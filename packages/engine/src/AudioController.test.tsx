import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { AudioController } from './AudioController';
import { AudioEngine } from '../../audio/src/AudioEngine';
import * as THREE from 'three';

// Mock the environment
// @vitest-environment jsdom

describe('AudioController', () => {
  beforeEach(() => {
    const engine = AudioEngine.getInstance();
    engine._resetForTest();
    vi.spyOn(engine, 'init').mockImplementation(() => {});
    vi.spyOn(engine, 'start').mockImplementation(async () => {});
    vi.spyOn(engine, 'setMasterVolume').mockImplementation(() => {});
    vi.spyOn(engine, 'setWindIntensity').mockImplementation(() => {});
    vi.spyOn(engine, 'setMetalIntensity').mockImplementation(() => {});
    vi.spyOn(engine, 'setEngineIntensity').mockImplementation(() => {});
    vi.spyOn(engine, 'setPosition').mockImplementation(() => {});
  });

  it('should initialize AudioEngine on mount', async () => {
    const engine = AudioEngine.getInstance();
    const renderer = await ReactThreeTestRenderer.create(<AudioController />);

    expect(engine.init).toHaveBeenCalled();
    await renderer.unmount();
  });

  it('should listen for interactions to start audio', async () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    const renderer = await ReactThreeTestRenderer.create(<AudioController />);

    expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    addEventListenerSpy.mockRestore();
    await renderer.unmount();
  });

  it('should start engine and set master volume on interaction', async () => {
    const engine = AudioEngine.getInstance();
    const renderer = await ReactThreeTestRenderer.create(<AudioController />);

    // Simulate interaction
    const clickEvent = new MouseEvent('click');
    window.dispatchEvent(clickEvent);

    // wait for async handleInteraction
    await new Promise((r) => setTimeout(r, 0));

    expect(engine.start).toHaveBeenCalled();
    expect(engine.setMasterVolume).toHaveBeenCalledWith(0.75);

    await renderer.unmount();
  });
});
