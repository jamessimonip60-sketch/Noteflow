import React from 'react';
import { Search, Plus, Trash2, FileText, Sun, Moon, MoreHorizontal, Copy, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note } from '../types';
import VoiceRecorder from './VoiceRecorder';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onVoiceSuccess: (summary: string) => void;
}

export default function Sidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onAddNote,
  onDeleteNote,
  onDuplicateNote,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  onVoiceSuccess,
}: SidebarProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);

  const filteredNotes = notes.filter(
    (note) =>
      (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof note.content === 'string' ? note.content : '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 h-screen flex flex-col bg-white dark:bg-zinc-950 transition-colors relative">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl flex items-center justify-center text-[10px] font-bold shadow-lg shadow-zinc-200 dark:shadow-none">NF</div>
            <h1 className="font-bold text-zinc-900 dark:text-white tracking-tight">NoteFlow</h1>
          </div>
          <button
            onClick={onToggleTheme}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-white/5 focus:border-zinc-300 dark:focus:border-zinc-700 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-24 scrollbar-hide">
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                    activeNoteId === note.id
                      ? 'bg-zinc-100/80 dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-800'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                  }`}
                  onClick={() => {
                    onSelectNote(note.id);
                    setMenuOpenId(null);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          {new Date(note.lastModified).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className={`text-[13px] font-semibold truncate transition-colors ${
                        activeNoteId === note.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {note.title || 'Untitled Note'}
                      </h3>
                      <p className="text-[12px] text-zinc-500 dark:text-zinc-500 truncate mt-1 leading-relaxed">
                        {typeof note.content === 'string' ? note.content.replace(/<[^>]*>/g, '') : 'Start writing...'}
                      </p>
                    </div>

                    <div className="relative">
                      {note.id === deletingId ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNote(note.id);
                              setDeletingId(null);
                            }}
                            className="p-1 px-2 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(null);
                            }}
                            className="p-1 px-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === note.id ? null : note.id);
                            }}
                            className={`p-1.5 rounded-lg transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 text-zinc-400 ${
                              menuOpenId === note.id ? 'opacity-100 border-zinc-200 dark:border-zinc-800' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          <AnimatePresence>
                            {menuOpenId === note.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    onSelectNote(note.id);
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-[11px] font-medium flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                                >
                                  <Pencil size={12} />
                                  Edit Note
                                </button>
                                <button
                                  onClick={() => {
                                    onDuplicateNote(note.id);
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-[11px] font-medium flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                                >
                                  <Copy size={12} />
                                  Duplicate
                                </button>
                                <button
                                  onClick={() => {
                                    const content = typeof note.content === 'string' ? note.content : '';
                                    const text = `${note.title}\n\n${content.replace(/<[^>]*>/g, '')}`;
                                    const blob = new Blob([text], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${note.title || 'untitled'}.txt`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-[11px] font-medium flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                                >
                                  <FileText size={12} />
                                  Export as TXT
                                </button>
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
                                <button
                                  onClick={() => {
                                    setDeletingId(note.id);
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-[11px] font-medium flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                                >
                                  <Trash2 size={12} />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 px-6">
                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-300 dark:text-zinc-700">
                  <FileText size={20} />
                </div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-600">No notes found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-none z-20">
        <VoiceRecorder onSuccess={onVoiceSuccess} />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAddNote()}
          className="p-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-xl shadow-zinc-900/20 dark:shadow-none"
          title="New Note"
        >
          <Plus size={20} />
        </motion.button>
      </div>
    </aside>
  );
}
