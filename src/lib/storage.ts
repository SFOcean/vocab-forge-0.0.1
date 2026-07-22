import { UserProgress, UserStats, VocabWord, QuizSessionResult } from '@/types/vocab';
import { INITIAL_WORDS } from '@/data/words';
import { getInitialProgress } from './srs';

const PROGRESS_KEY = 'vocabforge_user_progress';
const STATS_KEY = 'vocabforge_user_stats';
const CUSTOM_WORDS_KEY = 'vocabforge_custom_words';
const QUIZ_HISTORY_KEY = 'vocabforge_quiz_history';

/**
 * Check if window is defined (browser environment)
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Initialize default progress for all words
 */
export function loadUserProgress(): Record<string, UserProgress> {
  if (!isBrowser()) return {};

  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load user progress:', e);
  }

  // Seed default progress map
  const defaultMap: Record<string, UserProgress> = {};
  INITIAL_WORDS.forEach((word) => {
    defaultMap[word.id] = getInitialProgress(word.id);
  });
  saveUserProgress(defaultMap);
  return defaultMap;
}

export function saveUserProgress(progressMap: Record<string, UserProgress>): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap));
  } catch (e) {
    console.error('Failed to save user progress:', e);
  }
}

export function updateWordProgress(updatedProgress: UserProgress): Record<string, UserProgress> {
  const currentMap = loadUserProgress();
  currentMap[updatedProgress.wordId] = updatedProgress;
  saveUserProgress(currentMap);
  return currentMap;
}

export function loadUserStats(): UserStats {
  const defaultStats: UserStats = {
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    dailyGoal: 10,
    todayReviewedCount: 0,
    totalQuizzesTaken: 0,
  };

  if (!isBrowser()) return defaultStats;

  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const stats: UserStats = JSON.parse(raw);
      // Check streak continuity
      const today = new Date().toISOString().split('T')[0];
      if (stats.lastActiveDate !== today) {
        const last = new Date(stats.lastActiveDate);
        const now = new Date(today);
        const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          stats.streakDays += 1;
          stats.todayReviewedCount = 0;
          stats.lastActiveDate = today;
        } else if (diffDays > 1) {
          stats.streakDays = 1;
          stats.todayReviewedCount = 0;
          stats.lastActiveDate = today;
        }
        saveUserStats(stats);
      }
      return stats;
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }

  saveUserStats(defaultStats);
  return defaultStats;
}

export function saveUserStats(stats: UserStats): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

export function incrementTodayReviewed(): UserStats {
  const stats = loadUserStats();
  stats.todayReviewedCount += 1;
  saveUserStats(stats);
  return stats;
}

export function loadCustomWords(): VocabWord[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CUSTOM_WORDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom words:', e);
  }
  return [];
}

export function addCustomWord(word: VocabWord): VocabWord[] {
  const current = loadCustomWords();
  const updated = [word, ...current];
  if (isBrowser()) {
    localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(updated));
    // also initialize progress for new word
    const progressMap = loadUserProgress();
    progressMap[word.id] = getInitialProgress(word.id);
    saveUserProgress(progressMap);
  }
  return updated;
}

export function loadQuizHistory(): QuizSessionResult[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load quiz history:', e);
  }
  return [];
}

export function saveQuizResult(result: QuizSessionResult): QuizSessionResult[] {
  const current = loadQuizHistory();
  const updated = [result, ...current];
  if (isBrowser()) {
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updated));
    const stats = loadUserStats();
    stats.totalQuizzesTaken += 1;
    saveUserStats(stats);
  }
  return updated;
}

export function exportUserDataJSON(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    progress: loadUserProgress(),
    stats: loadUserStats(),
    customWords: loadCustomWords(),
    quizHistory: loadQuizHistory(),
  };
  return JSON.stringify(data, null, 2);
}

export function importUserDataJSON(jsonStr: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.progress && typeof parsed.progress === 'object') {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(parsed.progress));
    }
    if (parsed.stats && typeof parsed.stats === 'object') {
      localStorage.setItem(STATS_KEY, JSON.stringify(parsed.stats));
    }
    if (Array.isArray(parsed.customWords)) {
      localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(parsed.customWords));
    }
    if (Array.isArray(parsed.quizHistory)) {
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(parsed.quizHistory));
    }
    return { success: true, message: 'Data imported successfully!' };
  } catch (e) {
    return { success: false, message: 'Invalid JSON format or corrupted backup file.' };
  }
}

export function resetAllUserData(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(CUSTOM_WORDS_KEY);
  localStorage.removeItem(QUIZ_HISTORY_KEY);
}
