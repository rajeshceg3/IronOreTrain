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

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(chunkSize * 2, chunkSize, 32, 32);
    const positions = geo.attributes.position;

    // Simple procedural noise via layered sine waves
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i); // This is Z in world space since plane is rotated

      // Create rolling dunes
      let z = 0;
      z += Math.sin(x * 0.05 + y * 0.05) * 2;
      z += Math.sin(x * 0.1 - y * 0.08) * 0.5;

      positions.setZ(i, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, [chunkSize]);

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
          geometry={geometry}
        />
      ))}
    </group>
  );
}
