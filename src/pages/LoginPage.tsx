import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { FlaskConical } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate('/dashboard');
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setMessage('Check your email to confirm your account!');
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setMessage('Magic link sent! Check your email.');
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
          <div className="flex border-b mb-6">
            {(['signin','signup'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setMessage(''); }}
                className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-amber-500 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded">{message}</div>}
          {error && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded">{error}</div>}

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" required className="w-full mt-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input type="password" required className="w-full mt-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium text-sm disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <div className="relative text-center text-xs text-muted-foreground">
                <span className="bg-card px-2">or</span>
                <div className="absolute inset-0 flex items-center -z-10"><div className="w-full border-t" /></div>
              </div>
              <form onSubmit={handleMagicLink}>
                <button type="submit" className="w-full py-2 border rounded-md text-sm hover:bg-muted">
                  Send Magic Link
                </button>
              </form>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" required className="w-full mt-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input type="password" required minLength={8} className="w-full mt-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <input type="password" required className="w-full mt-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium text-sm disabled:opacity-60">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
