import { useState } from 'react';

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim();

export default function Contact() {
  const [notice, setNotice] = useState('');

  function openEmail(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = String(formData.get('subject')).trim();
    const message = String(formData.get('message')).trim();
    const body = `From: ${String(formData.get('name')).trim()}\nReply-to: ${String(formData.get('email')).trim()}\n\n${message}`;
    window.location.assign(`mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setNotice('Your email app should open with this message ready to send. The message has not been sent by this website.');
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="mb-8 max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Get in touch</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">We’d love to hear from you.</h1>
      </div>

      {contactEmail ? (
        <form onSubmit={openEmail} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Your name
            <input name="name" autoComplete="name" required maxLength={120} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-emerald-400 focus:bg-white" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Your email
            <input name="email" type="email" autoComplete="email" required maxLength={160} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-emerald-400 focus:bg-white" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Subject
            <input name="subject" required maxLength={160} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-emerald-400 focus:bg-white" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Message
            <textarea name="message" required maxLength={5000} className="min-h-[140px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-emerald-400 focus:bg-white" />
          </label>
          <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700">
            Open email app
          </button>
          {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
        </form>
      ) : (
        <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          Contact email is not configured yet. The site owner can set <code>VITE_CONTACT_EMAIL</code> in the frontend deployment settings.
        </p>
      )}
    </section>
  );
}
