import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, Mic, Plus, Search, Users, X } from 'lucide-react';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';
import { WalletMenu } from '@/components/wallet/WalletMenu';
import { BalanceMenu } from '@/components/wallet/BalanceMenu';
import { useUiStore } from '@/stores/uiStore';

const PROMO_KEY = 'pump-clone-promo-dismissed';

export function TopBar(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') ?? '');
  const [promoOpen, setPromoOpen] = useState(() => !localStorage.getItem(PROMO_KEY));
  const openMobileSidebar = useUiStore((s) => s.setSidebarOpenMobile);

  useEffect(() => {
    setQuery(searchParams.get('search') ?? '');
  }, [searchParams]);

  const submitSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams(searchParams);
    if (trimmed) params.set('search', trimmed);
    else params.delete('search');
    navigate({ pathname: '/', search: params.toString() });
  };

  return (
    <header className="flex flex-col sticky top-0 left-0 z-20 bg-bg-primary border-b border-border-secondary">
      {promoOpen ? (
        <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs bg-surface border-b border-border text-text-muted">
          <a
            className="text-[14px] font-medium text-[#FAFAFA] truncate hover:underline"
            href="https://app.pump.fun/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Trade faster. Pump is better on mobile.
          </a>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(PROMO_KEY, '1');
              setPromoOpen(false);
            }}
            className="p-1 rounded hover:bg-surface-elevated text-text-muted hover:text-text-primary"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* ── Main nav row — 68 px tall, 3-column layout matching pump.fun ── */}
      <div className="flex items-center px-4 lg:px-6 h-[68px] w-full">
        <div className="flex items-center justify-between w-full h-full gap-x-3">

          {/* LEFT: mobile logo + desktop search */}
          <div className="flex items-center justify-start h-full grow-[2] basis-0 gap-x-3 min-w-0 max-lg:basis-auto">

            {/* Mobile logo — hidden on md+ */}
            <Link
              to="/"
              className="items-center justify-center shrink-0 hidden max-md:flex"
              aria-label="Home"
            >
              <span className="font-bold text-sm text-text-primary">{env.platformName}</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => openMobileSidebar(true)}
              aria-label="Open navigation"
              className="lg:hidden p-2 rounded-lg border border-border bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop search — hidden on lg and below */}
            <div className="flex items-center w-full max-w-[500px] max-lg:hidden gap-2">
              <form onSubmit={submitSearch} className="w-full">
                <div
                  className="relative flex h-10 w-full items-center rounded-lg bg-surface-elevated border border-border transition-colors hover:bg-surface"
                  role="search"
                >
                  <Search className="absolute left-3 shrink-0 h-[18px] w-[18px] text-text-muted pointer-events-none" aria-hidden />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for coins..."
                    className={cn(
                      'h-full w-full min-w-0 bg-transparent pl-10 pr-20',
                      'text-sm text-text-primary placeholder:text-text-muted',
                      'focus:outline-none',
                    )}
                  />
                  <div className="absolute right-3 hidden gap-1 sm:flex pointer-events-none">
                    <kbd className="inline-flex items-center justify-center h-5 min-w-5 rounded-sm border border-border bg-surface px-1 font-sans text-[11px] font-medium text-text-muted">⌘</kbd>
                    <kbd className="inline-flex items-center justify-center h-5 min-w-5 rounded-sm border border-border bg-surface px-1 font-sans text-[11px] font-medium text-text-muted">K</kbd>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: action buttons */}
          <div className="flex items-center justify-end h-full grow-[1] basis-0 gap-x-2 min-w-0 max-lg:grow-0 max-lg:basis-auto">

            {/* Mobile search icon — hidden on lg+ */}
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                navigate({ pathname: '/', search: params.toString() });
              }}
              aria-label="Search"
              className={cn(
                'hidden max-lg:grid place-items-center',
                'h-10 w-10 rounded-lg border border-border bg-surface-elevated',
                'text-text-muted hover:text-text-primary transition-colors',
              )}
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>

            {/* Voice chat */}
            <VoiceChatPill />

            {/* Create — label on lg+, icon-only below */}
            <Link to="/create" className="max-[480px]:hidden">
              {/* Desktop label */}
              <button
                type="button"
                className={cn(
                  'hidden lg:inline-flex items-center gap-2',
                  'h-10 px-4 rounded-lg border border-border bg-surface-elevated',
                  'text-[14px] font-medium text-text-primary hover:bg-surface transition-colors',
                )}
              >
                <Plus className="h-5 w-5" aria-hidden />
                <span>Create</span>
              </button>
              {/* Mobile icon-only */}
              <button
                type="button"
                aria-label="Create"
                className={cn(
                  'lg:hidden grid place-items-center',
                  'h-10 w-10 rounded-lg border border-border bg-surface-elevated',
                  'text-text-muted hover:text-text-primary transition-colors',
                )}
              >
                <Plus className="h-5 w-5" aria-hidden />
              </button>
            </Link>

            {/* Balance Dropdown */}
            <BalanceMenu />

            {/* Wallet / sign-in */}
            <WalletMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
