import { type SoundType } from './zenSpaceProvider';

class SoundService {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillator: OscillatorNode | null = null;
  private bufferSource: AudioBufferSourceNode | null = null;
  private currentSound: SoundType = null;
  
  private rainBuffer: AudioBuffer | null = null;
  private fireBuffer: AudioBuffer | null = null;
  private oceanBuffer: AudioBuffer | null = null;
  
  constructor() {
    // Create audio context when user interacts
    this.initAudioContext();
    // Preload sound buffers
    this.preloadSounds();
  }
  
  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      // Set a bit lower volume level for better user experience
      this.gainNode.gain.setValueAtTime(0.35, this.audioContext.currentTime);
      this.gainNode.connect(this.audioContext.destination);
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }
  }
  
  private async preloadSounds() {
    if (!this.audioContext) return;
    
    // Load sound files from local public directory
    try {
      try {
        // Rain sound - actual rain/rainfall sound
        const rainResponse = await fetch('/sounds/rain.mp3');
        const rainArrayBuffer = await rainResponse.arrayBuffer();
        this.rainBuffer = await this.audioContext.decodeAudioData(rainArrayBuffer);
        console.log('Rain sound loaded successfully');
      } catch (e) {
        console.error('Error loading rain sound', e);
      }
      
      try {
        // Fire sound - crackling campfire sound 
        const fireResponse = await fetch('/sounds/campfire.mp3');
        const fireArrayBuffer = await fireResponse.arrayBuffer();
        this.fireBuffer = await this.audioContext.decodeAudioData(fireArrayBuffer);
        console.log('Fire sound loaded successfully');
      } catch (e) {
        console.error('Error loading fire sound', e);
      }
      
      try {
        // Ocean sound - ocean waves sound
        const oceanResponse = await fetch('/sounds/ocean.mp3');
        const oceanArrayBuffer = await oceanResponse.arrayBuffer();
        this.oceanBuffer = await this.audioContext.decodeAudioData(oceanArrayBuffer);
        console.log('Ocean sound loaded successfully');
      } catch (e) {
        console.error('Error loading ocean sound', e);
      }
    } catch (e) {
      console.error('Error loading sound files', e);
    }
  }
  
  public play(soundType: SoundType) {
    console.log('Attempting to play sound:', soundType);
    
    if (!this.audioContext || !this.gainNode) {
      console.log('Creating audio context');
      this.initAudioContext();
      if (!this.audioContext || !this.gainNode) {
        console.error('Failed to create audio context or gain node');
        return;
      }
    }
    
    // Resume audio context if suspended (autoplay policy)
    if (this.audioContext.state === 'suspended') {
      console.log('Resuming suspended audio context');
      this.audioContext.resume();
    }
    
    // Stop any currently playing sound
    this.stop();
    
    this.currentSound = soundType;
    console.log('Current sound set to:', soundType);
    
    switch (soundType) {
      case 'rain':
        if (this.rainBuffer) {
          console.log('Playing rain sound');
          this.playBuffer(this.rainBuffer, true);
        } else {
          console.error('Rain sound buffer not loaded');
        }
        break;
      case 'fire':
        if (this.fireBuffer) {
          console.log('Playing fire sound');
          this.playBuffer(this.fireBuffer, true);
        } else {
          console.error('Fire sound buffer not loaded');
        }
        break;
      case 'whiteNoise':
        console.log('Playing white noise');
        this.playWhiteNoise();
        break;
      case 'ocean':
        if (this.oceanBuffer) {
          console.log('Playing ocean sound');
          this.playBuffer(this.oceanBuffer, true);
        } else {
          console.error('Ocean sound buffer not loaded');
        }
        break;
    }
  }
  
  private playBuffer(buffer: AudioBuffer, loop = false) {
    if (!this.audioContext || !this.gainNode) return;
    
    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.buffer = buffer;
    this.bufferSource.loop = loop;
    this.bufferSource.connect(this.gainNode);
    this.bufferSource.start();
  }
  
  private playWhiteNoise() {
    if (!this.audioContext || !this.gainNode) return;
    
    // Create white noise
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(
      1,
      bufferSize,
      this.audioContext.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.buffer = noiseBuffer;
    this.bufferSource.loop = true;
    
    // Create a filter to shape the white noise
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    filter.Q.value = 1;
    
    this.bufferSource.connect(filter);
    filter.connect(this.gainNode);
    this.bufferSource.start();
  }
  
  public stop() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
    
    if (this.bufferSource) {
      this.bufferSource.stop();
      this.bufferSource.disconnect();
      this.bufferSource = null;
    }
    
    this.currentSound = null;
  }
  
  public getCurrentSound(): SoundType {
    return this.currentSound;
  }
}

// Singleton instance
let soundServiceInstance: SoundService | null = null;

export function getSoundService(): SoundService {
  if (!soundServiceInstance) {
    soundServiceInstance = new SoundService();
  }
  return soundServiceInstance;
}
