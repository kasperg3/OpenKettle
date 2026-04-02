import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { FlaskConical } from 'lucide-react';

type Tab = 'signin' | 'signup' | 'reset';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/dashboard';

  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function switchTab(t: Tab) { setTab(t); setError(''); setMessage(''); }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate(from, { replace: true });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setMessage('Account created! Check your email to confirm before signing in.');
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError('Enter your email first'); return; }
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setMessage('Magic link sent! Check your email.');
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError('Enter your email address'); return; }
    setError(''); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${window.location.pathname}#/reset-password`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setMessage('Password reset email sent! Check your inbox.');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <FlaskConical className="h-12 w-12 text-amber-500 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">OpenKettle</h1>
          <p className="text-muted-foreground text-sm mt-1">Open-source brewing calculator</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          {/* Tabs */}
          <div className="flex border-b mb-6 gap-0">
            {(['signin', 'signup'] as const).map(t => (
              <button key={t} onClick={() => switchTab(t)}
                className={`flex-1 pb-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-amber-500 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm rounded-md">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
              {error}
            </div>
          )}

          {/* ── Sign In ── */}
          {tab === 'signin' && (
            <div className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" required autoComplete="email"
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <div className="flex justify-between items-baseline">
                    <label className="text-sm font-medium">Password</label>
                    <button type="button" onClick={() => switchTab('reset')}
                      className="text-xs text-amber-600 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <input type="password" required autoComplete="current-password"
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium text-sm disabled:opacity-60">
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div className="relative text-center text-xs text-muted-foreground">
                <span className="relative bg-card px-2 z-10">or</span>
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              </div>

              <form onSubmit={handleMagicLink}>
                <button type="submit" disabled={loading}
                  className="w-full py-2 border rounded-md text-sm hover:bg-muted disabled:opacity-60">
                  Send Magic Link
                </button>
                <p className="text-xs text-muted-foreground text-center mt-1.5">
                  Enter your email above, then click to receive a sign-in link.
                </p>
              </form>
            </div>
          )}

          {/* ── Sign Up ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" required autoComplete="email"
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input type="password" required minLength={8} autoComplete="new-password"
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <input type="password" required autoComplete="new-password"
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium text-sm disabled:opacity-60">
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
              <p className="text-xs text-center text-muted-foreground">
                All recipes you create are public by default — that's the OpenKettle ethos.
              </p>
            </form>
          )}

          {/* ── Password Reset ── */}
          {tab === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" required autoComplete="email"
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium text-sm disabled:opacity-60">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => switchTab('signin')}
                className="w-full py-2 border rounded-md text-sm hover:bg-muted">
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
