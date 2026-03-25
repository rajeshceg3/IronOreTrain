// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExperienceFlow } from './useExperienceFlow';
import { useExperienceStore } from '@iron-ore-train/state';

// Mock the useFrame hook from @react-three/fiber
let mockUseFrameCallback: (state: any, delta: number) => void;
vi.mock('@react-three/fiber', () => ({
  useFrame: (cb: any) => {
    mockUseFrameCallback = cb;
  },
}));

describe('useExperienceFlow', () => {
  beforeEach(() => {
    // Reset Zustand store
    useExperienceStore.setState({ state: 'ARRIVAL', isTrainAligned: false });
    mockUseFrameCallback = () => {};
  });

  it('transitions from ARRIVAL to ORIENTATION after 10 seconds', () => {
    renderHook(() => useExperienceFlow());

    // Initial state
    expect(useExperienceStore.getState().state).toBe('ARRIVAL');

    // Simulate 5 seconds
    mockUseFrameCallback({}, 5);
    expect(useExperienceStore.getState().state).toBe('ARRIVAL');

    // Simulate another 5.1 seconds
    mockUseFrameCallback({}, 5.1);
    expect(useExperienceStore.getState().state).toBe('ORIENTATION');
  });

  it('transitions from ORIENTATION to BOARDING after 15 seconds', () => {
    // Start at ORIENTATION
    useExperienceStore.setState({ state: 'ORIENTATION' });
    renderHook(() => useExperienceFlow());

    expect(useExperienceStore.getState().state).toBe('ORIENTATION');

    // Simulate 10 seconds
    mockUseFrameCallback({}, 10);
    expect(useExperienceStore.getState().state).toBe('ORIENTATION');

    // Simulate another 5.1 seconds
    mockUseFrameCallback({}, 5.1);
    expect(useExperienceStore.getState().state).toBe('BOARDING');
  });
});
