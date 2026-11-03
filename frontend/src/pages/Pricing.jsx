import { Link } from 'react-router-dom';

const plans = [
  { name: 'Free', price: '0 FRW', description: 'Perfect for trying out the beginner lessons and vocabulary list.' },
  { name: 'Learner', price: '5,000 FRW / month', description: 'Unlock structured courses, quizzes, and daily practice tools.', featured: true },
  { name: 'Pro', price: '10,000 FRW / month', description: 'Full access to advanced content, live tutor sessions, and progress analytics.' },
];

export default function Pricing() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Plans</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Choose the right plan for your goals.</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">Paid checkout is not enabled yet. You can create a free account; paid plans are shown for preview only.</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-3xl border p-7 shadow-sm ${plan.featured ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
            <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
            <p className="mt-5 text-3xl font-black text-emerald-700">{plan.price}</p>
            <p className="mt-4 text-slate-600">{plan.description}</p>
            {plan.name === 'Free' ? (
              <Link to="/register" className="mt-6 inline-flex w-full justify-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
                Create a free account
              </Link>
            ) : (
              <button type="button" disabled className="mt-6 w-full cursor-not-allowed rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-600">
                Checkout not available
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
