import React from 'react';
import { motion } from 'motion/react';
import { Plus, StickyNote } from 'lucide-react';

interface EmptyStateProps {
  onAddNote: () => void;
  hasNotes: boolean;
}

export default function EmptyState({ onAddNote, hasNotes }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-8 transition-colors relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-zinc-50 dark:bg-zinc-900/20 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md relative z-10"
      >
        <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-zinc-900 dark:text-zinc-100 shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-none border border-zinc-100 dark:border-zinc-800 rotate-3">
          <StickyNote size={36} strokeWidth={1.5} />
        </div>
        
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
          {hasNotes ? 'Your space is ready.' : 'A blank page for your best ideas.'}
        </h2>
        
        <p className="text-base text-zinc-500 dark:text-zinc-400 mb-12 leading-relaxed font-medium">
          {hasNotes 
            ? 'Select a note from the sidebar to continue where you left off, or capture a new thought.' 
            : 'Capture meetings, draft projects, or just list your tasks. NoteFlow helps you focus on what matters.'}
        </p>
        
        {!hasNotes && (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddNote()}
            className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl hover:bg-zinc-800 dark:hover:bg-white transition-all font-bold text-sm tracking-wide shadow-2xl shadow-zinc-900/20 dark:shadow-none"
          >
            <Plus size={20} />
            New Note
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
