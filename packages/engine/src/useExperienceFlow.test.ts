// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExperienceFlow } from './useExperienceFlow';
import { useExperienceStore } from '@iron-ore-train/state';
import * as useEnvironmentTimeModule from './useEnvironmentTime';

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
    useExperienceStore.setState({ state: 'ARRIVAL', isTrainAligned: false, isStill: false });
    mockUseFrameCallback = () => {};
    vi.spyOn(useEnvironmentTimeModule, 'useEnvironmentTime').mockReturnValue({
      elapsedSeconds: 0,
      cycleProgress: 0,
      timeOfDay: 'day'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('transitions to REFLECTION when boarded and still for > 5 seconds', () => {
    useExperienceStore.setState({ state: 'EXPLORATION', isStill: true });
    renderHook(() => useExperienceFlow());

    mockUseFrameCallback({}, 5.1);
    expect(useExperienceStore.getState().state).toBe('REFLECTION');
  });

  it('transitions out of REFLECTION when no longer still', () => {
    useExperienceStore.setState({ state: 'REFLECTION', isStill: false });
    renderHook(() => useExperienceFlow());

    mockUseFrameCallback({}, 0.1);
    expect(useExperienceStore.getState().state).toBe('EXPLORATION');
  });

  it('transitions to NIGHT when timeOfDay is night and boarded', () => {
    useExperienceStore.setState({ state: 'EXPLORATION', isStill: false });
    vi.spyOn(useEnvironmentTimeModule, 'useEnvironmentTime').mockReturnValue({
      elapsedSeconds: 500,
      cycleProgress: 0.9,
      timeOfDay: 'night'
    });

    // Rerender to get the new mocked value
    const { rerender } = renderHook(() => useExperienceFlow());
    rerender();

    mockUseFrameCallback({}, 0.1);
    expect(useExperienceStore.getState().state).toBe('NIGHT');
  });
});
