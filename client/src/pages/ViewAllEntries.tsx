import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { type JournalEntry, type Mood } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Mapping of mood to emoji
const moodEmojis: Record<Mood, string> = {
  calm: '😌',
  happy: '😊',
  neutral: '😐',
  sad: '😔',
  angry: '😠'
};

const ViewAllEntries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  
  const { data: entries, isLoading, isError } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/journal-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      toast({
        title: 'Journal entry deleted',
        description: 'Your journal entry has been successfully deleted.',
        variant: 'success',
      });
      setEntryToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete entry',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setEntryToDelete(null);
    }
  });

  // Handle delete confirmation
  const handleDelete = (id: number) => {
    setEntryToDelete(id);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteEntryMutation.mutate(entryToDelete);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-bold text-primary-600 dark:text-primary-400">All Journal Entries</h1>
        <Link href="/">
          <Button variant="outline">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Home
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-6 border border-slate-200 dark:border-dark-700 rounded-lg animate-pulse">
              <div className="flex justify-between">
                <div>
                  <div className="h-5 bg-slate-200 dark:bg-dark-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded w-1/4 mb-4"></div>
                </div>
                <div className="w-8 h-8 bg-slate-200 dark:bg-dark-700 rounded-full"></div>
              </div>
              <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p className="text-xl">Failed to load journal entries</p>
          <p className="mt-2">Please try again later</p>
        </div>
      ) : entries && entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              className="p-6 border border-slate-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 shadow-sm"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-medium">{entry.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {format(new Date(entry.date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-mood-${entry.mood} text-white text-lg`}>
                  {moodEmojis[entry.mood as Mood] || '😐'}
                </div>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-300 line-clamp-3">
                {entry.content}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <Link href={`/entries/${entry.id}`}>
                  <Button variant="outline" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View Full Entry
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(entry.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-slate-200 dark:border-dark-700">
          <p className="text-xl text-slate-600 dark:text-slate-300">No journal entries yet</p>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Start your mindfulness journey by creating your first entry</p>
          <Link href="/">
            <Button className="mt-6 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Create New Entry
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={entryToDelete !== null} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this journal entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ViewAllEntries;
