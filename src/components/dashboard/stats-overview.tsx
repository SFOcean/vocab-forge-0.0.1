'use client';

import React from 'react';
import { BookOpen, CheckCircle2, Clock, Flame, TrendingUp, Sparkles } from 'lucide-react';
import { UserStats } from '@/types/vocab';

interface StatsOverviewProps {
  totalWordsCount: number;
  masteredCount: number;
  learningCount: number;
  newCount: number;
  dueCount: number;
  stats: UserStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalWordsCount,
  masteredCount,
  learningCount,
  newCount,
  dueCount,
  stats,
}) => {
  const masteryPercentage = totalWordsCount > 0 ? Math.round((masteredCount / totalWordsCount) * 100) : 0;
  const goalPercentage = Math.min(100, Math.round((stats.todayReviewedCount / stats.dailyGoal) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total Vocabulary Pool */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Words</span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-heading text-white">{totalWordsCount}</span>
          <span className="text-xs text-slate-400">Word Smart Pool</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Word Smart 1 & 2 + BCS/GRE</span>
        </div>
      </div>

      {/* Metric 2: SRS Mastered Words */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mastery Level</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-heading text-white">{masteredCount}</span>
          <span className="text-xs font-semibold text-emerald-400">({masteryPercentage}%)</span>
        </div>
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${masteryPercentage}%` }}
          />
        </div>
      </div>

      {/* Metric 3: Today's Due Review */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Due Today</span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-heading text-white">{dueCount}</span>
          <span className="text-xs text-slate-400">SRS cards scheduled</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Reviewed Today: <strong className="text-cyan-400">{stats.todayReviewedCount}</strong>/{stats.dailyGoal}</span>
        </div>
      </div>

      {/* Metric 4: Daily Learning Streak */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Learning Streak</span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-heading text-white">{stats.streakDays}</span>
          <span className="text-xs text-amber-400 font-semibold">Days Active</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Daily Goal Progress: {goalPercentage}%</span>
        </div>
      </div>
    </div>
  );
};
