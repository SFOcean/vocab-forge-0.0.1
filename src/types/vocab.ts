export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb';

export type WordTag =
  | 'Word Smart 1'
  | 'Word Smart 2'
  | 'GRE High-Frequency'
  | 'BCS Direct'
  | 'IBA High-Yield';

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  root: string; // e.g., "MAL (bad/evil)"
  rootFamily: string; // e.g., "Latin Root: MAL / MIS / DIS"
  cluster: string; // Thematic group, e.g., "Hostility & Harm", "Speech & Talkativeness"
  exampleSentence: string;
  synonyms: string[];
  antonyms: string[];
  tags: WordTag[];
}

export interface UserProgress {
  wordId: string;
  interval: number; // in days
  repetition: number;
  easeFactor: number; // default 2.5 (SM-2 Algorithm)
  nextReviewDate: string; // ISO string
  status: 'new' | 'learning' | 'mastered';
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt?: string;
}

export type QuizMode = 'iba-contextual' | 'bcs-direct';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  mode: QuizMode;
  targetWord: VocabWord;
  prompt: string;
  options: QuizOption[];
  explanation: string;
  questionType: 'sentence-completion' | 'synonym' | 'antonym' | 'root-id' | 'meaning';
}

export interface QuizSessionResult {
  id: string;
  date: string;
  mode: QuizMode;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export interface UserStats {
  streakDays: number;
  lastActiveDate: string;
  dailyGoal: number; // default e.g. 10 words
  todayReviewedCount: number;
  totalQuizzesTaken: number;
}

export type RatingGrade = 0 | 3 | 4 | 5;
