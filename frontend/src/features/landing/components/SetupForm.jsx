import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSetupStore, ROUND_OPTIONS, MINUTE_OPTIONS, MOTION_MIN, MOTION_MAX } from '../store/setupStore';

export default function SetupForm() {
  const navigate = useNavigate();
  const { topic, motion, side, totalRounds, roundMinutes, locked, updateSetup, lockSetup } = useSetupStore();
  const [error, setError] = useState('');

  // Show banner if a debate is already in progress
  if (locked) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold">A debate is in progress</h2>
        <p className="mt-2 text-slate-600">
          <span className="font-medium">Motion:</span> {motion}
        </p>
        <p className="text-slate-600">
          <span className="font-medium">Your side:</span> {side === 'for' ? 'For' : 'Against'}
        </p>
        <Link to="/arena" className="btn-primary mt-4">
          Return to the Arena
        </Link>
      </div>
    );
  }

  function validate() {
    const trimmed = motion.trim();
    if (trimmed.length < MOTION_MIN) return `The motion must be at least ${MOTION_MIN} characters.`;
    if (trimmed.length > MOTION_MAX) return `The motion must be at most ${MOTION_MAX} characters.`;
    return '';
  }

  function handleStart(event) {
    event.preventDefault();
    const problem = validate();
    setError(problem);
    if (problem) return;

    updateSetup({ motion: motion.trim(), topic: topic.trim() });
    lockSetup();
    navigate('/arena');
  }

  return (
    <form onSubmit={handleStart} className="card space-y-4">
      <h2 className="text-lg font-semibold">Set up your debate</h2>

      <div>
        <label htmlFor="topic" className="label">
          Topic (optional, used to pre-fill your research)
        </label>
        <input
          id="topic"
          className="input"
          maxLength={100}
          placeholder="e.g. Renewable energy"
          value={topic}
          onChange={(e) => updateSetup({ topic: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="motion" className="label">
          Motion
        </label>
        <textarea
          id="motion"
          className="input"
          rows={2}
          maxLength={MOTION_MAX}
          placeholder="e.g. This house believes that developing countries should prioritise renewable energy over coal"
          value={motion}
          onChange={(e) => updateSetup({ motion: e.target.value })}
        />
        <p className="mt-1 text-right text-xs text-slate-500">
          {motion.length}/{MOTION_MAX}
        </p>
      </div>

      <fieldset>
        <legend className="label">Your side</legend>
        <div className="flex gap-6">
          {['for', 'against'].map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="side"
                value={option}
                checked={side === option}
                onChange={() => updateSetup({ side: option })}
              />
              {option === 'for' ? 'For the motion' : 'Against the motion'}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          The AI takes the other side. The "For" side speaks first.
        </p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rounds" className="label">
            Rounds
          </label>
          <select
            id="rounds"
            className="input"
            value={totalRounds}
            onChange={(e) => updateSetup({ totalRounds: Number(e.target.value) })}
          >
            {ROUND_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} rounds
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="minutes" className="label">
            Time per round
          </label>
          <select
            id="minutes"
            className="input"
            value={roundMinutes}
            onChange={(e) => updateSetup({ roundMinutes: Number(e.target.value) })}
          >
            {MINUTE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} minutes
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="error-box">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary">
          Start debate
        </button>
        <Link to="/research" className="btn-secondary">
          Research first
        </Link>
      </div>
    </form>
  );
}
