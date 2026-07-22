'use client';

import React from 'react';
import { X, Volume2, Sparkles, CheckCircle2, Flame, BookOpen, Clock } from 'lucide-react';
import { VocabWord, UserProgress } from '@/types/vocab';
import { getDaysUntilNextReview } from '@/lib/srs';

interface WordDetailModalProps {
  word: VocabWord | null;
  progress?: UserProgress;
  onClose: () => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({ word, progress, onClose }) => {
  if (!word) return null;

  const playAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getTagClass = (tag: string) => {
    if (tag.includes('Smart 1')) return 'tag-ws1';
    if (tag.includes('Smart 2')) return 'tag-ws2';
    if (tag.includes('GRE')) return 'tag-gre';
    return 'tag-bcs';
  };

  const daysLeft = progress ? getDaysUntilNextReview(progress) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-indigo-500/30 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tags & SRS status header */}
        <div className="flex items-center justify-between mb-4 pr-8">
          <div className="flex flex-wrap gap-1.5">
            {word.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getTagClass(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {progress && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-semibold capitalize flex items-center gap-1">
              {progress.status === 'mastered' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {progress.status === 'learning' && <Flame className="w-3.5 h-3.5 text-amber-400" />}
              {progress.status}
            </span>
          )}
        </div>

        {/* Word Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">{word.word}</h2>
            <button
              onClick={playAudio}
              className="w-9 h-9 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 transition-colors"
              title="Pronounce Word"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="font-mono text-cyan-400">{word.phonetic}</span>
            <span>•</span>
            <span className="italic font-serif font-semibold text-slate-300">{word.partOfSpeech}</span>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-xs">
          {/* Definition */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Definition</span>
            <p className="text-sm text-slate-100 font-medium leading-relaxed">{word.definition}</p>
          </div>

          {/* Root Etymology */}
          {word.root && (
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-purple-200">
              <span className="font-bold text-purple-300 block mb-0.5">Etymology & Root Origin</span>
              <span>{word.root}</span>
            </div>
          )}

          {/* Example Sentence */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
            <span className="font-bold text-indigo-300 block mb-1">Contextual Usage</span>
            <p className="text-slate-300 italic font-serif">&ldquo;{word.exampleSentence.replace('___', word.word)}&rdquo;</p>
          </div>

          {/* Synonyms & Antonyms Grid */}
          <div className="grid grid-cols-2 gap-3">
            {word.synonyms.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">Synonyms</span>
                <span className="text-slate-300">{word.synonyms.join(', ')}</span>
              </div>
            )}
            {word.antonyms.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-rose-400 block mb-1">Antonyms</span>
                <span className="text-slate-300">{word.antonyms.join(', ')}</span>
              </div>
            )}
          </div>

          {/* SRS Progress Metrics */}
          {progress && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-slate-400">
              <div>
                <div className="text-[11px] font-semibold">SRS Repetitions: {progress.repetition}</div>
                <div className="text-[11px] font-semibold">Ease Factor: {progress.easeFactor}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" /> Next Review: {daysLeft === 0 ? 'Today' : `In ${daysLeft} days`}
                </div>
                <div className="text-[10px] text-slate-500">Correct: {progress.correctCount} | Incorrect: {progress.incorrectCount}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
