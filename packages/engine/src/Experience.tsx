import React from 'react';
import { Canvas } from '@react-three/fiber';

export function ExperienceScene() {
  return (
    <>
      <fog attach="fog" args={['#000000', 5, 100]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      {/* Basic scene content just to verify rendering */}
      <mesh position={[0, 0, -5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </>
  );
}

export function Experience() {
  return (
    <Canvas
      camera={{
        position: [0, 1.7, 0], // fixed human-eye height
        fov: 75,
      }}
      style={{ width: '100vw', height: '100vh' }}
    >
      <ExperienceScene />
    </Canvas>
  );
}
