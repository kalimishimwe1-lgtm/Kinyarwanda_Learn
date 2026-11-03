import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../lib/api';

const emptyOverview = { users: 0, lessons: 0, quizzes: 0, forumPosts: 0 };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(emptyOverview);
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [lessonForm, setLessonForm] = useState({ title: '', level: 'Beginner', description: '', content: '' });
  const [quizForm, setQuizForm] = useState({ question: '', options: ['', '', '', ''], answer: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return undefined;
    }

    let active = true;
    Promise.all([
      api('/admin/overview'),
      api('/admin/users'),
      api('/admin/lessons'),
      api('/admin/quizzes'),
    ])
      .then(([nextOverview, nextUsers, nextLessons, nextQuizzes]) => {
        if (!active) return;
        setOverview(nextOverview);
        setUsers(nextUsers);
        setLessons(nextLessons);
        setQuizzes(nextQuizzes);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Admin sign-in required</h1>
          <p className="mt-3 text-slate-600">Sign in with an administrator account to manage the learning platform.</p>
          <Link to="/login" className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">Sign in</Link>
        </div>
      </section>
    );
  }

  if (user.role !== 'admin') {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-rose-800">Administrator access required</h1>
          <p className="mt-2 text-rose-700">This account is not permitted to access the admin dashboard.</p>
        </div>
      </section>
    );
  }

  async function createLesson(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const lesson = await api('/admin/lessons', { method: 'POST', body: lessonForm });
      setLessons((current) => [lesson, ...current]);
      setOverview((current) => ({ ...current, lessons: Number(current.lessons) + 1 }));
      setLessonForm({ title: '', level: 'Beginner', description: '', content: '' });
      setNotice('Lesson created.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteLesson(id) {
    setError('');
    try {
      await api(`/admin/lessons/${id}`, { method: 'DELETE' });
      setLessons((current) => current.filter((lesson) => lesson.id !== id));
      setOverview((current) => ({ ...current, lessons: Math.max(0, Number(current.lessons) - 1) }));
      setNotice('Lesson removed.');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function createQuiz(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const quiz = await api('/admin/quizzes', { method: 'POST', body: quizForm });
      setQuizzes((current) => [quiz, ...current]);
      setOverview((current) => ({ ...current, quizzes: Number(current.quizzes) + 1 }));
      setQuizForm({ question: '', options: ['', '', '', ''], answer: '' });
      setNotice('Quiz question created.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuiz(id) {
    setError('');
    try {
      await api(`/admin/quizzes/${id}`, { method: 'DELETE' });
      setQuizzes((current) => current.filter((quiz) => quiz.id !== id));
      setOverview((current) => ({ ...current, quizzes: Math.max(0, Number(current.quizzes) - 1) }));
      setNotice('Quiz question removed.');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const metrics = [
    ['Registered learners', overview.users],
    ['Lessons', overview.lessons],
    ['Quiz questions', overview.quizzes],
    ['Forum posts', overview.forumPosts],
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Platform management</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Admin dashboard</h1>
        <p className="mt-2 text-slate-600">Signed in as {user.name}. Changes are saved to the platform database.</p>
      </div>

      {error && <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{error}</p>}
      {notice && <p role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">{notice}</p>}

      {loading ? (
        <p className="mt-8 text-slate-600">Loading dashboard…</p>
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-emerald-700">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Create a lesson</h2>
              <form className="mt-5 grid gap-3" onSubmit={createLesson}>
                <input required maxLength="200" value={lessonForm.title} onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Lesson title" />
                <select value={lessonForm.level} onChange={(event) => setLessonForm({ ...lessonForm, level: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
                <input value={lessonForm.description} onChange={(event) => setLessonForm({ ...lessonForm, description: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Short description" />
                <textarea value={lessonForm.content} onChange={(event) => setLessonForm({ ...lessonForm, content: event.target.value })} className="min-h-24 rounded-xl border border-slate-200 px-4 py-3" placeholder="Lesson content" />
                <button disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-60">Save lesson</button>
              </form>

              <h3 className="mt-8 font-bold text-slate-900">Lessons ({lessons.length})</h3>
              <ul className="mt-3 divide-y divide-slate-100">
                {lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center justify-between gap-3 py-3">
                    <span><b>{lesson.title}</b><span className="ml-2 text-sm text-slate-500">{lesson.level}</span></span>
                    <button type="button" onClick={() => deleteLesson(lesson.id)} className="text-sm font-semibold text-rose-700 hover:text-rose-800">Delete</button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Create a quiz question</h2>
              <form className="mt-5 grid gap-3" onSubmit={createQuiz}>
                <input required value={quizForm.question} onChange={(event) => setQuizForm({ ...quizForm, question: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Question" />
                {quizForm.options.map((option, index) => (
                  <input
                    key={index}
                    required
                    value={option}
                    onChange={(event) => setQuizForm({
                      ...quizForm,
                      options: quizForm.options.map((current, optionIndex) => optionIndex === index ? event.target.value : current),
                    })}
                    className="rounded-xl border border-slate-200 px-4 py-3"
                    placeholder={`Answer option ${index + 1}`}
                  />
                ))}
                <select required value={quizForm.answer} onChange={(event) => setQuizForm({ ...quizForm, answer: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3">
                  <option value="">Choose the correct answer</option>
                  {quizForm.options.filter(Boolean).map((option, index) => <option key={`${index}-${option}`} value={option}>{option}</option>)}
                </select>
                <button disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-60">Save quiz question</button>
              </form>

              <h3 className="mt-8 font-bold text-slate-900">Quiz questions ({quizzes.length})</h3>
              <ul className="mt-3 divide-y divide-slate-100">
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="font-medium">{quiz.question}</span>
                    <button type="button" onClick={() => deleteQuiz(quiz.id)} className="shrink-0 text-sm font-semibold text-rose-700 hover:text-rose-800">Delete</button>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900">Recent accounts</h2>
              <p className="mt-1 text-sm text-slate-500">Most recent 100 accounts</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr><th className="px-6 py-3 font-semibold">Name</th><th className="px-6 py-3 font-semibold">Email</th><th className="px-6 py-3 font-semibold">Role</th><th className="px-6 py-3 font-semibold">Wallet</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((account) => (
                    <tr key={account.id}>
                      <td className="px-6 py-3 font-medium text-slate-800">{account.name}</td>
                      <td className="px-6 py-3 text-slate-600">{account.email}</td>
                      <td className="px-6 py-3 capitalize text-slate-600">{account.role}</td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">{account.wallet_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
