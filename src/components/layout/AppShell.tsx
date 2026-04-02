import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
