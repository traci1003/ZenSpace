import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

const DateDisplay = () => {
  const [today, setToday] = useState(new Date());

  // Update date every minute to ensure it's current
  useEffect(() => {
    const intervalId = setInterval(() => {
      setToday(new Date());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <motion.div 
      className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300">Today</h2>
        <span className="text-primary-500 dark:text-primary-400 font-medium">
          {format(today, 'MMMM d, yyyy')}
        </span>
      </div>
      <div className="text-3xl font-serif">
        {format(today, 'EEEE')}
      </div>
    </motion.div>
  );
};

export default DateDisplay;
