import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../lib/api';

export default function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    api('/forum/posts')
      .then((data) => {
        if (active) setPosts(data);
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
  }, []);

  async function createPost(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      const post = await api('/forum/posts', {
        method: 'POST',
        body: { title, body },
      });
      setPosts((current) => [post, ...current]);
      setTitle('');
      setBody('');
      setNotice('Your post has been published.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Community</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Discussion forum</h1>
        <p className="mt-4 text-lg text-slate-600">Ask questions, share tips, and practice Kinyarwanda with other learners.</p>
      </div>

      {error && <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{error}</p>}
      {notice && <p role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">{notice}</p>}

      {user ? (
        <form onSubmit={createPost} className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Create a post</h2>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Title
            <input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 font-normal" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Message
            <textarea required maxLength={5000} value={body} onChange={(event) => setBody(event.target.value)} className="min-h-32 rounded-xl border border-slate-200 px-4 py-3 font-normal" />
          </label>
          <button disabled={submitting} className="w-fit rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60">
            {submitting ? 'Publishing…' : 'Publish post'}
          </button>
        </form>
      ) : (
        <p className="mt-8 rounded-2xl bg-emerald-50 p-5 text-emerald-900">
          <Link to="/login" className="font-semibold underline">Sign in</Link> to create a forum post.
        </p>
      )}

      <section className="mt-8" aria-labelledby="forum-posts-heading">
        <h2 id="forum-posts-heading" className="text-2xl font-bold text-slate-900">Recent posts</h2>
        {loading ? (
          <p className="mt-4 text-slate-600">Loading posts…</p>
        ) : posts.length ? (
          <div className="mt-4 grid gap-4">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                <p className="mt-3 whitespace-pre-wrap text-slate-700">{post.body}</p>
                <p className="mt-4 text-sm text-slate-500">
                  Posted by {post.author_name} · {new Date(post.created_at).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        ) : !error ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">No posts yet. Start the conversation.</p>
        ) : null}
      </section>
    </section>
  );
}
