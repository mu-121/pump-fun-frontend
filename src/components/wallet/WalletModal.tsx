import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@/providers/WalletModalProvider';
import toast from 'react-hot-toast';

export function WalletModal(): JSX.Element | null {
  const { visible, setVisible } = useWalletModal();
  const { wallets, select, connected } = useWallet();
  const [email, setEmail] = useState('');
  const [showAllWallets, setShowAllWallets] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Close modal when wallet successfully connects
  useEffect(() => {
    if (connected && visible) {
      setVisible(false);
    }
  }, [connected, visible, setVisible]);

  // Close modal on Escape press
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, setVisible]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (!visible) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  // Custom informational alerts for social / email placeholders
  const handleFeaturePlaceholder = (featureName: string) => {
    toast(`Sign-in with ${featureName} is disabled on this network. Please connect a Solana wallet to start trading.`, {
      icon: 'ℹ️',
      duration: 4000,
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    handleFeaturePlaceholder('Email');
  };

  const handleWalletSelect = (walletName: string) => {
    const foundWallet = wallets.find(
      (w) =>
        w.adapter.name === walletName ||
        w.adapter.name.toLowerCase().includes(walletName.toLowerCase())
    );

    if (foundWallet) {
      select(foundWallet.adapter.name);
    } else {
      // Direct users to download if not installed, or try connecting
      toast.error(`${walletName} wallet adapter not found. Make sure the extension is installed.`);
    }
  };

  // Find standard adapters in current wallet stack
  const phantomWallet = wallets.find((w) => w.adapter.name.toLowerCase().includes('phantom'));
  const solflareWallet = wallets.find((w) => w.adapter.name.toLowerCase().includes('solflare'));
  const metamaskWallet = wallets.find((w) => w.adapter.name.toLowerCase().includes('metamask'));

  // A helper to determine if a wallet is installed
  const isInstalled = (wallet: typeof phantomWallet) => {
    if (!wallet) return false;
    return wallet.readyState === 'Installed' || wallet.readyState === 'Loadable';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => setVisible(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
        aria-hidden="true"
      />

      {/* Modal Main container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-[356px] bg-[#0c0d0e] border border-[#202227] rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-text-primary z-10"
      >
        {/* Header section */}
        <div className="flex items-start justify-between">
          <div className="w-7"></div>
          <div className="flex flex-col items-center gap-1 pt-2">
            <div className="bg-[#14231c] border border-green-500/10 mb-2 flex size-12 items-center justify-center rounded-2xl">
              <img
                src="/Images/Sidedrawer/pump-logo.svg"
                alt="pump"
                className="h-7 w-7 object-contain"
              />
            </div>
            <div id="modal-title" className="font-semibold text-[#FAFAFA] text-[20px]">
              Welcome back
            </div>
            <p className="text-text-muted text-sm">Sign in to start trading.</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setVisible(false)}
            className="hover:bg-[#1a1c22] cursor-pointer rounded-lg p-1.5 transition-colors text-text-muted hover:text-text-primary"
          >
            <svg
              aria-hidden="true"
              width="16px"
              height="16px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 5L19 19M19 5L5 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              ></path>
            </svg>
          </button>
        </div>

        {/* Social Connect & Email list */}
        <div className="flex w-full flex-col gap-3">
          {/* Socials group */}
          <div className="flex flex-col gap-2" role="group" aria-label="Continue with a social account">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleFeaturePlaceholder('Google')}
              className="group relative flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-zinc-100"
            >
              <span className="shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                </svg>
              </span>
              <span>Continue with Google</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleFeaturePlaceholder('Apple')}
              className="group relative flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-zinc-900"
            >
              <svg className="shrink-0" aria-hidden="true" width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.0035 7.15814C19.3171 7.5784 18.7485 8.16594 18.351 8.86579C17.9534 9.56563 17.74 10.3549 17.7305 11.1597C17.7332 12.0655 18.0016 12.9506 18.5024 13.7054C19.0032 14.4602 19.7144 15.0515 20.5479 15.4061C20.2193 16.4664 19.7329 17.4712 19.1051 18.3868C18.2069 19.6798 17.2677 20.9727 15.8387 20.9727C14.4096 20.9727 14.0421 20.1425 12.3952 20.1425C10.7892 20.1425 10.2175 21 8.91088 21C7.60426 21 6.69246 19.8022 5.6444 18.3323C4.25999 16.2732 3.49913 13.8583 3.45312 11.3774C3.45312 7.29427 6.10722 5.13028 8.72032 5.13028C10.1086 5.13028 11.2656 6.04208 12.1366 6.04208C12.9669 6.04208 14.2599 5.07572 15.8387 5.07572C16.6504 5.05478 17.4548 5.23375 18.1811 5.59689C18.9074 5.96003 19.5332 6.49619 20.0035 7.15814ZM15.0901 3.34726C15.7861 2.52858 16.18 1.49589 16.2062 0.421702C16.2074 0.280092 16.1937 0.13875 16.1654 0C14.9699 0.116777 13.8644 0.686551 13.0757 1.59245C12.3731 2.37851 11.9643 3.38362 11.9188 4.43697C11.9193 4.56507 11.933 4.69278 11.9597 4.81808C12.0539 4.8359 12.1496 4.84503 12.2455 4.84536C12.7964 4.80152 13.3327 4.64611 13.8217 4.38858C14.3108 4.13104 14.7423 3.77676 15.0901 3.34726Z"
                  fill="currentColor"
                ></path>
              </svg>
              <span>Continue with Apple</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleFeaturePlaceholder('GitHub')}
              className="group relative flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-[#24292f] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-[#1f242b]"
            >
              <span className="shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11.04 11.04 0 0 1 5.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.75.12 3.04.73.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12c0-6.35-5.15-11.5-11.5-11.5z"></path>
                </svg>
              </span>
              <span>Continue with GitHub</span>
            </button>

            {/* X */}
            <button
              type="button"
              onClick={() => handleFeaturePlaceholder('X')}
              className="group relative flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-zinc-900"
            >
              <svg className="shrink-0" aria-hidden="true" width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.5652 3.25H20.5319L14.0505 10.6628L21.6753 20.75H15.7052L11.0291 14.6322L5.67867 20.75H2.71017L9.64264 12.8212L2.32812 3.25H8.44986L12.6766 8.84192L17.5652 3.25ZM16.524 18.9731H18.1679L7.55662 4.93359H5.79256L16.524 18.9731Z"
                  fill="currentColor"
                ></path>
              </svg>
              <span>Continue with X</span>
            </button>
          </div>

          {/* Email input form */}
          <form onSubmit={handleEmailSubmit} className="flex w-full items-stretch gap-2" noValidate>
            <label htmlFor="email-input" className="sr-only">
              Email address
            </label>
            <div className="border-[#202227] bg-[#121316] flex h-10 flex-1 items-center gap-2 rounded-xl border px-3 transition-colors duration-150 focus-within:border-primary/60 focus-within:bg-[#16171c]">
              <svg className="text-text-muted shrink-0" aria-hidden="true" width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.54601 18.891L4 18L4 18L3.54601 18.891ZM3.10899 18.454L2.21799 18.908L2.21799 18.908L3.10899 18.454ZM20.891 18.454L20 18V18L20.891 18.454ZM20.454 18.891L20.908 19.782L20.454 18.891ZM20.891 5.54601L20 6L20 6L20.891 5.54601ZM20.454 5.10899L20.908 4.21799L20.908 4.21799L20.454 5.10899ZM3.10899 5.54601L2.21799 5.09202L2.21799 5.09202L3.10899 5.54601ZM3.54601 5.10899L3.09202 4.21799L3.09202 4.21799L3.54601 5.10899ZM12.6332 12.4819L13.2665 13.2559H13.2665L12.6332 12.4819ZM11.3668 12.4819L10.7335 13.2559H10.7335L11.3668 12.4819ZM20 6.6V17.4H22V6.6H20ZM19.4 18H4.6V20H19.4V18ZM4 17.4V6.6H2V17.4H4ZM4.6 6H19.4V4H4.6V6ZM4.6 18C4.30347 18 4.14122 17.9992 4.02463 17.9897C3.91972 17.9811 3.94249 17.9707 4 18L3.09202 19.782C3.36344 19.9203 3.63318 19.9644 3.86177 19.9831C4.07869 20.0008 4.33647 20 4.6 20V18ZM2 17.4C2 17.6635 1.99922 17.9213 2.01695 18.1382C2.03562 18.3668 2.07969 18.6366 2.21799 18.908L4 18C4.0293 18.0575 4.01887 18.0803 4.0103 17.9754C4.00078 17.8588 4 17.6965 4 17.4H2ZM4 18L4 18L2.21799 18.908C2.40973 19.2843 2.71569 19.5903 3.09202 19.782L4 18ZM20 17.4C20 17.6965 19.9992 17.8588 19.9897 17.9754C19.9811 18.0803 19.9707 18.0575 20 18L21.782 18.908C21.9203 18.6366 21.9644 18.3668 21.9831 18.1382C22.0008 17.9213 22 17.6635 22 17.4H20ZM19.4 20C19.6635 20 19.9213 20.0008 20.1382 19.9831C20.3668 19.9644 20.6366 19.9203 20.908 19.782L20 18C20.0575 17.9707 20.0803 17.9811 19.9754 17.9897C19.8588 17.9992 19.6965 18 19.4 18V20ZM20 18L20 18L20.908 19.782C21.2843 19.5903 21.5903 19.2843 21.782 18.908L20 18ZM22 6.6C22 6.33647 22.0008 6.07869 21.9831 5.86177C21.9644 5.63318 21.9203 5.36344 21.782 5.09202L20 6C19.9707 5.94249 19.9811 5.91972 19.9897 6.02463C19.9992 6.14122 20 6.30347 20 6.6H22ZM19.4 6C19.6965 6 19.8588 6.00078 19.9754 6.0103C20.0803 6.01887 20.0575 6.0293 20 6L20.908 4.21799C20.6366 4.07969 20.3668 4.03562 20.1382 4.01695C19.9213 3.99922 19.6635 4 19.4 4V6ZM21.782 5.09202C21.5903 4.71569 21.2843 4.40973 20.908 4.21799L20 6L20 6L21.782 5.09202ZM4 6.6C4 6.30347 4.00078 6.14122 4.0103 6.02463C4.01887 5.91972 4.0293 5.94249 4 6L2.21799 5.09202C2.07969 5.36344 2.03562 5.63318 2.01695 5.86177C1.99922 6.07869 2 6.33647 2 6.6H4ZM4.6 4C4.33647 4 4.07869 3.99922 3.86177 4.01695C3.63318 4.03562 3.36344 4.07969 3.09202 4.21799L4 6C3.94249 6.0293 3.91972 6.01887 4.02463 6.0103C4.14122 6.00078 4.30347 6 4.6 6V4ZM4 6L3.09202 4.21799C2.71569 4.40973 2.40973 4.71569 2.21799 5.09202L4 6ZM20.3668 4.86241L12 11.7079L13.2665 13.2559L21.6332 6.41033L20.3668 4.86241ZM12 11.7079L3.63324 4.86241L2.36676 6.41033L10.7335 13.2559L12 11.7079ZM12 11.7079L12 11.7079L10.7335 13.2559C11.4703 13.8586 12.5297 13.8586 13.2665 13.2559L12 11.7079Z"
                  fill="currentColor"
                ></path>
              </svg>
              <input
                id="email-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="placeholder:text-text-muted text-text-primary h-full w-full min-w-0 bg-transparent text-sm font-medium outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!email.trim()}
              aria-label="Send sign-in code"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-150 ${email.trim()
                ? 'border-primary/40 bg-[#162a1f] hover:bg-[#1a3827] text-primary cursor-pointer'
                : 'border-[#202227] bg-[#121316] text-text-muted cursor-not-allowed'
                }`}
            >
              <svg aria-hidden="true" width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14 6L20 12L14 18M19 12H4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center w-full my-1">
          <div className="bg-[#202227] h-px flex-grow"></div>
          <span className="text-text-muted mx-3 text-xs font-semibold">or connect a wallet</span>
          <div className="bg-[#202227] h-px flex-grow"></div>
        </div>

        {/* Wallets connection block */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            {/* Phantom */}
            <button
              type="button"
              onClick={() => handleWalletSelect('Phantom')}
              className="border-[#202227] bg-[#121316] hover:bg-[#181a1f] flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-150 hover:-translate-y-px"
            >
              <img
                alt="Phantom"
                width="28"
                height="28"
                className="h-7 w-7 shrink-0 rounded-lg object-contain"
                src="/Images/phantom.svg"
              />
              <span className="text-sm font-semibold text-[#FAFAFA]">Phantom</span>
              {isInstalled(phantomWallet) && (
                <span className="ml-auto inline-flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-400">
                    <span className="size-1 rounded-full bg-green-400 animate-pulse"></span>
                    Detected
                  </span>
                </span>
              )}
            </button>

            {/* MetaMask Standard */}
            <button
              type="button"
              onClick={() => handleWalletSelect('MetaMask')}
              className="border-[#202227] bg-[#121316] hover:bg-[#181a1f] flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-150 hover:-translate-y-px"
            >
              <img
                alt="MetaMask"
                width="28"
                height="28"
                className="h-7 w-7 shrink-0 rounded-lg object-contain"
                src="/Images/metamask.svg"
              />
              <span className="text-sm font-semibold text-[#FAFAFA]">MetaMask</span>
              {isInstalled(metamaskWallet) && (
                <span className="ml-auto inline-flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-400">
                    <span className="size-1 rounded-full bg-green-400 animate-pulse"></span>
                    Detected
                  </span>
                </span>
              )}
            </button>

            {/* MetaMask Solana Snap */}
            <button
              type="button"
              onClick={() => handleWalletSelect('MetaMask')}
              className="border-[#202227] bg-[#121316] hover:bg-[#181a1f] flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-150 hover:-translate-y-px"
            >
              <img
                alt="MetaMask"
                width="28"
                height="28"
                className="h-7 w-7 shrink-0 rounded-lg object-contain"
                src="/Images/metamask.svg" />
              <span className="text-sm font-semibold text-[#FAFAFA]">MetaMask</span>
              {isInstalled(metamaskWallet) && (
                <span className="ml-auto inline-flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-400">
                    <span className="size-1 rounded-full bg-green-400 animate-pulse"></span>
                    Detected
                  </span>
                </span>
              )}
            </button>

            {/* More wallets button */}
            <button
              type="button"
              onClick={() => setShowAllWallets((prev) => !prev)}
              className="border-[#202227] bg-[#121316] hover:bg-[#181a1f] flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-150 hover:-translate-y-px"
            >
              <div className="bg-[#1c1e22] border border-[#2d3037] text-text-muted flex h-7 w-7 items-center justify-center rounded-lg">
                <svg aria-hidden="true" width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6ZM20 6H4V7H20V6ZM20 9H4V10H9C9.55228 10 10 10.4477 10 11V12H14V11C14 10.4477 14.4477 10 15 10H20V9Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#FAFAFA]">
                {showAllWallets ? 'Fewer wallets' : 'More wallets'}
              </span>
              <svg
                className={`text-text-muted ml-auto transition-transform duration-200 ${showAllWallets ? 'rotate-90' : ''
                  }`}
                aria-hidden="true"
                width="16px"
                height="16px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 4L16.2929 11.2929C16.6834 11.6834 16.6834 12.3166 16.2929 12.7071L9 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>
          </div>

          {/* More wallets dynamic drawer */}
          {showAllWallets && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#202227]/40 max-h-[220px] overflow-y-auto custom-scrollbar">
              {/* Dynamic rendering of other standard wallets like Solflare */}
              {wallets.map((wallet) => {
                const name = wallet.adapter.name;
                // Exclude Phantom and MetaMask from this list as they have prominent rows
                if (
                  name.toLowerCase().includes('phantom') ||
                  name.toLowerCase().includes('metamask')
                ) {
                  return null;
                }

                const detected = wallet.readyState === 'Installed' || wallet.readyState === 'Loadable';

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      select(name);
                    }}
                    className="border-[#202227]/60 bg-[#0f1013] hover:bg-[#15171c] flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all duration-150"
                  >
                    <img
                      alt={name}
                      width="24"
                      height="24"
                      className="h-6 w-6 shrink-0 rounded-md object-contain"
                      src={wallet.adapter.icon}
                    />
                    <span className="text-sm font-medium text-text-primary">{name}</span>
                    {detected && (
                      <span className="ml-auto inline-flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-green-400">
                          <span className="size-1 rounded-full bg-green-400"></span>
                          Detected
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}

              {/* In case no other wallets are registered, show a helper */}
              {wallets.filter(
                (w) =>
                  !w.adapter.name.toLowerCase().includes('phantom') &&
                  !w.adapter.name.toLowerCase().includes('metamask')
              ).length === 0 && (
                  <div className="text-center py-4 text-xs text-text-muted">
                    No other wallet extensions detected in this browser.
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
