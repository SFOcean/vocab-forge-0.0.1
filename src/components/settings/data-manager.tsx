'use client';

import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Target, Database } from 'lucide-react';
import { exportUserDataJSON, importUserDataJSON, resetAllUserData, loadUserStats, saveUserStats } from '@/lib/storage';
import { UserStats } from '@/types/vocab';

interface DataManagerProps {
  stats: UserStats;
  onDataResetOrImport: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ stats, onDataResetOrImport }) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [dailyGoalInput, setDailyGoalInput] = useState<number>(stats.dailyGoal || 10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const jsonStr = exportUserDataJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `vocabforge-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Vocabulary progress exported successfully as JSON file!' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to export backup data.' });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importUserDataJSON(content);
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
          onDataResetOrImport();
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetAllUserData();
    setShowResetConfirm(false);
    setMessage({ type: 'success', text: 'All learning progress and custom data reset to default.' });
    onDataResetOrImport();
  };

  const handleUpdateGoal = () => {
    const currentStats = loadUserStats();
    currentStats.dailyGoal = Number(dailyGoalInput);
    saveUserStats(currentStats);
    setMessage({ type: 'success', text: `Daily review target updated to ${dailyGoalInput} words!` });
    onDataResetOrImport();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-indigo-400" />
          Data Backup, Settings & Persistence
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your LocalStorage persistence, backup progress to JSON, or adjust your daily targets.
        </p>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl mb-6 border text-xs flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Export JSON Card */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-white mb-1">Export JSON Backup</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Download your complete VocabForge user progress, SuperMemo-2 metrics, streak history, and custom vocabulary words into a JSON backup file.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup (.json)</span>
          </button>
        </div>

        {/* Import JSON Card */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-white mb-1">Restore from JSON</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Upload a previously exported VocabForge `.json` backup file to restore your learning intervals, streak, and custom dataset.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Select Backup File</span>
          </button>
        </div>
      </div>

      {/* Daily Goal & Reset Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Adjust Daily Goal */}
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Daily Learning Target</h4>
              <p className="text-xs text-slate-400">Words scheduled for SRS review daily</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="100"
              value={dailyGoalInput}
              onChange={(e) => setDailyGoalInput(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white font-bold text-sm w-28 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleUpdateGoal}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors"
            >
              Save Goal
            </button>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Reset Learning Progress</h4>
              <p className="text-xs text-slate-400">Clear local SRS intervals & history</p>
            </div>
          </div>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-semibold text-xs transition-colors"
            >
              Reset All User Data
            </button>
          ) : (
            <div className="space-y-3 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30">
              <p className="text-xs text-rose-200 font-semibold">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
