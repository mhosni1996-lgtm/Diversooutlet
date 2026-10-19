import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Process } from './components/Process';
import { Services } from './components/Services';
import { Work } from './components/Work';
import { applyRootClasses, prefersReducedMotion, supportsWebGL, type RenderMode } from './lib/env';
import { startLoop } from './lib/loop';
import { ScrollTrigger, setupScroll } from './lib/scroll';

const Scene = lazy(() => import('./three/Scene'));

/** Any WebGL/runtime failure inside the scene falls back to the static composition. */
class SceneBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('[REACH] 3D scene disabled:', error);
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function App() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [mode, setMode] = useState<RenderMode>(() => (supportsWebGL() && !prefersReducedMotion() ? 'webgl' : 'static'));
  const [active, setActive] = useState('top');
  const [scrolled, setScrolled] = useState(false);
  const [preset, setPreset] = useState({ service: '', n: 0 });

  const effectiveMode: RenderMode = reduced ? 'static' : mode;

  useEffect(() => {
    applyRootClasses(effectiveMode, reduced);
    ScrollTrigger.refresh();
  }, [effectiveMode, reduced]);

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(prefersReducedMotion());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => startLoop({ smooth: !reduced }), [reduced]);
  useEffect(() => setupScroll({ reduced, onActiveSection: setActive, onScrolled: setScrolled }), [reduced]);

  const onFail = useCallback(() => setMode('static'), []);
  const onPick = useCallback((service: string) => setPreset((p) => ({ service, n: p.n + 1 })), []);

  return (
    <div className="app">
      <a className="skip-link" href="#main">تخطَّ إلى المحتوى</a>
      <Header active={active} scrolled={scrolled} />
      {effectiveMode === 'webgl' && (
        <div className="webgl-layer" aria-hidden="true">
          <SceneBoundary onFail={onFail}>
            <Suspense fallback={null}>
              <Scene onFail={onFail} />
            </Suspense>
          </SceneBoundary>
        </div>
      )}
      <main id="main" tabIndex={-1}>
        <Hero />
        <Services onPick={onPick} />
        <Work />
        <Process />
        <Contact preset={preset} />
      </main>
      <Footer />
    </div>
  );
}
