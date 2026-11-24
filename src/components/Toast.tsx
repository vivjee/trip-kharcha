'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trash2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  const isDestructive = message && (
    message.toLowerCase().includes('delete') ||
    message.toLowerCase().includes('remov') ||
    message.toLowerCase().includes('clear')
  );

  return (
    <AnimatePresence>
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-[calc(1rem+env(safe-area-inset-top))] inset-x-4 z-[999] pointer-events-none flex justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="surface-card-strong w-full max-w-sm rounded-2xl border border-line px-4 py-3 backdrop-blur-xl flex items-center gap-3"
            style={{
              boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.22), 0 4px 12px -2px rgba(0, 0, 0, 0.10), var(--nm-raised-medium)',
            }}
          >
            {/* Icon badge */}
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${
                isDestructive
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isDestructive ? (
                <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
              ) : (
                <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
              )}
            </div>

            {/* Message text */}
            <p className="text-xs font-extrabold text-text-hi truncate flex-1 leading-snug">
              {message}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
