import { useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useExperienceStore } from '@iron-ore-train/state';

const MAX_PAN = Math.PI / 4;
const MAX_TILT = Math.PI / 6;

export function useMotionController() {
  const state = useExperienceStore((store) => store.state);
  const setState = useExperienceStore((store) => store.setState);
  const isTrainAligned = useExperienceStore((store) => store.isTrainAligned);
  const setIsStill = useExperienceStore((store) => store.setIsStill);
  const targetRotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const targetPosition = useRef(new THREE.Vector3(0, 1.7, 0));
  const velocity = useRef(0);
  const previousPointer = useRef({ x: 0, y: 0 });

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

      // Based on state, adjust target position smoothly to board the train.
      // The train is at x=2, y=2.5. We are originally at x=0, y=1.7.
      const isBoarded = state === 'EXPLORATION' || state === 'DISCOVERY' || state === 'NIGHT' || state === 'REFLECTION';

      if (isBoarded) {
        targetPosition.current.x = 2;
        targetPosition.current.y = 2.5; // elevated on wagon
      } else {
        targetPosition.current.x = 0;
        targetPosition.current.y = 1.7; // ground level
      }

      // Add full motion system constraints and drift
      if (isBoarded) {
        // Allow slight Z drift and constrained X shifting within wagon bounds when boarded
        targetPosition.current.z += velocity.current * delta * 2;
        // ensure targetPosition is initialized to the boarded position correctly
        if (targetPosition.current.x === 0) targetPosition.current.x = 2;
        if (targetPosition.current.y === 1.7) targetPosition.current.y = 2.5;
        targetPosition.current.x += velocity.current * delta * 0.5 * pointerX; // drift laterally based on look direction
        targetPosition.current.x = THREE.MathUtils.clamp(targetPosition.current.x, 1.0, 3.0); // Stay within wagon width
        targetPosition.current.z = THREE.MathUtils.clamp(targetPosition.current.z, -5, 5); // Stay within wagon length
      } else {
        targetPosition.current.z += velocity.current * delta;
        targetPosition.current.z = THREE.MathUtils.clamp(targetPosition.current.z, -5, 5);
      }

      velocity.current = THREE.MathUtils.lerp(velocity.current, 0, delta * 5);

      // Clamp camera directly to avoid lerp overshoots or unconstrained interpolation during fast movements
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetPosition.current.x, delta * 2);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetPosition.current.y, delta * 2);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetPosition.current.z, delta * 5);

      if (isBoarded) {
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, 1.0, 3.0);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5, 5);
      } else {
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5, 5);
      }

      // Check stillness
      const pointerDeltaX = Math.abs(pointerX - previousPointer.current.x);
      const pointerDeltaY = Math.abs(pointerY - previousPointer.current.y);
      const isCurrentlyStill = Math.abs(velocity.current) < 0.01 && pointerDeltaX < 0.001 && pointerDeltaY < 0.001;

      if (useExperienceStore.getState().isStill !== isCurrentlyStill) {
        setIsStill(isCurrentlyStill);
      }

      previousPointer.current.x = pointerX;
      previousPointer.current.y = pointerY;
    },
    [setState, state, isTrainAligned, setIsStill]
  );

  // Only call hooks at top level. We can expose targetPosition for testing
  return useMemo(
    () => ({
      onWheel,
      update,
      _targetPosition: targetPosition
    }),
    [onWheel, update]
  );
}
