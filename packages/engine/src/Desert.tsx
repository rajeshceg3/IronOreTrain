import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@iron-ore-train/state';

export function Desert() {
  const state = useExperienceStore((state) => state.state);

  const chunkSize = 100;
  const chunkCount = 5;
  const terrainMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#c2b280', roughness: 0.9, metalness: 0.1 }),
    []
  );

  const groupRef = useRef<THREE.Group>(null);

  // Derive ground speed from the state. We'll simplify and say only during EXPLORATION
  // and beyond does it move noticeably.
  const groundSpeed = useMemo(() => {
    switch (state) {
      case 'ARRIVAL':
      case 'ORIENTATION':
        return 0; // The user stands still, train approaches
      case 'BOARDING':
        return 2; // Speed up
      case 'EXPLORATION':
      case 'DISCOVERY':
      case 'NIGHT':
      case 'REFLECTION':
        return 10;
      default:
        return 0;
    }
  }, [state]);

  useFrame((_, delta) => {
    if (groupRef.current && groundSpeed > 0) {
      // Move chunks backward to simulate forward motion
      const children = groupRef.current.children;
      children.forEach((chunk) => {
        chunk.position.z += groundSpeed * delta;
        // If a chunk falls behind the camera, move it to the front
        if (chunk.position.z > chunkSize) {
          chunk.position.z -= chunkSize * chunkCount;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: chunkCount }).map((_, index) => (
        <mesh
          key={index}
          position={[0, -0.5, -index * chunkSize + chunkSize / 2]} // Offset to start slightly behind camera
          rotation={[-Math.PI / 2, 0, 0]}
          material={terrainMaterial}
        >
          <planeGeometry args={[chunkSize * 2, chunkSize, 32, 32]} />
          {/* We would typically add some procedural noise to vertices here */}
        </mesh>
      ))}
    </group>
  );
}
