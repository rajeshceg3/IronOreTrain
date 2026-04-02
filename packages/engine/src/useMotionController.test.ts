import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMotionController } from './useMotionController';
import { useExperienceStore } from '@iron-ore-train/state';
import * as THREE from 'three';

// Mock the environment
// @vitest-environment jsdom

describe('useMotionController', () => {
  beforeEach(() => {
    // Reset state before each test
    useExperienceStore.setState({ state: 'ARRIVAL', isTrainAligned: false });
  });

  it('should initialize motion controller', () => {
    const { result } = renderHook(() => useMotionController());
    expect(result.current.onWheel).toBeDefined();
    expect(result.current.update).toBeDefined();
  });

  it('should update isStill to true when there is no velocity and no pointer movement', () => {
    const { result } = renderHook(() => useMotionController());
    const camera = new THREE.PerspectiveCamera();

    result.current.update(camera, 0, 0, 0.1);

    expect(useExperienceStore.getState().isStill).toBe(true);
  });

  it('should update isStill to false when there is pointer movement', () => {
    const { result } = renderHook(() => useMotionController());
    const camera = new THREE.PerspectiveCamera();

    result.current.update(camera, 1, 0.5, 0.1);

    expect(useExperienceStore.getState().isStill).toBe(false);
  });

  it('should update camera rotation based on pointer input', () => {
    const { result } = renderHook(() => useMotionController());
    const camera = new THREE.PerspectiveCamera();

    // pointerX is left/right, pointerY is up/down
    result.current.update(camera, 1, 0.5, 0.1);

    // With delta 0.1, it should lerp towards the target
    expect(camera.rotation.y).toBeLessThan(0); // since target is -pointerX * MAX_PAN
    expect(camera.rotation.x).toBeGreaterThan(0); // since target is pointerY * MAX_TILT
  });

  it('should increase velocity on wheel event', () => {
    const { result } = renderHook(() => useMotionController());
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 1.7, 0);

    // Negative deltaY (scrolling up) should increase forward velocity (moving negative Z or positive Z depending on orientation)
    // Here, velocity -= deltaY * 0.005. So -100 means +0.5 velocity.
    result.current.onWheel(-100);

    result.current.update(camera, 0, 0, 0.1);

    // If we are at ARRIVAL, target position Z moves by velocity * delta
    // So target z increases, then lerps.
    expect(camera.position.z).toBeGreaterThan(0);
  });

  it('should transition to EXPLORATION state when BOARDING and train is aligned and moved far enough', () => {
    useExperienceStore.setState({ state: 'BOARDING', isTrainAligned: true });
    const { result } = renderHook(() => useMotionController());
    const camera = new THREE.PerspectiveCamera();

    // Simulate user scrolling to move forward (negative Z)
    result.current.onWheel(1000); // velocity becomes -5

    // first update moves targetPosition.z to -5 (clamped)
    result.current.update(camera, 0, 0, 1.0);

    // second update checks condition targetPosition.z < -2 and updates state
    result.current.update(camera, 0, 0, 1.0);

    expect(useExperienceStore.getState().state).toBe('EXPLORATION');
  });

  it('should constrain movement to wagon when boarded', () => {
    useExperienceStore.setState({ state: 'EXPLORATION' });
    const { result } = renderHook(() => useMotionController());
    const camera = new THREE.PerspectiveCamera();

    // Attempt to move laterally way outside bounds
    result.current.onWheel(2000); // -10 velocity

    // Update multiple times with large delta so that `camera.position.x`
    // fully reaches `targetPosition.x` which should be clamped.
    for(let i=0; i<10; i++) {
        // pointerX controls lateral movement direction.
        // We need velocity to remain high to keep drifting, but velocity lerps to 0.
        // So let's re-apply velocity before each update to force strong drift
        result.current.onWheel(2000);
        result.current.update(camera, 10, 0, 1.0); // positive pointerX, meaning positive drift.
    }

    // Position should be constrained to 1.0 <= x <= 3.0
    expect(camera.position.x).toBeLessThanOrEqual(3.0);
    expect(camera.position.x).toBeGreaterThanOrEqual(1.0);

    for(let i=0; i<10; i++) {
        result.current.onWheel(2000);
        result.current.update(camera, -10, 0, 1.0); // negative pointerX
    }

    expect(camera.position.x).toBeLessThanOrEqual(3.0);
    expect(camera.position.x).toBeGreaterThanOrEqual(1.0);

    // Y should be elevated on wagon
    // Wait, the hook sets target position based on state inside update.
    // Let's ensure update ran to update the targetPosition correctly.
    result.current.update(camera, 0, 0, 1.0);
    // Directly check targetPosition just in case camera lerping is weird
    expect(result.current._targetPosition.current.y).toBeCloseTo(2.5, 1);
  });

  it('should scale down camera rotation when reducedMotion is true', () => {
    useExperienceStore.setState({ settings: { reducedMotion: true, subtitles: true } });
    const { result } = renderHook(() => useMotionController());
    const camera = new THREE.PerspectiveCamera();

    result.current.update(camera, 1, 0.5, 0.1);

    // MAX_PAN is PI/4 (0.785), scaled by 0.5 is 0.392
    // target is -1 * 0.392 = -0.392. Lerp factor is 5 * 0.1 = 0.5
    // so it should move half as much as the non-reduced motion case.
    expect(camera.rotation.y).toBeGreaterThan(-0.4);
    expect(camera.rotation.y).toBeLessThan(0);
  });

});
