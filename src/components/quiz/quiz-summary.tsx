'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, ArrowRight, CheckCircle2, XCircle, Award } from 'lucide-react';
import { QuizQuestion, QuizMode } from '@/types/vocab';

interface QuizSummaryProps {
  score: number;
  total: number;
  mode: QuizMode;
  userAnswers: { question: QuizQuestion; selectedId: string; isCorrect: boolean }[];
  onRestart: () => void;
  onFinish: () => void;
}

export const QuizSummary: React.FC<QuizSummaryProps> = ({
  score,
  total,
  mode,
  userAnswers,
  onRestart,
  onFinish,
}) => {
  const percentage = Math.round((score / total) * 100);

  useEffect(() => {
    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  }, [percentage]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-indigo-500/30 text-center mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 mx-auto mb-6 shadow-xl shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-cyan-400">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
          mode === 'iba-contextual' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        }`}>
          {mode === 'iba-contextual' ? 'IBA Contextual Assessment' : 'BCS Direct Drill'}
        </span>

        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white mb-2">
          {percentage >= 80 ? 'Outstanding Performance!' : percentage >= 50 ? 'Solid Attempt!' : 'Keep Practicing!'}
        </h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
          You scored <strong className="text-cyan-400 font-bold">{score}</strong> out of <strong className="text-white font-bold">{total}</strong> questions correctly ({percentage}% Accuracy).
        </p>

        {/* Score Radial Card */}
        <div className="inline-flex items-center justify-center p-6 rounded-3xl bg-slate-900/80 border border-slate-800 mb-8">
          <div className="text-center px-6">
            <div className="text-4xl font-extrabold font-heading text-white">{percentage}%</div>
            <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Accuracy</div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center px-6">
            <div className="text-4xl font-extrabold font-heading text-emerald-400">{score}</div>
            <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Correct</div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center px-6">
            <div className="text-4xl font-extrabold font-heading text-rose-400">{total - score}</div>
            <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Incorrect</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={onFinish}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Answer Review Section */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="text-lg font-bold font-heading text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          Questions Breakdown Review
        </h3>

        <div className="space-y-4">
          {userAnswers.map((ans, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                ans.isCorrect
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-rose-500/5 border-rose-500/20'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-200">
                  #{i + 1} Word: <strong className="text-white font-bold">{ans.question.targetWord.word}</strong>
                </span>
                <span className={`flex items-center gap-1 ${ans.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {ans.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Correct
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> Incorrect
                    </>
                  )}
                </span>
              </div>
              <p className="text-slate-400 italic font-serif text-[11px]">&ldquo;{ans.question.prompt}&rdquo;</p>
              <div className="text-[11px] text-slate-300">
                <strong className="text-purple-300">Etymology & Meaning: </strong>
                {ans.question.targetWord.definition} ({ans.question.targetWord.root})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
