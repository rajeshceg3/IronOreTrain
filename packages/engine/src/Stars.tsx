import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnvironmentTime } from './useEnvironmentTime';

export function Stars() {
  const { timeOfDay } = useEnvironmentTime();
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const starCount = 3000;

  const positions = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      // Create a dome of stars around the origin
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      // Only keep upper hemisphere
      if (phi > Math.PI / 2) continue;

      const r = 200 + Math.random() * 50; // Distance

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [starCount]);

  useFrame((_, delta) => {
    if (materialRef.current) {
      // Fade in stars during night
      const targetOpacity = timeOfDay === 'night' ? 0.8 : 0;
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        targetOpacity,
        delta * 0.5
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.5}
        color="#ffffff"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </points>
  );
}
