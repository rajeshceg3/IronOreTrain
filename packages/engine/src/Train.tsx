import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@iron-ore-train/state';
import { DiscoverySystem } from './DiscoverySystem';

export function Train() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const state = useExperienceStore((store) => store.state);
  const setIsTrainAligned = useExperienceStore((store) => store.setIsTrainAligned);
  const isTrainAligned = useExperienceStore((store) => store.isTrainAligned);

  const wagonCount = 200;
  const wagonLength = 12; // approximate length of an ore wagon
  const wagonSpacing = 1;
  const totalLength = wagonCount * (wagonLength + wagonSpacing);

  const settings = useExperienceStore((store) => store.settings);

  const trainSpeed = useMemo(() => {
    const reducedMotion = settings.reducedMotion;
    switch (state) {
      case 'ARRIVAL':
        return reducedMotion ? 5 : 10; // approaching
      case 'ORIENTATION':
        return reducedMotion ? 2.5 : 5; // slowing down as it nears
      case 'BOARDING':
        return isTrainAligned ? 0 : (reducedMotion ? 1 : 2); // stop when aligned to board
      case 'EXPLORATION':
      case 'DISCOVERY':
      case 'NIGHT':
      case 'REFLECTION':
        return 0; // The train is "stationary" relative to the boarded user, desert moves instead
      default:
        return 0;
    }
  }, [state, isTrainAligned, settings.reducedMotion]);

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
      let nextOffset = trainOffset.current - trainSpeed * delta;

      if (state === 'BOARDING' && !isTrainAligned) {
        // Try to snap to the nearest wagon alignment when boarding
        const segmentLength = wagonLength + wagonSpacing;
        const remainder = nextOffset % segmentLength;
        const normalizedRemainder = remainder >= 0 ? remainder : remainder + segmentLength;

        // If we are very close to a segment boundary, snap and stop
        if (normalizedRemainder < 0.1 || normalizedRemainder > segmentLength - 0.1) {
          nextOffset = Math.round(nextOffset / segmentLength) * segmentLength;
          setIsTrainAligned(true);
        }
      }

      trainOffset.current = nextOffset;

      const dummy = new THREE.Object3D();
      for (let i = 0; i < wagonCount; i++) {
        // Position relative to the train offset
        const zPos = trainOffset.current - i * (wagonLength + wagonSpacing);
        dummy.position.set(2, 0, zPos);

        // Simple LOD / Culling: if it's too far behind or way past the fog, scale to 0
        // Camera is mostly looking towards negative Z, and fog far is ~300 max
        // We'll cull wagons that are Z < -350 or Z > 50
        if (zPos < -350 || zPos > 50) {
          dummy.scale.set(0, 0, 0);
        } else {
          dummy.scale.set(1, 1, 1);
        }

        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, wagonCount]}>
        <boxGeometry args={[3, 2, wagonLength]} />
        <meshStandardMaterial color="#4a2e2b" roughness={0.8} /> {/* Iron red rust color */}
      </instancedMesh>
      <DiscoverySystem trainOffsetRef={trainOffset} />
    </>
  );
}
