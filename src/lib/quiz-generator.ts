import { VocabWord, QuizQuestion, QuizOption, QuizMode } from '@/types/vocab';

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates an IBA Contextual Quiz set
 */
export function generateIBAQuiz(allWords: VocabWord[], count: number = 10): QuizQuestion[] {
  const selectedWords = shuffle(allWords).slice(0, Math.min(count, allWords.length));
  
  return selectedWords.map((target, idx) => {
    // Generate 3 distractor words
    const distractors = allWords
      .filter((w) => w.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // Alternate question styles: Sentence Completion vs Contextual Nuance
    const isSentenceCompletion = idx % 2 === 0;

    let prompt = '';
    let questionType: QuizQuestion['questionType'] = 'sentence-completion';

    if (isSentenceCompletion && target.exampleSentence.includes('___')) {
      prompt = `Select the word that best completes the sentence contextually:\n\n"${target.exampleSentence}"`;
      questionType = 'sentence-completion';
    } else {
      prompt = `In competitive examination passages, which word best describes: "${target.definition}"?`;
      questionType = 'meaning';
    }

    const optionsRaw: QuizOption[] = [
      { id: `opt-target`, text: target.word, isCorrect: true },
      ...distractors.map((d, i) => ({
        id: `opt-distractor-${i}`,
        text: d.word,
        isCorrect: false,
      })),
    ];

    const shuffledOptions = shuffle(optionsRaw);

    const explanation = `**${target.word}** (${target.partOfSpeech}) means: *${target.definition}*.\n\n` +
      `**Etymology/Root:** ${target.root}\n\n` +
      `**Example Context:** "${target.exampleSentence.replace('___', target.word)}"`;

    return {
      id: `iba-q-${target.id}-${idx}`,
      mode: 'iba-contextual',
      targetWord: target,
      prompt,
      options: shuffledOptions,
      explanation,
      questionType,
    };
  });
}

/**
 * Generates a BCS Direct Quiz set
 */
export function generateBCSQuiz(allWords: VocabWord[], count: number = 10): QuizQuestion[] {
  const selectedWords = shuffle(allWords).slice(0, Math.min(count, allWords.length));

  return selectedWords.map((target, idx) => {
    const qTypeIndex = idx % 4;
    let questionType: QuizQuestion['questionType'] = 'synonym';
    let prompt = '';
    let optionsRaw: QuizOption[] = [];

    const otherWords = allWords.filter((w) => w.id !== target.id);

    if (qTypeIndex === 0 && target.synonyms.length > 0) {
      // Direct Synonym Question
      questionType = 'synonym';
      prompt = `BCS Direct Drill: Choose the closest SYNONYM for "${target.word.toUpperCase()}"`;
      const correctSynonym = target.synonyms[0];
      
      const distractorSynonyms = shuffle(
        otherWords.flatMap((w) => w.synonyms).filter((s) => !target.synonyms.includes(s))
      ).slice(0, 3);

      optionsRaw = [
        { id: 'opt-correct', text: correctSynonym, isCorrect: true },
        ...distractorSynonyms.map((s, i) => ({ id: `opt-d-${i}`, text: s, isCorrect: false })),
      ];
    } else if (qTypeIndex === 1 && target.antonyms.length > 0) {
      // Direct Antonym Question
      questionType = 'antonym';
      prompt = `BCS Direct Drill: Choose the ANTONYM for "${target.word.toUpperCase()}"`;
      const correctAntonym = target.antonyms[0];

      const distractorAntonyms = shuffle(
        otherWords.flatMap((w) => w.antonyms).filter((a) => !target.antonyms.includes(a))
      ).slice(0, 3);

      optionsRaw = [
        { id: 'opt-correct', text: correctAntonym, isCorrect: true },
        ...distractorAntonyms.map((a, i) => ({ id: `opt-d-${i}`, text: a, isCorrect: false })),
      ];
    } else if (qTypeIndex === 2 && target.root) {
      // Root Identification
      questionType = 'root-id';
      prompt = `Etymology Drill: What is the Latin/Greek root breakdown for "${target.word.toUpperCase()}"?`;
      
      const distractorRoots = shuffle(
        otherWords.map((w) => w.root).filter((r) => r !== target.root)
      ).slice(0, 3);

      optionsRaw = [
        { id: 'opt-correct', text: target.root, isCorrect: true },
        ...distractorRoots.map((r, i) => ({ id: `opt-d-${i}`, text: r, isCorrect: false })),
      ];
    } else {
      // Direct Definition Match
      questionType = 'meaning';
      prompt = `Select the precise dictionary definition for "${target.word.toUpperCase()}" (${target.partOfSpeech}):`;

      const distractorDefinitions = shuffle(
        otherWords.map((w) => w.definition).filter((d) => d !== target.definition)
      ).slice(0, 3);

      optionsRaw = [
        { id: 'opt-correct', text: target.definition, isCorrect: true },
        ...distractorDefinitions.map((d, i) => ({ id: `opt-d-${i}`, text: d, isCorrect: false })),
      ];
    }

    const shuffledOptions = shuffle(optionsRaw);

    const explanation = `**Target Word:** ${target.word} (${target.phonetic})\n\n` +
      `**Definition:** ${target.definition}\n` +
      `**Root Origin:** ${target.root}\n` +
      `**Synonyms:** ${target.synonyms.join(', ')}\n` +
      `**Antonyms:** ${target.antonyms.join(', ')}`;

    return {
      id: `bcs-q-${target.id}-${idx}`,
      mode: 'bcs-direct',
      targetWord: target,
      prompt,
      options: shuffledOptions,
      explanation,
      questionType,
    };
  });
}
