import { site } from '../content/site';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__row">
          <a className="brand-link" href="#top" aria-label="REACH — العودة إلى الأعلى">
            <Logo height={64} />
          </a>
          <nav aria-label="روابط التذييل">
            <ul>
              {site.nav.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="site-footer__bottom">
          <span>
            © {new Date().getFullYear()} REACH — {site.footer.rights}
          </span>
          <span className="latin">{site.footer.line}</span>
        </div>
      </div>
    </footer>
  );
}
