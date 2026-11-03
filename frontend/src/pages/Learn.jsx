import { Link } from 'react-router-dom';

const levels = [
  { title: 'Beginner', description: 'Start with greetings, numbers, and essential daily phrases.', accent: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { title: 'Intermediate', description: 'Expand your confidence with real conversation and travel phrases.', accent: 'bg-sky-50 text-sky-700 border-sky-200' },
  { title: 'Advanced', description: 'Strengthen fluency with longer conversations and practical storytelling.', accent: 'bg-violet-50 text-violet-700 border-violet-200' },
];

export default function Learn() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Learning levels</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Choose your learning path.</h1>
        <p className="mt-3 text-lg text-slate-600">Progress step by step and build real-world speaking confidence.</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {levels.map((level) => (
          <Link key={level.title} to="/lessons" className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${level.accent}`}>
              {level.title}
            </span>
            <p className="mt-5 text-slate-600">{level.description}</p>
            <span className="mt-6 inline-flex font-semibold text-emerald-700">Explore lessons →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
