import * as THREE from 'three';
import { sampleRibbon, type Ribbon } from './geometry';

/**
 * Every sculptural element is described by the same Box state, so any element can morph between
 * a rotated cube (hero), a logo-style oblique extrusion locked to a DOM rect (services / work),
 * a gateway on the ribbon (process) or a tile of the final REACH stair (contact).
 */
export interface Box {
  p: THREE.Vector3; // centre
  q: THREE.Quaternion;
  w: number;
  h: number;
  d: number;
  sx: number; // shear: back face offset per unit depth (−1,−1 = logo's 45° down-left)
  sy: number;
  thick: number; // frame edge thickness
  face: number; // ice side faces 0..1
  blue: number; // edge colour silver → brand blue
  vis: number; // scale multiplier (blocks, glass, arrow)
}

export const FRAMES = 6;
export const BLOCKS = 4;
/** Element order: frames 0-5, blocks 6-9, glass 10, arrow 11 */
export const COUNT = FRAMES + BLOCKS + 2;
export const GLASS = FRAMES + BLOCKS;
export const ARROW = GLASS + 1;

export function makeBox(): Box {
  return { p: new THREE.Vector3(), q: new THREE.Quaternion(), w: 1, h: 1, d: 1, sx: 0, sy: 0, thick: 0.05, face: 0, blue: 0, vis: 1 };
}

export function lerpBox(o: Box, a: Box, b: Box, s: number) {
  o.p.lerpVectors(a.p, b.p, s);
  o.q.slerpQuaternions(a.q, b.q, s);
  o.w = a.w + (b.w - a.w) * s;
  o.h = a.h + (b.h - a.h) * s;
  o.d = a.d + (b.d - a.d) * s;
  o.sx = a.sx + (b.sx - a.sx) * s;
  o.sy = a.sy + (b.sy - a.sy) * s;
  o.thick = a.thick + (b.thick - a.thick) * s;
  o.face = a.face + (b.face - a.face) * s;
  o.blue = a.blue + (b.blue - a.blue) * s;
  o.vis = a.vis + (b.vis - a.vis) * s;
}

export interface WRect {
  cx: number;
  cy: number;
  w: number;
  h: number;
  l: number;
  r: number;
  t: number;
  b: number;
}

export interface Ctx {
  /** world units per CSS px at z = 0 */
  k: number;
  vw: number;
  vh: number;
  rect: (key: string) => WRect | null;
  time: number;
  hero: number;
  process: number;
  intro: number;
  pointer: { x: number; y: number };
  hover: number[];
  compact: boolean;
  ribbon: Ribbon | null;
  ribbonOrigin: THREE.Vector3;
}

const _e = new THREE.Euler();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _t = new THREE.Vector3();
const X = new THREE.Vector3(1, 0, 0);
const Zaxis = new THREE.Vector3(0, 0, 1);

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const win = (x: number, a: number, b: number) => clamp01((x - a) / (b - a));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

function setEuler(q: THREE.Quaternion, x: number, y: number, z: number) {
  return q.setFromEuler(_e.set(x, y, z));
}

function cube(o: Box, x: number, y: number, z: number, s: number) {
  o.p.set(x, y, z);
  o.w = o.h = o.d = s;
  o.sx = o.sy = 0;
}

/** Lock a box's front face to a DOM rect (z = 0 plane), extruding back with the logo's oblique shear. */
function anchor(o: Box, r: WRect, d: number, pad = 0) {
  o.w = r.w + pad * 2;
  o.h = r.h + pad * 2;
  o.d = d;
  o.sx = -1;
  o.sy = -1;
  o.q.identity();
  o.p.set(r.cx - d / 2, r.cy - d / 2, -d / 2);
}

/** Orient so local +X points along `dir` and the flat face looks at the camera. */
function pointAlong(q: THREE.Quaternion, dir: THREE.Vector3) {
  const x = _v.copy(dir).normalize();
  const z = _v2.copy(Zaxis).addScaledVector(x, -Zaxis.dot(x));
  if (z.lengthSq() < 1e-6) z.set(0, 1, 0);
  z.normalize();
  const y = _t.crossVectors(z, x);
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  q.setFromRotationMatrix(m);
}

