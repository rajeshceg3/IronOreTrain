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

    // Touch parity: vertical drag mirrors wheel locomotion. Dragging up is a
    // scroll-down equivalent (content moves up), so it feeds a positive delta,
    // matching wheel deltaY semantics. One finger only; multi-touch is ignored.
    let lastTouchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches.length === 1 ? e.touches[0].clientY : null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (lastTouchY === null || e.touches.length !== 1) return;
      const y = e.touches[0].clientY;
      const dy = (lastTouchY - y) * 2; // drag feels roughly like wheel ticks
      lastTouchY = y;
      if (dy !== 0) onWheel(dy);
    };
    const onTouchEnd = () => {
      lastTouchY = null;
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      if (wheelListener.current) {
        window.removeEventListener('wheel', wheelListener.current);
      }
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onWheel]);

  useFrame(({ pointer }, delta) => {
    update(camera, pointer.x, pointer.y, delta);
  });

  return null;
}
