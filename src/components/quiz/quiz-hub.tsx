'use client';

import React, { useState } from 'react';
import { Target, Zap, Shield, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { VocabWord, QuizMode } from '@/types/vocab';
import { generateIBAQuiz, generateBCSQuiz } from '@/lib/quiz-generator';
import { QuizRunner } from './quiz-runner';

interface QuizHubProps {
  words: VocabWord[];
  initialMode?: QuizMode;
  onQuizFinished: (score: number, total: number, mode: QuizMode) => void;
}

export const QuizHub: React.FC<QuizHubProps> = ({ words, initialMode, onQuizFinished }) => {
  const [selectedMode, setSelectedMode] = useState<QuizMode | null>(initialMode || null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [activeQuestions, setActiveQuestions] = useState<any[] | null>(null);

  const startQuiz = (mode: QuizMode) => {
    let questions = [];
    if (mode === 'iba-contextual') {
      questions = generateIBAQuiz(words, questionCount);
    } else {
      questions = generateBCSQuiz(words, questionCount);
    }
    setSelectedMode(mode);
    setActiveQuestions(questions);
  };

  if (activeQuestions && selectedMode) {
    return (
      <QuizRunner
        questions={activeQuestions}
        mode={selectedMode}
        onComplete={(score, total) => {
          onQuizFinished(score, total, selectedMode);
          setActiveQuestions(null);
          setSelectedMode(null);
        }}
        onCancel={() => {
          setActiveQuestions(null);
          setSelectedMode(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Title Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Competitive Exam Engine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Choose Your Exam Quiz Mode
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">
          Tailored assessment engines formatted specifically for IBA MBA contextual usage and BCS direct speed drills.
        </p>
      </div>

      {/* Question Count Selector */}
      <div className="max-w-xs mx-auto mb-8 glass-card p-3 rounded-2xl flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 ml-2">Questions per Quiz:</span>
        <div className="flex items-center gap-1">
          {[5, 10, 15, 20].map((num) => (
            <button
              key={num}
              onClick={() => setQuestionCount(num)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                questionCount === num
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IBA MBA Mode Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 hover:border-purple-500/60 transition-all group relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                IBA MBA Special
              </span>
            </div>

            <h3 className="text-2xl font-bold font-heading text-white mb-2">
              IBA Contextual Mode
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Tests words in complex sentence completions, nuanced context passages, and paragraph fill-in-the-blanks. Ideal for IBA MBA admissions, GRE, & GMAT candidates.
            </p>

            <ul className="space-y-2 text-xs text-slate-400 mb-8">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Sentence completion with context clues</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Detailed etymology & usage breakdown</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => startQuiz('iba-contextual')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.01]"
          >
            <span>Start IBA Contextual Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* BCS Direct Mode Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 hover:border-emerald-500/60 transition-all group relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                BCS Cadre Special
              </span>
            </div>

            <h3 className="text-2xl font-bold font-heading text-white mb-2">
              BCS Direct Drill
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Rapid-fire direct synonym/antonym recognition, root etymology identification, and definition matching designed for BCS Preliminary & Bank Jobs.
            </p>

            <ul className="space-y-2 text-xs text-slate-400 mb-8">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Direct Synonyms & Antonyms speed test</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Etymology Latin/Greek root matching</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => startQuiz('bcs-direct')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.01]"
          >
            <span>Start BCS Direct Drill</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
