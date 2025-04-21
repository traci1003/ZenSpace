import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useJournal, useMood } from '@/lib/useZenSpace';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toast } from "@/components/ui/toast";
import { format } from 'date-fns';

interface EditorProps {
  entryId?: number;
}

const JournalEditor = ({ entryId }: EditorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentMood } = useMood();
  const { journalTitle, setJournalTitle, journalContent, setJournalContent } = useJournal();

  const [isSaving, setIsSaving] = useState(false);

  // Create a new journal entry
  const createEntryMutation = useMutation({
    mutationFn: async () => {
      if (!currentMood) throw new Error('Please select a mood first');
      if (!journalTitle.trim()) throw new Error('Please add a title to your journal');
      if (!journalContent.trim()) throw new Error('Please write something in your journal');

      // Format date as ISO string
      const date = new Date().toISOString();
      
      const res = await apiRequest('POST', '/api/journal-entries', {
        title: journalTitle,
        content: journalContent,
        mood: currentMood,
        date
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      toast({
        title: 'Journal saved',
        description: 'Your journal entry has been saved successfully.',
        variant: 'default',
      });
      
      // Reset form after successful save
      setJournalTitle('');
      setJournalContent('');
      setIsSaving(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to save journal',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setIsSaving(false);
    }
  });

  // Update an existing journal entry
  const updateEntryMutation = useMutation({
    mutationFn: async () => {
      if (!entryId) throw new Error('No entry ID provided');
      if (!currentMood) throw new Error('Please select a mood first');
      if (!journalTitle.trim()) throw new Error('Please add a title to your journal');
      if (!journalContent.trim()) throw new Error('Please write something in your journal');

      const res = await apiRequest('PUT', `/api/journal-entries/${entryId}`, {
        title: journalTitle,
        content: journalContent,
        mood: currentMood
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      queryClient.invalidateQueries({ queryKey: [`/api/journal-entries/${entryId}`] });
      
      toast({
        title: 'Journal updated',
        description: 'Your journal entry has been updated successfully.',
        variant: 'default',
      });
      
      setIsSaving(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update journal',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setIsSaving(false);
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    
    if (entryId) {
      updateEntryMutation.mutate();
    } else {
      createEntryMutation.mutate();
    }
  };

  // Basic text formatting functions
  const boldText = () => {
    setJournalContent((prevContent: string) => prevContent + '**bold text**');
  };

  const italicText = () => {
    setJournalContent((prevContent: string) => prevContent + '*italic text*');
  };

  const underlineText = () => {
    setJournalContent((prevContent: string) => prevContent + '__underlined text__');
  };

  const bulletList = () => {
    setJournalContent((prevContent: string) => prevContent + '\n- List item 1\n- List item 2\n- List item 3');
  };

  const numberedList = () => {
    setJournalContent((prevContent: string) => prevContent + '\n1. List item 1\n2. List item 2\n3. List item 3');
  };

  const quote = () => {
    setJournalContent((prevContent: string) => prevContent + '\n> Quoted text goes here');
  };

  return (
    <motion.div 
      className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300">
          {entryId ? 'Edit Journal Entry' : 'Today\'s Journal'}
        </h2>
        <div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !currentMood}
            className="bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Entry Title"
          value={journalTitle}
          onChange={(e) => setJournalTitle(e.target.value)}
          className="w-full p-2 text-xl font-serif focus:outline-none bg-transparent border-b border-slate-200 dark:border-dark-700 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
        />
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <div className="border-slate-200 dark:border-dark-700 rounded-lg mb-4">
          <div className="flex border-b border-slate-200 dark:border-dark-700">
            <button 
              className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-tl-lg transition-colors"
              onClick={boldText}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              </svg>
            </button>
            <button 
              className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
              onClick={italicText}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="4" x2="10" y2="4"/>
                <line x1="14" y1="20" x2="5" y2="20"/>
                <line x1="15" y1="4" x2="9" y2="20"/>
              </svg>
            </button>
            <button 
              className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
              onClick={underlineText}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
                <line x1="4" y1="21" x2="20" y2="21"/>
              </svg>
            </button>
            <button 
              className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
              onClick={bulletList}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <button 
              className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
              onClick={numberedList}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="10" y1="6" x2="21" y2="6"/>
                <line x1="10" y1="12" x2="21" y2="12"/>
                <line x1="10" y1="18" x2="21" y2="18"/>
                <path d="M4 6h1v4"/>
                <path d="M4 10h2"/>
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
              </svg>
            </button>
            <button 
              className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
              onClick={quote}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
              </svg>
            </button>
          </div>
          <Textarea
            id="journal-content"
            placeholder="Write your thoughts..."
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
            className="w-full p-4 min-h-[300px] bg-transparent border-0 focus:ring-0 focus:outline-none resize-none"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default JournalEditor;
