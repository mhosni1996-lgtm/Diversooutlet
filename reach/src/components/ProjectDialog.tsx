import { useEffect, useRef, type RefObject } from 'react';
import { site, type Project } from '../content/site';
import { ConceptArt } from './Art';
import { Picture } from './Picture';

/** Native modal <dialog>: focus is trapped, Esc closes, background is inert. */
export function ProjectDialog({ project, onClose, returnFocus }: { project: Project | null; onClose: () => void; returnFocus: RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (project && !dlg.open) {
      dlg.showModal();
      dlg.querySelector<HTMLElement>('.project-dialog__scroll')?.scrollTo(0, 0);
      dlg.querySelector<HTMLElement>('.dialog-close')?.focus();
    }
    if (!project && dlg.open) dlg.close();
  }, [project]);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    const handle = () => {
      onClose();
      returnFocus.current?.focus();
    };
    dlg.addEventListener('close', handle);
    return () => dlg.removeEventListener('close', handle);
  }, [onClose, returnFocus]);

  const w = site.work;
  return (
    <dialog
      ref={ref}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
      onKeyDown={(e) => {
        // Keep Tab cycling inside the dialog (native modals may otherwise hand focus to browser chrome).
        if (e.key !== 'Tab') return;
        const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])'));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
    >
      {project && (
        <div className="project-dialog__scroll">
          <div className="project-dialog__head">
            <div className="project-meta">
              <span className="cat">{project.category}</span>
              <span className="latin">{project.categoryEn}</span>
            </div>
            <button type="button" className="dialog-close" onClick={() => ref.current?.close()}>
              إغلاق
              <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 3 L17 17 M17 3 L3 17" stroke="currentColor" strokeWidth="2.6" />
              </svg>
            </button>
          </div>
          <div className="project-dialog__body">
            <div>
              {project.concept && <span className="badge" style={{ position: 'static', display: 'inline-block' }}>{w.conceptBadge}</span>}
              <h2 className="project-dialog__title" id="project-dialog-title">
                {project.title}
              </h2>
              <p className="lead" style={{ fontSize: '1.05rem' }}>{project.summary}</p>
              <ul className="project-dialog__details">
                {project.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p className="note">{project.concept ? w.conceptNote : 'note' in project ? project.note : ''}</p>
            </div>
            <div className="gallery">
              {'gallery' in project ? (
                [project.cover, ...project.gallery].map((g) => (
                  <figure key={g.base}>
                    <Picture base={g.base} alt={g.alt} sizes="(max-width: 760px) 92vw, 30vw" />
                  </figure>
                ))
              ) : 'art' in project ? (
                <figure>
                  <ConceptArt kind={project.art} label={project.title} />
                </figure>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
