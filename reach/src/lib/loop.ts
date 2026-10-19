import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { runtime } from './runtime';

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
      // Anchor offset comes from CSS scroll-padding-top (header height), which Lenis honours.
      anchors: true,
      // Dialogs and the mobile menu scroll natively.
      prevent: (node) => !!node.closest?.('dialog'),
    });
    lenis.on('scroll', () => {
      ScrollTrigger.update();
      runtime.lastActivity = performance.now();
    });
  }
  const tick = (time: number) => {
    lenis?.raf(time * 1000);
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
