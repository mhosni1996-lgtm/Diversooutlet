import '@fontsource-variable/alexandria';
import '@fontsource-variable/space-grotesk';
import './styles/tokens.css';
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyRootClasses, prefersReducedMotion, supportsWebGL } from './lib/env';

// Hosts that inject their own document shell may drop <html lang/dir>; enforce Arabic RTL.
document.documentElement.lang = 'ar';
document.documentElement.dir = 'rtl';

// Set capability classes before first paint so the correct static/3D layout renders immediately.
const reduced = prefersReducedMotion();
applyRootClasses(supportsWebGL() && !reduced ? 'webgl' : 'static', reduced);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
