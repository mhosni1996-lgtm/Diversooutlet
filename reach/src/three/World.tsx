import { invalidate, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { onPoke, runtime } from '../lib/runtime';
import {
  ARROW,
  BLOCKS,
  CONTACT_GROUND,
  COUNT,
  contactUnit,
  easeInOut,
  FRAMES,
  GLASS,
  HERO_GROUND,
  heroUnit,
  lerpBox,
  makeBox,
  STATES,
  type Box,
  type Ctx,
  type WRect,
} from './choreography';
import { buildRibbon, createArrowGeometry, type Ribbon } from './geometry';

const BRAND = {
  blue: new THREE.Color('#4847AE'),
  yellow: new THREE.Color('#FCD704'),
  ice: new THREE.Color('#D4ECF6'),
  silver: new THREE.Color('#E6E9F0'),
};

const CAMERA_Z = 20;
const FOV = 30;
const VIS_H = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));

// Edge index pairs of a cube whose corners are indexed by bits (x:1, y:2, back:4)
const EDGES: [number, number][] = [];
for (let i = 0; i < 8; i++) for (const bit of [1, 2, 4]) if (!(i & bit)) EDGES.push([i, i | bit]);

const damp = (a: number, b: number, lambda: number, dt: number) => THREE.MathUtils.lerp(a, b, 1 - Math.exp(-lambda * dt));

const ANCHOR_KEYS = ['hero-stage', 'svc-0', 'svc-1', 'svc-2', 'svc-3', 'svc-deco', 'featured', 'work-cursor', 'process-track', 'node-0', 'node-1', 'node-2', 'node-3', 'contact-stage', 'cta-arrow', 'cta-button'];