// ---------- Hero composition (units of the hero stage) ----------
// [x, y, z, size, rx, ry, rz, blue]
const HERO_FRAMES = [
  [0.95, -1.25, 0.3, 1.2, 0, 0.35, 0, 0],
  [-0.4, -1.25, -0.25, 1.25, 0, -0.25, 0, 1],
  [-0.15, 0.05, 0.05, 1.3, 0.1, 0.5, 0.08, 0],
  [-1.6, -0.6, -0.6, 0.95, 0, 0.8, 0, 0],
  [1.25, 0.65, -0.5, 0.8, 0.4, 0.3, 0.2, 1],
  [0.5, 1.5, 0.35, 0.6, 0.6, 0.2, 0.5, 0],
];
// [x, y, z, size, rx, ry, rz]
const HERO_BLOCKS = [
  [-0.4, -1.25, -0.25, 0.8, 0, -0.25, 0],
  [-0.15, 0.05, 0.05, 0.55, 0.3, 0.9, 0.2],
  [1.75, -0.75, 0.7, 0.34, 0.5, 0.4, 0],
  [-1.2, 1.1, 0.45, 0.28, 0.2, 0.7, 0.4],
];
const HERO_GLASS = [0.95, -1.25, 0.3, 0.8, 0, 0.35, 0];
// Opening offsets for the blocks/glass sliding out of their frames: [dx, dy, dz, start, end]
const SLIDE = [
  [0.1, -0.05, 1.7, 0.0, 0.45],
  [0.2, 1.0, 1.0, 0.05, 0.5],
  [0.5, -0.3, 0.6, 0.1, 0.6],
  [-0.4, 0.4, 0.5, 0.1, 0.6],
];
export const HERO_GROUND = -1.86;

export function heroUnit(c: Ctx) {
  const s = c.rect('hero-stage');
  if (!s) return null;
  return { s, u: Math.min(s.w / 4.4, s.h / 4.0) };
}

export function stateHero(c: Ctx, out: Box[]) {
  const hu = heroUnit(c);
  const s = hu?.s ?? { cx: 0, cy: 0, w: 4, h: 4, l: -2, r: 2, t: 2, b: -2 };
  const u = hu?.u ?? 1;
  const O = _t.set(s.cx, s.cy + 0.15 * u, 0).clone();
  const hp = c.hero;
  const open = easeInOut(win(hp, 0.15, 0.85));
  const time = c.time;
  const pointerQ = setEuler(new THREE.Quaternion(), -c.pointer.y * 0.1, c.pointer.x * 0.2, 0);

  for (let i = 0; i < FRAMES; i++) {
    const f = HERO_FRAMES[i];
    const o = out[i];
    // Layers open outward from the centroid and straighten toward the axes.
    const spread = 1 + 0.42 * open;
    const floatY = i >= 4 ? Math.sin(time * 0.8 + i) * 0.06 : 0;
    cube(o, f[0] * spread * u, (f[1] * spread + floatY + open * 0.15) * u, (f[2] + open * (i % 2 ? -0.5 : 0.6)) * u, f[3] * u);
    const straighten = 1 - 0.55 * open;
    setEuler(o.q, f[4] * straighten, f[5] * straighten + Math.sin(time * 0.35 + i * 1.7) * 0.05, f[6] * straighten);
    o.thick = 0.055 * u;
    o.face = 0;
    o.blue = f[7];
    o.vis = 1;
  }
  for (let i = 0; i < BLOCKS; i++) {
    const b = HERO_BLOCKS[i];
    const sl = SLIDE[i];
    const e = easeInOut(win(hp, sl[3], sl[4]));
    const o = out[FRAMES + i];
    const floatY = i >= 2 ? Math.sin(time * 0.9 + i * 2) * 0.07 : 0;
    cube(o, (b[0] + sl[0] * e) * u, (b[1] + sl[1] * e + floatY) * u, (b[2] + sl[2] * e) * u, b[3] * u);
    setEuler(o.q, b[4] + e * 0.6, b[5] + e * 0.9 + (i >= 2 ? time * 0.2 : 0), b[6]);
    o.vis = 1;
    o.face = 0;
    o.blue = 1;
  }
  {
    const g = HERO_GLASS;
    const e = easeInOut(win(hp, 0.1, 0.6));
    const o = out[GLASS];
    cube(o, (g[0] + 0.6 * e) * u, (g[1] + 0.1 * e) * u, (g[2] + 1.3 * e) * u, g[3] * u);
    setEuler(o.q, g[4] + e * 0.5, g[5] + e * 0.8, g[6]);
    o.vis = 1;
  }
  {
    // The arrow travels through the frames as the structure opens.
    const e = easeInOut(win(hp, 0.25, 1));
    const o = out[ARROW];
    o.p.set((-2.05 + 4.6 * e) * u, (0.05 + Math.sin(time * 1.1) * 0.04 + 0.2 * e) * u, (0.25 + 0.4 * e) * u);
    o.q.identity();
    o.w = o.h = o.d = 1.05 * u;
    o.vis = 1;
  }

  // Intro assembly + pointer response, then translate to the stage.
  for (let i = 0; i < COUNT; i++) {
    const o = out[i];
    const ie = easeOut(win(c.intro, i * 0.045, i * 0.045 + 0.55));
    if (ie < 1) {
      const a = i * 2.39996;
      o.p.x += Math.cos(a) * 2.2 * u * (1 - ie);
      o.p.y += (Math.sin(a) * 1.6 + 1.4) * u * (1 - ie);
      o.p.z += 3 * (1 - ie);
      const sc = 0.001 + ie;
      o.w *= sc;
      o.h *= sc;
      o.d *= sc;
      if (i < FRAMES) o.thick *= sc;
      o.q.multiply(setEuler(_q, (1 - ie) * 1.2, (1 - ie) * 2, 0));
    }
    o.p.applyQuaternion(pointerQ).add(O);
    o.q.premultiply(pointerQ);
  }
}

