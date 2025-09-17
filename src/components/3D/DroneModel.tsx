import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';

export function DroneModel() {
  const droneRef = useRef<Group>(null);

  useFrame((state) => {
    if (droneRef.current) {
      droneRef.current.rotation.y += 0.005;
      droneRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group ref={droneRef} position={[3, 1, 0]} scale={0.8}>
      {/* Drone Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.3, 1]} />
        <meshStandardMaterial color="#1e40af" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Camera Gimbal */}
      <mesh position={[0, -0.3, 0.3]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Arms */}
      {[-1, 1].map((x, i) =>
        [-1, 1].map((z, j) => (
          <group key={`${i}-${j}`} position={[x * 0.8, 0, z * 0.4]}>
            <mesh>
              <cylinderGeometry args={[0.03, 0.03, 1]} />
              <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Propellers */}
            <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.02]} />
              <meshStandardMaterial color="#0ea5e9" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))
      )}
      
      {/* LED Lights */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0.6]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}