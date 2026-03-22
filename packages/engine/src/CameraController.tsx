import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@iron-ore-train/state';

export function CameraController() {
  const { camera } = useThree();
  const state = useExperienceStore((store) => store.state);
  const setState = useExperienceStore((store) => store.setState);

  const targetRotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const targetPosition = useRef(new THREE.Vector3(0, 1.7, 0));

  const velocity = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleWheel = (e: WheelEvent) => {
      velocity.current -= e.deltaY * 0.005;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useFrame(({ pointer }, delta) => {
    if (state === 'BOARDING' && targetPosition.current.z < -2) {
      setState('EXPLORATION');
    }
    const maxPan = Math.PI / 4;
    const maxTilt = Math.PI / 6;

    targetRotation.current.y = -pointer.x * maxPan;
    targetRotation.current.x = pointer.y * maxTilt;

    camera.rotation.order = 'YXZ';
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotation.current.x, delta * 5);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotation.current.y, delta * 5);

    targetPosition.current.z += velocity.current * delta;
    velocity.current = THREE.MathUtils.lerp(velocity.current, 0, delta * 5);

    targetPosition.current.z = THREE.MathUtils.clamp(targetPosition.current.z, -5, 5);

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetPosition.current.z, delta * 5);
    camera.position.y = targetPosition.current.y; // Keep camera at eye-level
  });

  return null;
}