export function stateServices(c: Ctx, out: Box[]) {
  const ext = (c.compact ? 14 : 26) * c.k;
  for (let i = 0; i < 4; i++) {
    const o = out[i];
    const r = c.rect(`svc-${i}`);
    if (!r) continue;
    const h = c.hover[i];
    anchor(o, r, ext * (1 + 0.8 * h));
    o.thick = 2.4 * c.k;
    o.face = 1;
    o.blue = 1;
    o.vis = 1;
  }
  const deco = c.rect('svc-deco');
  const dc = deco ?? c.rect('svc-0') ?? { cx: 0, cy: 0, w: 1, h: 1, l: 0, r: 0, t: 0, b: 0 };
  // Cube, satellite and arrow stay inside the decorative slot above the intro copy.
  const size = Math.min(dc.h * 0.56, 100 * c.k);
  const cx = dc.l + size * 0.9;
  const cy = dc.cy + size * 0.08;
  {
    const o = out[4];
    cube(o, cx, cy, 0, size);
    setEuler(o.q, 0.5, c.time * 0.25 + 0.6, 0.3);
    o.thick = 3 * c.k;
    o.face = 0;
    o.blue = 1;
  }
  {
    const o = out[5];
    cube(o, cx + size * 1.05, cy + size * 0.42, 0.2, size * 0.4);
    setEuler(o.q, 0.8, -c.time * 0.35, 0.2);
    o.thick = 2.4 * c.k;
    o.face = 0;
    o.blue = 0;
  }
  // Blocks pour into the cards (they disappear behind the opaque card surface).
  for (let i = 0; i < BLOCKS; i++) {
    const o = out[FRAMES + i];
    const r = c.rect(`svc-${i}`);
    if (!r) continue;
    cube(o, r.l + 70 * c.k, r.t - 70 * c.k, -0.4, 44 * c.k);
    setEuler(o.q, 0.3, 0.6, 0);
    o.vis = 1;
  }
  {
    const o = out[GLASS];
    cube(o, cx, cy, 0, size * 0.5);
    setEuler(o.q, -0.3, -c.time * 0.3, 0.4);
    o.vis = 1;
  }
  {
    const o = out[ARROW];
    // Points down toward the service grid, beside (never over) the intro copy.
    const dir = _v.set(0.5, -0.86, 0).normalize();
    const s = size * 0.62;
    const nudge = Math.sin(c.time * 1.6) * 4 * c.k;
    o.p.set(cx + size * 2.05 + dir.x * nudge, cy - size * 0.12 + dir.y * nudge, 0.3);
    pointAlong(o.q, dir);
    o.w = o.h = o.d = s;
    o.vis = 1;
  }
}

