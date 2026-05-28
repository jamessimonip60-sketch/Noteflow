import React, { useState } from 'react';
import { 
  Search, Plus, Trash2, FileText, Star, Lock, Unlock, 
  MoreVertical, Copy, Pencil, Share2, CornerDownRight, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note } from '../types';
import { playHapticSound } from '../utils/sound';

interface MobileNotesListProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onShowToast: (msg: string) => void;
}

export default function MobileNotesList({
  notes,
  activeNoteId,
  onSelectNote,
  onAddNote,
  onDeleteNote,
  onDuplicateNote,
  onUpdateNote,
  searchQuery,
  onSearchChange,
  onShowToast
}: MobileNotesListProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'starred' | 'audio' | 'locked'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  
  // Apple notes PIN lock mock states
  const [pinPromptId, setPinPromptId] = useState<string | null>(null);
  const [pinInputValue, setPinInputValue] = useState('');
  const [settingPinId, setSettingPinId] = useState<string | null>(null);
  const [newPinValue, setNewPinValue] = useState('');

  // Filter notes based on search & category tabs
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = 
      (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof note.content === 'string' ? note.content : '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeCategory === 'starred') return !!note.isFavorite;
    if (activeCategory === 'locked') return !!note.isLocked;
    if (activeCategory === 'audio') {
      // Audio summaries usually have 'Meeting Summary' title or rich layout
      return note.title.toLowerCase().includes('summary') || note.content.includes('Summary');
    }
    return true;
  });

  // Tap navigation sound triggers
  const handleSelect = (note: Note) => {
    if (note.isLocked) {
      playHapticSound('heavy');
      setPinPromptId(note.id);
      setPinInputValue('');
    } else {
      playHapticSound('tap');
      onSelectNote(note.id);
    }
  };

  const verifyPinAndOpen = () => {
    const note = notes.find(n => n.id === pinPromptId);
    if (note && (note.lockPin === pinInputValue || pinInputValue === '1234')) {
      playHapticSound('success');
      onSelectNote(note.id);
      setPinPromptId(null);
      setPinInputValue('');
    } else {
      playHapticSound('heavy');
      onShowToast('❌ Incorrect Lock code (Hint: try 1234)');
    }
  };

  const saveNewPin = () => {
    if (!newPinValue) return;
    onUpdateNote(settingPinId!, { isLocked: true, lockPin: newPinValue });
    playHapticSound('success');
    onShowToast('🔒 Secure lock code activated!');
    setSettingPinId(null);
    setNewPinValue('');
  };

  const initiateRename = (note: Note) => {
    setEditingId(note.id);
    setEditTitleValue(note.title || 'Untitled Note');
    setActiveMenuId(null);
  };

  const handleRenameSave = (id: string) => {
    onUpdateNote(id, { title: editTitleValue || 'Untitled Note' });
    playHapticSound('success');
    setEditingId(null);
    onShowToast('✏️ Title modified successfully');
  };

  const toggleFavorite = (note: Note) => {
    onUpdateNote(note.id, { isFavorite: !note.isFavorite });
    playHapticSound('tap');
    onShowToast(note.isFavorite ? '⭐️ Unstarred note' : '⭐️ Starred note!');
    setActiveMenuId(null);
  };

  const handleShare = (note: Note) => {
    const content = typeof note.content === 'string' ? note.content.replace(/<[^>]*>/g, '') : '';
    const shareText = `📝 ${note.title || 'Untitled Note'}\n\n${content}`;
    navigator.clipboard.writeText(shareText);
    playHapticSound('success');
    onShowToast('📋 Text copied to clipboard!');
    setActiveMenuId(null);
  };

  const toggleLock = (note: Note) => {
    if (note.isLocked) {
      onUpdateNote(note.id, { isLocked: false, lockPin: undefined });
      playHapticSound('tap');
      onShowToast('🔓 Padlock authentication removed');
      setActiveMenuId(null);
    } else {
      setSettingPinId(note.id);
      setNewPinValue('1234'); // default hint
      setActiveMenuId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Search Header Container */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800/80 space-y-3.5 shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h1 className="text-xl font-bold font-sans tracking-tight text-zinc-900 dark:text-white">NoteFlow</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              playHapticSound('heavy');
              onAddNote();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
          >
            <Plus size={14} /> Add Note
          </motion.button>
        </div>

        {/* Search block */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
          <input
            type="text"
            placeholder="Search matching content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
          {([
            { id: 'all', label: 'All' },
            { id: 'starred', label: 'Starred' },
            { id: 'audio', label: 'Audio Summaries' },
            { id: 'locked', label: 'Locked' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playHapticSound('tap');
                setActiveCategory(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-tight whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                  : 'bg-zinc-100/80 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main List Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-24">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              {editingId === note.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitleValue}
                    onChange={(e) => setEditTitleValue(e.target.value)}
                    className="w-full text-sm font-semibold p-1.5 border-b border-indigo-500 focus:outline-none bg-transparent"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRenameSave(note.id)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 text-white rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  {/* Note Tappable Core */}
                  <div 
                    onClick={() => handleSelect(note)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                        {new Date(note.lastModified).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {note.isFavorite && (
                        <Star size={11} className="text-amber-500 fill-current" />
                      )}
                      {note.isLocked && (
                        <Lock size={11} className="text-rose-500" />
                      )}
                    </div>
                    
                    <h3 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-100 truncate">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {note.isLocked ? (
                        <span className="italic text-zinc-400 flex items-center gap-1">🔒 Note secured (Click to tap code)</span>
                      ) : (
                        typeof note.content === 'string' ? note.content.replace(/<[^>]*>/g, '') : 'Start writing...'
                      )}
                    </p>
                  </div>

                  {/* Context Action popover trigger */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        playHapticSound('tap');
                        setActiveMenuId(activeMenuId === note.id ? null : note.id);
                      }}
                      className="p-1 px-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-400 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/80 transition-colors"
                    >
                      <MoreVertical size={13} />
                    </button>

                    {/* Quick Menu Popover */}
                    <AnimatePresence>
                      {activeMenuId === note.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            <button
                              onClick={() => initiateRename(note)}
                              className="w-full text-left px-3 py-2 text-[11px] font-medium flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                            >
                              <Pencil size={12} /> Rename Title
                            </button>
                            <button
                              onClick={() => toggleFavorite(note)}
                              className="w-full text-left px-3 py-2 text-[11px] font-medium flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                            >
                              <Star size={12} className={note.isFavorite ? "fill-amber-500 text-amber-500" : ""} /> 
                              {note.isFavorite ? 'Unstar' : 'Star Note'}
                            </button>
                            <button
                              onClick={() => toggleLock(note)}
                              className="w-full text-left px-3 py-2 text-[11px] font-medium flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                            >
                              {note.isLocked ? <Unlock size={12} /> : <Lock size={12} />} 
                              {note.isLocked ? 'Unlock File' : 'Password Lock'}
                            </button>
                            <button
                              onClick={() => {
                                playHapticSound('success');
                                onDuplicateNote(note.id);
                                setActiveMenuId(null);
                                onShowToast('📋 Note duplicated successfully!');
                              }}
                              className="w-full text-left px-3 py-2 text-[11px] font-medium flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                            >
                              <Copy size={12} /> Duplicate Note
                            </button>
                            <button
                              onClick={() => handleShare(note)}
                              className="w-full text-left px-3 py-2 text-[11px] font-medium flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                            >
                              <Share2 size={12} /> Share Markdown
                            </button>
                            <button
                              onClick={() => {
                                playHapticSound('success');
                                const content = typeof note.content === 'string' ? note.content : '';
                                const text = `${note.title}\n\n${content.replace(/<[^>]*>/g, '')}`;
                                const blob = new Blob([text], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${note.title || 'untitled'}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                                setActiveMenuId(null);
                                onShowToast('📥 TXT saved!');
                              }}
                              className="w-full text-left px-3 py-2 text-[11px] font-medium flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                            >
                              <FileText size={12} /> Save as Text File
                            </button>
                            <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
                            <button
                              onClick={() => {
                                playHapticSound('heavy');
                                onDeleteNote(note.id);
                                setActiveMenuId(null);
                                onShowToast('🗑️ Note was scrubbed');
                              }}
                              className="w-full text-left px-3 py-2 text-[11px] font-bold flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-rose-600 transition-colors"
                            >
                              <Trash2 size={12} /> Erase Note
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 px-6">
            <div className="w-12 h-12 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <FileText size={18} />
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-650">No files found matching criteria</p>
          </div>
        )}
      </div>

      {/* MOCK Apple PIN Screen Alert Modal */}
      <AnimatePresence>
        {pinPromptId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 w-full max-w-xs text-center space-y-4 shadow-2xl"
            >
              <div className="mx-auto w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center text-indigo-500 mb-1">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Folder Passcode Required</h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Provide secret code to display (Hint: 1234)</p>
              </div>
              <input
                type="password"
                maxLength={8}
                placeholder="••••"
                value={pinInputValue}
                onChange={(e) => setPinInputValue(e.target.value)}
                className="w-full text-center text-lg font-bold p-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none tracking-widest"
                onKeyDown={(e) => e.key === 'Enter' && verifyPinAndOpen()}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setPinPromptId(null)}
                  className="flex-1 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyPinAndOpen}
                  className="flex-1 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-xl"
                >
                  Verify
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Initialize Pin Lock Modal */}
      <AnimatePresence>
        {settingPinId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 w-full max-w-xs text-center space-y-4 shadow-2xl"
            >
              <div className="mx-auto w-10 h-10 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center text-rose-500 mb-1">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Create Security Passcode</h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Write your authorization code for this note:</p>
              </div>
              <input
                type="text"
                placeholder="1234"
                maxLength={8}
                value={newPinValue}
                onChange={(e) => setNewPinValue(e.target.value)}
                className="w-full text-center text-sm font-bold p-2 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setSettingPinId(null)}
                  className="flex-1 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewPin}
                  className="flex-1 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-xl"
                >
                  Enable Lock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
