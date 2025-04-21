import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { format } from 'date-fns';
import { type JournalEntry, type Mood } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useJournal, useMood } from '@/lib/useZenSpace';
import JournalEditor from '@/components/JournalEditor';

// Mapping of mood to emoji
const moodEmojis: Record<Mood, string> = {
  calm: '😌',
  happy: '😊',
  neutral: '😐',
  sad: '😔',
  angry: '😠'
};

const ViewEntry = () => {
  const [, params] = useRoute('/entries/:id');
  const entryId = params?.id ? parseInt(params.id, 10) : undefined;
  
  const { setJournalTitle, setJournalContent } = useJournal();
  const { setCurrentMood } = useMood();
  
  const { data: entry, isLoading, isError } = useQuery<JournalEntry>({
    queryKey: [`/api/journal-entries/${entryId}`],
    enabled: !!entryId,
  });

  // Set form values when entry is loaded
  useEffect(() => {
    if (entry) {
      setJournalTitle(entry.title);
      setJournalContent(entry.content);
      setCurrentMood(entry.mood as Mood);
    }
  }, [entry, setJournalTitle, setJournalContent, setCurrentMood]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-dark-700 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-slate-200 dark:bg-dark-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError || !entry) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12 bg-white dark:bg-dark-800 rounded-lg shadow-sm">
        <h2 className="text-2xl font-medium text-slate-700 dark:text-slate-300">Entry not found</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          The journal entry you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/entries">
          <Button className="mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to All Entries
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-serif font-bold text-primary-600 dark:text-primary-400">
            View & Edit Entry
          </h1>
          <div className={`ml-4 w-8 h-8 flex items-center justify-center rounded-full bg-mood-${entry.mood} text-white`}>
            {moodEmojis[entry.mood as Mood] || '😐'}
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href="/entries">
            <Button variant="outline">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              All Entries
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Created on {format(new Date(entry.date), 'MMMM d, yyyy')}
      </div>
      
      {/* Use the JournalEditor component in edit mode */}
      <JournalEditor entryId={entry.id} />
    </motion.div>
  );
};

export default ViewEntry;
