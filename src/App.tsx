import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Mic, Sliders, Battery, Wifi, Signal, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MobileNotesList from './components/MobileNotesList';
import NoteEditor from './components/NoteEditor';
import MobileSettings from './components/MobileSettings';
import VoiceRecorder from './components/VoiceRecorder';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Note } from './types';
import { playHapticSound } from './utils/sound';

export default function App() {
  const [notes, setNotes] = useLocalStorage<Note[]>('noteflow_notes', [
    {
      id: 'demo-1',
      title: '💡 Welcome to NoteFlow Mobile!',
      content: '<p>Tap notes to edit content. Click <b>"..."</b> on the right edge of any note card to reveal advanced capabilities like:</p><ul><li>✏️ Inline renaming</li><li>⭐️ Star favoriting</li><li>🔒 Passcode locking (PIN: 1234)</li><li>📋 Clipboard exporting</li><li>📥 Offline TXT saving</li></ul><p>Use the <b>Record</b> tab to test server-side voice summarization!</p>',
      lastModified: Date.now() - 3600000,
      isFavorite: true
    },
    {
      id: 'demo-2',
      title: '🎙️ Speech summary sample',
      content: '<p><b>Title:</b> Marketing Sync Summary</p><p>We reviewed our quarterly goals. The active campaign showed a <b>24%</b> boost in target conversion rates. Next week James will configure our mobile launch pipeline.</p>',
      lastModified: Date.now() - 7200000
    }
  ]);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('noteflow_theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage<number>('noteflow_font_size', 16);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'record' | 'settings'>('notes');

  // Dynamic system clock in phone frame
  const [simulatedTime, setSimulatedTime] = useState('18:24');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSimulatedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const activeNote = useMemo(() => 
    notes.find((note) => note.id === activeNoteId),
    [notes, activeNoteId]
  );

  const sortedNotes = useMemo(() => 
    [...notes].sort((a, b) => b.lastModified - a.lastModified),
    [notes]
  );

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const addNote = (initialContent?: string) => {
    const content = typeof initialContent === 'string' ? initialContent : '';
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: content ? 'Meeting Summary' : '',
      content: content,
      lastModified: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setSearchQuery('');
  };

  const handleVoiceSuccess = (summary: string) => {
    addNote(summary);
    setActiveTab('notes');
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? { ...note, ...updates, lastModified: Date.now() }
          : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const duplicateNote = (id: string) => {
    const noteToDuplicate = notes.find(n => n.id === id);
    if (noteToDuplicate) {
      const newNote: Note = {
        ...noteToDuplicate,
        id: crypto.randomUUID(),
        title: `${noteToDuplicate.title} (Copy)`,
        lastModified: Date.now(),
      };
      setNotes([newNote, ...notes]);
      setActiveNoteId(newNote.id);
    }
  };

  const handleClearDatabase = () => {
    setNotes([]);
    setActiveNoteId(null);
    playHapticSound('heavy');
    showToast('🧹 Local database completely wiped!');
  };

  const handleTabChange = (tab: 'notes' | 'record' | 'settings') => {
    playHapticSound('double_tap');
    setActiveTab(tab);
  };

  return (
    <div className={`${theme} transition-colors duration-300`}>
      {/* Outer Aesthetic Responsive Environment */}
      <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 flex flex-col items-center justify-center p-0 sm:py-6 relative overflow-hidden font-sans">
        
        {/* Background Visual Mesh Gradients (Only visible on wide desktop viewports) */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-indigo-500/10 to-transparent blur-3xl pointer-events-none hidden sm:block" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-rose-500/10 to-transparent blur-3xl pointer-events-none hidden sm:block" />

        {/* -------------------- MAIN MOBILE DEVICE WRAPPER -------------------- */}
        <div className="w-full sm:w-[395px] h-screen sm:h-[812px] bg-white dark:bg-zinc-950 sm:rounded-[3rem] sm:border-[10px] sm:border-zinc-900 dark:sm:border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col select-none ring-1 ring-black/10">
          
          {/* iOS Status Bar (Highly responsive - hides seamlessly on very compact widgets) */}
          <div className="h-10 bg-white dark:bg-zinc-900/40 px-6 pt-2 flex items-center justify-between z-40 select-none border-b border-zinc-100/10 shrink-0">
            {/* Clock */}
            <span className="text-xs font-bold text-zinc-900 dark:text-white tracking-wide font-mono select-none">
              {simulatedTime}
            </span>

            {/* Simulated iPhone Camera Island / Active Recording Status indicator */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2 h-5 w-24 bg-black rounded-full flex items-center justify-center z-50">
              <AnimatePresence mode="wait">
                {activeTab === 'record' ? (
                  <motion.div
                    key="recording-status"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[8px] font-mono text-red-400 font-bold uppercase tracking-widest leading-none">REC ACTIVE</span>
                  </motion.div>
                ) : (
                  <div key="camera-sensor" className="w-3 h-3 bg-zinc-900/80 rounded-full border border-zinc-800" />
                )}
              </AnimatePresence>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
              <Signal size={12} className="stroke-[2.5]" />
              <span className="text-[9px] font-bold font-mono tracking-tighter">eSIM</span>
              <Wifi size={12} />
              <div className="flex items-center gap-0.5 ml-0.5">
                <span className="text-[8px] font-bold font-mono">88%</span>
                <Battery size={14} className="opacity-90" />
              </div>
            </div>
          </div>

          {/* Core View Container with tab layout */}
          <div className="flex-1 w-full relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === 'notes' && (
                <motion.div
                  key="notes-tab"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex flex-col"
                >
                  <MobileNotesList
                    notes={sortedNotes}
                    activeNoteId={activeNoteId}
                    onSelectNote={(id) => setActiveNoteId(id)}
                    onAddNote={addNote}
                    onDeleteNote={deleteNote}
                    onDuplicateNote={duplicateNote}
                    onUpdateNote={updateNote}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onShowToast={showToast}
                  />
                </motion.div>
              )}

              {activeTab === 'record' && (
                <motion.div
                  key="record-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex flex-col"
                >
                  <VoiceRecorder 
                    onSuccess={handleVoiceSuccess} 
                    variant="fullscreen" 
                  />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings-tab"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex flex-col"
                >
                  <MobileSettings
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    notesCount={notes.length}
                    onClearDatabase={handleClearDatabase}
                    onShowToast={showToast}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Note Editor Modal (Slides in cleanly from right edge over the top of tabs) */}
            <AnimatePresence>
              {activeNote && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                  className="absolute inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col"
                >
                  <NoteEditor
                    note={activeNote}
                    onUpdateNote={updateNote}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    onBack={() => {
                      playHapticSound('tap');
                      setActiveNoteId(null);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* -------------------- FLOATING TOAST POPUP -------------------- */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 15, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 15, x: '-50%' }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-900/90 dark:bg-zinc-100/90 backdrop-blur-md text-white dark:text-zinc-950 text-xs font-bold rounded-full shadow-lg border border-white/10 flex items-center gap-2 z-50 whitespace-nowrap"
              >
                <Sparkles size={13} className="text-yellow-400 fill-yellow-400" />
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom iOS Navigation Bar Deck */}
          <div className="h-16 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-around px-2 pb-2 shrink-0 z-40 select-none">
            
            {/* Notes List Tab button */}
            <button
              onClick={() => handleTabChange('notes')}
              className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 cursor-pointer ${
                activeTab === 'notes' 
                  ? 'text-indigo-600 dark:text-white scale-105 font-bold' 
                  : 'text-zinc-400 dark:text-zinc-550 hover:text-zinc-600'
              }`}
            >
              <FileText size={18} className={activeTab === 'notes' ? "stroke-[2.5]" : "stroke-2"} />
              <span className="text-[10px] tracking-tight">Library</span>
            </button>

            {/* Voice Recorder Capture button */}
            <button
              onClick={() => handleTabChange('record')}
              className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 cursor-pointer ${
                activeTab === 'record' 
                  ? 'text-rose-500 dark:text-rose-400 scale-105 font-bold' 
                  : 'text-zinc-400 dark:text-zinc-550 hover:text-rose-455'
              }`}
            >
              <div className={`p-1 rounded-full ${activeTab === 'record' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500' : ''}`}>
                <Mic size={18} className={activeTab === 'record' ? "stroke-[2.5]" : "stroke-2"} />
              </div>
              <span className="text-[10px] tracking-tight">Record</span>
            </button>

            {/* Settings Tab button */}
            <button
              onClick={() => handleTabChange('settings')}
              className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 cursor-pointer ${
                activeTab === 'settings' 
                  ? 'text-indigo-600 dark:text-white scale-105 font-bold' 
                  : 'text-zinc-400 dark:text-zinc-550 hover:text-zinc-600'
              }`}
            >
              <Sliders size={18} className={activeTab === 'settings' ? "stroke-[2.5]" : "stroke-2"} />
              <span className="text-[10px] tracking-tight">Settings</span>
            </button>
          </div>

          {/* Simulated Physical Bottom Swipe Home Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-350 dark:bg-zinc-800 rounded-full z-40 hidden sm:block pointer-events-none" />
        </div>

      </div>
    </div>
  );
}