export function World({ compact }: { compact: boolean }) {
  const { camera, size } = useThree();

  // ---------- Shared geometry & materials (created once) ----------
  const res = useMemo(() => {
    const edgeGeo = new THREE.BoxGeometry(1, 1, 1);
    const faceGeo = new THREE.PlaneGeometry(1, 1);
    const blockGeo = new RoundedBoxGeometry(1, 1, 1, 2, 0.07);
    const arrowGeo = createArrowGeometry();
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.42 });
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
    const blockMat = new THREE.MeshStandardMaterial({ color: BRAND.blue, roughness: 0.62, metalness: 0.02 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: BRAND.ice,
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    const arrowMat = new THREE.MeshStandardMaterial({ color: BRAND.yellow, roughness: 0.38, metalness: 0.02 });
    const ribbonMat = new THREE.MeshStandardMaterial({ color: BRAND.yellow, roughness: 0.45, metalness: 0, side: THREE.DoubleSide });
    const shadowMat = new THREE.ShadowMaterial({ color: 0x14142b, opacity: 0, transparent: true });
    return { edgeGeo, faceGeo, blockGeo, arrowGeo, edgeMat, faceMat, blockMat, glassMat, arrowMat, ribbonMat, shadowMat };
  }, []);

  useEffect(
    () => () => {
      Object.values(res).forEach((r) => (r as THREE.BufferGeometry | THREE.Material).dispose());
    },
    [res],
  );

  const edgesRef = useRef<THREE.InstancedMesh>(null);
  const facesRef = useRef<THREE.InstancedMesh>(null);
  const blocksRef = useRef<THREE.InstancedMesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const arrowRef = useRef<THREE.Mesh>(null);
  const ribbonRef = useRef<THREE.Mesh>(null);
  const groundRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.DirectionalLight>(null);

  // ---------- Per-frame state (no allocations in the loop) ----------
  const sim = useMemo(() => {
    const A = Array.from({ length: COUNT }, makeBox);
    const B = Array.from({ length: COUNT }, makeBox);
    const cur = Array.from({ length: COUNT }, makeBox);
    return {
      A,
      B,
      cur,
      story: runtime.story,
      hero: runtime.hero,
      process: runtime.process,
      pointer: { x: 0, y: 0 },
      hover: [0, 0, 0, 0],
      introStart: -1,
      els: new Map<string, HTMLElement>(),
      rects: new Map<string, WRect>(),
      layoutVersion: -1,
      ribbon: null as Ribbon | null,
      ribbonKey: '',
      ribbonOrigin: new THREE.Vector3(),
      idleTimer: 0 as number | ReturnType<typeof setTimeout>,
      corners: Array.from({ length: 8 }, () => new THREE.Vector3()),
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      v: new THREE.Vector3(),
      v2: new THREE.Vector3(),
      v3: new THREE.Vector3(),
      s: new THREE.Vector3(),
      color: new THREE.Color(),
      zero: new THREE.Matrix4().makeScale(0, 0, 0),
    };
  }, []);

  // Wake the demand frameloop on scroll / pointer / hover / resize.
  useEffect(() => {
    const off = onPoke(() => invalidate());
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      runtime.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      runtime.pointer.y = (e.clientY / innerHeight) * 2 - 1;
      runtime.lastActivity = performance.now();
      invalidate();
    };
    const onResize = () => {
      runtime.layoutVersion++;
      invalidate();
    };
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('resize', onResize);
    return () => {
      off();
      removeEventListener('pointermove', onMove);
      removeEventListener('resize', onResize);
      clearTimeout(sim.idleTimer);
    };
  }, [sim]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const now = state.clock.elapsedTime;
    if (sim.introStart < 0) sim.introStart = now;
    const vw = size.width;
    const vh = size.height;
    const k = VIS_H / vh;

    // ---- Smooth the scroll-derived inputs ----
    sim.story = damp(sim.story, runtime.story, 7, dt);
    sim.hero = damp(sim.hero, runtime.hero, 8, dt);
    sim.process = damp(sim.process, runtime.process, 8, dt);
    sim.pointer.x = damp(sim.pointer.x, runtime.pointer.x, 3, dt);
    sim.pointer.y = damp(sim.pointer.y, runtime.pointer.y, 3, dt);
    for (let i = 0; i < 4; i++) sim.hover[i] = damp(sim.hover[i], runtime.hover === i ? 1 : 0, 9, dt);

    // ---- Read DOM anchors (rects → world, front-face plane z = 0) ----
    if (sim.layoutVersion !== runtime.layoutVersion) {
      sim.layoutVersion = runtime.layoutVersion;
      sim.els.clear();
      for (const key of ANCHOR_KEYS) {
        const el = document.querySelector<HTMLElement>(`[data-anchor="${key}"]`);
        if (el) sim.els.set(key, el);
      }
    }
    sim.rects.clear();
    const rect = (key: string): WRect | null => {
      const cached = sim.rects.get(key);
      if (cached) return cached;
      const el = sim.els.get(key);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return null;
      const w: WRect = {
        cx: (r.left + r.width / 2 - vw / 2) * k,
        cy: (vh / 2 - (r.top + r.height / 2)) * k,
        w: r.width * k,
        h: r.height * k,
        l: (r.left - vw / 2) * k,
        r: (r.right - vw / 2) * k,
        t: (vh / 2 - r.top) * k,
        b: (vh / 2 - r.bottom) * k,
      };
      sim.rects.set(key, w);
      return w;
    };

    // ---- Ribbon: rebuild when the track layout changes ----
    const trackEl = sim.els.get('process-track');
    if (trackEl) {
      const tr = trackEl.getBoundingClientRect();
      const nodes: { x: number; y: number }[] = [];
      for (let i = 0; i < 4; i++) {
        const n = sim.els.get(`node-${i}`)?.getBoundingClientRect();
        if (n) nodes.push({ x: n.left + n.width / 2 - tr.left, y: n.top + n.height / 2 - tr.top });
      }
      const key = `${Math.round(tr.width)}x${Math.round(tr.height)}:${vh}:${nodes.map((n) => `${Math.round(n.x)},${Math.round(n.y)}`).join('|')}`;
      if (nodes.length === 4 && key !== sim.ribbonKey) {
        sim.ribbonKey = key;
        sim.ribbon = buildRibbon(nodes, k, compact ? 9 : 13, sim.ribbon ?? undefined);
        if (ribbonRef.current) ribbonRef.current.geometry = sim.ribbon.geometry;
      }
      sim.ribbonOrigin.set((tr.left - vw / 2) * k, (vh / 2 - tr.top) * k, -0.12);
    }

    const ctx: Ctx = {
      k,
      vw,
      vh,
      rect,
      time: now,
      hero: sim.hero,
      process: sim.process,
      intro: Math.min((now - sim.introStart) / 1.9, 1),
      pointer: sim.pointer,
      hover: sim.hover,
      compact,
      ribbon: sim.ribbon,
      ribbonOrigin: sim.ribbonOrigin,
    };

    // ---- Evaluate the two neighbouring states and blend with a per-element stagger ----
    const story = THREE.MathUtils.clamp(sim.story, 0, 4);
    const i0 = Math.min(Math.floor(story), 3);
    const local = story - i0;
    STATES[i0](ctx, sim.A);
    STATES[i0 + 1](ctx, sim.B);
    const spread = 0.035;
    for (let e = 0; e < COUNT; e++) {
      const se = easeInOut(THREE.MathUtils.clamp((local - e * spread) / (1 - spread * (COUNT - 1)), 0, 1));
      const o = sim.cur[e];
      lerpBox(o, sim.A[e], sim.B[e], se);
      // Elements arc toward the camera mid-flight, so transitions read as movement through depth.
      o.p.z += Math.sin(Math.PI * se) * (compact ? 0.6 : 1.3);
    }

    writeInstances(sim, k, edgesRef.current, facesRef.current, blocksRef.current, sim.hover, story);

    // Glass + arrow
    const g = sim.cur[GLASS];
    if (glassRef.current) {
      glassRef.current.position.copy(g.p);
      glassRef.current.quaternion.copy(g.q);
      glassRef.current.scale.set(g.w * g.vis, g.h * g.vis, g.d * g.vis);
    }
    const a = sim.cur[ARROW];
    if (arrowRef.current) {
      arrowRef.current.position.copy(a.p);
      arrowRef.current.quaternion.copy(a.q);
      arrowRef.current.scale.setScalar(Math.max(a.w * a.vis, 1e-4));
    }

    // Ribbon progress
    if (ribbonRef.current && sim.ribbon) {
      const total = sim.ribbon.points.length - 1;
      const n = Math.floor(sim.process * total);
      ribbonRef.current.geometry.setDrawRange(0, n * 6);
      ribbonRef.current.position.copy(sim.ribbonOrigin);
      ribbonRef.current.visible = n > 0 && story > 1.5;
    }

    // Soft contact shadow on an invisible floor: under the hero sculpture, later under the final stair.
    const hu = heroUnit(ctx);
    const cu = contactUnit(ctx);
    const heroW = 1 - THREE.MathUtils.clamp(story, 0, 1);
    const contactW = THREE.MathUtils.clamp(story - 3, 0, 1);
    if (groundRef.current && lightRef.current) {
      const useHero = heroW >= contactW;
      const unit = useHero ? hu : cu;
      if (unit) {
        const gy = useHero ? unit.s.cy + (0.15 + HERO_GROUND) * unit.u : unit.s.cy + CONTACT_GROUND * unit.u;
        groundRef.current.position.set(unit.s.cx, gy, 0);
        groundRef.current.scale.setScalar(unit.u * 9);
        lightRef.current.position.set(unit.s.cx + 1.5, gy + 12, 2.5);
        lightRef.current.target.position.set(unit.s.cx, gy, 0);
        lightRef.current.target.updateMatrixWorld();
      }
      res.shadowMat.opacity = 0.13 * Math.max(heroW, contactW * 0.7);
      groundRef.current.visible = res.shadowMat.opacity > 0.004;
    }

    // Camera: a gentle dolly while the hero opens, back to the canonical framing afterwards.
    const dolly = sim.hero * heroW;
    const cx = hu ? hu.s.cx * 0.12 * dolly : 0;
    camera.position.set(cx, 0, CAMERA_Z - 1.8 * dolly);

    // ---- Demand frameloop: full rate while active, 30 fps for ambient idle motion ----
    const settled =
      Math.abs(sim.story - runtime.story) < 1e-4 &&
      Math.abs(sim.hero - runtime.hero) < 1e-4 &&
      Math.abs(sim.process - runtime.process) < 1e-4 &&
      Math.abs(sim.pointer.x - runtime.pointer.x) < 1e-3 &&
      Math.abs(sim.pointer.y - runtime.pointer.y) < 1e-3 &&
      sim.hover.every((h, i) => Math.abs(h - (runtime.hover === i ? 1 : 0)) < 1e-3);
    const active = !settled || ctx.intro < 1 || performance.now() - runtime.lastActivity < 900;
    if (active) invalidate();
    else if (!sim.idleTimer) {
      sim.idleTimer = setTimeout(() => {
        sim.idleTimer = 0;
        invalidate();
      }, 1000 / 30);
    }
  });

  return (
    <>
      <hemisphereLight args={['#ffffff', '#d6deee', 1.0]} />
      <directionalLight
        ref={lightRef}
        position={[3, 9, 7]}
        intensity={2.0}
        castShadow={!compact}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <directionalLight position={[-6, 2, 8]} intensity={0.35} />

      <instancedMesh ref={edgesRef} args={[res.edgeGeo, res.edgeMat, FRAMES * 12]} castShadow frustumCulled={false} />
      <instancedMesh ref={facesRef} args={[res.faceGeo, res.faceMat, FRAMES * 2]} frustumCulled={false} />
      <instancedMesh ref={blocksRef} args={[res.blockGeo, res.blockMat, BLOCKS]} castShadow frustumCulled={false} />
      <mesh ref={glassRef} geometry={res.blockGeo} material={res.glassMat} renderOrder={2} frustumCulled={false} />
      <mesh ref={arrowRef} geometry={res.arrowGeo} material={res.arrowMat} castShadow frustumCulled={false} />
      <mesh ref={ribbonRef} material={res.ribbonMat} frustumCulled={false} />
      <mesh ref={groundRef} rotation-x={-Math.PI / 2} material={res.shadowMat} receiveShadow>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </>
  );
}

