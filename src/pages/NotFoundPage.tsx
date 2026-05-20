import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage(): JSX.Element {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <p className="text-xs font-mono text-text-muted">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-text-muted max-w-sm">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link to="/">
        <Button variant="primary">Back home</Button>
      </Link>
    </div>
  );
}
