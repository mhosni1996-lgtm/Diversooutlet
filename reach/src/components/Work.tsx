import { useRef, useState } from 'react';
import { site, type Project } from '../content/site';
import { ArrowGlyph, ConceptArt } from './Art';
import { Picture } from './Picture';
import { ProjectDialog } from './ProjectDialog';
import { RevealTitle } from './RevealTitle';

export function Work() {
  const w = site.work;
  const [open, setOpen] = useState<Project | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const featured = w.projects.find((p) => p.featured)!;
  const rest = w.projects.filter((p) => !p.featured);

  const show = (p: Project, el: HTMLElement) => {
    returnFocus.current = el;
    setOpen(p);
  };

  return (
    <section id="work" className="section work" aria-labelledby="work-title">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">{w.kicker}</span>
            <RevealTitle id="work-title" className="section-title" lines={w.titleLines} />
          </div>
          <p className="lead" data-rise>{w.intro}</p>
        </div>

        <article className="featured" aria-labelledby="featured-title">
          <div className="featured__info" data-rise="children">
            <div className="project-meta">
              <span className="cat">{featured.category}</span>
              <span className="latin">{featured.categoryEn}</span>
              <span className="latin">{featured.year}</span>
            </div>
            <h3 className="featured__title" id="featured-title">
              {featured.title}
            </h3>
            <p className="featured__summary">{featured.summary}</p>
            <div>
              <button type="button" className="btn btn--ghost" aria-haspopup="dialog" onClick={(e) => show(featured, e.currentTarget)}>
                {w.openLabel}
                <ArrowGlyph />
              </button>
            </div>
            <div className="cursor-slot" data-anchor="work-cursor" aria-hidden="true" />
          </div>
          <div className="featured__media" data-anchor="featured">
            {'cover' in featured && <Picture base={featured.cover.base} alt={featured.cover.alt} sizes="(max-width: 860px) 92vw, 56vw" />}
            <button type="button" aria-haspopup="dialog" aria-label={`${w.openLabel}: ${featured.title}`} onClick={(e) => show(featured, e.currentTarget)} />
          </div>
        </article>

        <div className="projects">
          {rest.map((p) => (
            <button key={p.id} type="button" className="project-card" aria-haspopup="dialog" onClick={(e) => show(p, e.currentTarget)}>
              <span className="project-card__media">
                {'art' in p && <ConceptArt kind={p.art} label={p.title} />}
                <span className="badge">{w.conceptBadge}</span>
              </span>
              <span className="project-meta">
                <span className="cat">{p.category}</span>
                <span className="latin">{p.categoryEn}</span>
              </span>
              <span className="project-card__title">{p.title}</span>
              <span className="project-card__summary">{p.summary}</span>
              <span className="project-card__more">
                {w.openLabel}
                <ArrowGlyph />
              </span>
            </button>
          ))}
        </div>
      </div>
      <ProjectDialog project={open} onClose={() => setOpen(null)} returnFocus={returnFocus} />
    </section>
  );
}
