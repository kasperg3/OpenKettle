import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-4">🍺</div>
      <h1 className="text-3xl font-bold mb-2">404 — Page Not Found</h1>
      <p className="text-muted-foreground mb-6">This page doesn't exist, but your next brew will be great.</p>
      <Link to="/" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-sm">
        Back to Home
      </Link>
    </div>
  );
}
