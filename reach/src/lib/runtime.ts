/**
 * Mutable runtime shared between the DOM scroll layer (GSAP) and the WebGL scene.
 * Written by ScrollTriggers / listeners, read every frame inside useFrame — never via React state,
 * so scrolling never triggers React re-renders.
 */
export const runtime = {
  /** Story position 0..4: ASSEMBLE(0) → OPEN(1) → FRAME(2) → CONNECT(3) → REACH(4). */
  story: 0,
  /** Progress of each section entrance, index 1..4 (index 0 unused). Summed into `story`. */
  segments: [0, 0, 0, 0, 0],
  /** Hero pin progress 0..1 — the cube opens in layers. */
  hero: 0,
  /** Process ribbon progress 0..1. */
  process: 0,
  /** Service card under hover / keyboard focus, -1 for none. */
  hover: -1,
  /** Pointer in normalized device coords (-1..1). */
  pointer: { x: 0, y: 0 },
  /** performance.now() of the last user/scroll activity — keeps the demand frameloop alive. */
  lastActivity: 0,
  /** Bumped whenever layout may have changed (ScrollTrigger refresh, fonts, resize). */
  layoutVersion: 0,
};

export function updateStory() {
  const s = runtime.segments;
  runtime.story = s[1] + s[2] + s[3] + s[4];
}

/** Render scheduling, read by the scene tick. */
export const frames = {
  /** Something changed: render on the next tick. */
  requested: true,
  /** The scene is still easing toward its targets. */
  keepAlive: true,
};

/** Notify the scene that something changed and it should render. */
export function poke() {
  runtime.lastActivity = performance.now();
  frames.requested = true;
}
