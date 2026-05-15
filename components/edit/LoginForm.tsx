'use client';

import { useState } from 'react';

export const LoginForm = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/edit/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        window.location.reload();
      } else {
        setError(data.error ?? 'Login failed.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[80vh] min-h-[80dvh] max-w-md flex-col justify-center px-6 py-10">
      <h1 className="mb-3 font-display text-3xl tracking-wide text-white" style={{ textShadow: 'var(--glow)' }}>
        Editor
      </h1>
      <p className="mb-6 text-sm text-text-dim">Only Khalil&apos;s allowed past here.</p>
      <form onSubmit={onSubmit} className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur-md">
        <label htmlFor="pw" className="mb-2 block text-xs uppercase tracking-widest text-text-dim">
          Password
        </label>
        <input
          id="pw"
          type="password"
          autoFocus
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-base text-white outline-none focus:border-[var(--accent-2)]"
        />
        {error && <div className="mt-3 rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</div>}
        <button
          type="submit"
          disabled={submitting || !password}
          className="mt-5 w-full rounded-full bg-[var(--accent-2)] px-6 py-3 font-display text-sm tracking-wide text-[var(--bg-1)] shadow-glow disabled:opacity-50"
        >
          {submitting ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </main>
  );
};
