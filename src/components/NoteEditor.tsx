import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Plus, ChevronLeft } from 'lucide-react';
import { Note } from '../types';

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  fontSize: number;
  setFontSize: (size: number | ((prev: number) => number)) => void;
  onBack?: () => void;
}

const MenuButton = ({ 
  onClick, 
  isActive, 
  children, 
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode; 
  title: string;
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg scale-105' 
        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
    }`}
    title={title}
  >
    {children}
  </button>
);

export default function NoteEditor({ note, onUpdateNote, fontSize, setFontSize, onBack }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Note content...',
      }),
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      onUpdateNote(note.id, { content: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[calc(100vh-400px)]',
      },
    },
  });

  // Update editor content when switching notes
  useEffect(() => {
    if (editor && note.id !== (editor.storage as any)?.currentId) {
      editor.commands.setContent(note.content);
      (editor.storage as any).currentId = note.id;
    }
  }, [note.id, editor]);

  if (!editor) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col h-screen overflow-hidden bg-white dark:bg-zinc-950 transition-colors"
    >
      <header className="px-4 pr-6 sm:px-8 py-4 flex flex-wrap gap-3 items-center justify-between border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="group/back flex items-center pr-2 py-1.5 focus:outline-none text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              <ChevronLeft size={22} className="group-hover/back:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-semibold tracking-tight">Main</span>
            </button>
          )}

          <div className="flex items-center gap-1 p-1 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
            >
              <Bold size={16} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
            >
              <Italic size={16} />
            </MenuButton>
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List size={16} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Ordered List"
            >
              <ListOrdered size={16} />
            </MenuButton>
          </div>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          {/* Font Size Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <button 
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500"
            >
              <div className="w-3.5 h-px bg-current" />
            </button>
            <span className="text-[10px] font-mono font-bold w-5 text-center tabular-nums">{fontSize}</span>
            <button 
              onClick={() => setFontSize(Math.min(32, fontSize + 2))}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="tabular-nums">Saved {new Date(note.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto px-8 sm:px-16 md:px-24 py-16 scrollbar-hide max-w-5xl mx-auto w-full">
        <input
          type="text"
          value={note.title}
          placeholder="New Note"
          onChange={(e) => onUpdateNote(note.id, { title: e.target.value })}
          className="w-full text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white placeholder:text-zinc-100 dark:placeholder:text-zinc-900/50 border-none focus:ring-0 p-0 mb-10 bg-transparent tracking-tighter leading-tight"
        />
        
        <div 
          className="leading-relaxed text-zinc-700 dark:text-zinc-300 transition-all font-medium/relaxed"
          style={{ fontSize: `${fontSize}px` }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </motion.div>
  );
}
