import { useEffect, useRef } from 'react';
import { site } from '../content/site';
import { Logo } from './Logo';

const EN: Record<string, string> = { top: 'Home', services: 'Services', work: 'Work', process: 'Process', contact: 'Contact' };

export function Header({ active, scrolled }: { active: string; scrolled: boolean }) {
  const menuRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const open = () => menuRef.current?.showModal();
  const close = () => menuRef.current?.close();

  useEffect(() => {
    const dlg = menuRef.current;
    if (!dlg) return;
    const onClose = () => toggleRef.current?.focus();
    dlg.addEventListener('close', onClose);
    // Close the menu if the viewport grows past the mobile breakpoint.
    const mq = matchMedia('(min-width: 961px)');
    const onMq = () => mq.matches && dlg.open && dlg.close();
    mq.addEventListener('change', onMq);
    return () => {
      dlg.removeEventListener('close', onClose);
      mq.removeEventListener('change', onMq);
    };
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container">
        <a className="brand-link" href="#top" aria-label="REACH — الصفحة الرئيسية">
          <Logo height={46} />
        </a>
        <nav className="main-nav" aria-label="التنقل الرئيسي">
          <ul>
            {site.nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} aria-current={active === n.id ? 'true' : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn btn--yellow btn--sm header-cta" href="#contact">
          {site.cta}
        </a>
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-label="فتح القائمة"
          aria-haspopup="dialog"
          aria-controls="mobile-menu"
          onClick={open}
        >
          <span aria-hidden="true" />
        </button>
      </div>

      <dialog ref={menuRef} id="mobile-menu" className="mobile-menu" aria-label="القائمة">
        <div className="mobile-menu__inner">
          <div className="mobile-menu__top">
            <Logo height={40} />
            <button type="button" className="menu-close" onClick={close} aria-label="إغلاق القائمة" autoFocus>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 3 L17 17 M17 3 L3 17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
              </svg>
            </button>
          </div>
          <nav aria-label="التنقل للجوال">
            {site.nav.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={close} aria-current={active === n.id ? 'true' : undefined}>
                {n.label}
                <span className="latin">{EN[n.id]}</span>
              </a>
            ))}
          </nav>
          <a className="btn btn--yellow" href="#contact" onClick={close}>
            {site.cta}
          </a>
        </div>
      </dialog>
    </header>
  );
}
