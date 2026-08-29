import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

/**
 * Raw WebGL for the V3 dither field. No React, no framer-motion, no DOM
 * lifecycle: every function here takes a context and returns handles, so the
 * hook can call the exact same sequence on first mount and on
 * `webglcontextrestored` without a second code path.
 */

const DEV = process.env.NODE_ENV === "development";

/** Bound before linking so nothing has to `getAttribLocation` afterwards. */
const POSITION_LOCATION = 0;

const COVER_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

/**
 * `alpha: false` — the shader paints the zinc-900 base itself, so there is no
 * compositing work and no way for the page behind to bleed through.
 * `failIfMajorPerformanceCaveat: true` — if the browser would answer with a
 * software rasteriser we would rather have no canvas at all: the CSS gradient
 * underneath already looks right, and a CPU-rendered fullscreen shader on a
 * hero would cook the machine for a decoration.
 */
export const CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  preserveDrawingBuffer: false,
  powerPreference: "low-power",
  failIfMajorPerformanceCaveat: true,
};

/**
 * A Bayer dither is a *pixel* effect. Rendering it at `devicePixelRatio` costs
 * four times as much for a strictly worse result — the matrix shrinks below
 * the eye's resolution and the whole thing turns back into a smooth gradient.
 * Half of CSS resolution gives a chunky, deliberate 2-CSS-pixel grain, which
 * `.hero-dither-canvas { image-rendering: pixelated }` then upscales without
 * smoothing.
 */
export const RENDER_SCALE = 0.5;

/**
 * Two reasons, not one. An ultrawide would otherwise still hand us a 2500px
 * buffer at half scale — but more importantly `gl_FragCoord` is mediump in
 * GLSL ES 1.00, so pixel coordinates stop being exact integers past 2048 and
 * the Bayer indices would begin to alias. 1280 keeps a wide margin.
 */
const MAX_BUFFER_EDGE = 1280;

interface ParallelShaderCompile {
  COMPLETION_STATUS_KHR: number;
}

export interface DitherProgram {
  program: WebGLProgram;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  buffer: WebGLBuffer;
  /** Null when the driver doesn't expose KHR_parallel_shader_compile. */
  parallel: ParallelShaderCompile | null;
}

export interface DitherUniforms {
  resolution: WebGLUniformLocation | null;
  pointer: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
}

export interface BufferSize {
  width: number;
  height: number;
}

export const createContext = (
  canvas: HTMLCanvasElement
): WebGLRenderingContext | null => {
  try {
    return canvas.getContext("webgl", CONTEXT_ATTRIBUTES);
  } catch {
    // Some hardened/privacy configurations throw rather than return null.
    return null;
  }
};

const compile = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  /**
   * Deliberately NOT reading COMPILE_STATUS here: that query blocks the main
   * thread until the driver has finished compiling, which is precisely the
   * stall this whole module is arranged to avoid. A failed compile fails the
   * link too, and LINK_STATUS is read exactly once, later, off the mount path.
   */
  return shader;
};

export const createDitherProgram = (
  gl: WebGLRenderingContext
): DitherProgram | null => {
  const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  const buffer = gl.createBuffer();

  if (!vertexShader || !fragmentShader || !program || !buffer) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    if (program) gl.deleteProgram(program);
    if (buffer) gl.deleteBuffer(buffer);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.bindAttribLocation(program, POSITION_LOCATION, "a_position");
  gl.linkProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, COVER_TRIANGLE, gl.STATIC_DRAW);

  return {
    program,
    vertexShader,
    fragmentShader,
    buffer,
    parallel: gl.getExtension(
      "KHR_parallel_shader_compile"
    ) as ParallelShaderCompile | null,
  };
};

/**
 * True once it is safe to ask the program a question without stalling.
 *
 * Without the extension there is nothing to poll: the first query will block
 * for however long the driver needs, so we report ready immediately and take
 * the hit one frame after mount rather than during it.
 */
export const isLinkFinished = (
  gl: WebGLRenderingContext,
  handles: DitherProgram
): boolean => {
  const { parallel } = handles;
  if (!parallel) return true;
  return (
    gl.getProgramParameter(
      handles.program,
      parallel.COMPLETION_STATUS_KHR
    ) === true
  );
};

/**
 * The one synchronous status read, plus the state that only becomes legal
 * after a successful link. Returns null if the program is unusable — the
 * caller's answer to that is to show nothing and leave the CSS fallback up.
 */
export const finishProgram = (
  gl: WebGLRenderingContext,
  handles: DitherProgram
): DitherUniforms | null => {
  if (!gl.getProgramParameter(handles.program, gl.LINK_STATUS)) {
    if (DEV) {
      // Info logs are a driver round-trip each; they never run in production.
      console.error("[hero/v3] dither shader failed to link", {
        program: gl.getProgramInfoLog(handles.program),
        vertex: gl.getShaderInfoLog(handles.vertexShader),
        fragment: gl.getShaderInfoLog(handles.fragmentShader),
      });
    }
    return null;
  }

  gl.useProgram(handles.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, handles.buffer);
  gl.enableVertexAttribArray(POSITION_LOCATION);
  gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, 0, 0);

  return {
    resolution: gl.getUniformLocation(handles.program, "u_resolution"),
    pointer: gl.getUniformLocation(handles.program, "u_pointer"),
    time: gl.getUniformLocation(handles.program, "u_time"),
  };
};

/**
 * Sizes the drawing buffer from the CSS box and resets the viewport.
 *
 * The viewport is set unconditionally: resizing the drawing buffer silently
 * resets it to the new full size only in the sense that it is *invalidated*,
 * and a restored context starts with a viewport of the canvas's initial size.
 * One redundant call per resize is cheaper than the class of bug where half
 * the hero is stretched.
 */
export const applySize = (
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number
): BufferSize => {
  const longest = Math.max(cssWidth, cssHeight, 1);
  const scale = Math.min(RENDER_SCALE, MAX_BUFFER_EDGE / longest);
  const width = Math.max(1, Math.round(cssWidth * scale));
  const height = Math.max(1, Math.round(cssHeight * scale));

  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  gl.viewport(0, 0, width, height);

  return { width, height };
};

export const drawFrame = (
  gl: WebGLRenderingContext,
  uniforms: DitherUniforms,
  size: BufferSize,
  time: number,
  pointerX: number,
  pointerY: number
) => {
  gl.uniform2f(uniforms.resolution, size.width, size.height);
  gl.uniform2f(uniforms.pointer, pointerX, pointerY);
  gl.uniform1f(uniforms.time, time);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
};

/**
 * Frees the GL objects but deliberately does NOT call
 * `WEBGL_lose_context.loseContext()`: `canvas.getContext` hands back the same
 * context object for the life of the element, so a lost context would still
 * be the one returned to the next init — and under StrictMode there always is
 * a next init, one tick later, on the same canvas node. Reusing the live
 * context and rebuilding only the program is both correct and what the
 * restore path does anyway.
 */
export const disposeProgram = (
  gl: WebGLRenderingContext,
  handles: DitherProgram
) => {
  gl.deleteBuffer(handles.buffer);
  gl.deleteProgram(handles.program);
  gl.deleteShader(handles.vertexShader);
  gl.deleteShader(handles.fragmentShader);
};
