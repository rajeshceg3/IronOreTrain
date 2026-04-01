import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@iron-ore-train/state';

export function DustParticles() {
  const state = useExperienceStore((store) => store.state);
  const settings = useExperienceStore((store) => store.settings);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particleCount = 200;

  // Set ground speed equivalent to use in Desert to represent wind/movement
  const speed = useMemo(() => {
    const reducedMotion = settings.reducedMotion;
    switch (state) {
      case 'ARRIVAL':
      case 'ORIENTATION':
      case 'BOARDING':
        return 0; // The train is arriving/boarding, not fully in motion from passenger view
      case 'EXPLORATION':
      case 'DISCOVERY':
      case 'NIGHT':
      case 'REFLECTION':
        return reducedMotion ? 7.5 : 15; // Fast horizontal wind when boarded
      default:
        return 0;
    }
  }, [state, settings.reducedMotion]);

  const particlesData = useMemo(() => {
    return Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * 50, // width spread
      y: Math.random() * 5, // height
      z: (Math.random() - 0.5) * 50, // depth spread
      speedFactor: 0.5 + Math.random(), // slight variation
    }));
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!meshRef.current || speed === 0) return;

    const dummy = new THREE.Object3D();

    particlesData.forEach((particle, i) => {
      // Move particles along Z axis to simulate fast forward movement/wind
      particle.z += speed * particle.speedFactor * delta;

      // Loop particles back
      if (particle.z > 25) {
        particle.z -= 50;
        // optionally randomize x and y again
        particle.x = (Math.random() - 0.5) * 50;
        particle.y = Math.random() * 5;
      }

      dummy.position.set(particle.x, particle.y, particle.z);
      // add a slight rotation based on time
      dummy.rotation.x += delta;
      dummy.rotation.y += delta;
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (speed === 0) {
    return null; // Efficiently skip rendering if not moving
  }

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <planeGeometry args={[0.05, 0.05]} />
      <meshBasicMaterial color="#c2b280" transparent opacity={0.6} depthWrite={false} />
    </instancedMesh>
  );
}
