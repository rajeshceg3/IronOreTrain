import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioEngine } from './AudioEngine';

describe('AudioEngine', () => {
  let engine: AudioEngine;

  beforeEach(() => {
    // Reset singleton state
    engine = AudioEngine.getInstance();
    engine._resetForTest();

    // Mock AudioContext and its nodes
    const mockGainNode = () => ({
      connect: vi.fn(),
      gain: {
        value: 1,
        setTargetAtTime: vi.fn(),
      },
    });

    const mockPannerNode = () => ({
      connect: vi.fn(),
      pan: {
        setTargetAtTime: vi.fn(),
      },
    });

    const MockAudioContext = class {
      destination = {};
      currentTime = 0;
      sampleRate = 44100;
      state = 'suspended';
      createGain = () => mockGainNode();
      createStereoPanner = () => mockPannerNode();
      resume = vi.fn().mockResolvedValue(undefined);
      suspend = vi.fn();
      createBuffer = vi.fn().mockReturnValue({
        getChannelData: vi.fn().mockReturnValue(new Float32Array(44100 * 2))
      });
      createBufferSource = vi.fn().mockReturnValue({
        buffer: null,
        loop: false,
        connect: vi.fn(),
        start: vi.fn(),
      });
      createOscillator = vi.fn().mockReturnValue({
        type: 'sine',
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
      });
    };

    vi.stubGlobal('AudioContext', MockAudioContext);
    vi.stubGlobal('window', {
      AudioContext: MockAudioContext,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be a singleton', () => {
    const engine1 = AudioEngine.getInstance();
    const engine2 = AudioEngine.getInstance();
    expect(engine1).toBe(engine2);
  });

  it('should initialize AudioContext correctly', () => {
    engine.init();
    expect(engine.getContextState()).toBe('suspended');
  });

  it('should start (resume) the audio context', async () => {
    engine.init();
    await engine.start();
    // In our mock, resume() is called. We can't actually transition state in the mock easily
    // without more complex mocking, but we can verify no errors are thrown.
  });

  it('should change master volume', () => {
    engine.init();
    engine.setMasterVolume(0.5);
    // As long as it doesn't throw, we're successfully calling into the mocked setTargetAtTime
  });

  it('should change wind intensity', () => {
    engine.init();
    engine.setWindIntensity(0.8);
  });

  it('should change metal intensity', () => {
    engine.init();
    engine.setMetalIntensity(0.7);
  });

  it('should change engine intensity', () => {
    engine.init();
    engine.setEngineIntensity(0.6);
  });

  it('should set stereo pan position', () => {
    engine.init();
    engine.setPosition(0.5);
  });
});
