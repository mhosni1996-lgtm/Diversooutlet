import { site } from '../content/site';
import { ArrowGlyph, StaticSculpture } from './Art';
import { RevealTitle } from './RevealTitle';

export function Hero() {
  const h = site.hero;
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__sticky">
        <div className="decor decor--grid" aria-hidden="true" />
        <div className="container hero__grid">
          <div className="hero__text">
            <span className="kicker" data-hero-in>{h.kicker}</span>
            <RevealTitle as="h1" id="hero-title" className="hero__title" lines={h.titleLines} accent={h.accentWord} trigger="load" />
            <p className="lead hero__copy" data-hero-in>{h.copy}</p>
            <div className="hero__actions" data-hero-in>
              <a className="btn btn--yellow" href="#contact">
                {h.primary}
                <ArrowGlyph />
              </a>
              <a className="btn btn--ghost" href="#work">{h.secondary}</a>
            </div>
          </div>
          <div className="hero__stage" data-anchor="hero-stage">
            <StaticSculpture variant="hero" />
          </div>
        </div>
        <p className="scroll-hint" aria-hidden="true">
          <i />
          {h.scrollHint}
        </p>
      </div>
    </section>
  );
}
