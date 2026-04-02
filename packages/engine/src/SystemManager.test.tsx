import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { SystemManager } from './SystemManager';
import { useExperienceStore } from '@iron-ore-train/state';

// @vitest-environment jsdom

const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    gl: {
      domElement: {
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      }
    }
  })
}));

describe('SystemManager', () => {
  beforeEach(() => {
    useExperienceStore.setState({ isContextLost: false });
    vi.clearAllMocks();
  });

  it('adds and removes event listeners for context loss/restore', () => {
    const { unmount } = renderHook(() => SystemManager());

    expect(mockAddEventListener).toHaveBeenCalledWith('webglcontextlost', expect.any(Function), false);
    expect(mockAddEventListener).toHaveBeenCalledWith('webglcontextrestored', expect.any(Function), false);

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('webglcontextlost', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('webglcontextrestored', expect.any(Function));
  });

  it('updates state when context is lost and restored', () => {
    renderHook(() => SystemManager());

    const lostHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'webglcontextlost')[1];
    const restoredHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'webglcontextrestored')[1];

    expect(useExperienceStore.getState().isContextLost).toBe(false);

    const mockEvent = { preventDefault: vi.fn() };
    lostHandler(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(useExperienceStore.getState().isContextLost).toBe(true);

    restoredHandler();
    expect(useExperienceStore.getState().isContextLost).toBe(false);
  });
});
