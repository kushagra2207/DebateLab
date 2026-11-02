function Section({ title, children }) {
  return (
    <section className="card">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items, emptyText }) {
  if (!items || items.length === 0) return <p className="text-sm text-slate-500">{emptyText}</p>;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function ReportView({ report }) {
  return (
    <div className="space-y-4">
      {report.overallAssessment && (
        <Section title="Overall assessment">
          <p className="text-sm whitespace-pre-wrap text-slate-700">{report.overallAssessment}</p>
        </Section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Strengths">
          <BulletList items={report.strengths} emptyText="None listed." />
        </Section>
        <Section title="Weaknesses">
          <BulletList items={report.weaknesses} emptyText="None listed." />
        </Section>
      </div>

      <Section title="Logical fallacies">
        {!report.fallacies || report.fallacies.length === 0 ? (
          <p className="text-sm text-slate-500">No logical fallacies found. Well done!</p>
        ) : (
          <ul className="space-y-3">
            {report.fallacies.map((fallacy, i) => (
              <li key={i} className="rounded-md bg-red-50 p-3 text-sm">
                <p className="font-semibold text-red-800">{fallacy.type}</p>
                <p className="mt-1 text-slate-600 italic">"{fallacy.quote}"</p>
                <p className="mt-1 text-slate-700">{fallacy.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Evidence you could have used">
        <BulletList items={report.missedEvidence} emptyText="None listed." />
      </Section>

      {report.notesUsage && (
        <Section title="How you used your notes">
          <p className="text-sm text-slate-700">{report.notesUsage}</p>
        </Section>
      )}

      {report.modelAnswer && (
        <Section title="A model answer for your side">
          <p className="text-sm whitespace-pre-wrap text-slate-700">{report.modelAnswer}</p>
        </Section>
      )}

      <Section title="Tips for next time">
        <BulletList items={report.tips} emptyText="None listed." />
      </Section>
    </div>
  );
}
