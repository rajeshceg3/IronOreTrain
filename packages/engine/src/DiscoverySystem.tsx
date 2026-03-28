import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@iron-ore-train/state';

interface DiscoveryObject {
  id: string;
  position: [number, number, number];
  text: string;
  radius: number;
}

export function DiscoverySystem({ trainOffsetRef }: { trainOffsetRef: React.MutableRefObject<number> }) {
  const setActiveText = useExperienceStore((store) => store.setActiveText);
  const state = useExperienceStore((store) => store.state);

  // Group to move with the train
  const groupRef = useRef<THREE.Group>(null);
  const clothRef = useRef<THREE.Mesh>(null);

  // Define positions relative to train's 0 offset
  // Boarding happens near Z=0. We'll place objects further back on the train (negative Z).
  // The train moves towards user, so it starts at offset 1000 and ends up around 0.
  // We'll place objects at negative Z offsets so user has to drift back to see them.
  const objects = useMemo<DiscoveryObject[]>(() => [
    {
      id: 'cloth',
      position: [2, 1, -30], // Attached to side of wagon
      text: "People ride this for survival.",
      radius: 5, // Trigger distance
    },
    {
      id: 'footprints',
      position: [2, 0.9, -80], // Top of ore pile
      text: "12+ hours exposed to the desert.",
      radius: 5,
    },
    {
      id: 'silhouette',
      position: [2, 1.5, -200], // Far back
      text: "700 kilometers. Zouérat to Nouadhibou.",
      radius: 15,
    }
  ], []);

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return;

    // Sync group Z with trainOffset
    groupRef.current.position.z = trainOffsetRef.current;

    // Small cloth animation
    if (clothRef.current) {
      clothRef.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.1;
      clothRef.current.rotation.z = Math.cos(clock.elapsedTime * 3) * 0.05;
    }

    if (state !== 'EXPLORATION' && state !== 'DISCOVERY' && state !== 'NIGHT') {
      setActiveText(null);
      return;
    }

    // Check distance/gaze to trigger text
    let activeId: string | null = null;
    let closestText: string | null = null;
    let minDistance = Infinity;

    // Use a raycaster or simple distance check
    // Given the simple movement, distance check is sufficient and performant
    const cameraWorldPos = new THREE.Vector3();
    camera.getWorldPosition(cameraWorldPos);

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    objects.forEach((obj) => {
      // Calculate object's world position
      const objWorldPos = new THREE.Vector3(...obj.position);
      objWorldPos.z += trainOffsetRef.current;

      const distance = cameraWorldPos.distanceTo(objWorldPos);

      if (distance < obj.radius) {
        // Also check if camera is generally looking towards the object
        const dirToObject = new THREE.Vector3().subVectors(objWorldPos, cameraWorldPos).normalize();
        const angle = cameraDirection.angleTo(dirToObject);

        // If looking roughly towards it (within ~45 degrees)
        if (angle < Math.PI / 4 && distance < minDistance) {
          minDistance = distance;
          closestText = obj.text;
          activeId = obj.id;
        }
      }
    });

    if (activeId) {
      if (state === 'EXPLORATION') {
        useExperienceStore.getState().setState('DISCOVERY');
      }
      setActiveText(closestText);
    } else {
      setActiveText(null);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Cloth */}
      <mesh ref={clothRef} position={objects[0].position}>
        <planeGeometry args={[0.5, 0.8]} />
        <meshStandardMaterial color="#c2b280" side={THREE.DoubleSide} roughness={0.9} />
      </mesh>

      {/* Footprints (simple decals on top of ore) */}
      <mesh position={objects[1].position} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial color="#2a1e1b" transparent opacity={0.7} depthWrite={false} />
      </mesh>

      {/* Distant Silhouette */}
      <mesh position={objects[2].position}>
        <planeGeometry args={[0.8, 1.8]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
