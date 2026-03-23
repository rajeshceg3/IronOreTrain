import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { CameraController } from './CameraController';
import { useExperienceStore } from '@iron-ore-train/state';

describe('CameraController', () => {
  it('should render without crashing', async () => {
    const renderer = await ReactThreeTestRenderer.create(<CameraController />);
    expect(renderer.scene.children.length).toBe(0); // It returns null
  });

  it('should register wheel event listener if window is defined', async () => {
    // Ensure window is defined for test
    if (typeof window === 'undefined') {
      // Create minimal mock window just for addEventListener/removeEventListener if strictly needed,
      // but in vitest happy-dom or jsdom window should be defined.
      // If it isn't defined, we'll mock just what we need on a global object.
      // @ts-ignore
      global.window = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    }

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const renderer = await ReactThreeTestRenderer.create(<CameraController />);

    expect(addEventListenerSpy).toHaveBeenCalledWith('wheel', expect.any(Function), { passive: true });

    await renderer.unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('wheel', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