interface Room {
  id: string;
  name: string;
  current: number;
  max: number;
}

const GENERAL_ROOMS: Room[] = [
  { id: 'g1', name: 'General 1', current: 8,  max: 50 },
  { id: 'g2', name: 'General 2', current: 1,  max: 50 },
  { id: 'g3', name: 'General 3', current: 0,  max: 50 },
];

const SQUAD_ROOMS: Room[] = [
  { id: 's1', name: 'Squad 1', current: 0, max: 4 },
  { id: 's2', name: 'Squad 2', current: 0, max: 4 },
];

/* ─────────────────────────────────────────────
   VoiceChatPill
───────────────────────────────────────────── */
function VoiceChatPill(): JSX.Element {
  const hasNotification = true;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  /* close popover on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popoverOpen]);

  function handleRoomClick(room: Room) {
    setSelectedRoom(room);
    setPopoverOpen(false);
    setProfileOpen(true);
  }

  const totalRooms = GENERAL_ROOMS.length + SQUAD_ROOMS.length;

  return (
    <>
      <div ref={popoverRef} className="relative">
        {/* Desktop */}
        <button
          type="button"
          aria-label="Voice chat"
          onClick={() => setPopoverOpen((v) => !v)}
          className={cn(
            'hidden lg:inline-flex items-center gap-2',
            'h-10 px-4 rounded-lg border border-border bg-surface-elevated',
            'text-sm font-medium text-text-primary hover:bg-surface transition-colors',
          )}
        >
          <Mic className="h-5 w-5" aria-hidden />
          <span>Voice chat</span>
        </button>

        {/* Mobile */}
        <button
          type="button"
          aria-label="Voice chat"
          onClick={() => setPopoverOpen((v) => !v)}
          className={cn(
            'lg:hidden grid place-items-center',
            'h-10 w-10 rounded-lg border border-border bg-surface-elevated',
            'text-text-muted hover:text-text-primary transition-colors',
          )}
        >
          <Mic className="h-5 w-5" aria-hidden />
        </button>

        {/* Notification dot */}
        {hasNotification && (
          <span
            aria-hidden
            className="pointer-events-none absolute right-0.5 top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-bg-primary"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-red-500" />
            </span>
          </span>
        )}

        {/* ── Popover ── */}
{popoverOpen && (
  <>
    {/* BACKDROP LAYER (fixes your issue) */}
    <div
      className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
      onClick={() => setPopoverOpen(false)}
    />

    {/* POPOVER */}
    <div
      role="dialog"
      className={cn(
        "absolute right-0 top-[calc(100%+8px)] z-[1000]",
        "w-[320px] overflow-hidden rounded-lg",
        "border border-border-tertiary bg-[#18191B] shadow-md outline-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border-tertiary px-4 py-3">
        <Mic className="h-5 w-5 text-text-primary" />
        <h3 className="font-semibold text-text-primary">Voice chats</h3>
        <span className="ml-auto text-xs text-text-tertiary">
          {totalRooms} rooms
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex max-h-[320px] flex-col overflow-y-auto p-2">
        {/* General */}
        <div className="flex flex-col">
          <div className="flex items-center gap-x-2 px-2 py-1.5">
            <Mic className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="text-[11px] font-semibold uppercase text-text-tertiary">
              General
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {GENERAL_ROOMS.map((room) => (
              <RoomButton
                key={room.id}
                room={room}
                onClick={() => handleRoomClick(room)}
              />
            ))}
          </div>
        </div>

        {/* Squad */}
        <div className="border-t border-border-tertiary pt-3">
          <div className="flex items-center gap-x-2 px-2 py-1.5">
            <Users className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="text-[11px] font-semibold uppercase text-text-tertiary">
              Squad
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {SQUAD_ROOMS.map((room) => (
              <RoomButton
                key={room.id}
                room={room}
                onClick={() => handleRoomClick(room)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-border-tertiary px-4 py-2.5">
        <p className="text-center text-xs text-text-tertiary">
          Join a room to start talking with others
        </p>
      </div>
    </div>
  </>
)}
      </div>

      {/* ── Profile Claim Modal ── */}
      {profileOpen && (
        <ClaimProfileModal
          room={selectedRoom}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   Room button row
───────────────────────────────────────────── */
function RoomButton({ room, onClick }: { room: Room; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-200 cursor-pointer hover:bg-bg-tertiary"
    >
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-medium text-text-primary">{room.name}</span>
        </div>
        <span className="text-[11px] leading-snug text-text-tertiary">Click to join</span>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-text-primary">
        {room.current}/{room.max}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────
   Claim Profile Modal
───────────────────────────────────────────── */
const AVATAR_LAYERS = [
  'https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Backgrounds/Pink/600x600',
  'https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Bodies/Body-3-Red/600x600',
  'https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Face-expressions/Face-7/600x600',
  'https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Face-Accessories/Blush/600x600',
  'https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Head-accessories/Leafs-Yellow/600x600',
  'https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Arm-Accessories/Bracelet-green/600x600',
  'https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Accessories/Bowtie-Red/600x600',
];

function ClaimProfileModal({ room, onClose }: { room: Room | null; onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSave = username.trim().length > 0;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function handleSave() {
    if (!canSave) return;
    // In a real app this would submit to backend
    alert(`Joining ${room?.name ?? 'room'} as @${username.trim()}!`);
    onClose();
  }

  /* close on backdrop click */
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-[340px] rounded-2xl border border-border-secondary bg-bg-primary shadow-2xl overflow-hidden mx-4">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-bg-secondary text-text-tertiary hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex flex-col items-center gap-5 p-6 pt-8 text-center">

          {/* Avatar */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative shrink-0 rounded-full outline-none transition-transform duration-300 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-bg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary size-28"
            aria-label="Change profile image"
          >
            {/* glow ring */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-bg-accent/70 via-white/10 to-transparent opacity-70 blur-sm transition-opacity group-hover:opacity-100" />

            {/* avatar layers */}
            <div className="overflow-hidden relative rounded-full border border-border-secondary bg-bg-secondary object-cover shadow-xl size-28">
              <div className="absolute inset-0 origin-center" style={{ transform: 'scale(1.6) translate(1%, 18%)' }}>
                {previewUrl ? (
                  <img className="absolute inset-0 h-full w-full object-cover" src={previewUrl} alt="Profile" />
                ) : (
                  AVATAR_LAYERS.map((src, i) => (
                    <img key={i} width={112} height={112} className="absolute inset-0 h-full w-full object-cover" alt="" src={src} />
                  ))
                )}
              </div>
            </div>

            {/* camera badge */}
            <span className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full border-2 border-bg-primary bg-bg-accent text-bg-primary shadow-lg transition-transform duration-200 group-hover:rotate-6 group-hover:scale-105 size-9">
              <svg className="size-4" aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7H6.96482C7.29917 7 7.6114 6.8329 7.79687 6.5547L9.20313 4.4453C9.3886 4.1671 9.70083 4 10.0352 4H13.9648C14.2992 4 14.6114 4.1671 14.7969 4.4453L16.2031 6.5547C16.3886 6.8329 16.7008 7 17.0352 7H20C20.5523 7 21 7.44772 21 8V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V8C3 7.44772 3.44772 7 4 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round" />
                <path d="M15 13C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round" />
              </svg>
            </span>

            <input
              ref={fileRef}
              id="voice-chat-profile-image-input"
              className="sr-only"
              tabIndex={-1}
              accept="image/*"
              type="file"
              onChange={handleFile}
            />
          </button>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-text-primary">
              Claim your Pump Profile
            </h2>
            {room && (
              <p className="mt-1 text-xs text-text-tertiary">Joining <span className="text-text-secondary font-medium">{room.name}</span></p>
            )}
          </div>

          {/* Username input */}
          <div className="rounded-2xl border border-border-secondary/70 bg-bg-secondary/40 p-4 transition-colors duration-200 focus-within:border-bg-accent/70 focus-within:bg-bg-secondary/70 w-full text-left">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary"
                htmlFor="voice-chat-username-input"
              >
                Username <span className="text-red-400">*</span>
              </label>
              <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[11px] text-text-tertiary">15 max</span>
            </div>
            <input
              id="voice-chat-username-input"
              maxLength={15}
              placeholder="Choose a handle"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn(
                'w-full h-12 rounded-lg border border-border-secondary bg-bg-primary/80',
                'px-3 text-base font-medium text-text-primary text-center',
                'placeholder:text-text-muted shadow-inner transition-shadow outline-none',
                'focus:ring-2 focus:ring-bg-accent/50',
              )}
            />
          </div>

          {/* Save */}
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={cn(
              'w-full h-10 rounded-lg font-semibold text-sm transition-all duration-200',
              'shadow-lg shadow-bg-accent/10 hover:scale-[1.01]',
              canSave
                ? 'bg-bg-accent text-bg-primary hover:opacity-90 cursor-pointer'
                : 'bg-bg-tertiary text-text-tertiary cursor-not-allowed opacity-60',
            )}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
