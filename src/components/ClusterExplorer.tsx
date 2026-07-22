'use client';

import React, { useState } from 'react';
import {
  Layers,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Play,
  Volume2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { VocabWord, UserProgress } from '@/types/vocab';
import { getAllClusters, filterWordsByCluster } from '@/data/words';
import { SRSFlashcard } from '@/components/SRSFlashcard';
import { calculateNextReview, saveWordProgress, Rating } from '@/lib/srs';
import { updateWordProgress, incrementTodayReviewed } from '@/lib/storage';

interface ClusterExplorerProps {
  words: VocabWord[];
  progressMap: Record<string, UserProgress>;
  onProgressUpdate: () => void;
}

export const ClusterExplorer: React.FC<ClusterExplorerProps> = ({
  words,
  progressMap,
  onProgressUpdate,
}) => {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const [activeClusterStudy, setActiveClusterStudy] = useState<{
    clusterName: string;
    words: VocabWord[];
    index: number;
  } | null>(null);

  const clusters = getAllClusters(words);

  const toggleExpand = (clusterName: string) => {
    if (expandedCluster === clusterName) {
      setExpandedCluster(null);
    } else {
      setExpandedCluster(clusterName);
    }
  };

  const startStudySession = (clusterName: string, clusterWords: VocabWord[]) => {
    setActiveClusterStudy({
      clusterName,
      words: clusterWords,
      index: 0,
    });
  };

  const handleRateClusterCard = (rating: Rating) => {
    if (!activeClusterStudy) return;

    const currentWord = activeClusterStudy.words[activeClusterStudy.index];
    const prevProgress = progressMap[currentWord.id];

    const computed = calculateNextReview(rating, prevProgress);
    const updatedProgress: UserProgress = {
      wordId: currentWord.id,
      ...computed,
    };

    saveWordProgress(currentWord.id, updatedProgress);
    updateWordProgress(updatedProgress);
    incrementTodayReviewed();
    onProgressUpdate();

    if (activeClusterStudy.index + 1 < activeClusterStudy.words.length) {
      setActiveClusterStudy({
        ...activeClusterStudy,
        index: activeClusterStudy.index + 1,
      });
    } else {
      // Completed cluster study
      setActiveClusterStudy(null);
    }
  };

  const playAudio = (e: React.MouseEvent, wordText: string) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getTagClass = (tag: string) => {
    if (tag.includes('Smart 1')) return 'tag-ws1';
    if (tag.includes('Smart 2')) return 'tag-ws2';
    if (tag.includes('GRE')) return 'tag-gre';
    if (tag.includes('Yield')) return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
    return 'tag-bcs';
  };

  // If in active study mode for a cluster
  if (activeClusterStudy) {
    const currentWord = activeClusterStudy.words[activeClusterStudy.index];
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center justify-between glass-card p-4 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Cluster Study Mode
            </span>
            <h3 className="text-xl font-bold font-heading text-white">
              {activeClusterStudy.clusterName}
            </h3>
          </div>
          <button
            onClick={() => setActiveClusterStudy(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700"
          >
            Exit Cluster Session
          </button>
        </div>

        <SRSFlashcard
          word={currentWord}
          onRate={handleRateClusterCard}
          cardIndex={activeClusterStudy.index}
          totalCards={activeClusterStudy.words.length}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8">
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>Semantic & Root Clustering Engine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Explore Vocabulary Clusters
        </h2>
        <p className="text-xs text-slate-400">
          Study words grouped by shared etymological roots (e.g. MAL, BENE, LOQU) and thematic meanings for rapid contextual mastery.
        </p>
      </div>

      {/* Cluster Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clusters.map((clusterName) => {
          const clusterWords = filterWordsByCluster(clusterName, words);
          const totalInCluster = clusterWords.length;
          const masteredInCluster = clusterWords.filter(
            (w) => progressMap[w.id]?.status === 'mastered'
          ).length;
          const pct = totalInCluster > 0 ? Math.round((masteredInCluster / totalInCluster) * 100) : 0;
          const isExpanded = expandedCluster === clusterName;

          return (
            <div
              key={clusterName}
              className="glass-panel rounded-3xl border border-indigo-500/25 hover:border-indigo-500/50 transition-all flex flex-col justify-between overflow-hidden shadow-xl"
            >
              {/* Card Header */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Semantic Theme
                    </span>
                    <h3 className="text-xl font-bold font-heading text-white">
                      {clusterName}
                    </h3>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 font-bold text-indigo-400 shrink-0">
                    {totalInCluster} {totalInCluster === 1 ? 'Word' : 'Words'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Cluster Mastery</span>
                    <span className="font-bold text-emerald-400">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Root Families in this cluster */}
                <div className="flex flex-wrap gap-1 text-[11px] text-purple-300">
                  {Array.from(new Set(clusterWords.map((w) => w.rootFamily).filter(Boolean))).map(
                    (rf) => (
                      <span
                        key={rf}
                        className="px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-500/20 text-[10px] font-semibold"
                      >
                        {rf}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Card Action Bar */}
              <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => toggleExpand(clusterName)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>{isExpanded ? 'Hide Words' : 'View Grouped Words'}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* "Study This Cluster" Action Button */}
                <button
                  onClick={() => startStudySession(clusterName, clusterWords)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Study This Cluster</span>
                </button>
              </div>

              {/* Grouped Expansion View (Accordion Drawer) */}
              {isExpanded && (
                <div className="p-6 bg-slate-900/90 border-t border-slate-800 space-y-4 animate-fadeIn">
                  <h4 className="text-xs uppercase font-bold text-cyan-300 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Words in &ldquo;{clusterName}&rdquo;
                  </h4>

                  <div className="space-y-3">
                    {clusterWords.map((word) => {
                      const p = progressMap[word.id];
                      return (
                        <div
                          key={word.id}
                          className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{word.word}</span>
                              <span className="font-mono text-cyan-400 text-[11px]">{word.phonetic}</span>
                              <span className="italic text-slate-400">({word.partOfSpeech})</span>
                              <button
                                onClick={(e) => playAudio(e, word.word)}
                                className="p-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                              >
                                <Volume2 className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-medium capitalize">
                              {p?.status || 'new'}
                            </span>
                          </div>

                          <p className="text-slate-200">{word.definition}</p>

                          <div className="text-[11px] text-purple-300 font-mono">
                            Root: {word.root} ({word.rootFamily})
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex flex-wrap gap-1">
                              {word.tags.map((t) => (
                                <span
                                  key={t}
                                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${getTagClass(
                                    t
                                  )}`}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>

                            {word.synonyms.length > 0 && (
                              <div className="text-[10px] text-slate-400">
                                Synonyms: <span className="text-emerald-400">{word.synonyms.slice(0, 3).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
