// @vitest-environment jsdom
import React from 'react';
import { render } from '@testing-library/react';
import { StateLogger } from './StateLogger';
import { useExperienceStore } from '@iron-ore-train/state';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('StateLogger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    useExperienceStore.setState({ state: 'ARRIVAL' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs state transitions', () => {
    const { rerender } = render(<StateLogger />);

    // Initial render shouldn't log a transition
    expect(console.log).not.toHaveBeenCalled();

    // Trigger state change
    useExperienceStore.setState({ state: 'ORIENTATION' });
    rerender(<StateLogger />);

    expect(console.log).toHaveBeenCalledWith('[State Transition] ARRIVAL -> ORIENTATION');

    // Trigger another state change
    useExperienceStore.setState({ state: 'BOARDING' });
    rerender(<StateLogger />);

    expect(console.log).toHaveBeenCalledWith('[State Transition] ORIENTATION -> BOARDING');
  });

  it('does not log if state remains the same', () => {
    const { rerender } = render(<StateLogger />);

    // Clear mock calls to reset the call count from the initial render/state changes
    vi.mocked(console.log).mockClear();

    useExperienceStore.setState({ state: 'ARRIVAL' });
    rerender(<StateLogger />);

    expect(console.log).not.toHaveBeenCalled();
  });
});
