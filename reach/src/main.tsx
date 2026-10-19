import '@fontsource-variable/alexandria';
import '@fontsource-variable/space-grotesk';
import './styles/tokens.css';
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyRootClasses, prefersReducedMotion, supportsWebGL } from './lib/env';

// Set capability classes before first paint so the correct static/3D layout renders immediately.
const reduced = prefersReducedMotion();
applyRootClasses(supportsWebGL() && !reduced ? 'webgl' : 'static', reduced);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
