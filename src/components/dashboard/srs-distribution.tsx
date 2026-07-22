'use client';

import React from 'react';
import { Layers, Brain, CheckCircle2, Sparkles } from 'lucide-react';

interface SRSDistributionProps {
  newCount: number;
  learningCount: number;
  masteredCount: number;
  total: number;
}

export const SRSDistribution: React.FC<SRSDistributionProps> = ({
  newCount,
  learningCount,
  masteredCount,
  total,
}) => {
  const newPct = total > 0 ? Math.round((newCount / total) * 100) : 0;
  const learningPct = total > 0 ? Math.round((learningCount / total) * 100) : 0;
  const masteredPct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            SRS Memory Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            SuperMemo-2 retention breakdown across stages
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
          {total} Words Total
        </span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="w-full bg-slate-900 rounded-xl h-4 flex overflow-hidden p-0.5 border border-slate-800 mb-6">
        {masteredPct > 0 && (
          <div
            style={{ width: `${masteredPct}%` }}
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-l-lg transition-all duration-500"
            title={`Mastered: ${masteredCount} (${masteredPct}%)`}
          />
        )}
        {learningPct > 0 && (
          <div
            style={{ width: `${learningPct}%` }}
            className="bg-gradient-to-r from-amber-500 to-orange-400 h-full transition-all duration-500"
            title={`Learning: ${learningCount} (${learningPct}%)`}
          />
        )}
        {newPct > 0 && (
          <div
            style={{ width: `${newPct}%` }}
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-r-lg transition-all duration-500"
            title={`New: ${newCount} (${newPct}%)`}
          />
        )}
      </div>

      {/* Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mastered Stage */}
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Mastered</div>
              <div className="text-xs text-slate-400">Interval &ge; 14 days</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-heading text-emerald-400">{masteredCount}</div>
            <div className="text-[10px] text-slate-400">{masteredPct}%</div>
          </div>
        </div>

        {/* Learning Stage */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Learning</div>
              <div className="text-xs text-slate-400">Active Repetitions</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-heading text-amber-400">{learningCount}</div>
            <div className="text-[10px] text-slate-400">{learningPct}%</div>
          </div>
        </div>

        {/* New Stage */}
        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Unseen / New</div>
              <div className="text-xs text-slate-400">Not started yet</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-heading text-indigo-400">{newCount}</div>
            <div className="text-[10px] text-slate-400">{newPct}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
