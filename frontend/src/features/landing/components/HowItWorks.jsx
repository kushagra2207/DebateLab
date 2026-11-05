const STEPS = [
  {
    title: '1. Set up',
    text: 'Write a motion, pick your side (For or Against) and choose how many rounds you want.',
  },
  {
    title: '2. Research',
    text: 'Look up World Bank statistics and recent news, and write your points down as notes.',
  },
  {
    title: '3. Debate',
    text: 'Argue against an AI that rebuts you and fact-checks your claims. Your notes stay visible.',
  },
  {
    title: '4. Improve',
    text: 'Get a coaching report: strengths, weaknesses, fallacies, missed evidence and tips.',
  },
];

export default function HowItWorks() {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">How it works</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.title} className="card">
            <h3 className="font-semibold text-indigo-700">{step.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
