'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, Volume2, Sparkles, CheckCircle2, Flame, HelpCircle, X } from 'lucide-react';
import { VocabWord, UserProgress, WordTag } from '@/types/vocab';
import { searchWords, filterWordsByTag } from '@/data/words';
import { WordDetailModal } from './word-detail-modal';
import { AddWordModal } from './add-word-modal';

interface WordListProps {
  words: VocabWord[];
  progressMap: Record<string, UserProgress>;
  onAddCustomWord: (word: VocabWord) => void;
}

export const WordList: React.FC<WordListProps> = ({ words, progressMap, onAddCustomWord }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Helper: Count words per exam tag
  const getTagWordCount = (tag: string) => {
    if (tag === 'All') return words.length;
    return words.filter((w) => w.tags.includes(tag as any)).length;
  };

  // Filter & Search pipeline
  let filtered = searchWords(searchQuery, words);
  filtered = filterWordsByTag(selectedTag, filtered);

  if (selectedStatus !== 'all') {
    filtered = filtered.filter((w) => {
      const p = progressMap[w.id];
      if (selectedStatus === 'new') return !p || p.status === 'new';
      return p?.status === selectedStatus;
    });
  }

  const isAnyFilterActive = selectedTag !== 'All' || selectedStatus !== 'all' || searchQuery.trim() !== '';

  const clearAllFilters = () => {
    setSelectedTag('All');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  const getTagClass = (tag: string) => {
    if (tag.includes('Smart 1')) return 'tag-ws1';
    if (tag.includes('Smart 2')) return 'tag-ws2';
    if (tag.includes('GRE')) return 'tag-gre';
    return 'tag-bcs';
  };

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header & Add Word Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span>Word Explorer & Dictionary</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono">
              {filtered.length} / {words.length} Words
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse all {words.length} Word Smart, GRE & BCS entries with roots, phonetics & SRS status
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Word</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words, etymology roots, definitions, or synonyms..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills with Count Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          {/* Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Word Smart 1', 'Word Smart 2', 'GRE High-Frequency', 'BCS Direct'].map((tag) => {
              const count = getTagWordCount(tag);
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
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">SRS Stage:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1 border border-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Stages</option>
              <option value="new">New / Unseen</option>
              <option value="learning">Learning</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Counter Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/30 text-xs">
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>
            Showing <strong className="text-cyan-300 font-bold text-sm">{filtered.length}</strong> of{' '}
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

      {/* Words Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((word) => {
          const p = progressMap[word.id];
          return (
            <div
              key={word.id}
              onClick={() => setSelectedWord(word)}
              className="glass-card p-5 rounded-2xl cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Top card row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-wrap gap-1">
                    {word.tags.map((t) => (
                      <span
                        key={t}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getTagClass(t)}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {p && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-medium capitalize flex items-center gap-1">
                      {p.status === 'mastered' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {p.status === 'learning' && <Flame className="w-3 h-3 text-amber-400" />}
                      {p.status}
                    </span>
                  )}
                </div>

                {/* Word Title & Audio */}
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold font-heading text-white group-hover:text-indigo-300 transition-colors">
                    {word.word}
                  </h3>
                  <button
                    onClick={(e) => playAudio(e, word.word)}
                    className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <span className="font-mono text-cyan-400">{word.phonetic}</span>
                  <span>•</span>
                  <span className="italic font-serif text-slate-300">{word.partOfSpeech}</span>
                </div>

                <p className="text-xs text-slate-300 font-medium line-clamp-2 mb-3">
                  {word.definition}
                </p>
              </div>

              {/* Bottom Card Root & Synonyms */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-purple-300 truncate max-w-[180px]">Root: {word.root}</span>
                <span className="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Details &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-xs">
          No vocabulary words match your search and filter options.
        </div>
      )}

      {/* Modals */}
      <WordDetailModal
        word={selectedWord}
        progress={selectedWord ? progressMap[selectedWord.id] : undefined}
        onClose={() => setSelectedWord(null)}
      />

      <AddWordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWord={onAddCustomWord}
      />
    </div>
  );
};
