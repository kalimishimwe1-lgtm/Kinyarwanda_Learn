import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-20 bg-slate-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-black text-emerald-400">KinyarwandaLearn</h3>
          <p className="mt-3 max-w-xs text-slate-300">
            Learn Kinyarwanda through structured lessons, vocabulary, practice, and community support.
          </p>
        </div>

        <div>
          <h4 className="font-bold">Learn</h4>
          <Link className="mt-3 block text-slate-300 transition hover:text-emerald-400" to="/lessons">Lessons</Link>
          <Link className="mt-2 block text-slate-300 transition hover:text-emerald-400" to="/dictionary">Dictionary</Link>
          <Link className="mt-2 block text-slate-300 transition hover:text-emerald-400" to="/quizzes">Quizzes</Link>
        </div>

        <div>
          <h4 className="font-bold">Community</h4>
          <Link className="mt-3 block text-slate-300 transition hover:text-emerald-400" to="/forum">Forum</Link>
          <Link className="mt-2 block text-slate-300 transition hover:text-emerald-400" to="/tutors">Tutors</Link>
          <Link className="mt-2 block text-slate-300 transition hover:text-emerald-400" to="/resources">Resources</Link>
        </div>

        <div>
          <h4 className="font-bold">Support</h4>
          <Link className="mt-3 block text-slate-300 transition hover:text-emerald-400" to="/contact">Contact</Link>
          <Link className="mt-2 block text-slate-300 transition hover:text-emerald-400" to="/pricing">Pricing</Link>
          <Link className="mt-2 block text-slate-300 transition hover:text-emerald-400" to="/admin">Admin</Link>
        </div>
      </div>

      <div className="border-t border-slate-700 py-5 text-center text-sm text-slate-400">
        © 2026 KinyarwandaLearn. Built for confident language learning.
      </div>
    </footer>
  );
}
