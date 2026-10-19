import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { frames, runtime } from './runtime';

/**
 * One clock for everything. Each GSAP tick first advances the scroll (Lenis), which updates
 * ScrollTrigger, and then renders the WebGL scene — so DOM and 3D move in the same frame and
 * DOM-locked geometry never trails the page.
 */
type SceneTick = (timeSec: number) => void;

let sceneTick: SceneTick | null = null;
export let lenis: Lenis | null = null;

export function setSceneTick(fn: SceneTick | null) {
  sceneTick = fn;
}

export function startLoop({ smooth }: { smooth: boolean }) {
  if (smooth) {
    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.12,
      // Touch goes through the same loop as the wheel, so on phones the animation also moves
      // exactly with the finger (and its momentum) instead of a frame behind native scrolling.
      syncTouch: true,
      syncTouchLerp: 0.09,
      touchInertiaExponent: 1.7,
      // Anchor offset comes from CSS scroll-padding-top (header height), which Lenis honours.
      anchors: true,
      // Dialogs, the mobile menu and text areas scroll natively.
      prevent: (node) => !!node.closest?.('dialog, textarea'),
    });
    lenis.on('scroll', () => {
      ScrollTrigger.update();
      runtime.lastActivity = performance.now();
    });
  }
  runtime.scrollY = window.scrollY;
  const tick = (time: number) => {
    lenis?.raf(time * 1000);
    // Scroll speed drives motion: measured per tick, so it falls to zero as soon as scrolling stops.
    const y = window.scrollY;
    runtime.velocity += (y - runtime.scrollY - runtime.velocity) * 0.35;
    if (Math.abs(runtime.velocity) < 0.01) runtime.velocity = 0;
    if (y !== runtime.scrollY || runtime.velocity !== 0) frames.requested = true;
    runtime.scrollY = y;
    sceneTick?.(time);
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}