type Sim = {
  cur: Box[];
  corners: THREE.Vector3[];
  m: THREE.Matrix4;
  q: THREE.Quaternion;
  v: THREE.Vector3;
  v2: THREE.Vector3;
  v3: THREE.Vector3;
  s: THREE.Vector3;
  color: THREE.Color;
  zero: THREE.Matrix4;
};

const Y = new THREE.Vector3(0, 1, 0);
const _R = new THREE.Matrix4();

/** Frames → 12 edge bars of constant thickness + 2 ice side faces; blocks → sheared instanced boxes. */
function writeInstances(
  sim: Sim,
  k: number,
  edges: THREE.InstancedMesh | null,
  faces: THREE.InstancedMesh | null,
  blocks: THREE.InstancedMesh | null,
  hover: number[],
  story: number,
) {
  if (!edges || !faces || !blocks) return;
  const { corners, m, q, v, v2, v3, s, color } = sim;
  const servicesW = 1 - Math.min(Math.abs(story - 1), 1);

  for (let f = 0; f < FRAMES; f++) {
    const b = sim.cur[f];
    for (let i = 0; i < 8; i++) {
      const back = i & 4 ? 0.5 : -0.5;
      corners[i]
        .set((i & 1 ? 0.5 : -0.5) * b.w + b.sx * b.d * back, (i & 2 ? 0.5 : -0.5) * b.h + b.sy * b.d * back, (i & 4 ? -0.5 : 0.5) * b.d)
        .applyQuaternion(b.q)
        .add(b.p);
    }
    const t = Math.max(b.thick, 0.6 * k);
    color.copy(BRAND.silver).lerp(BRAND.blue, b.blue);
    for (let e = 0; e < 12; e++) {
      const [i0, i1] = EDGES[e];
      v.subVectors(corners[i1], corners[i0]);
      const len = v.length();
      if (len < 1e-5) {
        edges.setMatrixAt(f * 12 + e, sim.zero);
        continue;
      }
      q.setFromUnitVectors(Y, v.divideScalar(len));
      v2.addVectors(corners[i0], corners[i1]).multiplyScalar(0.5);
      m.compose(v2, q, s.set(t, len + t, t));
      edges.setMatrixAt(f * 12 + e, m);
      edges.setColorAt(f * 12 + e, color);
    }

    // Faces: left (x−: corners 0,2,4) and bottom (y−: corners 0,1,4), revealed from the front edge back.
    const hv = f < 4 ? hover[f] * servicesW : 0;
    color.copy(BRAND.ice).lerp(BRAND.yellow, hv * 0.9);
    for (let side = 0; side < 2; side++) {
      const idx = f * 2 + side;
      if (b.face < 0.01) {
        faces.setMatrixAt(idx, sim.zero);
        continue;
      }
      const c0 = corners[0];
      v.subVectors(side === 0 ? corners[2] : corners[1], c0);
      v2.subVectors(corners[4], c0).multiplyScalar(b.face);
      v3.crossVectors(v, v2).normalize();
      m.makeBasis(v, v2, v3);
      m.setPosition(c0.x + v.x / 2 + v2.x / 2, c0.y + v.y / 2 + v2.y / 2, c0.z + v.z / 2 + v2.z / 2);
      faces.setMatrixAt(idx, m);
      faces.setColorAt(idx, color);
    }
  }
  edges.instanceMatrix.needsUpdate = true;
  if (edges.instanceColor) edges.instanceColor.needsUpdate = true;
  faces.instanceMatrix.needsUpdate = true;
  if (faces.instanceColor) faces.instanceColor.needsUpdate = true;

  // Blocks: T · R · Shear · S (shear makes them extrude like the logo when locked to DOM nodes)
  for (let i = 0; i < BLOCKS; i++) {
    const b = sim.cur[FRAMES + i];
    const w = b.w * b.vis;
    const h = b.h * b.vis;
    const d = b.d * b.vis;
    m.set(w, 0, -b.sx * d, 0, 0, h, -b.sy * d, 0, 0, 0, d, 0, 0, 0, 0, 1);
    m.premultiply(_R.makeRotationFromQuaternion(b.q).setPosition(b.p));
    blocks.setMatrixAt(i, m);
  }
  blocks.instanceMatrix.needsUpdate = true;
}
