import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

function ProfileTab() {
  const user = useAuthStore(s => s.user);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_profiles')
      .select('username, display_name, bio')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { setLoadError(error.message); return; }
        if (data) {
          setUsername(data.username ?? '');
          setDisplayName(data.display_name ?? '');
          setBio(data.bio ?? '');
        }
      });
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    await supabase.from('user_profiles').upsert({ id: user.id, display_name: displayName, username, bio });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-md">
      {loadError && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{loadError}</div>}
      <div>
        <label className="text-sm font-medium">Email</label>
        <input className="w-full mt-1 px-3 py-2 text-sm border rounded-md bg-muted/50 text-muted-foreground" value={user?.email ?? ''} disabled />
      </div>
      <div>
        <label className="text-sm font-medium">Username</label>
        <input className="w-full mt-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" value={username} onChange={e => setUsername(e.target.value)} placeholder="homebrewer42" />
      </div>
      <div>
        <label className="text-sm font-medium">Display Name</label>
        <input className="w-full mt-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="John Brewer" />
      </div>
      <div>
        <label className="text-sm font-medium">Bio</label>
        <textarea className="w-full mt-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Homebrewer since 2015..." />
      </div>
      <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-sm font-medium">
        {saved ? '✓ Saved' : 'Save Profile'}
      </button>
    </form>
  );
}

function EquipmentProfilesTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Equipment profiles are saved with each recipe. To set a default, open the Equipment tab in any recipe and configure your system settings there — those values will persist in the recipe.
      </p>
      <div className="p-4 border rounded-lg bg-muted/30 text-sm">
        <strong>Tip:</strong> Create a recipe as a "template" with your default equipment settings and clone it each time you brew.
      </div>
    </div>
  );
}

const TABS = ['Account', 'Equipment', 'About'];

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Account');

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Profile & Settings</h1>

        <div className="flex border-b mb-6 gap-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === t ? 'border-amber-500 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'Account' && <ProfileTab />}
        {activeTab === 'Equipment' && <EquipmentProfilesTab />}
        {activeTab === 'About' && (
          <div className="space-y-4 text-sm text-muted-foreground max-w-lg">
            <p><strong className="text-foreground">OpenKettle</strong> is an open-source brewing calculator and recipe database.</p>
            <p>All recipes are public by default — that's the point. Share your knowledge, learn from others, and build on the community's work.</p>
            <p>Built with React, TypeScript, Vite, Tailwind CSS, and Supabase. All brewing calculations happen in your browser — no server required for computation.</p>
            <a href="https://github.com/kasperg3/OpenKettle" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">View source on GitHub →</a>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
