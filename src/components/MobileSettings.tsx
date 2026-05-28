import React, { useState } from 'react';
import { 
  Sun, Moon, Sliders, Trash2, Award, Zap, Volume2, VolumeX, 
  Info, Sparkles, User, RefreshCw, FileCode, Check, Pencil, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playHapticSound } from '../utils/sound';

interface MobileSettingsProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  notesCount: number;
  onClearDatabase: () => void;
  onShowToast: (msg: string) => void;
}

export default function MobileSettings({
  theme,
  onToggleTheme,
  fontSize,
  setFontSize,
  notesCount,
  onClearDatabase,
  onShowToast
}: MobileSettingsProps) {
  // Mock profile name persistence
  const [profileName, setProfileName] = useState(() => {
    return window.localStorage.getItem('noteflow_username') || 'James Peter';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState(profileName);

  // Sound effects local state
  const [isMuted, setIsMuted] = useState(() => {
    return window.localStorage.getItem('noteflow_haptics_muted') === 'true';
  });

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    window.localStorage.setItem('noteflow_haptics_muted', nextMuted ? 'true' : 'false');
    if (!nextMuted) {
      setTimeout(() => playHapticSound('success'), 100);
    }
    onShowToast(nextMuted ? '🔇 Interaction sounds muted' : '🔊 Sound synthesis activated!');
  };

  const handleNameSave = () => {
    const finalName = profileNameInput.trim() || 'James Peter';
    setProfileName(finalName);
    window.localStorage.setItem('noteflow_username', finalName);
    setIsEditingName(false);
    playHapticSound('success');
    onShowToast('👤 Nickname modified successfully!');
  };

  const playSoundDemo = () => {
    playHapticSound('success');
    onShowToast('🎵 Feedback sound generated!');
  };

  // Safe database clearing state
  const [confirmClear, setConfirmClear] = useState(false);

  // Compute mock stats
  const totalCharactersStored = React.useMemo(() => {
    try {
      const raw = window.localStorage.getItem('noteflow_notes');
      return raw ? raw.length : 0;
    } catch {
      return 0;
    }
  }, [notesCount]);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto p-4 space-y-5 pb-24 transition-colors">
      
      {/* Visual Workspace Hero */}
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl mt-2 flex items-center gap-4 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-505 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* User Identity Section */}
        <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0 ring-4 ring-indigo-50 dark:ring-indigo-950">
          {profileName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={profileNameInput}
                onChange={(e) => setProfileNameInput(e.target.value)}
                className="text-sm font-bold p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-28"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              />
              <button 
                onClick={handleNameSave}
                className="p-1 px-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group">
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm truncate">{profileName}</h3>
              <button 
                onClick={() => {
                  playHapticSound('tap');
                  setProfileNameInput(profileName);
                  setIsEditingName(true);
                }}
                className="text-zinc-400 hover:text-indigo-500 p-0.5 rounded cursor-pointer"
              >
                <Pencil size={11} />
              </button>
            </div>
          )}
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium truncate">NoteFlow Registered Client</p>
        </div>
        
        <div className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-mono text-zinc-500 dark:text-zinc-400 font-bold rounded-xl absolute top-3 right-3 select-none">
          Active e-mail
        </div>
      </div>

      {/* iOS styled menu groupings */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-2">Display Controls</h4>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm divide-y divide-zinc-105 dark:divide-zinc-800">
          
          {/* Theme switcher control row */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl">
                {theme === 'light' ? <Sun size={15} /> : <Moon size={15} />}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-850 dark:text-zinc-100">Ambient UI Theme</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Toggle between day or night mode canvas</p>
              </div>
            </div>
            <button
              onClick={() => {
                playHapticSound('tap');
                onToggleTheme();
              }}
              className="p-1.5 px-3.5 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition-all cursor-pointer"
            >
              {theme === 'light' ? 'Go Dark' : 'Go Light'}
            </button>
          </div>

          {/* Sound Synthesizer Click sound */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-500 rounded-xl">
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-850 dark:text-zinc-100">Haptic Keyboard Sounds</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Tactile audio synth clicks on interactive actions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={playSoundDemo}
                className="p-1.5 px-2 bg-zinc-50 dark:bg-zinc-950 text-zinc-400 hover:text-zinc-700 rounded-lg text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800"
              >
                Test Sound
              </button>
              <button
                onClick={handleMuteToggle}
                className={`p-1.5 px-3 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
                  isMuted 
                    ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isMuted ? 'Muted' : 'Symphony'}
              </button>
            </div>
          </div>

          {/* Typography Specimen and Font size slider */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-xl">
                <Sliders size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-850 dark:text-zinc-100">Editor Typography Scale</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Control the readability dimensions of the note pages</p>
              </div>
            </div>
            
            {/* Real Font Slider */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Compact (12px)</span>
                <span className="font-bold text-indigo-500">{fontSize}px</span>
                <span>Spacious (32px)</span>
              </div>
              <input
                type="range"
                min={12}
                max={32}
                step={2}
                value={fontSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFontSize(val);
                  playHapticSound('tap');
                }}
                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div 
                className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-center border border-zinc-100 dark:border-zinc-800 transition-all font-sans text-zinc-700 dark:text-zinc-400 italic line-clamp-1"
                style={{ fontSize: `${fontSize}px` }}
              >
                Note Flow specimen preview check.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud & Sandbox Statistics and local database details */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-2">Device Statistics</h4>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-4 space-y-3.5 shadow-sm text-xs select-none">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2.5">
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1.5">📁 Local File Registry</span>
            <span className="font-mono font-bold text-zinc-800 dark:text-white">{notesCount} notes loaded</span>
          </div>
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2.5">
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1.5">💾 Database Footprint</span>
            <span className="font-mono font-bold text-zinc-800 dark:text-white">{(totalCharactersStored / 1024).toFixed(2)} KB utilized</span>
          </div>
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2.5">
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1.5">💡 Capture Engine</span>
            <span className="font-mono font-bold text-indigo-550 text-indigo-500 font-extrabold flex items-center gap-1">Gemini AI Client <Sparkles size={11} className="fill-current" /></span>
          </div>
          <div className="flex items-center justify-between pb-1">
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1.5">⚙️ Hosting Environment</span>
            <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">Cloud Run Application API</span>
          </div>
        </div>
      </div>

      {/* Extreme dangerous controls */}
      <div className="space-y-1.5 pt-1">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-2">Extreme Actions</h4>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-805 rounded-2xl p-4 shadow-sm">
          {!confirmClear ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-600">Factory Reset Database</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Wipe all notes from local browser memory</p>
              </div>
              <button
                onClick={() => {
                  playHapticSound('heavy');
                  setConfirmClear(true);
                }}
                className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-500 rounded-xl text-xs font-semibold cursor-pointer border border-rose-100 dark:border-rose-900/10"
              >
                Reset App
              </button>
            </div>
          ) : (
            <div className="text-center space-y-3.5 py-1">
              <p className="text-xs font-bold text-rose-600 flex items-center gap-2 justify-center">
                <AlertCircle size={14} /> Are you absolutely positive? This is irreversible.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    playHapticSound('tap');
                    setConfirmClear(false);
                  }}
                  className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350 text-[11px] font-bold rounded-xl"
                >
                  Terminate
                </button>
                <button
                  onClick={() => {
                    playHapticSound('heavy');
                    onClearDatabase();
                    setConfirmClear(false);
                  }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl"
                >
                  Yes, Erase Memory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
