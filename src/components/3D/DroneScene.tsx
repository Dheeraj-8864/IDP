import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { DroneModel } from './DroneModel';
import { TechGrid } from './TechGrid';
import { ParticleField } from './ParticleField';

export function DroneScene() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} color="#0080ff" />
          <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4080ff" />
          
          <DroneModel />
          <TechGrid />
          <ParticleField />
        </Suspense>
      </Canvas>
    </div>
  );
}