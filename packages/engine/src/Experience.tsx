import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Desert } from './Desert';
import { Train } from './Train';
import { CameraController } from './CameraController';
import { useEnvironmentTime } from './useEnvironmentTime';
import { AudioController } from './AudioController';
import { detectWebGLSupport } from './WebGLSupport';

const SKY_COLORS = {
  dawn: '#5f7185',
  day: '#b2c7d8',
  dusk: '#483a3a',
  night: '#090c12',
} as const;

export function ExperienceScene() {
  const { timeOfDay } = useEnvironmentTime();

  const ambientIntensity = timeOfDay === 'night' ? 0.2 : timeOfDay === 'dusk' ? 0.35 : 0.5;
  const directionalIntensity = timeOfDay === 'night' ? 0.1 : timeOfDay === 'dusk' ? 0.6 : 1;
  const fogFar = timeOfDay === 'night' ? 220 : 300;

  return (
    <>
      <fog attach="fog" args={[SKY_COLORS[timeOfDay], 10, fogFar]} />

      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[10, 10, 10]} intensity={directionalIntensity} />

      <Desert />
      <Train />
      <CameraController />
      <AudioController />
    </>
  );
}

export function Experience() {
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  useEffect(() => {
    setIsWebGLSupported(detectWebGLSupport());
  }, []);

  if (!isWebGLSupported) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-sm text-gray-300" role="status">
        WebGL is not available in this browser. Please enable hardware acceleration or use a compatible browser.
      </div>
    );
  }

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
