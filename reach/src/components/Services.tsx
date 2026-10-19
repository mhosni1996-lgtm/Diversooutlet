import { site } from '../content/site';
import { poke, runtime } from '../lib/runtime';
import { ArrowGlyph, ServiceMotif } from './Art';
import { RevealTitle } from './RevealTitle';

export function Services({ onPick }: { onPick: (service: string) => void }) {
  const s = site.services;
  const setHover = (i: number) => {
    runtime.hover = i;
    poke();
  };
  return (
    <section id="services" className="section services" aria-labelledby="services-title">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">{s.kicker}</span>
            <RevealTitle id="services-title" className="section-title" lines={s.titleLines} />
          </div>
          <div>
            <div className="svc-deco" data-anchor="svc-deco" aria-hidden="true" />
            <p className="lead" data-rise>{s.intro}</p>
          </div>
        </div>

        <ul className="services__grid">
          {s.items.map((item, i) => (
            <li
              key={item.id}
              className="service"
              data-anchor={`svc-${i}`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => runtime.hover === i && setHover(-1)}
              onFocus={() => setHover(i)}
              onBlur={() => runtime.hover === i && setHover(-1)}
            >
              <span className="service__accent" aria-hidden="true" />
              <div className="service__top">
                <div>
                  <span className="service__no latin">{item.no}</span>
                  <span className="service__en" lang="en">{item.en}</span>
                </div>
                <ServiceMotif kind={item.id} />
              </div>
              <h3 className="service__title">{item.title}</h3>
              <p className="service__body">{item.body}</p>
              <ul className="service__points" aria-label={`ما تشمله خدمة ${item.title}`}>
                {item.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <a className="service__link" href="#contact" onClick={() => onPick(item.title)}>
                {s.linkLabel}
                <span className="sr-only">: {item.title}</span>
                <ArrowGlyph />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
