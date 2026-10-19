import { advance, Canvas } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { isCompactViewport } from '../lib/env';
import { setSceneTick } from '../lib/loop';
import { frames, runtime } from '../lib/runtime';
import { World } from './World';

/** Ambient motion keeps running at ~30 fps for this long after the last interaction, then rendering stops. */
const AMBIENT_MS = 6000;

/**
 * Fixed, transparent, pointer-transparent canvas behind the semantic HTML.
 * frameloop="never": frames are rendered from the shared GSAP tick (see lib/loop.ts), right after the scroll
 * position updates, so the 3D never lags the page. Rendering stops entirely when nothing is moving.
 */
export default function Scene({ onFail }: { onFail: () => void }) {
  const compact = isCompactViewport();

  useEffect(() => {
    let lastRender = 0;
    setSceneTick((t) => {
      if (document.hidden) return;
      const now = performance.now();
      const ambient = now - runtime.lastActivity < AMBIENT_MS && now - lastRender > 32;
      if (frames.requested || frames.keepAlive || ambient) {
        frames.requested = false;
        lastRender = now;
        advance(t);
      }
    });
    return () => setSceneTick(null);
  }, []);

  return (
    <Canvas
      flat
      frameloop="never"
      dpr={[1, compact ? 1.25 : 1.5]}
      camera={{ fov: 30, position: [0, 0, 20], near: 1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        const pmrem = new THREE.PMREMGenerator(gl);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environmentIntensity = 0.35;
        pmrem.dispose();
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onFail();
        });
        frames.requested = true;
        document.documentElement.classList.add('scene-ready');
      }}
    >
      <World compact={compact} />
    </Canvas>
  );
}
