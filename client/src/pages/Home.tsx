import { motion } from 'framer-motion';
import DateDisplay from '@/components/DateDisplay';
import MoodSelector from '@/components/MoodSelector';
import ZenQuote from '@/components/ZenQuote';
import MeditationTimer from '@/components/MeditationTimer';
import JournalEditor from '@/components/JournalEditor';
import MoodStats from '@/components/MoodStats';
import RecentEntries from '@/components/RecentEntries';

const Home = () => {
  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Left Panel */}
      <div className="lg:col-span-1 space-y-6">
        <DateDisplay />
        <MoodSelector />
        <ZenQuote />
        <MeditationTimer />
      </div>
      
      {/* Right Panel */}
      <div className="lg:col-span-2 space-y-6">
        <JournalEditor />
        <MoodStats />
        <RecentEntries />
      </div>
    </motion.div>
  );
};

export default Home;
