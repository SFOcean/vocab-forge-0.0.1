'use client';

import React, { useState } from 'react';
import { QuizQuestion, QuizMode } from '@/types/vocab';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, X, Sparkles, Volume2 } from 'lucide-react';
import { QuizSummary } from './quiz-summary';

interface QuizRunnerProps {
  questions: QuizQuestion[];
  mode: QuizMode;
  onComplete: (score: number, total: number) => void;
  onCancel: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  questions,
  mode,
  onComplete,
  onCancel,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ question: QuizQuestion; selectedId: string; isCorrect: boolean }[]>([]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (hasAnswered) return;
    setSelectedOptionId(optionId);
    setHasAnswered(true);

    const chosen = currentQ.options.find((o) => o.id === optionId);
    const isCorrect = chosen?.isCorrect ?? false;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => [
      ...prev,
      { question: currentQ, selectedId: optionId, isCorrect },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setHasAnswered(false);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  const playAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentQ.targetWord.word);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isFinished) {
    return (
      <QuizSummary
        score={score}
        total={questions.length}
        mode={mode}
        userAnswers={userAnswers}
        onRestart={() => {
          setCurrentIndex(0);
          setSelectedOptionId(null);
          setHasAnswered(false);
          setScore(0);
          setShowExplanation(false);
          setIsFinished(false);
          setUserAnswers([]);
        }}
        onFinish={() => onComplete(score, questions.length)}
      />
    );
  }

  const progressPercentage = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header & Close Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            mode === 'iba-contextual'
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {mode === 'iba-contextual' ? 'IBA Contextual Mode' : 'BCS Direct Drill'}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Exit Quiz"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 mb-6">
        <div
          className={`h-full transition-all duration-300 ${
            mode === 'iba-contextual'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-500'
              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Question Card Container */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl mb-6">
        {/* Question Target Word / Context Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-heading text-white">
              Target: {currentQ.targetWord.word}
            </span>
            <button
              onClick={playAudio}
              className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
              title="Pronounce"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {currentQ.questionType.replace('-', ' ')}
          </span>
        </div>

        {/* Prompt Text */}
        <div className="text-base sm:text-lg font-medium text-slate-100 mb-6 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          {currentQ.prompt}
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle = 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 text-slate-200';

            if (hasAnswered) {
              if (opt.isCorrect) {
                btnStyle = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold';
              } else if (isSelected && !opt.isCorrect) {
                btnStyle = 'bg-rose-500/15 border-rose-500/50 text-rose-300 font-semibold';
              } else {
                btnStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={hasAnswered}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-700">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm">{opt.text}</span>
                </div>

                {hasAnswered && opt.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {hasAnswered && isSelected && !opt.isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Box */}
        {hasAnswered && (
          <div className="mt-6 pt-6 border-t border-slate-800 animate-fadeIn">
            {!showExplanation ? (
              <button
                onClick={() => setShowExplanation(true)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Show Detailed Explanation & Etymology</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-2 text-slate-200">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Exam Note & Etymology</span>
                </div>
                <div className="whitespace-pre-line leading-relaxed">
                  {currentQ.explanation}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next Question Action Bar */}
      {hasAnswered && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Exam Results'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
