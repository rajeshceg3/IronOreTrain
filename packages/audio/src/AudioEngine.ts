export class AudioEngine {
  private static instance: AudioEngine;
  private context: AudioContext | null = null;

  // Master control
  private masterGain: GainNode | null = null;

  // Layer controls
  private windGain: GainNode | null = null;
  private metalGain: GainNode | null = null;
  private engineGain: GainNode | null = null;

  // Sound Sources
  private windSource: AudioBufferSourceNode | null = null;
  private metalSource: AudioBufferSourceNode | null = null;
  private engineSource: OscillatorNode | null = null;

  // Positional logic wrapper
  private panner: StereoPannerNode | null = null;

  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
          console.warn('Web Audio API is not supported in this browser');
          return;
      }
      this.context = new AudioContextClass();

      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);

      this.panner = this.context.createStereoPanner();
      this.panner.connect(this.masterGain);

      // Initialize layer gains
      this.windGain = this.context.createGain();
      this.windGain.gain.value = 0; // default silent
      this.windGain.connect(this.panner);

      this.metalGain = this.context.createGain();
      this.metalGain.gain.value = 0;
      this.metalGain.connect(this.panner);

      this.engineGain = this.context.createGain();
      this.engineGain.gain.value = 0;
      this.engineGain.connect(this.panner);

      this.setupGenerators();

      this.isInitialized = true;
    } catch (e) {
      console.warn('Failed to initialize Audio Engine:', e);
    }
  }

  private setupGenerators() {
    if (!this.context) return;

    // Wind Generator: White Noise Buffer
    const bufferSize = this.context.sampleRate * 2; // 2 seconds
    const windBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = windBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.windSource = this.context.createBufferSource();
    this.windSource.buffer = windBuffer;
    this.windSource.loop = true;
    if (this.windGain) this.windSource.connect(this.windGain);

    // Engine Generator: Low Frequency Oscillator
    this.engineSource = this.context.createOscillator();
    this.engineSource.type = 'triangle';
    this.engineSource.frequency.value = 40; // Low hum
    if (this.engineGain) this.engineSource.connect(this.engineGain);

    // Metal Generator: Pink-ish Noise / Harsh Synth (simplified for now as another white noise variant)
    const metalBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const metalOutput = metalBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Very basic approximation of metal friction scrape
      metalOutput[i] = (Math.random() * 2 - 1) * Math.sin(i / 10);
    }
    this.metalSource = this.context.createBufferSource();
    this.metalSource.buffer = metalBuffer;
    this.metalSource.loop = true;
    if (this.metalGain) this.metalSource.connect(this.metalGain);
  }

  public async start() {
    if (!this.context) return;
    if (this.context.state === 'suspended') {
      await this.context.resume();

      // Start sources if not already started
      try {
        if (this.windSource) this.windSource.start(0);
        if (this.metalSource) this.metalSource.start(0);
        if (this.engineSource) this.engineSource.start(0);
      } catch (e) {
        // Ignore "cannot start more than once" errors if already started
      }
    }
  }

  public suspend() {
    if (this.context && this.context.state === 'running') {
      this.context.suspend();
    }
  }

  public setMasterVolume(value: number) {
    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, value)),
        this.context.currentTime,
        0.1
      );
    }
  }

  public setWindIntensity(speed: number) {
     if (this.windGain && this.context) {
        // Assume speed is normalized 0-1
        this.windGain.gain.setTargetAtTime(speed, this.context.currentTime, 0.5);
     }
  }

  public setMetalIntensity(intensity: number) {
    if (this.metalGain && this.context) {
      this.metalGain.gain.setTargetAtTime(intensity, this.context.currentTime, 0.5);
    }
  }

  public setEngineIntensity(intensity: number) {
    if (this.engineGain && this.context) {
      this.engineGain.gain.setTargetAtTime(intensity, this.context.currentTime, 0.5);
    }
  }

  public setPosition(pan: number) {
    if (this.panner && this.context) {
      // Pan from -1 (left) to 1 (right)
      this.panner.pan.setTargetAtTime(
        Math.max(-1, Math.min(1, pan)),
        this.context.currentTime,
        0.1
      );
    }
  }

  public getContextState(): AudioContextState | 'uninitialized' {
      return this.context ? this.context.state : 'uninitialized';
  }

  // Use only for testing
  public _resetForTest() {
    this.context = null;
    this.masterGain = null;
    this.windGain = null;
    this.metalGain = null;
    this.engineGain = null;
    this.panner = null;
    this.windSource = null;
    this.metalSource = null;
    this.engineSource = null;
    this.isInitialized = false;
  }
}
