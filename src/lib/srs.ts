import { UserProgress, VocabWord } from '@/types/vocab';

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export function getInitialProgress(wordId: string): UserProgress {
  return {
    wordId,
    interval: 0,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
    correctCount: 0,
    incorrectCount: 0,
  };
}

/**
 * SuperMemo-2 (SM-2) Algorithm Implementation
 */
export function calculateNextReview(
  rating: Rating,
  prevProgress?: UserProgress
): Omit<UserProgress, 'wordId'> {
  let interval = prevProgress?.interval || 0;
  let repetition = prevProgress?.repetition || 0;
  let easeFactor = prevProgress?.easeFactor || 2.5;
  let correctCount = prevProgress?.correctCount || 0;
  let incorrectCount = prevProgress?.incorrectCount || 0;

  if (rating === 'again') {
    repetition = 0;
    interval = 1;
    incorrectCount += 1;
  } else {
    correctCount += 1;
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  }

  // Adjust Ease Factor based on quality rating
  const qualityMap: Record<Rating, number> = {
    again: 1,
    hard: 3,
    good: 4,
    easy: 5,
  };
  const q = qualityMap[rating];
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  const status = interval >= 21 ? 'mastered' : 'learning';

  return {
    interval,
    repetition,
    easeFactor,
    nextReviewDate: nextReview.toISOString(),
    status,
    correctCount,
    incorrectCount,
  };
}

/**
 * LocalStorage Key & Data Persistence Handlers
 */
const STORAGE_KEY = 'vocabforge_user_progress';

export function getStoredProgress(): Record<string, UserProgress> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

export function saveWordProgress(wordId: string, progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  const current = getStoredProgress();
  current[wordId] = progress;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function isDueForReview(progress?: UserProgress): boolean {
  if (!progress) return true; // New words are due immediately
  const now = new Date();
  const reviewDate = new Date(progress.nextReviewDate);
  return reviewDate <= now;
}

export function getDaysUntilNextReview(progress?: UserProgress): number {
  if (!progress) return 0;
  const reviewDate = new Date(progress.nextReviewDate);
  const now = new Date();
  const diffTime = reviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
