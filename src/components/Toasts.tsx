import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';

export interface Toast {
  id: string;
  title: string;
  desc?: string;
  type?: "info" | "success" | "error";
}

interface ToastsProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const Toasts: React.FC<ToastsProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "min-w-[260px] max-w-sm rounded-xl border shadow-lg p-3 backdrop-blur bg-white/90 dark:bg-zinc-900/80",
              t.type === 'success' && 'border-emerald-300/50',
              t.type === 'error' && 'border-red-300/50',
              t.type === 'info' && 'border-zinc-300/50'
            )}
            role="alert"
            aria-live="polite"
            aria-label={`${t.type || 'info'} notification: ${t.title}`}
          >
            <div className="font-medium mb-1">{t.title}</div>
            {t.desc && <div className="text-sm text-zinc-600 dark:text-zinc-400">{t.desc}</div>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
