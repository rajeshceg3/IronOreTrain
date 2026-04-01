import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { AudioController } from './AudioController';
import { useExperienceStore } from '@iron-ore-train/state';
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

  it('should dampen audio when user is completely still', async () => {
    const engine = AudioEngine.getInstance();
    useExperienceStore.setState({ isStill: true });

    const renderer = await ReactThreeTestRenderer.create(<AudioController />);

    // Simulate interaction to start audio processing
    window.dispatchEvent(new MouseEvent('click'));
    await new Promise((r) => setTimeout(r, 0));

    // Force React to render after state change
    await renderer.update(<AudioController />);

    // Force a frame render to trigger useFrame logic
    await renderer.advanceFrames(2, 0.016); // Simulate ~60fps step

    expect(engine.setWindIntensity).toHaveBeenCalled();

    // Ensure the last call to the setters has the correct value after settling
    const lastCall = (spy: any) => spy.mock.calls[spy.mock.calls.length - 1][0];

    // The default clamp01(0.25 + normalizedSpeed * 0.45) * 0.5 = 0.125
    expect(lastCall(engine.setEngineIntensity)).toBeCloseTo(0.125);
    // wind: clamp01((0.2 + 0) * 0.2) = 0.04
    expect(lastCall(engine.setWindIntensity)).toBeCloseTo(0.04);
    // metal: clamp01((0.15 + 0) * 0.2) = 0.03
    expect(lastCall(engine.setMetalIntensity)).toBeCloseTo(0.03);

    await renderer.unmount();

    useExperienceStore.setState({ isStill: false }); // Reset state
  });

  it('should normal audio when user is not completely still', async () => {
    const engine = AudioEngine.getInstance();
    useExperienceStore.setState({ isStill: false });

    const renderer = await ReactThreeTestRenderer.create(<AudioController />);

    // Simulate interaction to start audio processing
    window.dispatchEvent(new MouseEvent('click'));
    await new Promise((r) => setTimeout(r, 0));

    // Force React to render after state change
    await renderer.update(<AudioController />);

    // Force a frame render to trigger useFrame logic
    await renderer.advanceFrames(2, 0.016); // Simulate ~60fps step

    expect(engine.setWindIntensity).toHaveBeenCalled();

    // Ensure the last call to the setters has the correct value after settling
    const lastCall = (spy: any) => spy.mock.calls[spy.mock.calls.length - 1][0];

    // normalized speed approx 0, so movingSlowlyDampening = 0.35
    expect(lastCall(engine.setEngineIntensity)).toBeCloseTo(0.25);
    // wind: clamp01((0.2 + 0) * 0.35) = 0.07
    expect(lastCall(engine.setWindIntensity)).toBeCloseTo(0.07);
    // metal: clamp01((0.15 + 0) * 0.35) = 0.0525
    expect(lastCall(engine.setMetalIntensity)).toBeCloseTo(0.0525);

    await renderer.unmount();
  });
});
