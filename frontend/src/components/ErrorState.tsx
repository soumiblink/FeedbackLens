import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = "Something went wrong", 
  message = "We couldn't load this information. Please try again.",
  onRetry 
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-panel p-12 text-center"
    >
      <AlertCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium h-12"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}
