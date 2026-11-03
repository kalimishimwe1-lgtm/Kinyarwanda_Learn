import { Link } from 'react-router-dom';
import { stats } from '../data/content';

const features = [
  { icon: '📚', title: 'Structured lessons', text: 'Follow clear beginner-to-advanced learning paths.' },
  { icon: '🧠', title: 'Practice quizzes', text: 'Test what you learn with quick, confidence-building drills.' },
  { icon: '🔎', title: 'Vocabulary builder', text: 'Use everyday words and phrases for real-life speaking.' },
];

const learningPath = [
  'Build a strong base in greetings and phrases',
  'Expand your vocabulary for daily conversation',
  'Practice speaking with quizzes and cultural lessons',
];

export default function Home() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            Learn. Speak. Connect.
          </span>
          <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
            Learn Kinyarwanda with confidence and culture.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            KinyarwandaLearn helps learners build practical language skills through lessons, vocabulary, quizzes, and community-based practice.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/lessons" className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700">
              Start learning
            </Link>
            <Link to="/register" className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
              Create account
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-2xl shadow-emerald-950/20">
          <div className="rounded-2xl bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">This week</p>
            <h2 className="mt-3 text-3xl font-bold">Small steps. Big growth.</h2>
            <ul className="mt-6 space-y-4 text-slate-200">
              {learningPath.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-slate-950">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="text-3xl font-black text-emerald-700">{stat.value}</div>
            <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="text-4xl">{feature.icon}</div>
            <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
            <p className="mt-3 text-slate-600">{feature.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
