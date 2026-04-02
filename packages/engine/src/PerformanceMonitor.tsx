import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function PerformanceMonitor() {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useFrame(() => {
    frameCountRef.current += 1;
    const now = performance.now();
    const elapsed = now - lastTimeRef.current;

    // Log FPS every 5 seconds
    if (elapsed >= 5000) {
      const fps = Math.round((frameCountRef.current * 1000) / elapsed);
      console.info(`[Performance] FPS: ${fps}`);
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  });

  return null;
}
