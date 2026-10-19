# REACH — interactive 3D agency website

Arabic-first (RTL) marketing site for REACH with a persistent WebGL scene that tells one scroll story:
**ASSEMBLE → OPEN → FRAME → CONNECT → REACH**.

React 19 · TypeScript · Vite 8 · three.js r186 + React Three Fiber 9 · GSAP 3 ScrollTrigger · Alexandria + Space Grotesk (self-hosted).

## Setup

```bash
cd reach
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build
```

QA switches: `?webgl=0` forces the static fallback, `?motion=reduce` forces the reduced-motion experience.

## Where things live

| Path | What |
| --- | --- |
| `src/content/site.ts` | **All copy, navigation, services, projects, form settings** — the one file to edit |
| `src/styles/tokens.css` | Brand tokens (colours sampled from the logo: `#4847AE`, `#FCD704`, `#D4ECF6`), type scale, easing |
| `src/styles/global.css` | Layout and components |
| `src/lib/scroll.ts` | All GSAP ScrollTriggers: story progress, hero pin progress, ribbon progress, masked text reveals |
| `src/lib/runtime.ts` | Mutable scroll/scene state shared between DOM and WebGL (no React re-renders on scroll) |
| `src/three/choreography.ts` | The five scene states — each a function of live DOM anchor rects |
| `src/three/World.tsx` | Rendering: instanced frames/faces/blocks, arrow, ribbon, shadow, demand frameloop |
| `src/three/geometry.ts` | Extruded brand arrow, folded ribbon builder |
| `src/components/Art.tsx` | SVG brand glyphs, service motifs, concept placeholders, static fallback sculptures |

### How the 3D attaches to the page
The canvas is `position: fixed` behind the HTML (`pointer-events: none`). Elements marked `data-anchor="…"`
(hero stage, service cards, featured image, process nodes, contact stage, CTA) are measured every frame and
projected onto the z = 0 plane, so frames lock onto real layout at any viewport size. Each element blends between the
two neighbouring story states with a small per-element stagger and an arc through depth; scrolling back reverses it exactly.

### Performance
6 frames = 1 instanced draw call (72 edge bars) + 1 for side faces; 4 blocks instanced; one translucent object;
no post-processing; DPR capped (1.75 desktop / 1.5 mobile); shadows only on desktop; demand frameloop (full rate while
scrolling or moving, 30 fps for idle ambient motion, paused when the tab is hidden); three.js is lazy-loaded so the
page is usable before the 3D arrives; images are WebP with `srcset`, lazy-loaded, with fixed dimensions.

## Contact form integration
No backend is configured. Until one is, the form validates input, shows a visible "preview mode" notice and,
on submit, states plainly that **nothing was sent**. To connect it, set `site.contact.endpoint` to a URL that accepts
`POST` JSON `{ name, phone, company, service, brief }`. Success is shown only on a 2xx response.

## Missing real assets / integrations
- **Logo source file** — no standalone logo was supplied. The header/footer logo was extracted (unaltered, guide lines
  removed) from the construction page of the brand PDF. Replace `public/brand/reach-logo-*.png` with the official SVG.
- **Portfolio** — the only supplied imagery is REACH's own identity mockups, shown as an in-house project. The other
  three projects are clearly labelled «تصور تجريبي» placeholders; replace them with real, cleared client work.
- **Contact details** — no email, phone, WhatsApp or address was supplied; `site.contact.details` renders only non-null values.
- **Form backend** — see above.
- **Social links, privacy policy, analytics, Open Graph image** — not supplied.
