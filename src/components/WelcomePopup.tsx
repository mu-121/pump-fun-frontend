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
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 bg-[rgba(0,0,0,0.75)]
      max-[640px]:items-end
      max-[640px]:pb-0
max-[640px]:pt-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      {/* Solid backdrop — not click-to-close. Users must accept to continue. */}
      <div
        className="absolute inset-0 flex items-center justify-center p-6 cursor-pointer  max-[640px]:left-[20px]
  max-[640px]:items-end
    max-[640px]:px-[20px]
    max-[640px]:pb-0"
        aria-hidden="true"
      />
      <div className="relative bg-[#111113] border border-[#212225] z-10 shadow-[0_0_0_1px_#212225] outline-green-300 w-full cursor-auto outline outline-0 outline-[var(--color-bg-accent)] outline-offset-[-4px] will-change-[opacity,transform] rounded-[16px] flex flex-col w-full max-w-[640px] p-6 transition-[opacity,transform] duration-150
        max-[640px]:rounded-t-[24px]
max-[640px]:rounded-b-none
max-[640px]:pt-[12px]
max-[640px]:transition-transform
max-[640px]:duration-[450ms]
max-[640px]:ease-[cubic-bezier(.32,.72,0,1)]
max-[640px]:translate-y-[var(--drawer-swipe-movement-y)]">
        <div className="hidden max-[640px]:flex justify-center mb-3">
          <div className="w-12 h-1 rounded-full bg-[#3A3A3D]" />
        </div>
        <Hero />

        <div className="px-0 pt-6 pb-0">
          <h1
            id="welcome-title"
            className="font-bold font-[Inter] leading-[134%] text-[24px] text-[#FAFAFA!important] text-center"
          >
            Welcome to {env.platformName}!
          </h1>
          <p className="mt-4 mb-[4px] leading-[150%] font-[Inter!important] text-[16px] text-[#A1A1AA] text-text-muted text-center leading-relaxed">
            {/* {env.platformName}  */}
            Pump lets anyone create coins, giving everyone equal access to buy and sell from the start. Prices can move quickly, so trade carefully.
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

          <p className='mt-4 text-[#A1A1AA] font-[Inter!important] text-xs text-text-tertiary mx-auto max-w-[480px] text-center'>
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
      <img src='/Images/FirstPopup/dialog-clickwrap-cover.webp' alt='cover'
        className='border border-solid border-border-secondary aspect-16-9 rounded-[12px] object-cover select-none max-[640px]:rounded-[20px]' />
    );
  }
  return (
    <img onError={() => setErrored(true)}
      src='/Images/FirstPopup/dialog-clickwrap-cover.webp' alt='cover'
      className='border border-solid border-border-secondary aspect-16-9 rounded-[12px] object-cover select-none max-[640px]:rounded-[20px]' />

  );
}
