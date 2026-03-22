import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Desert } from './Desert';
import { Train } from './Train';
import { CameraController } from './CameraController';

export function ExperienceScene() {
  return (
    <>
      <fog attach="fog" args={['#000000', 10, 300]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      <Desert />
      <Train />
      <CameraController />
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
