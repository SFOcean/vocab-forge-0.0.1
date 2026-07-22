import { VocabWord } from '@/types/vocab';
import rawWords from './words.json';

export const INITIAL_WORDS: VocabWord[] = rawWords as VocabWord[];

export function getWordById(id: string, customWords: VocabWord[] = []): VocabWord | undefined {
  const allWords = [...INITIAL_WORDS, ...customWords];
  return allWords.find((w) => w.id === id);
}

export function filterWordsByTag(tag: string, words: VocabWord[]): VocabWord[] {
  if (!tag || tag === 'All') return words;
  return words.filter((w) => w.tags.includes(tag as any));
}

export function searchWords(query: string, words: VocabWord[]): VocabWord[] {
  if (!query.trim()) return words;
  const q = query.toLowerCase().trim();
  return words.filter(
    (w) =>
      w.word.toLowerCase().includes(q) ||
      w.definition.toLowerCase().includes(q) ||
      w.root.toLowerCase().includes(q) ||
      w.synonyms.some((s) => s.toLowerCase().includes(q))
  );
}
