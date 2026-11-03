import { Link } from 'react-router-dom';
import { lessons } from '../data/content';

export default function Lessons() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Course roadmap</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Build practical Kinyarwanda skills.</h1>
        </div>
        <Link to="/quizzes" className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
          Take a quiz
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {lessons.map((lesson) => (
          <article key={lesson.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {lesson.level}
              </span>
              <span className="text-sm text-slate-500">{lesson.duration}</span>
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">{lesson.title}</h2>
            <p className="mt-3 text-slate-600">{lesson.description}</p>

            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              {lesson.objectives.map((objective) => (
                <li key={objective} className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  {objective}
                </li>
              ))}
            </ul>

            <Link to="/quizzes" className="mt-6 inline-flex font-semibold text-emerald-700 transition hover:text-emerald-800">
              Practice this lesson →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
