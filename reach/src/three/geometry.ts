import * as THREE from 'three';

/**
 * The REACH arrow: the logo's cursor as a double chevron, extruded and bevelled.
 * Normalised to length 1 along +X (tail −0.5, tip +0.5), flat faces toward +Z.
 */
export function createArrowGeometry() {
  const main = new THREE.Shape();
  main.moveTo(1, 0);
  main.lineTo(-0.5, 0.62);
  main.lineTo(-0.16, 0);
  main.lineTo(-0.5, -0.62);
  main.closePath();

  const tail = new THREE.Shape();
  tail.moveTo(-0.3, 0);
  tail.lineTo(-0.98, 0.4);
  tail.lineTo(-0.76, 0);
  tail.lineTo(-0.98, -0.4);
  tail.closePath();

  const geo = new THREE.ExtrudeGeometry([main, tail], {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 2,
    curveSegments: 1,
  });
  geo.center();
  geo.computeBoundingBox();
  const len = geo.boundingBox!.max.x - geo.boundingBox!.min.x;
  geo.scale(1 / len, 1 / len, 1 / len);
  return geo;
}

export interface Ribbon {
  geometry: THREE.BufferGeometry;
  /** Sample positions and tangents (relative to the track's top-left, world units). */
  points: THREE.Vector3[];
  tangents: THREE.Vector3[];
  segments: number;
  perSegment: number;
}

const _v = new THREE.Vector3();
const Z = new THREE.Vector3(0, 0, 1);

/**
 * Folded ribbon through the process nodes. Each segment between two nodes is a cubic Bézier
 * that arcs *above* both nodes (or beside them on mobile) so it never runs through step copy,
 * and twists half a turn so it lies flat — facing the viewer — exactly at every node.
 * `nodes` are in px relative to the track's top-left (y down); `k` converts px → world.
 */
export function buildRibbon(nodes: { x: number; y: number }[], k: number, widthPx: number, prev?: Ribbon): Ribbon {
  const perSegment = 64;
  const segs = Math.max(1, nodes.length - 1);
  const N = segs * perSegment + 1;
  const points: THREE.Vector3[] = [];
  const tangents: THREE.Vector3[] = [];
  const toW = (x: number, y: number, z = 0) => new THREE.Vector3(x * k, -y * k, z);

  for (let s = 0; s < segs; s++) {
    const A = nodes[s];
    const B = nodes[s + 1];
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    let c1: THREE.Vector3, c2: THREE.Vector3;
    if (Math.abs(dx) >= Math.abs(dy)) {
      const lift = Math.min(A.y, B.y) - 70;
      c1 = toW(A.x + dx * 0.32, lift, 0.55);
      c2 = toW(B.x - dx * 0.32, lift, 0.55);
    } else {
      // Vertical (mobile) layout: stay in the node column — copy sits beside it, the screen edge on the other side.
      const side = (A.x + B.x) / 2;
      c1 = toW(side, A.y + dy * 0.3, 0.45);
      c2 = toW(side, B.y - dy * 0.3, 0.45);
    }
    const p0 = toW(A.x, A.y);
    const p3 = toW(B.x, B.y);
    const curve = new THREE.CubicBezierCurve3(p0, c1, c2, p3);
    for (let i = s === 0 ? 0 : 1; i <= perSegment; i++) {
      const t = i / perSegment;
      points.push(curve.getPoint(t));
      tangents.push(curve.getTangent(t).normalize());
    }
  }

  const geo = prev?.geometry ?? new THREE.BufferGeometry();
  const pos = new Float32Array(N * 6);
  const nor = new Float32Array(N * 6);
  const half = (widthPx * k) / 2;
  const B = new THREE.Vector3();
  const Nn = new THREE.Vector3();
  const W = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    const T = tangents[i];
    // Camera-facing normal orthogonal to the tangent, and the in-plane binormal.
    Nn.copy(Z).addScaledVector(T, -Z.dot(T)).normalize();
    B.crossVectors(T, Nn).normalize();
    const theta = (i / (N - 1)) * segs * Math.PI;
    W.copy(B).multiplyScalar(Math.cos(theta)).addScaledVector(Nn, Math.sin(theta)).multiplyScalar(half);
    const p = points[i];
    pos.set([p.x + W.x, p.y + W.y, p.z + W.z, p.x - W.x, p.y - W.y, p.z - W.z], i * 6);
    _v.crossVectors(T, W).normalize();
    nor.set([_v.x, _v.y, _v.z, _v.x, _v.y, _v.z], i * 6);
  }
  const idx = new Uint16Array((N - 1) * 6);
  for (let i = 0; i < N - 1; i++) {
    const a = i * 2;
    idx.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], i * 6);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeBoundingSphere();
  return { geometry: geo, points, tangents, segments: segs, perSegment };
}

/** Interpolated sample along the ribbon at fraction f (0..1). */
export function sampleRibbon(r: Ribbon, f: number, outP: THREE.Vector3, outT: THREE.Vector3) {
  const n = r.points.length - 1;
  const x = Math.min(Math.max(f, 0), 1) * n;
  const i = Math.min(Math.floor(x), n - 1);
  const t = x - i;
  outP.lerpVectors(r.points[i], r.points[i + 1], t);
  outT.lerpVectors(r.tangents[i], r.tangents[i + 1], t).normalize();
}
