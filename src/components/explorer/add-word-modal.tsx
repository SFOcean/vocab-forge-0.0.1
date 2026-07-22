'use client';

import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { VocabWord, WordTag } from '@/types/vocab';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWord: (word: VocabWord) => void;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({ isOpen, onClose, onAddWord }) => {
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<string>('adjective');
  const [definition, setDefinition] = useState('');
  const [root, setRoot] = useState('');
  const [rootFamily, setRootFamily] = useState('');
  const [cluster, setCluster] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [banglaMeaning, setBanglaMeaning] = useState('');
  const [synonymsStr, setSynonymsStr] = useState('');
  const [antonymsStr, setAntonymsStr] = useState('');
  const [selectedTags, setSelectedTags] = useState<WordTag[]>(['Word Smart 1']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !definition.trim()) return;

    const newWordObj: VocabWord = {
      id: `custom-${Date.now()}`,
      word: word.trim(),
      phonetic: phonetic.trim() || `/${word.trim().toLowerCase()}/`,
      partOfSpeech,
      definition: definition.trim(),
      root: root.trim() || 'Custom Root',
      rootFamily: rootFamily.trim() || 'General Vocabulary',
      cluster: cluster.trim() || 'General Theme',
      banglaMeaning: banglaMeaning.trim(),
      exampleSentence: exampleSentence.trim() || `The student applied the word ${word.trim()} in practice.`,
      synonyms: synonymsStr.split(',').map((s) => s.trim()).filter(Boolean),
      antonyms: antonymsStr.split(',').map((a) => a.trim()).filter(Boolean),
      tags: selectedTags,
    };

    onAddWord(newWordObj);
    onClose();
  };

  const toggleTag = (tag: WordTag) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-indigo-500/30 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-white">Add Custom Word</h3>
            <p className="text-xs text-slate-400">Expand your VocabForge personal dictionary</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Vocabulary Word *</label>
            <input
              type="text"
              required
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g. Magnanimous"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phonetic Notation</label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder="/mæɡˈnæn.ɪ.məs/"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Part of Speech</label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="noun">noun</option>
                <option value="verb">verb</option>
                <option value="adjective">adjective</option>
                <option value="adverb">adverb</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Definition *</label>
            <textarea
              required
              rows={2}
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Clear, precise dictionary definition..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Root Origin</label>
              <input
                type="text"
                value={root}
                onChange={(e) => setRoot(e.target.value)}
                placeholder="MAGNUS (great) + ANIMUS"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Root Family</label>
              <input
                type="text"
                value={rootFamily}
                onChange={(e) => setRootFamily(e.target.value)}
                placeholder="Latin Root: MAGN / GRAND"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Semantic Cluster Group</label>
            <input
              type="text"
              value={cluster}
              onChange={(e) => setCluster(e.target.value)}
              placeholder="e.g. Kindness & Altruism, Speech & Silence"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Context Example Sentence</label>
            <input
              type="text"
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              placeholder="The leader showed a ___ gesture towards rivals."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Bangla Meaning</label>
            <input
              type="text"
              value={banglaMeaning}
              onChange={(e) => setBanglaMeaning(e.target.value)}
              placeholder="e.g. মহানুভব, উদার"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Synonyms (comma separated)</label>
              <input
                type="text"
                value={synonymsStr}
                onChange={(e) => setSynonymsStr(e.target.value)}
                placeholder="generous, noble, forgiving"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Antonyms (comma separated)</label>
              <input
                type="text"
                value={antonymsStr}
                onChange={(e) => setAntonymsStr(e.target.value)}
                placeholder="miserly, petty, selfish"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Exam Tags</label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'Word Smart 1',
                  'Word Smart 2',
                  'GRE High-Frequency',
                  'BCS Direct',
                  'IBA High-Yield',
                ] as WordTag[]
              ).map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
            >
              Save Custom Word
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
