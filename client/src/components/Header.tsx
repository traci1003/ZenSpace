import { useSound, useTheme } from '@/lib/useZenSpace';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, User } from 'lucide-react';

const Header = () => {
  const { isSoundOn, toggleSound } = useSound();
  const { theme, toggleTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Don't show the header on the auth page
  if (location === '/auth') {
    return null;
  }
  
  return (
    <motion.header 
      className="border-b border-slate-200 dark:border-dark-700 p-4 flex justify-between items-center"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-2">
        <span className="text-2xl">🧘</span>
        <h1 className="font-serif text-2xl font-bold text-primary-600 dark:text-primary-400">ZenSpace</h1>
      </div>
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center mr-4">
            <span className="text-sm text-muted-foreground mr-2">
              <User size={16} className="inline mr-1" />
              {user.username}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              title="Log out"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
            </Button>
          </div>
        )}
        <button 
          onClick={toggleSound}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors" 
          title="Toggle ambient sound"
        >
          {isSoundOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-400">
              <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-400">
              <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
              <line x1="23" x2="17" y1="9" y2="15"/>
              <line x1="17" x2="23" y1="9" y2="15"/>
            </svg>
          )}
        </button>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors" 
          title="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2"/>
              <path d="M12 20v2"/>
              <path d="m4.93 4.93 1.41 1.41"/>
              <path d="m17.66 17.66 1.41 1.41"/>
              <path d="M2 12h2"/>
              <path d="M20 12h2"/>
              <path d="m6.34 17.66-1.41 1.41"/>
              <path d="m19.07 4.93-1.41 1.41"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
          )}
        </button>
      </div>
    </motion.header>
  );
};

export default Header;
