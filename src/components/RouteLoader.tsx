import { Spinner } from '@/components/ui/Spinner';

/** Suspense fallback used while a lazy-loaded route chunk is downloading. */
export function RouteLoader(): JSX.Element {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
