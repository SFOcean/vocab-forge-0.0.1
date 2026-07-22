'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { BookOpen, CheckCircle, RefreshCw, Filter, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { VocabWord, UserProgress } from '@/types/vocab';
import { calculateNextReview, isDueForReview, saveWordProgress, Rating } from '@/lib/srs';
import { updateWordProgress, incrementTodayReviewed } from '@/lib/storage';
import { FlashcardItem } from './flashcard-item';

interface FlashcardDeckProps {
  words: VocabWord[];
  progressMap: Record<string, UserProgress>;
  onProgressUpdate: (updated: Record<string, UserProgress>) => void;
  onNavigateHome: () => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  words,
  progressMap,
  onProgressUpdate,
  onNavigateHome,
}) => {
  const [filterTag, setFilterTag] = useState<string>('All');
  const [dueOnly, setDueOnly] = useState<boolean>(true);

  const [deck, setDeck] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(0);

  // Initialize deck based on filters
  const buildDeck = useCallback(() => {
    let filtered = words;

    if (filterTag !== 'All') {
      filtered = filtered.filter((w) => w.tags.includes(filterTag as any));
    }

    if (dueOnly) {
      filtered = filtered.filter((w) => {
        const p = progressMap[w.id];
        return !p || isDueForReview(p);
      });
    }

    setDeck(filtered);
    setCurrentIndex(0);
    setCompleted(filtered.length === 0);
    setSessionCount(0);
  }, [words, progressMap, filterTag, dueOnly]);

  useEffect(() => {
    buildDeck();
  }, [buildDeck]);

  const handleRate = useCallback(
    (rating: Rating) => {
      if (currentIndex >= deck.length) return;

      const currentWord = deck[currentIndex];
      const currentProgress = progressMap[currentWord.id];

      const computed = calculateNextReview(rating, currentProgress);
      const fullProgress: UserProgress = {
        wordId: currentWord.id,
        ...computed,
      };

      saveWordProgress(currentWord.id, fullProgress);
      const updatedMap = updateWordProgress(fullProgress);
      onProgressUpdate(updatedMap);

      incrementTodayReviewed();
      setSessionCount((prev) => prev + 1);

      if (currentIndex + 1 < deck.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCompleted(true);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    },
    [currentIndex, deck, progressMap, onProgressUpdate]
  );

  // Keyboard shortcut listener for 1-4 ratings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completed || deck.length === 0) return;
      if (e.key === '1') handleRate('again');
      if (e.key === '2') handleRate('hard');
      if (e.key === '3') handleRate('good');
      if (e.key === '4') handleRate('easy');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [completed, deck, handleRate]);

  if (completed || deck.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-indigo-500/30">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Trophy className="w-8 h-8" />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold font-heading text-white mb-2">
            Deck Session Complete!
          </h2>
          <p className="text-sm text-slate-300 mb-6">
            {sessionCount > 0
              ? `Great job! You reviewed ${sessionCount} SRS cards in this session.`
              : 'No cards match your selected review filters right now.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setDueOnly(false);
                buildDeck();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Review All Cards</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = deck[currentIndex];
  const currentProgress = progressMap[currentWord.id] || {
    wordId: currentWord.id,
    interval: 0,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
    correctCount: 0,
    incorrectCount: 0,
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Deck Controls & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 glass-card p-4 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Deck:</span>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Tags</option>
            <option value="Word Smart 1">Word Smart 1</option>
            <option value="Word Smart 2">Word Smart 2</option>
            <option value="GRE High-Frequency">GRE High-Frequency</option>
            <option value="BCS Direct">BCS Direct</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={dueOnly}
              onChange={(e) => setDueOnly(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Due for Review Only</span>
          </label>
        </div>
      </div>

      {/* Active Flashcard */}
      <FlashcardItem
        key={currentWord.id}
        word={currentWord}
        progress={currentProgress}
        onRate={handleRate}
        cardIndex={currentIndex}
        totalCards={deck.length}
      />
    </div>
  );
};
