import { useRef, useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { useTheme } from '@/lib/useZenSpace';
import { type JournalEntry, type Mood } from '@shared/schema';
import Chart from 'chart.js/auto';

// Define time periods
type Period = 'week' | 'month' | 'year';

// Mood score mapping (1-5 scale)
const moodScores: Record<Mood, number> = {
  angry: 1,
  sad: 2,
  neutral: 3,
  happy: 4,
  calm: 5
};

// Mood colors
const moodColors: Record<Mood, string> = {
  calm: '#22c55e',
  happy: '#facc15',
  neutral: '#94a3b8',
  sad: '#60a5fa',
  angry: '#ef4444'
};

const MoodChart = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [period, setPeriod] = useState<Period>('week');
  const { theme } = useTheme();
  
  // Get date range based on period using useMemo
  const dateRange = useMemo(() => {
    const now = new Date();
    
    switch (period) {
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'year':
        return {
          start: startOfYear(now),
          end: endOfYear(now)
        };
    }
  }, [period]);
  
  const { start, end } = dateRange;
  
  // Fetch journal entries
  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });
  
  // Filter entries by date range
  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
  }, [entries, start, end]);
  
  // Generate chart data based on period and filtered entries
  const chartData = useMemo(() => {
    if (!filteredEntries.length) return { labels: [], data: [], colors: [] };
    
    const labels: string[] = [];
    const data: number[] = [];
    const pointBackgroundColors: string[] = [];
    
    if (period === 'week') {
      for (let i = 0; i < 7; i++) {
        const date = subDays(end, 6 - i);
        labels.push(format(date, 'EEE'));
        
        // Find entry for this date
        const entry = filteredEntries.find(e => {
          const entryDate = new Date(e.date);
          return format(entryDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });
        
        if (entry) {
          const moodScore = moodScores[entry.mood as Mood] || 3;
          data.push(moodScore);
          pointBackgroundColors.push(moodColors[entry.mood as Mood] || moodColors.neutral);
        } else {
          data.push(0); // No entry for this date
          pointBackgroundColors.push('rgba(0,0,0,0.1)');
        }
      }
    } else if (period === 'month') {
      // Group entries by week
      const weeksInMonth = Math.ceil((end.getDate() - start.getDate() + 1) / 7);
      
      for (let i = 0; i < weeksInMonth; i++) {
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() + i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        labels.push(`Week ${i + 1}`);
        
        // Get entries for this week
        const weekEntries = filteredEntries.filter(e => {
          const entryDate = new Date(e.date);
          return entryDate >= weekStart && entryDate <= weekEnd;
        });
        
        if (weekEntries.length > 0) {
          // Calculate average mood for the week
          const avgMood = weekEntries.reduce((sum, entry) => {
            return sum + (moodScores[entry.mood as Mood] || 3);
          }, 0) / weekEntries.length;
          
          data.push(Math.round(avgMood * 10) / 10);
          
          // Use the most frequent mood color
          const moodCounts: Record<string, number> = {};
          weekEntries.forEach(entry => {
            const mood = entry.mood as Mood;
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
          });
          
          let mostFrequentMood: Mood = 'neutral';
          let maxCount = 0;
          
          Object.entries(moodCounts).forEach(([mood, count]) => {
            if (count > maxCount) {
              maxCount = count;
              mostFrequentMood = mood as Mood;
            }
          });
          
          pointBackgroundColors.push(moodColors[mostFrequentMood]);
        } else {
          data.push(0);
          pointBackgroundColors.push('rgba(0,0,0,0.1)');
        }
      }
    } else if (period === 'year') {
      // Group by month
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(start.getFullYear(), i, 1);
        labels.push(format(monthDate, 'MMM'));
        
        // Get entries for this month
        const monthStart = new Date(start.getFullYear(), i, 1);
        const monthEnd = new Date(start.getFullYear(), i + 1, 0);
        
        const monthEntries = filteredEntries.filter(e => {
          const entryDate = new Date(e.date);
          return entryDate >= monthStart && entryDate <= monthEnd;
        });
        
        if (monthEntries.length > 0) {
          // Calculate average mood for the month
          const avgMood = monthEntries.reduce((sum, entry) => {
            return sum + (moodScores[entry.mood as Mood] || 3);
          }, 0) / monthEntries.length;
          
          data.push(Math.round(avgMood * 10) / 10);
          
          // Use the most frequent mood color
          const moodCounts: Record<string, number> = {};
          monthEntries.forEach(entry => {
            const mood = entry.mood as Mood;
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
          });
          
          let mostFrequentMood: Mood = 'neutral';
          let maxCount = 0;
          
          Object.entries(moodCounts).forEach(([mood, count]) => {
            if (count > maxCount) {
              maxCount = count;
              mostFrequentMood = mood as Mood;
            }
          });
          
          pointBackgroundColors.push(moodColors[mostFrequentMood]);
        } else {
          data.push(0);
          pointBackgroundColors.push('rgba(0,0,0,0.1)');
        }
      }
    }
    
    return {
      labels,
      data,
      colors: pointBackgroundColors
    };
  }, [filteredEntries, period, end, start]);
  
  // Create/update chart
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    // Only create chart if we have data
    if (chartData.labels.length === 0) return;
    
    // Create new chart
    const newChart = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Mood Rating',
          data: chartData.data,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: chartData.colors,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 5,
            ticks: {
              stepSize: 1,
              color: theme === 'dark' ? '#94a3b8' : '#475569',
              callback: function(value) {
                return value === 1 ? 'Angry' : 
                       value === 2 ? 'Sad' : 
                       value === 3 ? 'Neutral' : 
                       value === 4 ? 'Happy' : 
                       value === 5 ? 'Calm' : '';
              }
            },
            grid: {
              color: theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(203, 213, 225, 0.5)',
            }
          },
          x: {
            ticks: {
              color: theme === 'dark' ? '#94a3b8' : '#475569',
            },
            grid: {
              color: theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(203, 213, 225, 0.5)',
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                const moodLabel = value === 1 ? 'Angry' : 
                                 value === 2 ? 'Sad' : 
                                 value === 3 ? 'Neutral' : 
                                 value === 4 ? 'Happy' : 
                                 value === 5 ? 'Calm' : 'No data';
                return `Mood: ${moodLabel}`;
              }
            }
          }
        }
      }
    });
    
    // Store chart instance in ref
    chartInstanceRef.current = newChart;
    
    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData, theme]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300">Mood Overview</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setPeriod('week')}
            className={`period-selector px-3 py-1 text-sm rounded-full ${
              period === 'week' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-dark-700 dark:hover:bg-dark-600'
            } transition-colors`}
          >
            Week
          </button>
          <button 
            onClick={() => setPeriod('month')}
            className={`period-selector px-3 py-1 text-sm rounded-full ${
              period === 'month' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-dark-700 dark:hover:bg-dark-600'
            } transition-colors`}
          >
            Month
          </button>
          <button 
            onClick={() => setPeriod('year')}
            className={`period-selector px-3 py-1 text-sm rounded-full ${
              period === 'year' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-dark-700 dark:hover:bg-dark-600'
            } transition-colors`}
          >
            Year
          </button>
        </div>
      </div>
      
      <div className="chart-container h-64 mb-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <canvas ref={chartRef}></canvas>
        )}
      </div>
    </div>
  );
};

export default MoodChart;
