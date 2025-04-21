import { type SoundType } from './zenSpaceProvider';

class AudioPlayer {
  private audioElement: HTMLAudioElement | null = null;
  private currentSound: SoundType = null;
  
  constructor() {
    // Create audio element
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      console.log('Audio player initialized');
    }
  }
  
  public play(soundType: SoundType) {
    console.log('Attempting to play sound:', soundType);
    
    if (!this.audioElement) {
      console.error('Audio element not initialized');
      return;
    }
    
    // Stop current sound
    this.stop();
    
    // Set new sound
    this.currentSound = soundType;
    
    // Set source based on sound type
    switch (soundType) {
      case 'rain':
        this.audioElement.src = '/sounds/rain.mp3';
        console.log('Set rain sound source');
        break;
      case 'fire':
        this.audioElement.src = '/sounds/campfire-authentic.mp3';
        console.log('Set authentic fire sound source');
        break;
      case 'ocean':
        this.audioElement.src = '/sounds/ocean-authentic.mp3';
        console.log('Set authentic ocean sound source');
        break;
      case 'whiteNoise':
        this.audioElement.src = '/sounds/improved-whitenoise.mp3';
        console.log('Set improved white noise source');
        break;
      default:
        console.error('Unknown sound type:', soundType);
        return;
    }
    
    // Play the sound
    try {
      const playPromise = this.audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Successfully playing ${soundType} sound`);
          })
          .catch(error => {
            console.error('Error playing sound:', error);
            // Try to play after user interaction (autoplay policy)
            document.addEventListener('click', () => {
              this.audioElement?.play();
            }, { once: true });
          });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }
  
  public stop() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.currentSound = null;
        console.log('Sound stopped');
      } catch (error) {
        console.error('Error stopping sound:', error);
      }
    }
  }
  
  public getCurrentSound(): SoundType {
    return this.currentSound;
  }
  
  public setVolume(volume: number) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
      console.log(`Volume set to ${this.audioElement.volume}`);
    }
  }
}

// Singleton instance
let audioPlayerInstance: AudioPlayer | null = null;

export function getAudioPlayer(): AudioPlayer {
  if (!audioPlayerInstance) {
    audioPlayerInstance = new AudioPlayer();
  }
  return audioPlayerInstance;
}