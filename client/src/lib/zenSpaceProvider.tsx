import { createContext, useState, useEffect, ReactNode } from "react";
import { type Mood } from "@shared/schema";
import { getSoundService } from "./soundService";

// Sound types
export type SoundType = 'rain' | 'fire' | 'whiteNoise' | 'ocean' | null;

// Theme types
export type Theme = 'light' | 'dark';

// ZenSpace context types
interface ZenSpaceContextType {
  // Current mood state
  currentMood: Mood | null;
  setCurrentMood: (mood: Mood) => void;
  
  // Sound state
  isSoundOn: boolean;
  toggleSound: () => void;
  currentSound: SoundType;
  setCurrentSound: (sound: SoundType) => void;
  
  // Theme state
  theme: Theme;
  toggleTheme: () => void;
  
  // Journal form state
  journalTitle: string;
  setJournalTitle: (title: string) => void;
  journalContent: string;
  setJournalContent: (content: string) => void;
  
  // Meditation timer state
  isTimerRunning: boolean;
  toggleTimer: () => void;
  remainingTime: number;
  resetTimer: () => void;
}

// Create context with default values
export const ZenSpaceContext = createContext<ZenSpaceContextType>({
  currentMood: null,
  setCurrentMood: () => {},
  isSoundOn: false,
  toggleSound: () => {},
  currentSound: null,
  setCurrentSound: () => {},
  theme: 'light',
  toggleTheme: () => {},
  journalTitle: '',
  setJournalTitle: () => {},
  journalContent: '',
  setJournalContent: () => {},
  isTimerRunning: false,
  toggleTimer: () => {},
  remainingTime: 300, // 5 minutes
  resetTimer: () => {},
});

// Provider component
export const ZenSpaceProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [currentSound, setCurrentSound] = useState<SoundType>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes in seconds

  // Sound service
  const soundService = getSoundService();
  
  // Load theme from localStorage on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('zenspace-theme');
    if (savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    }
  }, []);
  
  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('zenspace-theme', newTheme);
      return newTheme;
    });
  };
  
  // Toggle sound function
  const toggleSound = () => {
    setIsSoundOn(prev => {
      if (!prev && currentSound) {
        soundService.play(currentSound);
      } else {
        soundService.stop();
      }
      return !prev;
    });
  };
  
  // Handle sound changes
  useEffect(() => {
    if (isSoundOn && currentSound) {
      soundService.play(currentSound);
    } else {
      soundService.stop();
    }
  }, [currentSound, isSoundOn]);
  
  // Timer effect
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (isTimerRunning && remainingTime > 0) {
      intervalId = window.setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [isTimerRunning, remainingTime]);
  
  // Toggle timer function
  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };
  
  // Reset timer function
  const resetTimer = () => {
    setIsTimerRunning(false);
    setRemainingTime(300);
  };
  
  // Format the context value
  const contextValue: ZenSpaceContextType = {
    currentMood,
    setCurrentMood,
    isSoundOn,
    toggleSound,
    currentSound,
    setCurrentSound,
    theme,
    toggleTheme,
    journalTitle,
    setJournalTitle,
    journalContent,
    setJournalContent,
    isTimerRunning,
    toggleTimer,
    remainingTime,
    resetTimer,
  };

  return (
    <ZenSpaceContext.Provider value={contextValue}>
      {children}
    </ZenSpaceContext.Provider>
  );
};
