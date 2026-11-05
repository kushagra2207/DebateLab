export default function MessageBubble({ role, label, text, pending = false }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg p-3 text-sm ${isUser ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white'} ${
          pending ? 'opacity-70' : ''
        }`}
      >
        <p className={`mb-1 text-xs font-semibold ${isUser ? 'text-indigo-100' : 'text-slate-500'}`}>{label}</p>
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}
