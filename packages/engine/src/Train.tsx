import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@iron-ore-train/state';

export function Train() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const state = useExperienceStore((state) => state.state);

  const wagonCount = 200;
  const wagonLength = 12; // approximate length of an ore wagon
  const wagonSpacing = 1;
  const totalLength = wagonCount * (wagonLength + wagonSpacing);

  const trainSpeed = useMemo(() => {
    switch (state) {
      case 'ARRIVAL':
        return 10; // approaching
      case 'ORIENTATION':
        return 5; // slowing down as it nears
      case 'BOARDING':
        return 2; // slow passing by to board
      case 'EXPLORATION':
      case 'DISCOVERY':
      case 'NIGHT':
      case 'REFLECTION':
        return 0; // The train is "stationary" relative to the boarded user, desert moves instead
      default:
        return 0;
    }
  }, [state]);

  const trainOffset = useRef(1000); // Start far away

  useEffect(() => {
    if (meshRef.current) {
      const dummy = new THREE.Object3D();
      // Initialize instanced mesh positions
      for (let i = 0; i < wagonCount; i++) {
        dummy.position.set(2, 0, -i * (wagonLength + wagonSpacing));
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [wagonCount, wagonLength, wagonSpacing]);

  useFrame((_, delta) => {
    if (meshRef.current && trainSpeed > 0) {
      // Move train forward towards user
      trainOffset.current -= trainSpeed * delta;

      const dummy = new THREE.Object3D();
      for (let i = 0; i < wagonCount; i++) {
        // Position relative to the train offset
        const zPos = trainOffset.current - i * (wagonLength + wagonSpacing);
        dummy.position.set(2, 0, zPos);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, wagonCount]}>
      <boxGeometry args={[3, 2, wagonLength]} />
      <meshStandardMaterial color="#4a2e2b" roughness={0.8} /> {/* Iron red rust color */}
    </instancedMesh>
  );
}