export function stateWork(c: Ctx, out: Box[]) {
  const m = c.rect('featured');
  if (!m) return;
  const pad = 14 * c.k;
  const d4 = (c.compact ? 22 : 40) * c.k;
  {
    const o = out[4];
    anchor(o, m, d4, pad);
    o.thick = 2.6 * c.k;
    o.face = 1;
    o.blue = 1;
  }
  // Depth echoes receding down-left behind the featured project.
  const e = (c.compact ? 8 : 12) * c.k;
  for (let j = 0; j < 4; j++) {
    const o = out[j];
    // On narrow layouts the echoes stay tucked behind the image so no line crosses the copy below it.
    const off = c.compact ? d4 * 0.5 : d4 + (j + 1) * e;
    o.w = m.w + pad * 2;
    o.h = m.h + pad * 2;
    o.d = 2 * c.k;
    o.sx = o.sy = 0;
    o.q.identity();
    o.p.set(m.cx - off, m.cy - off, -0.2 - j * 0.25);
    o.thick = 1.7 * c.k;
    o.face = 0;
    o.blue = 1 - j * 0.22;
  }
  const slot = c.rect('work-cursor');
  const usable = slot && slot.w > 0 && !c.compact;
  {
    const o = out[5];
    if (usable) {
      const s = slot!.h * 0.62;
      cube(o, slot!.cx + s * 0.35, slot!.cy, 0, s);
      setEuler(o.q, 0.35, -0.5 + Math.sin(c.time * 0.6) * 0.08, 0.1);
      o.thick = 2.4 * c.k;
    } else {
      cube(o, m.cx, m.cy, -1, 30 * c.k);
      o.q.identity();
      o.thick = 1 * c.k;
    }
    o.face = 0;
    o.blue = 1;
  }
  for (let i = 0; i < BLOCKS; i++) {
    const o = out[FRAMES + i];
    cube(o, m.cx + (i - 1.5) * 50 * c.k, m.cy, -1.2, 50 * c.k);
    setEuler(o.q, 0.4 * i, 0.5, 0);
    o.vis = 0.6;
  }
  {
    const o = out[GLASS];
    cube(o, m.cx, m.cy, -1.2, 60 * c.k);
    o.q.identity();
    o.vis = 0.5;
  }
  {
    const o = out[ARROW];
    if (usable) {
      const dir = _v2.set(m.cx - slot!.cx, m.cy - slot!.cy, 0).normalize().clone();
      const s = slot!.h * 0.75;
      const pulse = Math.sin(c.time * 2.2) * 4 * c.k;
      o.p.set(slot!.cx + dir.x * (s * 0.55 + pulse), slot!.cy + dir.y * (s * 0.55 + pulse), 0.35);
      pointAlong(o.q, dir);
      o.w = o.h = o.d = s;
      o.vis = 1;
    } else {
      o.p.set(m.cx, m.cy, -1);
      o.q.identity();
      o.w = o.h = o.d = 40 * c.k;
      o.vis = 0.3;
    }
  }
}

export function stateProcess(c: Ctx, out: Box[]) {
  const R = c.ribbon;
  const P = _t;
  const T = new THREE.Vector3();
  const gate = (c.compact ? 64 : 96) * c.k;
  // Gateways the ribbon threads through, each paired with a smaller echo.
  for (let i = 0; i < FRAMES; i++) {
    const o = out[i];
    const pair = i % 3;
    const echo = i >= 3;
    const f = (pair * 2 + 1) / 6 + (echo ? 0.035 : 0);
    if (R) {
      sampleRibbon(R, f, P, T);
      P.add(c.ribbonOrigin);
    } else P.set(0, 0, 0);
    const s = gate * (echo ? 0.72 : 1);
    cube(o, P.x, P.y, P.z, s);
    o.d = (echo ? 6 : 10) * c.k;
    const dir = _v.copy(Zaxis).lerp(T, echo ? 0.85 : 0.68).normalize();
    o.q.setFromUnitVectors(Zaxis, dir);
    o.q.multiply(setEuler(_q, 0, 0, Math.sin(c.time * 0.5 + i) * 0.06 + (echo ? 0.4 : 0)));
    o.thick = (echo ? 1.8 : 2.4) * c.k;
    o.face = 0;
    o.blue = echo ? 1 : 0.35;
  }
  for (let i = 0; i < BLOCKS; i++) {
    const o = out[FRAMES + i];
    const r = c.rect(`node-${i}`);
    if (!r) continue;
    anchor(o, r, (c.compact ? 9 : 12) * c.k);
    o.vis = 1;
  }
  {
    const o = out[GLASS];
    const r = c.rect('node-3');
    cube(o, r ? r.cx : 0, r ? r.cy : 0, -1, 30 * c.k);
    o.q.identity();
    o.vis = 0.001;
  }
  {
    const o = out[ARROW];
    const s = (c.compact ? 40 : 56) * c.k;
    if (R) {
      sampleRibbon(R, c.process, P, T);
      P.add(c.ribbonOrigin);
    }
    // Tip rides the ribbon's leading edge.
    o.p.copy(P).addScaledVector(T, -s * 0.45);
    o.p.z += 0.15;
    pointAlong(o.q, T);
    o.w = o.h = o.d = s;
    o.vis = 1;
  }
}

