import { MAX_ARGUMENT_LENGTH } from '../store/debateStore';

export default function Composer({ draft, onDraftChange, onSend, disabled }) {
  function handleSubmit(event) {
    event.preventDefault();
    if (draft.trim()) onSend();
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) handleSubmit(event);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        className="input"
        rows={5}
        maxLength={MAX_ARGUMENT_LENGTH}
        placeholder={disabled ? 'Wait for your turn...' : 'Write your argument... (Ctrl+Enter to send)'}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {draft.length}/{MAX_ARGUMENT_LENGTH}
        </span>
        <button type="submit" className="btn-primary" disabled={disabled || !draft.trim()}>
          Send argument
        </button>
      </div>
    </form>
  );
}
