import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { isCompactViewport } from '../lib/env';
import { World } from './World';

/**
 * Fixed, transparent, pointer-transparent canvas behind the semantic HTML.
 * Demand frameloop + capped DPR; no post-processing; one shadow-casting light on desktop only.
 */
export default function Scene({ onFail }: { onFail: () => void }) {
  const compact = isCompactViewport();
  return (
    <Canvas
      flat
      frameloop="demand"
      dpr={[1, compact ? 1.5 : 1.75]}
      shadows={compact ? false : 'percentage'}
      camera={{ fov: 30, position: [0, 0, 20], near: 1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
      style={{ position: 'absolute', inset: 0 }}
      events={undefined}
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
        document.documentElement.classList.add('scene-ready');
      }}
    >
      <World compact={compact} />
    </Canvas>
  );
}
