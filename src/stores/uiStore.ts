import { create } from 'zustand';

const SIDEBAR_LS_KEY = 'pump-clone-sidebar-collapsed';

function loadSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(SIDEBAR_LS_KEY) === '1';
  } catch {
    return false;
  }
}

function persistSidebarCollapsed(v: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SIDEBAR_LS_KEY, v ? '1' : '0');
  } catch {
    /* ignore quota / private-mode errors */
  }
}

interface UiState {
  /** Default slippage in basis points (100 = 1%). User-tunable in the trade panel. */
  slippageBps: number;
  setSlippageBps: (bps: number) => void;
  priorityFeeMode: 'auto' | 'fast' | 'turbo';
  setPriorityFeeMode: (m: 'auto' | 'fast' | 'turbo') => void;

  /** Desktop sidebar collapsed (icon-only) state — persisted to localStorage. */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;

  /** Mobile-only: sidebar drawer is open. Not persisted (transient). */
  sidebarOpenMobile: boolean;
  setSidebarOpenMobile: (v: boolean) => void;

  /** Global support widget visibility */
  supportWidgetOpen: boolean;
  setSupportWidgetOpen: (v: boolean) => void;

  /** Search modal visibility */
  searchModalOpen: boolean;
  setSearchModalOpen: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  slippageBps: 100, // 1%
  setSlippageBps: (bps: number) => set({ slippageBps: bps }),
  priorityFeeMode: 'auto',
  setPriorityFeeMode: (m) => set({ priorityFeeMode: m }),

  sidebarCollapsed: loadSidebarCollapsed(),
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    persistSidebarCollapsed(next);
    set({ sidebarCollapsed: next });
  },
  setSidebarCollapsed: (v: boolean) => {
    persistSidebarCollapsed(v);
    set({ sidebarCollapsed: v });
  },

  sidebarOpenMobile: false,
  setSidebarOpenMobile: (v: boolean) => set({ sidebarOpenMobile: v }),

  supportWidgetOpen: false,
  setSupportWidgetOpen: (v: boolean) => set({ supportWidgetOpen: v }),

  searchModalOpen: false,
  setSearchModalOpen: (v: boolean) => set({ searchModalOpen: v }),
}));
