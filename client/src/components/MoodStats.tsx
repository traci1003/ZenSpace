import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { type JournalEntry, type Mood } from '@shared/schema';
import MoodChart from './MoodChart';

interface MoodCount {
  mood: Mood;
  count: number;
  emoji: string;
  label: string;
}

const MoodStats = () => {
  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });

  // Get counts of each mood
  const moodCounts: MoodCount[] = [
    { mood: 'calm', count: 0, emoji: '😌', label: 'Calm' },
    { mood: 'happy', count: 0, emoji: '😊', label: 'Happy' },
    { mood: 'neutral', count: 0, emoji: '😐', label: 'Neutral' },
    { mood: 'sad', count: 0, emoji: '😔', label: 'Sad' },
    { mood: 'angry', count: 0, emoji: '😠', label: 'Angry' }
  ];

  // Calculate mood counts if entries are loaded
  if (entries && entries.length > 0) {
    entries.forEach(entry => {
      const moodIndex = moodCounts.findIndex(m => m.mood === entry.mood);
      if (moodIndex !== -1) {
        moodCounts[moodIndex].count += 1;
      }
    });
  }

  return (
    <motion.div 
      className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <MoodChart />
      
      <div className="grid grid-cols-5 gap-3 mt-8">
        {moodCounts.map((moodData) => (
          <motion.div 
            key={moodData.mood}
            className="flex flex-col items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`text-mood-${moodData.mood} text-lg font-bold`}>
              {isLoading ? (
                <div className="h-6 w-6 bg-slate-200 dark:bg-dark-700 rounded animate-pulse"></div>
              ) : (
                moodData.count
              )}
            </div>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-mood-${moodData.mood} text-white`}>
              {moodData.emoji}
            </div>
            <div className="text-xs mt-1">{moodData.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MoodStats;
