import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">404 - Page not found</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">We couldn’t find that page.</h1>
      <p className="mt-4 text-slate-600">The address may be incorrect, or the page may have moved.</p>
      <Link to="/" className="mt-8 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700">
        Back to home
      </Link>
    </section>
  );
}
