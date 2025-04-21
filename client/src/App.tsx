import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ViewAllEntries from "@/pages/ViewAllEntries";
import ViewEntry from "@/pages/ViewEntry";
import AuthPage from "@/pages/auth-page";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./lib/useZenSpace";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { ZenSpaceProvider } from "./lib/zenSpaceProvider";

function AppRouter() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/entries" component={ViewAllEntries} />
        <ProtectedRoute path="/entries/:id" component={ViewEntry} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ZenSpaceProvider>
          <ThemeHandler />
          <Toaster />
        </ZenSpaceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Separate component to handle theme after ZenSpaceProvider is available
function ThemeHandler() {
  const { theme } = useTheme();
  
  // Apply dark mode class to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-dark-900 dark:text-slate-100 transition-colors duration-300">
      <Header />
      <motion.main 
        className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AppRouter />
      </motion.main>
      <Footer />
    </div>
  );
}

export default App;