// ---------- Final REACH composition (units of the contact stage) ----------
// Two cubes over three — the logo's stair — plus the small arrow box. [x, y, size] front-face centres
const STAIR = [
  [-1.65, 0.55, 1.1],
  [-0.55, 0.55, 1.1],
  [-0.55, -0.55, 1.1],
  [0.55, -0.55, 1.1],
  [1.65, -0.55, 1.1],
  [0.66, 0.74, 0.5],
];
export const CONTACT_GROUND = -1.55;

export function contactUnit(c: Ctx) {
  const s = c.rect('contact-stage');
  if (!s) return null;
  return { s, u: Math.min(s.w / 4.7, s.h / 3.5) };
}

export function stateContact(c: Ctx, out: Box[]) {
  const cu = contactUnit(c);
  if (!cu) return;
  const { s, u } = cu;
  const ox = s.cx + 0.22 * u;
  const oy = s.cy + 0.22 * u;
  const d = 0.42 * u;
  for (let i = 0; i < FRAMES; i++) {
    const [x, y, sz] = STAIR[i];
    const o = out[i];
    const bob = i === 5 ? Math.sin(c.time * 1.2) * 0.04 * u : 0;
    const r: WRect = { cx: ox + x * u, cy: oy + y * u + bob, w: sz * u, h: sz * u, l: 0, r: 0, t: 0, b: 0 };
    anchor(o, r, i === 5 ? d * 0.5 : d);
    o.thick = 0.045 * u;
    o.face = 1;
    o.blue = 1;
  }
  // Solid blocks: two sit inside the stair (like the letters), two rest on it.
  const inside = (i: number, cubeIdx: number, sz: number, spin: number) => {
    const [x, y] = STAIR[cubeIdx];
    const o = out[FRAMES + i];
    cube(o, ox + x * u - d / 2, oy + y * u - d / 2, -d / 2, sz * u);
    setEuler(o.q, 0.25, c.time * spin + i, 0.1);
    o.vis = 1;
  };
  inside(0, 0, 0.46, 0.25);
  inside(1, 3, 0.46, -0.2);
  {
    const o = out[FRAMES + 2];
    const [x, y, sz] = STAIR[4];
    cube(o, ox + (x + 0.1) * u, oy + (y + sz / 2 + 0.17) * u, -0.1 * u, 0.32 * u);
    setEuler(o.q, 0, 0.5 + Math.sin(c.time * 0.5) * 0.1, 0);
    o.vis = 1;
  }
  {
    const o = out[FRAMES + 3];
    cube(o, ox - 2.35 * u, oy - 0.95 * u, 0.2 * u, 0.24 * u);
    setEuler(o.q, 0.3, 0.8, 0.2);
    o.vis = 1;
  }
  {
    const [x, y] = STAIR[2];
    const o = out[GLASS];
    cube(o, ox + x * u - d / 2, oy + y * u - d / 2, -d / 2, 0.5 * u);
    setEuler(o.q, -0.2, -c.time * 0.22, 0.2);
    o.vis = 1;
  }
  {
    const o = out[ARROW];
    const slot = c.rect('cta-arrow');
    const btn = c.rect('cta-button');
    if (slot && btn && slot.w > 0) {
      const dir = _v2.set(btn.cx - slot.cx, btn.cy - slot.cy, 0);
      if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0);
      dir.normalize();
      const sz = Math.min(slot.h * 0.95, (c.compact ? 44 : 56) * c.k);
      const pulse = (Math.sin(c.time * 2.6) * 0.5 + 0.5) * 6 * c.k;
      o.p.set(slot.cx + dir.x * pulse, slot.cy + dir.y * pulse, 0.3);
      pointAlong(o.q, dir);
      o.w = o.h = o.d = sz;
    } else {
      const [x, y] = STAIR[5];
      o.p.set(ox + x * u, oy + y * u, 0.3);
      pointAlong(o.q, X.clone().set(1, 1, 0));
      o.w = o.h = o.d = 0.6 * u;
    }
    o.vis = 1;
  }
}

export const STATES = [stateHero, stateServices, stateWork, stateProcess, stateContact];
