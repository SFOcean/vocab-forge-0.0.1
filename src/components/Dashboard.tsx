'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Target,
  Sparkles,
  Search,
  Filter,
  Volume2,
  Plus,
  RefreshCw,
  GitBranch,
  Award,
  X,
  Flag,
} from 'lucide-react';
import { VocabWord, UserProgress, UserStats, QuizMode } from '@/types/vocab';
import {
  INITIAL_WORDS,
  searchWords,
  filterWordsByTag,
  filterWordsByCluster,
  filterWordsByRootFamily,
  getAllClusters,
  getAllRootFamilies,
} from '@/data/words';
import {
  loadUserProgress,
  loadUserStats,
  loadCustomWords,
  updateWordProgress,
  incrementTodayReviewed,
  saveQuizResult,
  loadErrorReports,
} from '@/lib/storage';
import { isDueForReview, calculateNextReview, saveWordProgress, Rating } from '@/lib/srs';
import { SRSFlashcard } from '@/components/SRSFlashcard';
import { QuizHub } from '@/components/quiz/quiz-hub';
import { ClusterExplorer } from '@/components/ClusterExplorer';
import { WordDetailModal } from '@/components/explorer/word-detail-modal';
import { AddWordModal } from '@/components/explorer/add-word-modal';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'srs' | 'clusters' | 'quiz' | 'library'>('srs');
  const [words, setWords] = useState<VocabWord[]>(INITIAL_WORDS);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [stats, setStats] = useState<UserStats>({
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    dailyGoal: 10,
    todayReviewedCount: 0,
    totalQuizzesTaken: 0,
  });

  // SRS Deck state
  const [deck, setDeck] = useState<VocabWord[]>([]);
  const [currentDeckIndex, setCurrentDeckIndex] = useState<number>(0);

  // Library / Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedCluster, setSelectedCluster] = useState<string>('All');
  const [selectedRootFamily, setSelectedRootFamily] = useState<string>('All');
  const [selectedPos, setSelectedPos] = useState<string>('All');
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const refreshData = useCallback(() => {
    const custom = loadCustomWords();
    const allWords = [...INITIAL_WORDS, ...custom];
    const loadedProgress = loadUserProgress();
    const loadedStats = loadUserStats();

    setWords(allWords);
    setProgressMap(loadedProgress);
    setStats(loadedStats);

    // Build due deck
    const dueWords = allWords.filter((w) => {
      const p = loadedProgress[w.id];
      return !p || isDueForReview(p);
    });
    setDeck(dueWords);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle SRS Flashcard rating
  const handleRateCard = (rating: Rating) => {
    if (currentDeckIndex >= deck.length) return;

    const currentWord = deck[currentDeckIndex];
    const prevProgress = progressMap[currentWord.id];

    const computed = calculateNextReview(rating, prevProgress);
    const updatedProgress: UserProgress = {
      wordId: currentWord.id,
      ...computed,
    };

    saveWordProgress(currentWord.id, updatedProgress);
    const updatedMap = updateWordProgress(updatedProgress);
    setProgressMap(updatedMap);
    incrementTodayReviewed();
    setStats(loadUserStats());

    if (currentDeckIndex + 1 < deck.length) {
      setCurrentDeckIndex((prev) => prev + 1);
    } else {
      setCurrentDeckIndex(deck.length);
    }
  };

  const handleAddCustomWord = (newWord: VocabWord) => {
    const custom = loadCustomWords();
    localStorage.setItem('vocabforge_custom_words', JSON.stringify([newWord, ...custom]));
    refreshData();
  };

  // Metrics Calculations
  const totalTarget = 1600; // Target Word Smart 1 & 2 pool goal
  const currentTotalWords = words.length;

  const masteredCount = words.filter((w) => progressMap[w.id]?.status === 'mastered').length;
  const dueTodayCount = words.filter((w) => {
    const p = progressMap[w.id];
    return !p || isDueForReview(p);
  }).length;

  const ws1Words = words.filter((w) => w.tags.includes('Word Smart 1'));
  const ws1Mastered = ws1Words.filter((w) => progressMap[w.id]?.status === 'mastered').length;
  const ws1Pct = ws1Words.length > 0 ? Math.round((ws1Mastered / ws1Words.length) * 100) : 0;

  const ws2Words = words.filter((w) => w.tags.includes('Word Smart 2'));
  const ws2Mastered = ws2Words.filter((w) => progressMap[w.id]?.status === 'mastered').length;
  const ws2Pct = ws2Words.length > 0 ? Math.round((ws2Mastered / ws2Words.length) * 100) : 0;

  // Filter options lists
  const availableClusters = getAllClusters(words);
  const availableRootFamilies = getAllRootFamilies(words);

  // Helper: Count words per exam tag
  const getTagWordCount = (tag: string) => {
    if (tag === 'All') return words.length;
    return words.filter((w) => w.tags.includes(tag as any)).length;
  };

  // Filtered library words
  let libraryWords = searchWords(searchQuery, words);
  libraryWords = filterWordsByTag(selectedTag, libraryWords);
  libraryWords = filterWordsByCluster(selectedCluster, libraryWords);
  libraryWords = filterWordsByRootFamily(selectedRootFamily, libraryWords);
  if (selectedPos !== 'All') {
    libraryWords = libraryWords.filter((w) => w.partOfSpeech === selectedPos);
  }

  const isAnyFilterActive =
    selectedTag !== 'All' ||
    selectedCluster !== 'All' ||
    selectedRootFamily !== 'All' ||
    selectedPos !== 'All' ||
    searchQuery.trim() !== '';

  const clearAllFilters = () => {
    setSelectedTag('All');
    setSelectedCluster('All');
    setSelectedRootFamily('All');
    setSelectedPos('All');
    setSearchQuery('');
  };

  const getTagClass = (tag: string) => {
    if (tag.includes('Smart 1')) return 'tag-ws1';
    if (tag.includes('Smart 2')) return 'tag-ws2';
    if (tag.includes('GRE')) return 'tag-gre';
    if (tag.includes('Yield')) return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
    return 'tag-bcs';
  };

  const playAudio = (e: React.MouseEvent, textToRead: string) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. ANALYTICS HEADER */}
      <div className="space-y-6">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Words (1600 Target) */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Words
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-white">
                {currentTotalWords}
              </span>
              <span className="text-xs text-slate-400">/ {totalTarget} Target</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Word Smart 1 & 2 Pool</span>
            </div>
          </div>

          {/* Card 2: Mastered Count */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mastered Count
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-white">
                {masteredCount}
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                ({Math.round((masteredCount / currentTotalWords) * 100)}%)
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round((masteredCount / currentTotalWords) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Card 3: Due Today Count */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Due Today
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-white">
                {dueTodayCount}
              </span>
              <span className="text-xs text-slate-400">SRS cards due</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>
                Reviewed Today:{' '}
                <strong className="text-cyan-400">{stats.todayReviewedCount}</strong>/
                {stats.dailyGoal}
              </span>
            </div>
          </div>

          {/* Card 4: Current Streak Days */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Streak
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-white">
                {stats.streakDays}
              </span>
              <span className="text-xs text-amber-400 font-semibold">Days Active</span>
            </div>
            <div className="mt-3 text-xs text-slate-400">Daily Study Streak</div>
          </div>
        </div>

        {/* Word Smart 1 & 2 Progress Completion Bars */}
        <div className="glass-card p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Word Smart 1 Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Word Smart 1 Completion
              </span>
              <span className="text-xs font-bold text-indigo-400">{ws1Pct}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${ws1Pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>{ws1Mastered} Mastered</span>
              <span>{ws1Words.length} Total WS1 Words</span>
            </div>
          </div>

          {/* Word Smart 2 Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Word Smart 2 Completion
              </span>
              <span className="text-xs font-bold text-purple-400">{ws2Pct}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${ws2Pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>{ws2Mastered} Mastered</span>
              <span>{ws2Words.length} Total WS2 Words</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY TAB SWITCHER */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('srs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'srs'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>SRS Review Queue ({dueTodayCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('clusters')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'clusters'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Cluster & Root Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quiz'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Exam Quiz</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'library'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Word Library & Filter Search</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      <div>
        {/* TAB 1: SRS REVIEW QUEUE */}
        {activeTab === 'srs' && (
          <div className="space-y-6">
            {deck.length > 0 && currentDeckIndex < deck.length ? (
              <SRSFlashcard
                word={deck[currentDeckIndex]}
                onRate={handleRateCard}
                cardIndex={currentDeckIndex}
                totalCards={deck.length}
              />
            ) : (
              <div className="max-w-xl mx-auto py-12 text-center glass-panel p-8 rounded-3xl border border-indigo-500/30">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-heading text-white mb-2">
                  All Due Cards Reviewed!
                </h3>
                <p className="text-xs text-slate-300 mb-6">
                  You are up to date on today&apos;s SuperMemo-2 scheduled SRS reviews.
                </p>
                <button
                  onClick={() => {
                    setDeck(words);
                    setCurrentDeckIndex(0);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Review All Words Pool ({words.length})</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLUSTER & ROOT EXPLORER */}
        {activeTab === 'clusters' && (
          <ClusterExplorer
            words={words}
            progressMap={progressMap}
            onProgressUpdate={refreshData}
          />
        )}

        {/* TAB 3: EXAM QUIZ */}
        {activeTab === 'quiz' && (
          <QuizHub
            words={words}
            onQuizFinished={(score, total, mode) => {
              const accuracy = Math.round((score / total) * 100);
              saveQuizResult({
                id: `quiz-${Date.now()}`,
                date: new Date().toISOString(),
                mode,
                totalQuestions: total,
                correctAnswers: score,
                accuracy,
              });
              refreshData();
            }}
          />
        )}

        {/* TAB 4: WORD LIBRARY & SEARCH */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                  <span>Word Library & Search Directory</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono">
                    {libraryWords.length} / {words.length} Words
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filter vocabulary by shared Latin/Greek roots, clusters, parts of speech & exam tags
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const reports = loadErrorReports();
                    if (reports.length === 0) {
                      alert('No error reports logged yet.');
                      return;
                    }
                    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `vocabforge_error_logs_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition-all flex items-center gap-2 shrink-0"
                >
                  <Flag className="w-4 h-4 text-rose-400" />
                  <span>Export Logs</span>
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Word</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-card p-4 rounded-2xl space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by word, root, root family (e.g. MAL / MIS), cluster group (e.g. Speech), or definition..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Exam Tag Pills with Word Count Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    'All',
                    'Word Smart 1',
                    'Word Smart 2',
                    'GRE High-Frequency',
                    'BCS Direct',
                    'IBA High-Yield',
                  ].map((tag) => {
                    const tagCount = getTagWordCount(tag);
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-1 rounded-full font-semibold transition-all inline-flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <span>{tag}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {tagCount}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown Filters: Cluster & Root Family */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Semantic Cluster Filter */}
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <select
                      value={selectedCluster}
                      onChange={(e) => setSelectedCluster(e.target.value)}
                      className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1 border border-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Clusters ({availableClusters.length})</option>
                      {availableClusters.map((cl) => (
                        <option key={cl} value={cl}>
                          {cl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Root Family Filter */}
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                    <select
                      value={selectedRootFamily}
                      onChange={(e) => setSelectedRootFamily(e.target.value)}
                      className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1 border border-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Root Families ({availableRootFamilies.length})</option>
                      {availableRootFamilies.map((rf) => (
                        <option key={rf} value={rf}>
                          {rf}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* POS Select */}
                  <select
                    value={selectedPos}
                    onChange={(e) => setSelectedPos(e.target.value)}
                    className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1 border border-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All POS</option>
                    <option value="noun">noun</option>
                    <option value="verb">verb</option>
                    <option value="adjective">adjective</option>
                    <option value="adverb">adverb</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Counter Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/30 text-xs">
              <div className="flex items-center gap-2 text-slate-200 font-medium">
                <Filter className="w-4 h-4 text-cyan-400" />
                <span>
                  Showing <strong className="text-cyan-300 font-bold text-sm">{libraryWords.length}</strong> of{' '}
                  <strong className="text-white font-bold">{words.length}</strong> words matching your criteria
                </span>
              </div>

              {isAnyFilterActive && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            {/* Filterable Table / Card List */}
            <div className="overflow-x-auto glass-card rounded-2xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Word / Phonetic</th>
                    <th className="py-3.5 px-4">POS</th>
                    <th className="py-3.5 px-4">Semantic Cluster</th>
                    <th className="py-3.5 px-4">Root Family</th>
                    <th className="py-3.5 px-4">Definition</th>
                    <th className="py-3.5 px-4">Tags</th>
                    <th className="py-3.5 px-4 text-right">SRS Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {libraryWords.map((word) => {
                    const p = progressMap[word.id];
                    return (
                      <tr
                        key={word.id}
                        onClick={() => setSelectedWord(word)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{word.word}</span>
                            <button
                              onClick={(e) => playAudio(e, word.audioText || word.word)}
                              className="p-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[11px] font-mono text-cyan-400 font-normal">
                            {word.phonetic}
                          </span>
                        </td>
                        <td className="py-3 px-4 italic text-slate-300">{word.partOfSpeech}</td>
                        <td className="py-3 px-4 text-cyan-300 font-medium">
                          {word.cluster ? (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold text-[11px]">
                              {word.cluster}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-purple-300 font-medium">
                          {word.rootFamily ? (
                            <div>
                              <div className="font-semibold text-purple-300 text-[11px]">
                                {word.rootFamily}
                              </div>
                              <div className="text-[10px] text-slate-400">{word.root}</div>
                            </div>
                          ) : (
                            <span className="text-slate-500">{word.root}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-200 max-w-xs truncate">
                          {word.definition}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {word.tags.map((t) => (
                              <span
                                key={t}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getTagClass(
                                  t
                                )}`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium capitalize inline-flex items-center gap-1">
                            {p?.status === 'mastered' && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            )}
                            {p?.status === 'learning' && (
                              <Flame className="w-3 h-3 text-amber-400" />
                            )}
                            {p?.status || 'new'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {libraryWords.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No vocabulary words match your filter criteria.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <WordDetailModal
        word={selectedWord}
        progress={selectedWord ? progressMap[selectedWord.id] : undefined}
        onClose={() => setSelectedWord(null)}
      />

      <AddWordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWord={handleAddCustomWord}
      />
    </div>
  );
};
