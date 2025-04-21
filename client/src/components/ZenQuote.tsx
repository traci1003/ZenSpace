import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define some static quotes in case API fails
const fallbackQuotes = [
  {
    content: "The only zen you find on the tops of mountains is the zen you bring up there.",
    author: "Robert M. Pirsig"
  },
  {
    content: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    author: "Buddha"
  },
  {
    content: "When you realize nothing is lacking, the whole world belongs to you.",
    author: "Lao Tzu"
  },
  {
    content: "Wherever you are, be there totally.",
    author: "Eckhart Tolle"
  },
  {
    content: "The obstacle is the path.",
    author: "Zen Proverb"
  }
];

const ZenQuote = () => {
  const [quote, setQuote] = useState({ content: '', author: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('https://api.quotable.io/random?tags=wisdom|inspirational');
        if (response.ok) {
          const data = await response.json();
          setQuote({ 
            content: data.content,
            author: data.author
          });
        } else {
          // Use fallback quote if API fails
          const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
          setQuote(fallbackQuotes[randomIndex]);
        }
      } catch (error) {
        console.error('Failed to fetch quote:', error);
        // Use fallback quote if API fails
        const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
        setQuote(fallbackQuotes[randomIndex]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, []);

  return (
    <motion.div 
      className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-4">Zen Thought</h2>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-slate-200 dark:bg-dark-700 rounded w-1/4 ml-auto"></div>
        </div>
      ) : (
        <>
          <blockquote className="font-serif text-xl italic text-slate-700 dark:text-slate-300">
            <p>"{quote.content}"</p>
          </blockquote>
          <p className="mt-3 text-right text-slate-500 dark:text-slate-400 text-sm">
            — {quote.author}
          </p>
        </>
      )}
    </motion.div>
  );
};

export default ZenQuote;
