import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { FlaskConical } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  // Supabase fires PASSWORD_RECOVERY when the user arrives via the reset link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <FlaskConical className="h-12 w-12 text-amber-500 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Set New Password</h1>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          {!ready ? (
            <p className="text-sm text-muted-foreground text-center">
              Waiting for password reset confirmation…
              <br />
              <span className="text-xs">Make sure you opened this page from the reset link in your email.</span>
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">{error}</div>}
              <div>
                <label className="text-sm font-medium">New Password</label>
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
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
