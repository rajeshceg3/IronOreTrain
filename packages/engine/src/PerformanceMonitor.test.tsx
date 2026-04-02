// @vitest-environment jsdom
import React from 'react';
import { render } from '@testing-library/react';
import { PerformanceMonitor } from './PerformanceMonitor';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFrame } from '@react-three/fiber';

// Mock useFrame
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.useFakeTimers();
    vi.setSystemTime(0);
    // Mock performance.now to return system time
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('calculates and logs FPS correctly over a 5 second interval', () => {
    render(<PerformanceMonitor />);

    // Get the callback passed to useFrame
    const useFrameCallback = (vi.mocked(useFrame).mock.calls[0] as any)[0];

    // Simulate 300 frames over 5 seconds (60 FPS)
    for (let i = 0; i < 300; i++) {
      vi.setSystemTime((i + 1) * (5000 / 300)); // Advance time
      useFrameCallback();
    }

    expect(console.info).toHaveBeenCalledWith('[Performance] FPS: 60');

    // Simulate 150 frames over next 5 seconds (30 FPS)
    vi.mocked(console.info).mockClear();
    for (let i = 0; i < 150; i++) {
      vi.setSystemTime(5000 + ((i + 1) * (5000 / 150)));
      useFrameCallback();
    }

    expect(console.info).toHaveBeenCalledWith('[Performance] FPS: 30');
  });
});
