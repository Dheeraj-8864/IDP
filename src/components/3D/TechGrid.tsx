import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function TechGrid() {
  const gridRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.x = -Math.PI / 2;
      gridRef.current.position.y = -3;
      const material = gridRef.current.material as any;
      if (material.opacity !== undefined) {
        material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      }
    }
  });

  return (
    <mesh ref={gridRef}>
      <planeGeometry args={[20, 20, 20, 20]} />
      <meshBasicMaterial 
        color="#0080ff" 
        wireframe 
        transparent 
        opacity={0.15} 
      />
    </mesh>
  );
}