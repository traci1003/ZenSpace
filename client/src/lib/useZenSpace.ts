import { useContext } from 'react';
import { ZenSpaceContext } from './zenSpaceProvider';
import { getSoundService } from './soundService';
import { getAudioPlayer } from './audioPlayer';

// Hook to access the ZenSpace context
export function useZenSpace() {
  const context = useContext(ZenSpaceContext);
  
  if (context === undefined) {
    throw new Error('useZenSpace must be used within a ZenSpaceProvider');
  }
  
  return context;
}

// Specialized hooks for specific parts of the state
export function useMood() {
  const { currentMood, setCurrentMood } = useZenSpace();
  return { currentMood, setCurrentMood };
}

export function useSound() {
  const { isSoundOn, toggleSound, currentSound, setCurrentSound } = useZenSpace();
  
  // Use the HTML5 Audio element-based player instead of Web Audio API
  const setSound = (sound: typeof currentSound) => {
    const audioPlayer = getAudioPlayer();
    
    if (sound && isSoundOn) {
      // Play the sound using our new audio player
      audioPlayer.play(sound);
      audioPlayer.setVolume(0.4); // Set volume to 40%
    } else {
      // Stop any playing sound
      audioPlayer.stop();
    }
    
    // Update the state in context
    setCurrentSound(sound);
  };
  
  // Enhanced toggle sound function
  const enhancedToggleSound = () => {
    const newSoundOn = !isSoundOn;
    toggleSound();
    
    const audioPlayer = getAudioPlayer();
    if (!newSoundOn) {
      // Stop sound if turning off
      audioPlayer.stop();
    } else if (currentSound) {
      // Resume sound if turning on and there was a previous sound
      audioPlayer.play(currentSound);
      audioPlayer.setVolume(0.4);
    }
  };
  
  return { 
    isSoundOn, 
    toggleSound: enhancedToggleSound, 
    currentSound, 
    setCurrentSound: setSound 
  };
}

export function useTheme() {
  const { theme, toggleTheme } = useZenSpace();
  return { theme, toggleTheme };
}

export function useJournal() {
  const { journalTitle, setJournalTitle, journalContent, setJournalContent } = useZenSpace();
  
  const updateJournalContent = (updater: string | ((prev: string) => string)) => {
    if (typeof updater === 'function') {
      setJournalContent(updater(journalContent));
    } else {
      setJournalContent(updater);
    }
  };
  
  return { 
    journalTitle, 
    setJournalTitle, 
    journalContent, 
    setJournalContent: updateJournalContent 
  };
}

export function useTimer() {
  const { isTimerRunning, toggleTimer, remainingTime, resetTimer } = useZenSpace();
  
  // Format time as MM:SS
  const formattedTime = () => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return { 
    isTimerRunning, 
    toggleTimer, 
    remainingTime, 
    resetTimer,
    formattedTime: formattedTime()
  };
}
