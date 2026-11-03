import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { vocabulary } from '../data/content';

export default function Translation() {
  const [direction, setDirection] = useState('kinyarwanda-to-english');
  const [text, setText] = useState('');
  const matches = useMemo(() => {
    const query = text.trim().toLocaleLowerCase();
    if (!query) return [];

    return vocabulary.filter((entry) => {
      const source = direction === 'kinyarwanda-to-english' ? entry.word : entry.meaning;
      return source.toLocaleLowerCase() === query;
    });
  }, [direction, text]);

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Phrase lookup</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Kinyarwanda translator</h1>
        <p className="mt-3 text-slate-600">
          Look up individual words from our starter dictionary. This tool does not translate full sentences.
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <label htmlFor="translation-direction" className="block text-sm font-semibold text-slate-700">Translation direction</label>
        <select
          id="translation-direction"
          value={direction}
          onChange={(event) => setDirection(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-400 sm:max-w-sm"
        >
          <option value="kinyarwanda-to-english">Kinyarwanda to English</option>
          <option value="english-to-kinyarwanda">English to Kinyarwanda</option>
        </select>

        <label htmlFor="translation-input" className="mt-6 block text-sm font-semibold text-slate-700">
          {direction === 'kinyarwanda-to-english' ? 'Kinyarwanda word' : 'English word'}
        </label>
        <textarea
          id="translation-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={120}
          className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-emerald-400"
          placeholder={direction === 'kinyarwanda-to-english' ? 'For example: Muraho' : 'For example: Hello'}
        />

        {text.trim() && (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-5" role="status" aria-live="polite">
            {matches.length ? (
              matches.map((entry) => (
                <p key={entry.word} className="text-lg font-semibold text-emerald-900">
                  {direction === 'kinyarwanda-to-english' ? `${entry.word} — ${entry.meaning}` : `${entry.meaning} — ${entry.word}`}
                </p>
              ))
            ) : (
              <p className="text-emerald-900">No exact word match found in the starter dictionary.</p>
            )}
          </div>
        )}

        <Link to="/dictionary" className="mt-6 inline-flex font-semibold text-emerald-700 hover:text-emerald-800">
          Browse the dictionary →
        </Link>
      </div>
    </section>
  );
}
