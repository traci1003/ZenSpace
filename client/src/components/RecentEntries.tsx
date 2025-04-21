import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { type JournalEntry, type Mood } from '@shared/schema';

// Mapping of mood to emoji
const moodEmojis: Record<Mood, string> = {
  calm: '😌',
  happy: '😊',
  neutral: '😐',
  sad: '😔',
  angry: '😠'
};

const RecentEntries = () => {
  const { data: entries, isLoading, isError } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });

  // Show only last 3 entries for the "recent" section
  const recentEntries = entries?.slice(0, 3);
  
  return (
    <motion.div 
      className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-4">Recent Journal Entries</h2>
      
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-slate-200 dark:border-dark-700 rounded-lg animate-pulse">
              <div className="flex justify-between items-start">
                <div className="w-3/4">
                  <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-dark-700 rounded w-1/2 mb-2"></div>
                </div>
                <div className="w-6 h-6 bg-slate-200 dark:bg-dark-700 rounded-full"></div>
              </div>
              <div className="mt-2 h-4 bg-slate-200 dark:bg-dark-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p>Failed to load journal entries</p>
        </div>
      ) : recentEntries && recentEntries.length > 0 ? (
        <div className="space-y-3">
          {recentEntries.map((entry) => (
            <Link key={entry.id} href={`/entries/${entry.id}`}>
              <motion.div 
                className="p-4 border border-slate-200 dark:border-dark-700 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors cursor-pointer"
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{entry.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(entry.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full bg-mood-${entry.mood} text-white text-sm`}>
                    {moodEmojis[entry.mood as Mood] || '😐'}
                  </div>
                </div>
                <p className="mt-2 text-sm line-clamp-2 text-slate-600 dark:text-slate-300">
                  {entry.content}
                </p>
              </motion.div>
            </Link>
          ))}
          
          <Link href="/entries">
            <motion.button 
              className="w-full py-3 text-center text-primary-500 dark:text-primary-400 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg transition-colors mt-4"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              View All Entries 
              <svg xmlns="http://www.w3.org/2000/svg" className="inline-block ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </motion.button>
          </Link>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p>No journal entries yet</p>
          <p className="mt-2 text-sm">Start writing today to track your moods and thoughts</p>
        </div>
      )}
    </motion.div>
  );
};

export default RecentEntries;
