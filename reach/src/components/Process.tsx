import { site } from '../content/site';
import { RevealTitle } from './RevealTitle';

export function Process() {
  const p = site.process;
  return (
    <section id="process" className="section process" aria-labelledby="process-title">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">{p.kicker}</span>
            <RevealTitle id="process-title" className="section-title" lines={p.titleLines} />
          </div>
        </div>
        <div className="process__track" data-anchor="process-track">
          <span className="process__line" aria-hidden="true" />
          <ol className="process__steps">
          {p.steps.map((s, i) => (
            <li key={s.no} className="step">
              <span className="step__node latin" data-anchor={`node-${i}`} aria-hidden="true">
                {s.no}
              </span>
              <h3 className="step__title">
                <span className="sr-only">الخطوة {i + 1}: </span>
                {s.title}
              </h3>
              <span className="step__en" lang="en">{s.en}</span>
              <p className="step__body">{s.body}</p>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
