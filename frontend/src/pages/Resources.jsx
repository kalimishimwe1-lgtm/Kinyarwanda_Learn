import { Link } from 'react-router-dom';

const resources = [
  { title: 'Beginner guide', description: 'Start with the available structured lessons.', href: '/lessons', action: 'Explore lessons' },
  { title: 'Common vocabulary list', description: 'Review the words and meanings in the starter dictionary.', href: '/dictionary', action: 'Browse vocabulary' },
  { title: 'Practice quiz', description: 'Check your understanding with the available vocabulary quiz.', href: '/quizzes', action: 'Take a quiz' },
];

export default function Resources() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Free resources</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Extra materials to support your study.</h1>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {resources.map((resource) => (
          <article key={resource.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">{resource.title}</h2>
            <p className="mt-3 text-slate-600">{resource.description}</p>
            <Link to={resource.href} className="mt-6 inline-flex font-semibold text-emerald-700 hover:text-emerald-800">{resource.action} →</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
