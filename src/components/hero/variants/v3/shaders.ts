/**
 * GLSL for the V3 dither field. Kept as plain strings in their own module so
 * the shader source is a leaf of the lazy chunk `useDitherField` pulls in —
 * nothing here is imported at module scope by anything that ships in the
 * entry bundle.
 */

/**
 * One triangle large enough to cover the whole clip volume: three vertices, no
 * index buffer, and no diagonal seam down the middle of the screen for the
 * interpolator to disagree across. There is nothing else for this stage to do
 * — the fragment shader takes its coordinates from gl_FragCoord.
 */
export const VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/**
 * An animated scalar field, quantised to five palette steps through an 8x8
 * Bayer matrix.
 *
 * Two things make this read as deliberate 1-bit dithering rather than as a
 * generic mesh gradient:
 *
 * 1. The threshold is sampled from `gl_FragCoord`, i.e. the *drawing buffer's*
 *    pixel grid. The buffer is deliberately smaller than the CSS box (see
 *    `applySize`) and upscaled with `image-rendering: pixelated`, so the
 *    matrix stays a visible, regular pattern instead of dissolving into
 *    retina-sized noise.
 * 2. The palette is five hard steps of the site's own zinc-900 -> indigo-500
 *    ramp. Nothing is interpolated; every apparent intermediate tone is the
 *    dither mixing two neighbouring steps.
 *
 * `alpha: false` on the context means there is nothing behind this shader:
 * step 0 *is* the page background, painted here.
 */
export const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  u_resolution; // drawing-buffer size in pixels
uniform vec2  u_pointer;    // 0..1 across the hero, y up
uniform float u_time;       // seconds, accumulated from clamped frame deltas

/* There is no varying: the UV is derived from gl_FragCoord, which this shader
   needs anyway for the dither threshold. That drops an interpolator, removes
   the one construct whose precision has to agree across two stages, and keeps
   the pixel grid and the field in exactly the same coordinate space.

   gl_FragCoord is mediump in GLSL ES 1.00, i.e. fp16, i.e. exact for integers
   up to 2048 — which is why applySize() caps the drawing buffer at 1280. Past
   that the Bayer indices would start to alias and the pattern would break up. */

const float LEVELS = 4.0;

/* The whole palette is the site's: no colour here is invented. */
const vec3 C0 = vec3(0.0941, 0.0941, 0.1059); /* zinc-900   #18181b */
const vec3 C1 = vec3(0.1176, 0.1059, 0.2941); /* indigo-950 #1e1b4b */
const vec3 C2 = vec3(0.1922, 0.1804, 0.5059); /* indigo-900 #312e81 */
const vec3 C3 = vec3(0.2627, 0.2196, 0.7922); /* indigo-700 #4338ca */
const vec3 C4 = vec3(0.3882, 0.4000, 0.9451); /* indigo-500 #6366f1 */

/* The 2x2 ordered-dither kernel every larger matrix is built from. */
float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

/* 4x4 and 8x8 are the same kernel applied at half frequency and folded back
   in — cheaper and shorter than a lookup table, and branch-free. */
#define Bayer4(a) (Bayer2(0.5 * (a)) * 0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(0.5 * (a)) * 0.25 + Bayer2(a))

/* Palette lookup by step index, written as mixes rather than an if-chain so
   every fragment executes the same instructions. */
vec3 ramp(float i) {
  vec3 c = C0;
  c = mix(c, C1, step(0.5, i));
  c = mix(c, C2, step(1.5, i));
  c = mix(c, C3, step(2.5, i));
  c = mix(c, C4, step(3.5, i));
  return c;
}

/* Four sine waves over a domain-warped plane. The warp is what stops the
   result looking like plaid: it bends the interference pattern so the bands
   curl instead of crossing at right angles. */
float baseField(vec2 p, float t) {
  p += 0.22 * vec2(sin(p.y * 2.1 + t * 0.31), cos(p.x * 1.7 - t * 0.24));

  float v = sin(p.x * 2.6 + t * 0.37)
          + sin(p.y * 2.2 - t * 0.29)
          + sin((p.x + p.y) * 1.7 + t * 0.23)
          + sin(length(p * vec2(1.0, 1.35)) * 3.1 - t * 0.44);

  return v * 0.25; /* -1 .. 1 */
}

void main() {
  /* Aspect-corrected so the ripple stays circular on any viewport.
     gl_FragCoord's origin is bottom-left, which is the same way up as the
     pointer uniform the hook writes. */
  vec2 uv     = gl_FragCoord.xy / max(u_resolution, vec2(1.0));
  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 p      = (uv - 0.5) * 2.0 * aspect;
  vec2 ptr    = (u_pointer - 0.5) * 2.0 * aspect;

  float v = baseField(p, u_time);

  /* Cursor reaction: a travelling ripple that decays with distance, plus a
     soft bulge that lifts the field a step or two right under the pointer.
     Tuned so the pointer sits two to three palette steps above the ambient
     field and only reaches indigo-500 when a ripple crest passes through it. */
  float d = length(p - ptr);
  v += 0.50 * sin(d * 8.0 - u_time * 1.7) * exp(-d * 1.4);
  v += 0.60 * exp(-d * d * 2.2);

  /* Falls off to bare zinc-900 at the edges, centred at 66% across: the left
     third of the hero is under the headline scrim anyway. The edges are
     expressed relative to the field's own reach rather than as constants, so
     a phone in portrait gets the same composition as an ultrawide instead of
     one flat over-lit crest. */
  float reach  = length(aspect);
  vec2  centre = vec2(0.32 * aspect.x, 0.0);
  /* Written as 1.0 - smoothstep(near, far, r) rather than the shorter
     smoothstep(far, near, r): GLSL ES leaves smoothstep undefined when
     edge0 >= edge1, and "every driver I tried happened to do the sane thing"
     is not a guarantee. The two are numerically identical. */
  float glow = 1.0 - smoothstep(
    reach * 0.12,
    reach * 1.15,
    length((p - centre) * vec2(0.68, 1.0))
  );

  /* Bias and gamma set the ambient mix. Time-averaged that lands at roughly
     40% zinc-900 / 42% indigo-950 / 13% indigo-900 and a few percent of the
     top two steps: a field whose mean is a shade under indigo-950, i.e. the
     same weight as the CSS gradient it fades in over. */
  float amp = clamp((v * 0.5 + 0.4) * glow, 0.0, 1.0);
  amp = pow(amp, 1.6);

  float index = clamp(floor(amp * LEVELS + Bayer8(gl_FragCoord.xy)), 0.0, LEVELS);
  gl_FragColor = vec4(ramp(index), 1.0);
}
`;
