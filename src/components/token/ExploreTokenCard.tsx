import { memo, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { formatMarketCap, formatAddress, formatTimeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Token } from '@/types';

interface ExploreTokenCardProps {
  token: Token;
  index?: number;
  className?: string;
}

/* ─── helpers ─────────────────────────────────────────────── */

function getWatchlist(): string[] {
  try { return JSON.parse(localStorage.getItem('pump_watchlist') || '[]'); }
  catch { return []; }
}

function getLists(): string[] {
  try { return JSON.parse(localStorage.getItem('pump_lists') || '["Watchlist"]'); }
  catch { return ['Watchlist']; }
}

/* ─── Toast ────────────────────────────────────────────────── */

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return createPortal(
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-[#1A1A2E] border border-[#3A3B40] text-white text-sm px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in pointer-events-none">
      <svg className="w-4 h-4 text-[#86EFAC] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>,
    document.body,
  );
}

/* ─── Manage Lists Modal ───────────────────────────────────── */

function ListItem({
  name,
  onRename,
  onDelete,
}: {
  name: string;
  onRename: (next: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(name);
  const [confirming, setConfirming] = useState(false);

  const commitEdit = () => {
    const v = editVal.trim();
    if (v && v !== name) onRename(v);
    setEditing(false);
  };

  if (confirming) {
    return (
      <div className="flex h-10 items-center gap-3 rounded px-2">
        <span className="text-sm text-red-400 font-medium flex-1">Are you sure?</span>
        <button
          onClick={() => { onDelete(); setConfirming(false); }}
          className="h-7 px-3 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition-colors"
        >
          Yes
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          No, cancel
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex h-10 items-center gap-2 rounded px-2 bg-slate-800">
        <input
          autoFocus
          className="flex-1 bg-transparent text-sm text-white focus:outline-none"
          value={editVal}
          onChange={e => setEditVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') setEditing(false);
          }}
        />
        {/* confirm */}
        <button onClick={commitEdit} className="text-[#86EFAC] hover:text-white transition-colors p-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
        {/* cancel */}
        <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-red-400 transition-colors p-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="group flex h-10 items-center gap-2 rounded px-2 hover:bg-slate-800 transition-colors">
      <span className="flex-1 text-sm text-white">{name}</span>
      {/* pencil */}
      <button
        onClick={() => { setEditVal(name); setEditing(true); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-white rounded"
        title="Rename"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      {/* bin */}
      <button
        onClick={() => setConfirming(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded"
        title="Delete"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" /><path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  );
}

function ManageListsModal({ onClose }: { onClose: () => void }) {
  const [lists, setLists] = useState<string[]>(getLists);
  const [input, setInput] = useState('');

  const save = (updated: string[]) => {
    setLists(updated);
    localStorage.setItem('pump_lists', JSON.stringify(updated));
  };

  const handleCreate = () => {
    const name = input.trim();
    if (!name || lists.includes(name)) return;
    save([...lists, name]);
    setInput('');
  };

  const handleRename = (idx: number, next: string) => {
    const updated = lists.map((l, i) => (i === idx ? next : l));
    save(updated);
  };

  const handleDelete = (idx: number) => {
    save(lists.filter((_, i) => i !== idx));
  };

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-[22px] bg-slate-950 border border-slate-800/60 p-6 text-white shadow-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 transition-colors hover:bg-slate-800"
        >
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-400">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>

        {/* header */}
        <div className="mb-5">
          <h2 className="text-[18px] font-semibold text-gray-200 mb-1">Manage lists</h2>
          <p className="text-[14px] text-gray-400">Create new lists or manage your existing lists here</p>
        </div>

        <div className="space-y-4">
          {/* create row */}
          <div className="flex gap-2">
            <input
              className="flex-1 h-10 rounded-md border border-slate-700 bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Add new list..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className="h-10 px-4 flex items-center gap-1.5 bg-[#86EFAC] hover:bg-[#6EE7A0] font-[Inter] text-black text-[14px] font-semibold rounded-md transition-colors shrink-0"
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M5 12h14" /><path d="M12 5v14" />
              </svg>
              Create new list
            </button>
          </div>

          {/* existing lists */}
          <div className="max-h-[300px] space-y-1 overflow-y-auto py-1">
            {lists.map((list, idx) => (
              <ListItem
                key={list + idx}
                name={list}
                onRename={next => handleRename(idx, next)}
                onDelete={() => handleDelete(idx)}
              />
            ))}
            {lists.length === 0 && (
              <p className="flex h-7 flex-1 items-center px-1 py-0  font-[Inter] text-[#fff] text-[14px]">Watchlist</p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Shared LIVE Badge ────────────────────────────────────── */

function LiveBadge() {
  return (
    <div
      className="flex items-center gap-[3px] font-bold text-[10px] tracking-wide rounded shrink-0"
      style={{
        background: '#86EFAC',
        color: '#052E16',
        paddingLeft: 5,
        paddingRight: 6,
        height: 20,
      }}
    >
      {/* signal / wifi icon */}
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      {/* pulsing dot */}
      <span className="relative flex h-[5px] w-[5px] shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#052E16] opacity-60" />
        <span className="relative inline-flex rounded-full h-[5px] w-[5px] bg-[#052E16]" />
      </span>
      LIVE
    </div>
  );
}

/* ─── Main Card ────────────────────────────────────────────── */

/** Image-forward grid card — pump.fun explore style. */
export const ExploreTokenCard = memo(function ExploreTokenCard({
  token,
  index = 0,
  className,
}: ExploreTokenCardProps): JSX.Element {
  const initial = (token.symbol || token.name || '?').slice(0, 1).toUpperCase();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [watchlisted, setWatchlisted] = useState(() =>
    getWatchlist().includes(token.mintAddress),
  );

  // LIVE cycle
  const CYCLE_MS = 3000;
  const [tick, setTick] = useState(() => Math.floor(Date.now() / CYCLE_MS));
  useEffect(() => {
    const timer = setInterval(() => setTick(Math.floor(Date.now() / CYCLE_MS)), CYCLE_MS);
    return () => clearInterval(timer);
  }, []);
  const isLive = tick % 8 === index;

  const handleWatchlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = getWatchlist();
    if (watchlisted) {
      const updated = current.filter((id: string) => id !== token.mintAddress);
      localStorage.setItem('pump_watchlist', JSON.stringify(updated));
      setWatchlisted(false);
      setToast('Removed from Watchlist');
    } else {
      const updated = [...current, token.mintAddress];
      localStorage.setItem('pump_watchlist', JSON.stringify(updated));
      setWatchlisted(true);
      setToast('Added to Watchlist ✓');
    }
    setIsMenuOpen(false);
  }, [watchlisted, token.mintAddress]);

  const openModal = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setShowModal(true);
  }, []);

  return (
    <>
      {/* Portal: toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      {/* Portal: modal */}
      {showModal && <ManageListsModal onClose={() => setShowModal(false)} />}

      <Link
        to={`/token/${token.mintAddress}`}
        className={cn(
          'group flex flex-col gap-y-3 w-full snap-start animate-fade-in motion-reduce:animate-none font-["Inter"]',
          className,
        )}
        style={{ animationDelay: `${Math.min(index, 24) * 15}ms`, animationFillMode: 'backwards' }}
      >
        <div
          className={cn(
            'relative w-[222px] h-[222px] shrink-0 rounded-[12px] overflow-hidden transition-transform duration-200 group-hover:scale-[1.02] border',
            isLive ? 'border-[#5FE992]' : 'border-[#27272A]',
          )}
        >
          {/* card image */}
          {token.imageUrl ? (
            <img
              src={token.imageUrl}
              alt={token.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#18181B] to-[#111111] text-4xl font-bold text-[#A1A1AA]">
              {initial}
            </div>
          )}

          {/* Green line graph on hover */}
          <div className="absolute bottom-2 left-0 right-2 h-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" className="drop-shadow-[0_0_4px_rgba(95,233,146,0.8)]">
              <path
                d="M20,35 L25,32 L30,36 L35,30 L40,34 L45,28 L50,30 L55,18 L60,25 L65,12 L70,20 L75,8 L80,15 L85,22 L90,12 L95,18 L100,8"
                fill="none"
                stroke="#5FE992"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* ── TOP-RIGHT: LIVE badge (when live) + star button (always) ── */}
          <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5">
            {/* LIVE badge — only when live */}
            {isLive && <LiveBadge />}

            {/* Star / watchlist button — always visible */}
            <div className="relative">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(prev => !prev); }}
                className={cn(
                  'transition-colors p-1 drop-shadow-md',
                  watchlisted ? 'text-[#86EFAC]' : 'text-[#FAFAFA]/70 hover:text-[#FAFAFA]',
                )}
              >
                <svg
                  stroke="currentColor"
                  fill={watchlisted ? 'currentColor' : 'none'}
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn('h-5 w-5', watchlisted && 'text-[#86EFAC]')}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>

              {/* dropdown menu */}
              {isMenuOpen && (
                <div
                  className="absolute top-full right-0 mt-1 w-44 rounded-lg bg-[#24252C] border border-[#3A3B40] shadow-xl py-1 overflow-hidden"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  {/* Watchlist */}
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#FAFAFA] hover:bg-[#3A3B40] transition-colors"
                    onClick={handleWatchlist}
                  >
                    <svg
                      stroke="currentColor"
                      fill={watchlisted ? 'currentColor' : 'none'}
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={cn('h-4 w-4', watchlisted && 'text-[#FAFAFA]')}
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Watchlist
                    {watchlisted && (
                      <svg className="ml-auto h-3.5 w-3.5 text-[#FAFAFA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>

                  {/* Manage lists */}
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#FAFAFA] hover:bg-[#3A3B40] transition-colors"
                    onClick={openModal}
                  >
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Manage lists
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Token info ── */}
        <div className="flex flex-col">
          <p className="text-[16px] font-semibold text-[#FAFAFA] leading-tight truncate">
            {token.name || 'Unnamed'}
          </p>
          <p className="text-[14px] text-[#A1A1AA] leading-tight truncate mt-0.5">
            {token.symbol}
          </p>

          <p className="text-[16px] font-semibold text-[#FAFAFA] leading-tight mt-1.5">
            {(() => {
              const value = formatMarketCap(token.marketCapUsd);
              return value?.startsWith('$') ? value : `$${value}`;
            })()}{' '}
            <span className="text-[14px] text-[#A1A1AA] font-normal">MC</span>
          </p>

          <div className="flex items-center gap-1.5 mt-2 text-[14px] text-[#A1A1AA]">
            {token.imageUrl ? (
              <img src={token.imageUrl} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 shrink-0" />
            )}
            <span className="truncate">{formatAddress(token.creatorAddress, 4, 2) || 'Creator'}</span>
            <span className="shrink-0 flex items-center gap-1 ml-0.5">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="h-3 w-3 text-[#A1A1AA]" xmlns="http://www.w3.org/2000/svg">
                <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
              </svg>
              {formatTimeAgo(token.createdAt)}
            </span>
          </div>

          {token.description ? (
            <p className="mt-1.5 w-full line-clamp-2 text-[14px] text-[#A1A1AA] text-left leading-snug">
              {token.description}
            </p>
          ) : null}
        </div>
      </Link>
    </>
  );
});
