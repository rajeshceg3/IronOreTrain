import { useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useExperienceStore } from '@iron-ore-train/state';

const MAX_PAN = Math.PI / 4;
const MAX_TILT = Math.PI / 6;

export function useMotionController() {
  const state = useExperienceStore((store) => store.state);
  const setState = useExperienceStore((store) => store.setState);
  const isTrainAligned = useExperienceStore((store) => store.isTrainAligned);
  const targetRotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const targetPosition = useRef(new THREE.Vector3(0, 1.7, 0));
  const velocity = useRef(0);

  const onWheel = useCallback((deltaY: number) => {
    velocity.current -= deltaY * 0.005;
  }, []);

  const update = useCallback(
    (camera: THREE.Camera, pointerX: number, pointerY: number, delta: number) => {
      if (state === 'BOARDING' && targetPosition.current.z < -2 && isTrainAligned) {
        setState('EXPLORATION');
      }

      targetRotation.current.y = -pointerX * MAX_PAN;
      targetRotation.current.x = pointerY * MAX_TILT;

      camera.rotation.order = 'YXZ';
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotation.current.x, delta * 5);
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotation.current.y, delta * 5);

      targetPosition.current.z += velocity.current * delta;
      velocity.current = THREE.MathUtils.lerp(velocity.current, 0, delta * 5);
      targetPosition.current.z = THREE.MathUtils.clamp(targetPosition.current.z, -5, 5);

      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetPosition.current.z, delta * 5);
      camera.position.y = targetPosition.current.y;
    },
    [setState, state, isTrainAligned]
  );

  return useMemo(
    () => ({
      onWheel,
      update,
    }),
    [onWheel, update]
  );
}
