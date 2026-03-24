import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { AudioEngine } from '../../audio/src/AudioEngine';

const MAX_HEAD_ROTATION = Math.PI / 4;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function AudioController() {
  const [isReady, setIsReady] = useState(false);
  const engineRef = useRef<AudioEngine>(AudioEngine.getInstance());
  const previousZ = useRef(0);

  useEffect(() => {
    const engine = engineRef.current;
    engine.init();

    if (typeof window === 'undefined') {
      return;
    }

    const handleInteraction = async () => {
      await engine.start();
      engine.setMasterVolume(0.75);
      setIsReady(true);

      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    if (!isReady) return;

    const deltaZ = Math.abs(camera.position.z - previousZ.current);
    previousZ.current = camera.position.z;

    const normalizedSpeed = clamp01(deltaZ / Math.max(delta, 0.0001));
    const stillnessDampening = normalizedSpeed < 0.03 ? 0.35 : 1;
    const pan = Math.max(-1, Math.min(1, camera.rotation.y / MAX_HEAD_ROTATION));

    const engine = engineRef.current;
    engine.setPosition(pan);
    engine.setWindIntensity(clamp01((0.2 + normalizedSpeed * 0.8) * stillnessDampening));
    engine.setMetalIntensity(clamp01((0.15 + normalizedSpeed * 0.5) * stillnessDampening));
    engine.setEngineIntensity(clamp01(0.25 + normalizedSpeed * 0.45));
  });

  return null;
}
