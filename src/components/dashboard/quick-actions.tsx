'use client';

import React from 'react';
import { BookOpen, Zap, Shield, Search, ArrowRight } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (tab: string, subMode?: string) => void;
  dueCount: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate, dueCount }) => {
  return (
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-lg font-bold font-heading text-white mb-2 flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-400" />
        Quick Action Launchpad
      </h3>
      <p className="text-xs text-slate-400 mb-6">
        Jump straight into your daily study sessions or exam practice drills
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action 1: SRS Flashcard Review */}
        <div
          onClick={() => onNavigate('flashcards')}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-indigo-950/40 border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer group transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            {dueCount > 0 && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-cyan-500 text-slate-950">
                {dueCount} Due Now
              </span>
            )}
          </div>
          <h4 className="text-base font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
            SRS Flashcards Review
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            SM-2 spaced repetition deck for optimal long-term retention.
          </p>
          <div className="flex items-center text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>Start Review</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Action 2: IBA MBA Contextual Quiz */}
        <div
          onClick={() => onNavigate('quiz', 'iba-contextual')}
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 via-slate-900 to-purple-950/40 border border-purple-500/20 hover:border-purple-500/50 cursor-pointer group transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              IBA Mode
            </span>
          </div>
          <h4 className="text-base font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
            IBA Contextual Practice
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Sentence completion & nuanced contextual vocabulary test.
          </p>
          <div className="flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Launch IBA Quiz</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Action 3: BCS Direct Drill */}
        <div
          onClick={() => onNavigate('quiz', 'bcs-direct')}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/40 via-slate-900 to-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/50 cursor-pointer group transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              BCS Mode
            </span>
          </div>
          <h4 className="text-base font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
            BCS Direct Speed Drill
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Direct synonyms, antonyms & root etymology rapid recall.
          </p>
          <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Launch BCS Drill</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
