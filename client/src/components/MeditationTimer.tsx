import { motion } from 'framer-motion';
import { useTimer, useSound } from '@/lib/useZenSpace';
import { type SoundType } from '@/lib/zenSpaceProvider';

// Define sound options with more descriptive labels
const soundOptions: { type: SoundType; label: string; icon: string; description: string }[] = [
  { 
    type: 'rain', 
    label: 'Rainfall', 
    icon: 'droplet',
    description: 'Gentle rain sounds'
  },
  { 
    type: 'fire', 
    label: 'Campfire', 
    icon: 'flame',
    description: 'Authentic crackling campfire'
  },
  { 
    type: 'whiteNoise', 
    label: 'White Noise', 
    icon: 'wave-square',
    description: 'Steady background noise'
  },
  { 
    type: 'ocean', 
    label: 'Ocean Waves', 
    icon: 'water',
    description: 'Authentic HRTF binaural ocean recording'
  }
];

const MeditationTimer = () => {
  const { isTimerRunning, toggleTimer, resetTimer, formattedTime } = useTimer();
  const { currentSound, setCurrentSound } = useSound();

  return (
    <motion.div 
      className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-4">Take a Moment</h2>
      <div className="flex flex-col items-center">
        <motion.div 
          className="text-6xl text-primary-500 dark:text-primary-400 font-mono mb-4"
          key={formattedTime} // Re-trigger animation when time changes
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          {formattedTime}
        </motion.div>
        <div className="flex gap-3">
          <motion.button
            className={`${isTimerRunning 
              ? 'bg-slate-500 hover:bg-slate-600' 
              : 'bg-primary-500 hover:bg-primary-600'} 
              dark:bg-primary-600 dark:hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors`}
            onClick={toggleTimer}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isTimerRunning ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg> 
                Pause
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg> 
                Start
              </>
            )}
          </motion.button>
          <motion.button
            className="bg-slate-200 hover:bg-slate-300 dark:bg-dark-700 dark:hover:bg-dark-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg transition-colors"
            onClick={resetTimer}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg> 
            Reset
          </motion.button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {soundOptions.map((sound) => (
            <div key={sound.type} className="relative group">
              <motion.button
                className={`ambient-sound px-3 py-1 text-xs rounded-full ${
                  currentSound === sound.type
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-dark-700 dark:hover:bg-dark-600'
                } transition-colors`}
                onClick={() => setCurrentSound(sound.type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`${sound.label} - ${sound.description}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {sound.icon === 'droplet' && <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>}
                  {sound.icon === 'flame' && <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>}
                  {sound.icon === 'wave-square' && <>
                    <path d="M21 6h-4v4h-4v4H7v4H3"/>
                    <path d="M3 10h4v4h4v4h4v4h6"/>
                  </>}
                  {sound.icon === 'water' && <>
                    <path d="M2 12c.6-4.4 6-7.8 10-8 4 .2 9.4 3.6 10 8"/>
                    <path d="M12 20c-3.2 0-6-1.5-7-4 1-2.5 3.8-4 7-4s6 1.5 7 4c-1 2.5-3.8 4-7 4Z"/>
                  </>}
                </svg>
                {sound.label}
              </motion.button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {sound.description}
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MeditationTimer;
