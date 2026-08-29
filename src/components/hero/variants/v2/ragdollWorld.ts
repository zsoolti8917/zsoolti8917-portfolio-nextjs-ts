/**
 * The matter-js half of V2. Deliberately free of React so the whole lifecycle
 * question (StrictMode, refs, state) lives in `useRagdoll` and this file can be
 * reasoned about as "a world, and the four things that stop it escaping".
 *
 * Nothing here imports matter-js: the module object is handed in by the caller,
 * which is what keeps the engine out of the entry chunk. The `import("matter-js")`
 * occurrences below are TYPE queries only and are erased at compile time.
 */

type MatterModule = typeof import("matter-js");
type MatterBody = import("matter-js").Body;

/**
 * `Mouse.create` stores the listeners it bound on the instance so they can be
 * unbound again; the published typings omit them.
 */
type BoundMouse = import("matter-js").Mouse & {
  mousemove: (event: Event) => void;
  mousedown: (event: Event) => void;
  mouseup: (event: Event) => void;
  mousewheel: (event: Event) => void;
};

export interface ChipTarget {
  el: HTMLElement;
  width: number;
  height: number;
}

export interface RagdollWorld {
  /** One engine tick. Driven from framer-motion's `frame.update`. */
  step: (timestamp: number) => void;
  /** Writes every body's transform. Driven from framer-motion's `frame.render`. */
  sync: () => void;
  /** True once nothing is moving, i.e. the sync loop can be cancelled. */
  settled: () => boolean;
  /** Moves the walls for a new container width. Never rebuilds the pile. */
  resize: (width: number) => void;
  /** Re-drops every chip from the top. */
  reset: () => void;
  /** Releases a body still held after the pointer left the container. */
  release: () => void;
  destroy: () => void;
}

/**
 * Walls are thick on purpose: a thin static body is the classic way to lose a
 * fast chip through a corner. Their inner faces sit exactly on the container
 * bounds, and there is no ceiling — the chips fall in from above.
 */
const WALL = 200;
/** Wide enough that a resize only ever needs to move the floor, not resize it. */
const FLOOR_SPAN = 6000;
/** Side walls reach far above the container so a thrown chip can't fly out. */
const WALL_HEADROOM = 1200;
/** Per-tick velocity cap. A 90px chip at 30px/step still can't tunnel WALL. */
const MAX_SPEED = 30;
const CHAMFER = 6;

const clampTo = (value: number, min: number, max: number) =>
  max < min ? min : Math.min(max, Math.max(min, value));

const capSpeed = (v: number) => clampTo(v, -MAX_SPEED, MAX_SPEED);

/** A loose grid above the container, so the pile forms instead of raining in a line. */
const spawnFor = (index: number, width: number, chipWidth: number) => {
  const cols = Math.max(1, Math.floor(width / 130));
  const cell = width / cols;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const jitter = (Math.random() - 0.5) * cell * 0.35;
  return {
    x: clampTo(cell * (col + 0.5) + jitter, chipWidth / 2 + 4, width - chipWidth / 2 - 4),
    // Stays well inside the clamp's -500 ceiling, so nothing is teleported on frame 1.
    y: -40 - row * 44 - Math.random() * 14,
    angle: (Math.random() - 0.5) * 0.6,
  };
};

