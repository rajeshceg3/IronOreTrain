import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@iron-ore-train/state';
import { Desert } from './Desert';
import { Train } from './Train';
import { CameraController } from './CameraController';
import { useEnvironmentTime } from './useEnvironmentTime';
import { AudioController } from './AudioController';
import { detectWebGLSupport } from './WebGLSupport';
import { useExperienceFlow } from './useExperienceFlow';

const SKY_COLORS = {
  dawn: '#5f7185',
  day: '#b2c7d8',
  dusk: '#483a3a',
  night: '#090c12',
} as const;

export function ExperienceScene() {
  const { timeOfDay } = useEnvironmentTime();
  const state = useExperienceStore((store) => store.state);
  const fogRef = useRef<THREE.Fog>(null);
  useExperienceFlow();

  const ambientIntensity = timeOfDay === 'night' ? 0.2 : timeOfDay === 'dusk' ? 0.35 : 0.5;
  const directionalIntensity = timeOfDay === 'night' ? 0.1 : timeOfDay === 'dusk' ? 0.6 : 1;
  const targetFogFar = timeOfDay === 'night' ? 220 : 300;

  // Fog starts very near to hide everything at dawn, slowly reveals horizon
  const initialFogFar = 10;

  useFrame((_, delta) => {
    if (fogRef.current) {
      if (state === 'ARRIVAL') {
        fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, targetFogFar, delta * 0.1);
      } else {
        fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, targetFogFar, delta * 2);
      }
    }
  });

  return (
    <>
      <fog ref={fogRef} attach="fog" args={[SKY_COLORS[timeOfDay], 10, initialFogFar]} />

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
  const state = useExperienceStore((store) => store.state);

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
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-black transition-opacity"
        style={{
          opacity: state === 'ARRIVAL' ? 1 : 0,
          transitionDuration: state === 'ARRIVAL' ? '0ms' : '8000ms'
        }}
      />
      <Canvas
        camera={{
          position: [0, 1.7, 0], // fixed human-eye height
          fov: 75,
        }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <ExperienceScene />
      </Canvas>
    </div>
  );
}
