/** Rendering / motion capability detection. URL overrides exist for QA: ?webgl=0, ?motion=reduce */
const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();

export function prefersReducedMotion(): boolean {
  if (params.get('motion') === 'reduce') return true;
  if (params.get('motion') === 'full') return false;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function supportsWebGL(): boolean {
  if (params.get('webgl') === '0') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function isCompactViewport(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(max-width: 760px), (pointer: coarse)').matches;
}

export type RenderMode = 'webgl' | 'static';

export function applyRootClasses(mode: RenderMode, reduced: boolean) {
  const root = document.documentElement;
  root.classList.toggle('has-webgl', mode === 'webgl');
  root.classList.toggle('no-webgl', mode !== 'webgl');
  root.classList.toggle('reduce-motion', reduced);
  root.classList.toggle('motion-ok', !reduced);
}
