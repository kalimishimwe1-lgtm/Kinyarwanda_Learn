import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  ['Learn', '/learn'],
  ['Lessons', '/lessons'],
  ['Quizzes', '/quizzes'],
  ['Progress', '/progress'],
  ['Dictionary', '/dictionary'],
  ['Translation', '/translation'],
  ['Tutors', '/tutors'],
  ['Forum', '/forum'],
  ['Resources', '/resources'],
  ['Pricing', '/pricing'],
  ['Contact', '/contact'],
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" onClick={closeMenu} className="text-2xl font-black tracking-tight text-emerald-700">
          Kinyarwanda<span className="text-slate-800">Learn</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-3 text-sm font-medium text-slate-700 xl:flex">
          {links.map(([label, path]) => (
            <Link key={path} to={path} className="transition hover:text-emerald-700">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 xl:hidden"
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
          {user ? (
            <>
              <span className="hidden text-sm font-medium text-slate-600 sm:inline">Hi, {user.name}</span>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={closeMenu} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Admin</Link>
              )}
              <button type="button" onClick={() => { logout(); closeMenu(); }} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
                Login
              </Link>
              <Link to="/register" onClick={closeMenu} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Main navigation" className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 pb-4 text-sm font-medium text-slate-700 sm:grid-cols-3 xl:hidden">
          {links.map(([label, path]) => (
            <Link key={path} to={path} onClick={closeMenu} className="rounded-lg px-3 py-2 transition hover:bg-emerald-50 hover:text-emerald-700">
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
