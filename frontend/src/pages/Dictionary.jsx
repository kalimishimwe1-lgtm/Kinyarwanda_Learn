import { useMemo, useState } from 'react';
import { vocabulary } from '../data/content';

export default function Dictionary() {
  const [search, setSearch] = useState('');
  const filteredVocabulary = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return vocabulary;
    return vocabulary.filter((entry) => (
      entry.word.toLocaleLowerCase().includes(query)
      || entry.meaning.toLocaleLowerCase().includes(query)
      || entry.category.toLocaleLowerCase().includes(query)
    ));
  }, [search]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Quick reference</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Kinyarwanda dictionary</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search vocabulary"
          placeholder="Search in Kinyarwanda, English, or category"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filteredVocabulary.map((entry) => (
            <article key={entry.word} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{entry.word}</h2>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {entry.category}
                </span>
              </div>
              <p className="mt-3 text-base font-medium text-emerald-700">{entry.meaning}</p>
              {entry.example && <p className="mt-2 text-slate-600">Example: {entry.example}</p>}
            </article>
          ))}
          {!filteredVocabulary.length && (
            <p className="rounded-2xl bg-slate-50 p-5 text-slate-600 md:col-span-2" role="status">
              No vocabulary matches “{search}”. Try another word or browse the full list by clearing the search.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
