import { Link } from 'react-router-dom';

export default function Tutors() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">One-on-one learning</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Tutors</h1>
        <p className="mt-4 text-slate-600">
          A tutor directory and booking service are not available yet. We have removed sample profiles so you can distinguish confirmed tutors from placeholders.
        </p>
        <Link to="/lessons" className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
          Continue with lessons
        </Link>
      </div>
    </section>
  );
}
