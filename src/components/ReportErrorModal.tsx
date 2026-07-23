'use client';

import React, { useState } from 'react';
import { X, Flag, CheckCircle2 } from 'lucide-react';
import { ErrorReport } from '@/types/vocab';
import { saveErrorReport } from '@/lib/storage';

interface ReportErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordId: string;
  wordText: string;
}

export const ReportErrorModal: React.FC<ReportErrorModalProps> = ({
  isOpen,
  onClose,
  wordId,
  wordText,
}) => {
  const [type, setType] = useState<ErrorReport['type']>('Wrong Pronunciation');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const report: ErrorReport = {
      id: `err-${Date.now()}`,
      wordId,
      wordText,
      type,
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
    };
    saveErrorReport(report);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setComment('');
      setType('Wrong Pronunciation');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
              <Flag className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">Report Issue</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Issue Logged!</h4>
            <p className="text-sm text-slate-400">
              Thank you for helping improve the vocabulary database.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Target Word</span>
              <span className="text-lg font-bold text-indigo-300">{wordText}</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold text-sm mb-1.5">What is the issue?</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ErrorReport['type'])}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500"
              >
                <option value="Wrong Pronunciation">Wrong Pronunciation</option>
                <option value="Wrong Bangla Meaning">Wrong Bangla Meaning</option>
                <option value="Wrong English Meaning">Wrong English Meaning</option>
                <option value="Typo">Typo / Spelling Error</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold text-sm mb-1.5">Additional Details (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What should the correct value be?"
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500 resize-none custom-scrollbar"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" />
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