export const createRagdollWorld = (
  Matter: MatterModule,
  {
    container,
    chips,
    width,
    height,
  }: {
    container: HTMLElement;
    chips: ChipTarget[];
    width: number;
    height: number;
  }
): RagdollWorld => {
  const { Bodies, Body, Composite, Engine, Events, Mouse, MouseConstraint, Runner, Sleeping } =
    Matter;

  let w = width;
  const h = height;

  const engine = Engine.create();
  // The single biggest win here: once the pile settles every body sleeps, the
  // sync loop cancels itself, and the hero costs literally nothing.
  engine.enableSleeping = true;
  const world = engine.world;

  // ── Layer 1 of 3 against escaped bodies: thick static walls. No ceiling.
  const wallY = h / 2 - WALL_HEADROOM / 3;
  const floor = Bodies.rectangle(w / 2, h + WALL / 2, FLOOR_SPAN, WALL, { isStatic: true });
  const leftWall = Bodies.rectangle(-WALL / 2, wallY, WALL, h + WALL_HEADROOM, {
    isStatic: true,
  });
  const rightWall = Bodies.rectangle(w + WALL / 2, wallY, WALL, h + WALL_HEADROOM, {
    isStatic: true,
  });
  Composite.add(world, [floor, leftWall, rightWall]);

  const bodies = chips.map((chip, i) => {
    const spawn = spawnFor(i, w, chip.width);
    return Bodies.rectangle(spawn.x, spawn.y, chip.width, chip.height, {
      angle: spawn.angle,
      chamfer: {
        radius: Math.max(0, Math.min(CHAMFER, Math.min(chip.width, chip.height) / 2 - 1)),
      },
      restitution: 0.15,
      friction: 0.4,
      frictionAir: 0.01,
    });
  });
  Composite.add(world, bodies);

  const mouse = Mouse.create(container) as BoundMouse;
  const mouseConstraint = MouseConstraint.create(engine, { mouse });
  mouseConstraint.constraint.stiffness = 0.16;
  mouseConstraint.constraint.damping = 0.06;
  Composite.add(world, mouseConstraint);

  /**
   * Matter binds a non-passive `wheel` handler that calls `preventDefault()`,
   * and non-passive touch handlers that do the same. Left alone the hero eats
   * page scroll. (`mousewheel`/`DOMMouseScroll` are the pre-0.20 names; removing
   * them too costs nothing and covers an older matter-js.)
   */
  const unbindScrollBlockers = () => {
    container.removeEventListener("wheel", mouse.mousewheel);
    container.removeEventListener("mousewheel", mouse.mousewheel);
    container.removeEventListener("DOMMouseScroll", mouse.mousewheel);
    container.removeEventListener("touchmove", mouse.mousemove);
    container.removeEventListener("touchstart", mouse.mousedown);
    container.removeEventListener("touchend", mouse.mouseup);
  };
  unbindScrollBlockers();

  const redrop = (body: MatterBody, index: number) => {
    const spawn = spawnFor(index, w, chips[index].width);
    Body.setPosition(body, { x: spawn.x, y: spawn.y });
    Body.setVelocity(body, { x: 0, y: 0 });
    Body.setAngularVelocity(body, 0);
    Body.setAngle(body, spawn.angle);
  };

  /**
   * Layers 2 and 3: a per-tick speed cap so no single step can cross a wall,
   * and a teleport for anything that got out anyway (a resize, a tab that was
   * backgrounded mid-throw, a pathological stack of collisions).
   */
  const clamp = () => {
    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      // Never fight a live drag — the pointer is on screen by definition.
      if (body === mouseConstraint.body) continue;

      const { x: vx, y: vy } = body.velocity;
      if (Math.abs(vx) > MAX_SPEED || Math.abs(vy) > MAX_SPEED) {
        Body.setVelocity(body, { x: capSpeed(vx), y: capSpeed(vy) });
      }

      const { x, y } = body.position;
      if (x < -50 || x > w + 50 || y < -500 || y > h + 50) redrop(body, i);
    }
  };
  Events.on(engine, "afterUpdate", clamp);

  const runner = Runner.create({ delta: 1000 / 60 });

  const step = (timestamp: number) => {
    Runner.tick(runner, engine, timestamp);
  };

  const sync = () => {
    for (let i = 0; i < bodies.length; i++) {
      const { position, angle } = bodies[i];
      const chip = chips[i];
      chip.el.style.transform = `translate3d(${position.x - chip.width / 2}px, ${
        position.y - chip.height / 2
      }px, 0) rotate(${angle}rad)`;
    }
  };

  // Static walls do sleep in matter 0.20, but not relying on that keeps this
  // correct if the sleeping rules ever change.
  const settled = () => world.bodies.every((body) => body.isStatic || body.isSleeping);

  const wake = () => {
    for (const body of bodies) Sleeping.set(body, false);
  };

  const resize = (next: number) => {
    if (next <= 0 || next === w) return;
    w = next;
    Body.setPosition(floor, { x: w / 2, y: h + WALL / 2 });
    Body.setPosition(rightWall, { x: w + WALL / 2, y: wallY });
    clamp();
    wake();
  };

  const reset = () => {
    bodies.forEach(redrop);
    wake();
  };

  /**
   * `mouseup` outside the container never reaches Matter's element listener, so
   * without this a chip dragged off the hero stays welded to the cursor.
   */
  const release = () => {
    // Matter clears exactly these three on mouseup; the typings model them as
    // non-nullable, which they are not at runtime.
    const held = mouseConstraint as unknown as {
      constraint: { bodyB: MatterBody | null; pointB: { x: number; y: number } | null };
      body: MatterBody | null;
    };
    held.constraint.bodyB = null;
    held.constraint.pointB = null;
    held.body = null;
  };

  const destroy = () => {
    Events.off(engine, "beforeUpdate afterUpdate");
    Runner.stop(runner);
    release();
    Mouse.clearSourceEvents(mouse);
    // StrictMode re-runs the effect against the SAME element, so every listener
    // Matter bound has to come back off or the second world gets double input.
    container.removeEventListener("mousemove", mouse.mousemove);
    container.removeEventListener("mousedown", mouse.mousedown);
    container.removeEventListener("mouseup", mouse.mouseup);
    unbindScrollBlockers();
    Composite.clear(world, false);
    Engine.clear(engine);
  };

  return { step, sync, settled, resize, reset, release, destroy };
};
