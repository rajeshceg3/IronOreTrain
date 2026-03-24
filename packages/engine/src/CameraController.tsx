import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useMotionController } from './useMotionController';

export function CameraController() {
  const { camera } = useThree();
  const { onWheel, update } = useMotionController();
  const wheelListener = useRef<(e: WheelEvent) => void>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    wheelListener.current = (e: WheelEvent) => onWheel(e.deltaY);

    window.addEventListener('wheel', wheelListener.current, { passive: true });
    return () => {
      if (wheelListener.current) {
        window.removeEventListener('wheel', wheelListener.current);
      }
    };
  }, [onWheel]);

  useFrame(({ pointer }, delta) => {
    update(camera, pointer.x, pointer.y, delta);
  });

  return null;
}
