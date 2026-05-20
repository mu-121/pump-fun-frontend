import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { env } from '@/lib/env';

const STORAGE_KEY = 'pump-clone-welcome-accepted';

/**
 * First-visit welcome modal. Shows once per browser; the `Continue` click
 * persists acceptance so subsequent visits skip it. We don't expose an Esc /
 * backdrop close — this is a forced gate where the user agrees to ToS / age.
 *
 * The hero image lives in `/public/welcome-hero.webp` and is served at the
 * root path. If it's missing we fall back to a tasteful gradient so the modal
 * still looks intentional.
 */
export function WelcomePopup(): JSX.Element | null {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Render-deferred check so SSR-style flicker doesn't happen
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== '1') setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const accept = (): void => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore storage errors — they'll just re-see the modal next visit */
    }
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      {/* Solid backdrop — not click-to-close. Users must accept to continue. */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-[560px] rounded-2xl border border-border bg-surface shadow-glow overflow-hidden animate-fade-in">
        <Hero />

        <div className="px-6 pt-5 pb-5">
          <h1
            id="welcome-title"
            className="text-2xl font-bold tracking-tight text-text-primary text-center"
          >
            Welcome to {env.platformName}!
          </h1>
          <p className="mt-3 text-sm text-text-muted text-center leading-relaxed">
            {env.platformName} lets anyone create coins, giving everyone equal access to buy and
            sell from the start. Prices can move quickly, so trade carefully.
          </p>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-5"
            onClick={accept}
          >
            Continue
          </Button>

          <p className="mt-3 text-[11px] text-text-muted text-center leading-relaxed">
            By clicking this button, you agree to the{' '}
            <Link to="/legal/terms" className="underline hover:text-text-primary">
              Terms and Conditions
            </Link>
            ,{' '}
            <Link to="/legal/privacy" className="underline hover:text-text-primary">
              Privacy Policy
            </Link>
            , and certify that you are over 18 years old.
          </p>
        </div>
      </div>
    </div>
  );
}

function Hero(): JSX.Element {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className="h-[260px] w-full bg-gradient-to-br from-primary/80 via-accent/60 to-danger/50 grid place-items-center">
        <span className="text-5xl">🚀</span>
      </div>
    );
  }
  return (
    <img
      src="/welcome-hero.webp"
      alt=""
      onError={() => setErrored(true)}
      className="block w-full h-[260px] object-cover bg-surface-elevated"
    />
  );
}
