'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, RotateCw, Sparkles, HelpCircle, BookOpen, Layers, GitBranch, KeyRound, Flag } from 'lucide-react';
import { VocabWord } from '@/types/vocab';
import { Rating } from '@/lib/srs';
import { ReportErrorModal } from './ReportErrorModal';

interface SRSFlashcardProps {
  word: VocabWord;
  onRate: (rating: Rating) => void;
  cardIndex?: number;
  totalCards?: number;
}

export const SRSFlashcard: React.FC<SRSFlashcardProps> = ({
  word,
  onRate,
  cardIndex,
  totalCards,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showRootHint, setShowRootHint] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Toggle card flip
  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // Web Speech API for Pronunciation
  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Keyboard Event Listener (Space to flip, 1-4 for ratings)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1') {
        onRate('again');
      } else if (e.key === '2') {
        onRate('hard');
      } else if (e.key === '3') {
        onRate('good');
      } else if (e.key === '4') {
        onRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRate]);

  const getTagClass = (tag: string) => {
    if (tag.includes('Smart 1')) return 'tag-ws1';
    if (tag.includes('Smart 2')) return 'tag-ws2';
    if (tag.includes('GRE')) return 'tag-gre';
    if (tag.includes('Yield')) return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
    return 'tag-bcs';
  };

  // Highlight word in sentence
  const renderHighlightedSentence = (sentence: string, targetWord: string) => {
    if (sentence.includes('___')) {
      const parts = sentence.split('___');
      return (
        <span>
          &ldquo;{parts[0]}
          <strong className="text-cyan-400 font-bold underline decoration-cyan-500/40">
            {targetWord}
          </strong>
          {parts[1]}&rdquo;
        </span>
      );
    }

    const regex = new RegExp(`(${targetWord})`, 'gi');
    const parts = sentence.split(regex);

    return (
      <span>
        &ldquo;
        {parts.map((part, i) =>
          part.toLowerCase() === targetWord.toLowerCase() ? (
            <strong key={i} className="text-cyan-400 font-bold underline decoration-cyan-500/40">
              {part}
            </strong>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
        &rdquo;
      </span>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Optional Card Counter Header */}
      {cardIndex !== undefined && totalCards !== undefined && (
        <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3 px-2">
          <span className="font-medium bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Card <strong className="text-white">{cardIndex + 1}</strong> of{' '}
            <strong className="text-white">{totalCards}</strong>
          </span>
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px]">
                Space
              </kbd>{' '}
              Flip
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px]">
                1-4
              </kbd>{' '}
              Rate
            </span>
          </div>
        </div>
      )}

      {/* 3D Perspective Card Container */}
      <div
        className="w-full min-h-[400px] sm:min-h-[460px] perspective-1000 cursor-pointer group"
        onClick={handleFlip}
      >
        <motion.div
          className="w-full h-full relative transform-style-3d transition-transform duration-500"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* FRONT SIDE */}
          <div
            className={`w-full min-h-[400px] sm:min-h-[460px] max-h-[70vh] overflow-y-auto overflow-x-hidden rounded-3xl p-5 sm:p-8 glass-panel border border-slate-700/60 shadow-2xl flex flex-col justify-between absolute inset-0 backface-hidden group-hover:border-indigo-500/40 transition-colors ${
              isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            {/* Top Root Banner Badge */}
            <div className="space-y-2">
              <div className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/60 border border-indigo-500/30 flex items-center justify-between text-[11px] font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                  <span>[ {word.rootFamily || word.root || 'Latin Root'} ]</span>
                </span>
                <span className="text-slate-500">&bull;</span>
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cluster: {word.cluster || 'General'}</span>
                </span>
              </div>

              {/* Tags row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {word.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getTagClass(
                        tag
                      )}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsReportOpen(true);
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
                    title="Report Issue"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Word, Phonetic, Audio */}
            <div className="text-center my-auto py-4">
              <div className="inline-flex items-center gap-3 mb-2">
                <h2 className="text-4xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
                  {word.word}
                </h2>
                <button
                  onClick={playAudio}
                  className="w-10 h-10 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 transition-colors hover:scale-105 active:scale-95"
                  title="Listen Pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
                <span className="font-mono text-cyan-400">{word.phonetic}</span>
                <span>•</span>
                <span className="italic font-serif text-slate-300 font-semibold">
                  {word.partOfSpeech}
                </span>
              </div>

              {/* Etymology Hint Toggle */}
              {word.root && (
                <div className="mt-5">
                  {!showRootHint ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRootHint(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/20 transition-all hover:scale-105"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Reveal Etymology Hint</span>
                    </button>
                  ) : (
                    <div className="inline-block px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-semibold animate-fadeIn">
                      <div>Root Breakdown: <span className="text-cyan-300 font-bold">{word.root}</span></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Bar Prompt */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <RotateCw className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
              <span>
                Click or press{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-white font-mono">
                  Space
                </kbd>{' '}
                to flip card
              </span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            className={`w-full min-h-[400px] sm:min-h-[460px] max-h-[70vh] overflow-y-auto overflow-x-hidden rounded-3xl p-5 sm:p-8 glass-panel border border-indigo-500/40 shadow-2xl flex flex-col justify-between absolute inset-0 backface-hidden rotate-y-180 ${
              !isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            {/* Top Bar Back */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-heading text-white">{word.word}</span>
                <span className="text-xs italic text-indigo-400">({word.partOfSpeech})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReportOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  title="Report Issue"
                >
                  <Flag className="w-4 h-4" />
                </button>
                <button
                  onClick={playAudio}
                  className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                  title="Listen Pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Back Content Details */}
            <div className="space-y-3.5 my-auto py-2">
              {/* VISUAL ANCHOR: Highlighting Root Meaning Prominently */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/40 shadow-lg shadow-purple-500/10 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Etymology Visual Anchor
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{word.rootFamily}</span>
                </div>
                <div className="text-sm font-extrabold text-cyan-300 bg-slate-950/60 p-2 rounded-xl border border-purple-500/20 mt-1">
                  Root Structure: {word.root}
                </div>
              </div>

              {/* Definition */}
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Definition
                </h4>
                <p className="text-base text-slate-100 font-medium leading-relaxed">
                  {word.definition}
                </p>
                {word.banglaMeaning && (
                  <p className="text-sm text-indigo-300 font-medium leading-relaxed mt-1">
                    Bangla: {word.banglaMeaning}
                  </p>
                )}
              </div>

              {/* Related Forms & Preposition Grid */}
              {(word.relatedForms || word.preposition) && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {word.relatedForms && (
                    <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <span className="font-bold text-slate-400 block mb-0.5 text-[10px] uppercase">Related Forms</span>
                      <span className="text-indigo-200">{word.relatedForms}</span>
                    </div>
                  )}
                  {word.preposition && (
                    <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <span className="font-bold text-slate-400 block mb-0.5 text-[10px] uppercase">Preposition</span>
                      <span className="text-teal-300">{word.preposition}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Contextual Sentence with Highlight */}
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Contextual Usage
                </h4>
                <p className="text-xs text-indigo-200 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {renderHighlightedSentence(word.exampleSentence, word.word)}
                </p>
              </div>

              {/* Synonyms & Antonyms */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {word.synonyms.length > 0 && (
                  <div>
                    <span className="font-semibold text-emerald-400">Synonyms: </span>
                    <span className="text-slate-300">{word.synonyms.join(', ')}</span>
                  </div>
                )}
                {word.antonyms.length > 0 && (
                  <div>
                    <span className="font-semibold text-rose-400">Antonyms: </span>
                    <span className="text-slate-300">{word.antonyms.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Bar Hint */}
            <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              Select your recall rating below to update SuperMemo-2 SRS
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rating Action Buttons */}
      <div className="w-full mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Rating 1: Again (Red) */}
        <button
          onClick={() => onRate('again')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 transition-all hover:scale-[1.03]"
        >
          <span className="text-sm font-bold">Again</span>
          <span className="text-[10px] text-rose-300/80 mt-0.5">Reset (1 day)</span>
          <span className="text-[9px] opacity-60 font-mono mt-1">[Key 1]</span>
        </button>

        {/* Rating 2: Hard (Amber) */}
        <button
          onClick={() => onRate('hard')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/60 text-amber-400 transition-all hover:scale-[1.03]"
        >
          <span className="text-sm font-bold">Hard</span>
          <span className="text-[10px] text-amber-300/80 mt-0.5">Slow (~2 days)</span>
          <span className="text-[9px] opacity-60 font-mono mt-1">[Key 2]</span>
        </button>

        {/* Rating 3: Good (Blue/Indigo) */}
        <button
          onClick={() => onRate('good')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 active:bg-indigo-500/30 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-400 transition-all hover:scale-[1.03]"
        >
          <span className="text-sm font-bold">Good</span>
          <span className="text-[10px] text-indigo-300/80 mt-0.5">Normal (~6 days)</span>
          <span className="text-[9px] opacity-60 font-mono mt-1">[Key 3]</span>
        </button>

        {/* Rating 4: Easy (Emerald) */}
        <button
          onClick={() => onRate('easy')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 transition-all hover:scale-[1.03]"
        >
          <span className="text-sm font-bold">Easy</span>
          <span className="text-[10px] text-emerald-300/80 mt-0.5">Fast (~7+ days)</span>
          <span className="text-[9px] opacity-60 font-mono mt-1">[Key 4]</span>
        </button>
      </div>

      <ReportErrorModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        wordId={word.id}
        wordText={word.word}
      />
    </div>
  );
};
