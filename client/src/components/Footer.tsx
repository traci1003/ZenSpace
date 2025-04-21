import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

const Footer = () => {
  const [location] = useLocation();
  
  // Don't show footer on the auth page
  if (location === '/auth') {
    return null;
  }
  
  return (
    <motion.footer 
      className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm border-t border-slate-200 dark:border-dark-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <p>ZenSpace © {new Date().getFullYear()} – Your mindfulness companion</p>
    </motion.footer>
  );
};

export default Footer;
