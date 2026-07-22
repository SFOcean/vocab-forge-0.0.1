'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/navbar';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { SRSDistribution } from '@/components/dashboard/srs-distribution';
import { CategoryMastery } from '@/components/dashboard/category-mastery';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { FlashcardDeck } from '@/components/flashcards/flashcard-deck';
import { QuizHub } from '@/components/quiz/quiz-hub';
import { WordList } from '@/components/explorer/word-list';
import { DataManager } from '@/components/settings/data-manager';

import { INITIAL_WORDS } from '@/data/words';
import { VocabWord, UserProgress, UserStats, QuizMode } from '@/types/vocab';
import {
  loadUserProgress,
  loadUserStats,
  loadCustomWords,
  addCustomWord,
  saveQuizResult,
} from '@/lib/storage';
import { isDueForReview } from '@/lib/srs';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [quizSubMode, setQuizSubMode] = useState<QuizMode | undefined>(undefined);

  const [words, setWords] = useState<VocabWord[]>(INITIAL_WORDS);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [stats, setStats] = useState<UserStats>({
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    dailyGoal: 10,
    todayReviewedCount: 0,
    totalQuizzesTaken: 0,
  });

  const refreshState = useCallback(() => {
    const custom = loadCustomWords();
    const all = [...INITIAL_WORDS, ...custom];
    setWords(all);
    setProgressMap(loadUserProgress());
    setStats(loadUserStats());
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const handleProgressUpdate = (updatedMap: Record<string, UserProgress>) => {
    setProgressMap(updatedMap);
    setStats(loadUserStats());
  };

  const handleAddCustomWord = (newWord: VocabWord) => {
    addCustomWord(newWord);
    refreshState();
  };

  const handleQuizFinished = (score: number, total: number, mode: QuizMode) => {
    const accuracy = Math.round((score / total) * 100);
    saveQuizResult({
      id: `quiz-${Date.now()}`,
      date: new Date().toISOString(),
      mode,
      totalQuestions: total,
      correctAnswers: score,
      accuracy,
    });
    refreshState();
  };

  const handleQuickActionNavigate = (tab: string, subMode?: string) => {
    if (subMode) {
      setQuizSubMode(subMode as QuizMode);
    } else {
      setQuizSubMode(undefined);
    }
    setActiveTab(tab);
  };

  // Compute stats metrics
  const totalWordsCount = words.length;
  const masteredCount = words.filter((w) => progressMap[w.id]?.status === 'mastered').length;
  const learningCount = words.filter((w) => progressMap[w.id]?.status === 'learning').length;
  const newCount = words.filter((w) => !progressMap[w.id] || progressMap[w.id].status === 'new').length;
  const dueCount = words.filter((w) => {
    const p = progressMap[w.id];
    return !p || isDueForReview(p);
  }).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setQuizSubMode(undefined);
          setActiveTab(tab);
        }}
        stats={stats}
        dueCount={dueCount}
        masteredCount={masteredCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <StatsOverview
              totalWordsCount={totalWordsCount}
              masteredCount={masteredCount}
              learningCount={learningCount}
              newCount={newCount}
              dueCount={dueCount}
              stats={stats}
            />

            <QuickActions onNavigate={handleQuickActionNavigate} dueCount={dueCount} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SRSDistribution
                newCount={newCount}
                learningCount={learningCount}
                masteredCount={masteredCount}
                total={totalWordsCount}
              />
              <CategoryMastery words={words} progressMap={progressMap} />
            </div>
          </div>
        )}

        {/* TAB 2: SRS FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <FlashcardDeck
            words={words}
            progressMap={progressMap}
            onProgressUpdate={handleProgressUpdate}
            onNavigateHome={() => setActiveTab('dashboard')}
          />
        )}

        {/* TAB 3: EXAM QUIZZES */}
        {activeTab === 'quiz' && (
          <QuizHub
            words={words}
            initialMode={quizSubMode}
            onQuizFinished={handleQuizFinished}
          />
        )}

        {/* TAB 4: WORD EXPLORER */}
        {activeTab === 'explorer' && (
          <WordList
            words={words}
            progressMap={progressMap}
            onAddCustomWord={handleAddCustomWord}
          />
        )}

        {/* TAB 5: SETTINGS & EXPORT */}
        {activeTab === 'settings' && (
          <DataManager stats={stats} onDataResetOrImport={refreshState} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>VocabForge</strong> &bull; Word Smart 1 & 2 Vocabulary Mastery Engine for IBA MBA & BCS
          </span>
          <span className="text-slate-400">
            Powered by SuperMemo SM-2 SRS Algorithm
          </span>
        </div>
      </footer>
    </div>
  );
}
