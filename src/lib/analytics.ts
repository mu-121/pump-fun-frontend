/**
 * Optional analytics bootstrap. Reads `VITE_ANALYTICS_DOMAIN` at build time and,
 * if set, injects a Plausible script tag. The script is fully optional — the
 * bundle has no analytics dep otherwise.
 *
 * To switch providers (PostHog, Fathom, etc.) replace the script tag below.
 */
const PLAUSIBLE_SRC = 'https://plausible.io/js/script.js';

export function initAnalytics(): void {
  const domain = import.meta.env.VITE_ANALYTICS_DOMAIN as string | undefined;
  if (!domain) return;
  if (document.querySelector('script[data-pump-clone-analytics]')) return;
  const s = document.createElement('script');
  s.async = true;
  s.defer = true;
  s.dataset.domain = domain;
  s.dataset.pumpCloneAnalytics = '1';
  s.src = PLAUSIBLE_SRC;
  document.head.appendChild(s);
}
