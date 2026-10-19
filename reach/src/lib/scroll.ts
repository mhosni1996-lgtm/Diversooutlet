import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { poke, runtime, updateStory } from './runtime';

gsap.registerPlugin(ScrollTrigger);

/** Shared motion language (mirrors --ease-out / --ease-in-out in tokens.css). */
export const EASE_OUT = 'power3.out';
const REVEAL_DUR = 0.95;

interface Options {
  reduced: boolean;
  onActiveSection: (id: string) => void;
  onScrolled: (scrolled: boolean) => void;
}

/**
 * Wires every scroll-linked behaviour. All triggers are created inside one gsap.context
 * so the returned cleanup reverts tweens, inline styles and triggers together.
 */
export function setupScroll({ reduced, onActiveSection, onScrolled }: Options) {
  const ctx = gsap.context(() => {
    // Header background
    ScrollTrigger.create({
      start: 24,
      end: 'max',
      onToggle: (self) => onScrolled(self.isActive),
    });

    // Active nav item
    ['top', 'services', 'work', 'process', 'contact'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => self.isActive && onActiveSection(id),
      });
    });

    // Story segments: each section's entrance advances the 3D story by one state.
    const sectionIds = ['services', 'work', 'process', 'contact'];
    sectionIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 82%',
        end: id === 'contact' ? 'top 30%' : 'top 12%',
        onUpdate: (self) => {
          runtime.segments[i + 1] = self.progress;
          updateStory();
          poke();
        },
        onRefresh: (self) => {
          runtime.segments[i + 1] = self.progress;
          updateStory();
        },
      });
    });

    // Hero pin (CSS sticky) progress: the sculpture opens in layers.
    const hero = document.querySelector<HTMLElement>('.hero');
    if (hero && !reduced) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          runtime.hero = self.progress;
          poke();
        },
      });
      // Headline stays readable: it only drifts and never fades below legibility.
      gsap.to('.hero__text', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    // Process ribbon progress + step states
    const track = document.querySelector<HTMLElement>('.process__track');
    if (track) {
      const steps = Array.from(track.querySelectorAll<HTMLElement>('.step'));
      const apply = (p: number) => {
        runtime.process = p;
        track.style.setProperty('--pp', p.toFixed(4));
        steps.forEach((s, i) => {
          const at = i / (steps.length - 1);
          s.classList.toggle('is-reached', reduced || p >= at - 0.015);
          // Copy fades in as the ribbon approaches its node — tied to scroll, not a timed transition.
          const r = reduced ? 1 : Math.min(Math.max((p - (at - 0.12)) / 0.12, 0), 1);
          s.style.setProperty('--reveal', r.toFixed(3));
        });
        poke();
      };
      if (reduced) apply(1);
      else
        ScrollTrigger.create({
          trigger: track,
          start: 'top 72%',
          end: 'bottom 62%',
          onUpdate: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
        });
    }

    if (reduced) return;

    // Masked line reveals — complete Arabic lines rise from behind a mask, keeping letters connected.
    // Scroll-scrubbed: the lines move exactly as far and as fast as the page does (only the hero plays on load).
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((block) => {
      const lines = block.querySelectorAll('.mask-line > span');
      const accent = block.querySelector<HTMLElement>('.accent-word');
      const onLoad = block.dataset.reveal === 'load';
      const tl = gsap.timeline({
        paused: onLoad,
        defaults: { ease: onLoad ? EASE_OUT : 'none' },
        scrollTrigger: onLoad ? undefined : { trigger: block, start: 'top 94%', end: 'top 62%', scrub: true },
      });
      tl.from(lines, { yPercent: 115, duration: REVEAL_DUR, stagger: 0.1 });
      if (accent) tl.fromTo(accent, { '--accent': 0 }, { '--accent': 1, duration: 0.7 }, '-=0.45');
      if (onLoad) tl.play(0.0001).delay(0.25);
    });

    // Supporting blocks rise with the scroll (scrubbed, staggered children)
    gsap.utils.toArray<HTMLElement>('[data-rise]').forEach((el) => {
      const targets = el.dataset.rise === 'children' ? Array.from(el.children) : [el];
      gsap.from(targets, {
        y: 28,
        opacity: 0,
        ease: 'none',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 70%', scrub: true },
      });
    });

    gsap.from('.hero [data-hero-in]', {
      y: 18,
      opacity: 0,
      duration: 0.8,
      ease: EASE_OUT,
      stagger: 0.08,
      delay: 0.65,
    });
  });

  const refresh = () => {
    runtime.layoutVersion++;
    poke();
  };
  ScrollTrigger.addEventListener('refresh', refresh);
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return () => {
    ScrollTrigger.removeEventListener('refresh', refresh);
    ctx.revert();
  };
}

export { ScrollTrigger };
