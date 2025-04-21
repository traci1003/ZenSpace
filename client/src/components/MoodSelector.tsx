import { motion } from 'framer-motion';
import { useMood } from '@/lib/useZenSpace';
import { type Mood } from '@shared/schema';

// Define mood data
const moods: { type: Mood; emoji: string; label: string }[] = [
  { type: 'calm', emoji: '😌', label: 'Calm' },
  { type: 'happy', emoji: '😊', label: 'Happy' },
  { type: 'neutral', emoji: '😐', label: 'Neutral' },
  { type: 'sad', emoji: '😔', label: 'Sad' },
  { type: 'angry', emoji: '😠', label: 'Angry' }
];

const MoodSelector = () => {
  const { currentMood, setCurrentMood } = useMood();

  // Function to handle mood selection
  const handleMoodClick = (mood: Mood) => {
    console.log('Setting mood to:', mood);
    setCurrentMood(mood);
  };

  return (
    <motion.div 
      className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-4">
        How are you feeling today?
      </h2>
      <div className="grid grid-cols-5 gap-3">
        {moods.map((mood) => (
          <motion.button
            key={mood.type}
            type="button"
            data-mood={mood.type}
            className={`
              mood-icon flex flex-col items-center justify-center p-3 rounded-lg
              ${currentMood === mood.type ? 'ring-2 ring-mood-' + mood.type + ' ring-offset-2' : ''}
              bg-slate-100 hover:bg-slate-200 dark:bg-dark-700 dark:hover:bg-dark-700/80
              transition-all duration-200
            `}
            onClick={() => handleMoodClick(mood.type)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl mb-1" style={{ color: `var(--tw-color-mood-${mood.type})` }}>{mood.emoji}</span>
            <span className="text-xs font-medium" style={{ color: `var(--tw-color-mood-${mood.type})` }}>{mood.label}</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        {currentMood && (
          <p>Selected mood: <span className="font-medium" style={{ color: `var(--tw-color-mood-${currentMood})` }}>{moods.find(m => m.type === currentMood)?.label}</span></p>
        )}
      </div>
    </motion.div>
  );
};

export default MoodSelector;
