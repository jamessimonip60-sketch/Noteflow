import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Play, AlertCircle, Info, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { transcribeAndSummarizeAudio } from '../lib/gemini';
import { playHapticSound } from '../utils/sound';

interface VoiceRecorderProps {
  onSuccess: (summary: string) => void;
  variant?: 'pill' | 'fullscreen';
}

export default function VoiceRecorder({ onSuccess, variant = 'pill' }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveTranscriptHint, setLiveTranscriptHint] = useState('Tap record to begin transcribing with Gemini AI');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Dynamic visual soundwaves generator
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>([4, 12, 8, 16, 12, 24, 18, 10, 22, 14, 28, 16, 8, 14, 4]);

  useEffect(() => {
    let wavesInterval: number;
    if (isRecording) {
      wavesInterval = window.setInterval(() => {
        setWaveAmplitudes(prev => 
          prev.map(() => Math.floor(Math.random() * 32) + 6)
        );
      }, 100);
    } else {
      setWaveAmplitudes([4, 12, 8, 16, 12, 24, 18, 10, 22, 14, 28, 16, 8, 14, 4]);
    }
    return () => clearInterval(wavesInterval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      playHapticSound('recording_start');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setLiveTranscriptHint('Listening to your spoken notes... Speak clearly.');
      
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check frame configuration / browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      playHapticSound('recording_stop');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setLiveTranscriptHint('Preparing audio binaries for transmission...');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setLiveTranscriptHint('Contacting server-side Gemini Flash API...');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        setLiveTranscriptHint('Gemini is transcribing & distilling your notes into summary models...');
        const summary = await transcribeAndSummarizeAudio(base64Data);
        if (summary) {
          playHapticSound('success');
          onSuccess(summary);
          setLiveTranscriptHint('Successfully captured. Summary injected as a new active note!');
        } else {
          setLiveTranscriptHint('No content transcribed.');
        }
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsProcessing(false);
      setLiveTranscriptHint('Error calling Gemini. Check API deployment key configurations.');
      alert('Error processing audio with Gemini. Please verify process environment variables.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Classical Compact Toolbar Pill Variant
  if (variant === 'pill') {
    return (
      <div className="relative group">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-xl"
            >
              <Loader2 size={16} className="animate-spin text-indigo-500" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Summarizing...
              </span>
            </motion.div>
          ) : isRecording ? (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-4 bg-zinc-900 dark:bg-zinc-100 px-4 py-2 rounded-full shadow-2xl"
            >
              <div className="flex items-center gap-2 border-r border-white/25 dark:border-black/20 pr-3">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                <span className="text-xs font-mono font-bold text-white dark:text-zinc-900 tabular-nums">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <button
                onClick={stopRecording}
                className="group/stop p-1 rounded-full hover:bg-white/10 dark:hover:bg-black/5 transition-colors flex items-center justify-center"
                title="Stop Recording"
              >
                <Square size={13} className="text-white dark:text-zinc-900 fill-current group-hover/stop:scale-90 transition-transform" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full hover:bg-zinc-800 dark:hover:bg-white transition-all font-bold text-xs uppercase tracking-widest shadow-md"
              title="Record & Summarize Meeting"
            >
              <Mic size={14} className="text-indigo-505" />
              Rec
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 2. High Precision Native Fullscreen Cockpit Variant
  return (
    <div className="flex-1 flex flex-col items-center justify-between p-7 bg-white dark:bg-zinc-950 h-full overflow-y-auto">
      {/* Upper Status Cards */}
      <div className="w-full text-center space-y-2 mt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[11px] font-bold uppercase tracking-wider">
          <Disc size={13} className={isRecording ? 'animate-spin' : ''} />
          Gemini Audio Summarizer
        </div>
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">AI Voice Notes</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
          Record meetings, lectures or voice prompts. Our server-side Gemini client parses speech context and logs beautiful condensed notes.
        </p>
      </div>

      {/* Pulsing Oscilloscope Audio Waveforms Container */}
      <div className="h-44 w-full flex items-center justify-center gap-1 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-805 rounded-3xl p-6 relative overflow-hidden my-6">
        {isRecording && (
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
        )}
        
        {/* Render animated audio sticks */}
        <div className="flex items-end gap-1.5 h-24">
          {waveAmplitudes.map((amp, index) => (
            <motion.div
              key={index}
              animate={{ height: `${amp}%` }}
              transition={{ type: 'spring', damping: 15 }}
              className={`w-1 rounded-full ${
                isRecording 
                  ? 'bg-rose-500 dark:bg-rose-400' 
                  : isProcessing 
                    ? 'bg-indigo-500 dark:bg-indigo-400' 
                    : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Micro Status Monitor */}
      <div className="w-full max-w-sm bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl flex items-start gap-3">
        {isProcessing ? (
          <Loader2 size={16} className="text-indigo-500 animate-spin mt-0.5 shrink-0" />
        ) : isRecording ? (
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping mt-1.5 shrink-0" />
        ) : (
          <Info size={16} className="text-zinc-400 mt-0.5 shrink-0" />
        )}
        <div className="text-left font-sans">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">System Activity</p>
          <p className="text-[12px] font-medium text-zinc-700 dark:text-zinc-350 mt-0.5 transition-all">{liveTranscriptHint}</p>
        </div>
      </div>

      {/* Floating Control Pad */}
      <div className="my-8 flex flex-col items-center gap-4">
        {/* Digital Time Counter */}
        <div className="text-4xl font-mono font-bold tracking-tight text-zinc-800 dark:text-zinc-100 tabular-nums flex items-center gap-2">
          {isRecording && <span className="w-2.5 h-2.5 rounded-full bg-red-550 bg-rose-500 animate-pulse inline-block" />}
          {formatTime(recordingTime)}
        </div>

        {/* Dynamic Tactile Toggle Button */}
        <div className="relative flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900 rounded-full border border-zinc-100 dark:border-zinc-800">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.button
                key="stop-btn"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-500/20 shadow-inner z-10 border border-rose-400 cursor-pointer"
              >
                <Square size={24} className="fill-current" />
              </motion.button>
            ) : (
              <motion.button
                key="start-btn"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={startRecording}
                disabled={isProcessing}
                className="w-20 h-20 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-905 hover:bg-zinc-800 dark:hover:bg-zinc-105 flex items-center justify-center shadow-xl shadow-zinc-900/20 z-10 border border-zinc-800 dark:border-zinc-200/50 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 size={24} className="animate-spin text-white dark:text-indigo-600" />
                ) : (
                  <Mic size={26} className="text-rose-500 dark:text-rose-500" />
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold mt-2">
          {isRecording ? 'TAP TO COMPLETE TRANSCRIPTION' : 'TAP TO COMMENCE AUDIO DOCKET'}
        </p>
      </div>
    </div>
  );
}
