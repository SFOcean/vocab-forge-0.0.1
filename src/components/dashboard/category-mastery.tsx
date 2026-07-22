'use client';

import React from 'react';
import { Target, ShieldCheck, BookMarked, GraduationCap } from 'lucide-react';
import { VocabWord, UserProgress } from '@/types/vocab';

interface CategoryMasteryProps {
  words: VocabWord[];
  progressMap: Record<string, UserProgress>;
}

export const CategoryMastery: React.FC<CategoryMasteryProps> = ({ words, progressMap }) => {
  const categories = [
    { name: 'Word Smart 1', tag: 'Word Smart 1', icon: BookMarked, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { name: 'Word Smart 2', tag: 'Word Smart 2', icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { name: 'GRE High-Frequency', tag: 'GRE High-Frequency', icon: Target, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { name: 'BCS Direct', tag: 'BCS Direct', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-lg font-bold font-heading text-white mb-2 flex items-center gap-2">
        <Target className="w-5 h-5 text-cyan-400" />
        Exam Category Mastery
      </h3>
      <p className="text-xs text-slate-400 mb-6">
        Mastery breakdown tailored for IBA MBA & BCS exam lists
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const catWords = words.filter((w) => w.tags.includes(cat.tag as any));
          const catTotal = catWords.length;
          const catMastered = catWords.filter((w) => progressMap[w.id]?.status === 'mastered').length;
          const catLearning = catWords.filter((w) => progressMap[w.id]?.status === 'learning').length;
          const pct = catTotal > 0 ? Math.round((catMastered / catTotal) * 100) : 0;
          const Icon = cat.icon;

          return (
            <div key={cat.tag} className={`p-4 rounded-xl bg-slate-900/60 border ${cat.border}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">{cat.name}</span>
                    <div className="text-[11px] text-slate-400">{catTotal} Total Words</div>
                  </div>
                </div>
                <span className={`text-sm font-bold font-heading ${cat.color}`}>{pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full bg-current ${cat.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{catMastered} Mastered</span>
                <span>{catLearning} Learning</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
