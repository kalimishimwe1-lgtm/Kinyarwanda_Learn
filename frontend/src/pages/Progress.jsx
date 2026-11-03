import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readQuizHistory } from '../lib/progress';

export default function Progress() {
  const [history, setHistory] = useState({ attempts: [], error: '' });

  useEffect(() => {
    setHistory(readQuizHistory());
  }, []);

  const { attempts, error } = history;
  const bestAttempt = attempts.reduce(
    (best, attempt) => (
      !best || attempt.score / attempt.total > best.score / best.total ? attempt : best
    ),
    null,
  );
  const latestAttempt = attempts[attempts.length - 1];
  const stats = [
    { label: 'Completed quizzes', value: attempts.length },
    { label: 'Best score', value: bestAttempt ? `${Math.round((bestAttempt.score / bestAttempt.total) * 100)}%` : '—' },
    { label: 'Latest result', value: latestAttempt ? `${latestAttempt.score} / ${latestAttempt.total}` : '—' },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Your growth</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">My progress</h1>
        <p className="mt-3 text-slate-600">Quiz results are saved locally in this browser and are not synced across devices.</p>
      </div>

      {error && <p role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">{error}</p>}

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-500">{item.label}</p>
            <p className="mt-3 text-4xl font-black text-emerald-700">{item.value}</p>
          </div>
        ))}
      </div>

      {attempts.length ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Recent quiz results</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {attempts.slice(-5).reverse().map((attempt, index) => (
              <li key={`${attempt.completedAt}-${index}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-slate-700">
                <span>{new Date(attempt.completedAt).toLocaleString()}</span>
                <span className="font-semibold">{attempt.score} of {attempt.total}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">No quiz results yet</h2>
          <p className="mt-2 text-slate-600">Complete a quiz to start tracking your progress here.</p>
          <Link to="/quizzes" className="mt-5 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
            Take a quiz
          </Link>
        </div>
      )}
    </section>
  );
}
