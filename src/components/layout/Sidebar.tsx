import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Loader2,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Radio,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useSolBalance } from "@/hooks/useBalances";
import { useUiStore } from "@/stores/uiStore";
import { formatSol } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { useTokens } from "@/hooks/useTokens";
import type { Token } from "@/types/token";
import toast from "react-hot-toast";

const NAV = [
  { to: "/", label: "Home", icon: "/Images/Sidedrawer/home.svg", isImage: true, end: true },
  {
    to: "/callouts",
    label: "Callouts",
    icon: "/Images/Sidedrawer/callout.svg",
    isImage: true,
    end: false,
  },
  { to: "/live", label: "Live", icon: "/Images/Sidedrawer/live.svg", isImage: true, end: false },
  {
    to: "/support",
    label: "Support",
    icon: "/Images/Sidedrawer/support.svg",
    isImage: true,
    end: false,
  },
  {
    to: "/terminal",
    label: "Terminal",
    icon: "/Images/Sidedrawer/terminal.svg",
    isImage: true,
    end: false,
  },
  // {
  //   to: "/?sort=trending",
  //   label: "Trending",
  //   icon: TrendingUp,
  //   isImage: false,
  //   end: false,
  // },
  // {
  //   to: "/how-it-works",
  //   label: "How it works",
  //   icon: BookOpen,
  //   isImage: false,
  //   end: false,
  // },
] as const;

/**
 * Two modes, one component:
 *   - Desktop (lg+): static flex child, width animates between 72px and 220px
 *     via the persisted `sidebarCollapsed` flag in uiStore.
 *   - Mobile: fixed-positioned drawer that slides in from the left when the
 *     `sidebarOpenMobile` flag is true (set by the hamburger button in TopBar).
 *
 * The mobile drawer auto-closes on route change, on Esc, and on backdrop tap.
 * The desktop "collapsed" state never applies on mobile — the drawer always
 * renders full-width labels so taps are easy.
 */
const formatMcap = (val: number): string => {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
};

export function Sidebar(): JSX.Element {
  const { publicKey } = useWallet();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleDesktop = useUiStore((s) => s.toggleSidebar);
  const mobileOpen = useUiStore((s) => s.sidebarOpenMobile);
  const setMobileOpen = useUiStore((s) => s.setSidebarOpenMobile);
  const setSupportWidgetOpen = useUiStore((s) => s.setSupportWidgetOpen);

  const location = useLocation();
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createTriggerRef = useRef<HTMLDivElement | null>(null);

  const [calloutModalOpen, setCalloutModalOpen] = useState(false);
  const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);
  const [tryAppModalOpen, setTryAppModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [calloutNote, setCalloutNote] = useState("");
  const navigate = useNavigate();
  const tokensQuery = useTokens({
    sort: "trending",
    search: searchQuery || undefined,
  });
  const tokenItems =
    tokensQuery.data?.pages.flatMap((page) => page.items) ?? [];

  // Close the mobile drawer and create menu when the route changes
  useEffect(() => {
    setMobileOpen(false);
    setCreateMenuOpen(false);
  }, [location.pathname, location.search, setMobileOpen]);

  // Close create menu on click outside
  useEffect(() => {
    if (!createMenuOpen) return;
    const onClick = (e: MouseEvent): void => {
      const t = e.target as Node;
      if (createTriggerRef.current?.contains(t)) return;
      setCreateMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [createMenuOpen]);

  // Close create menu on Escape
  useEffect(() => {
    if (!createMenuOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setCreateMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [createMenuOpen]);

  // Esc closes the mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, setMobileOpen]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // On mobile, the drawer always renders full-width (no icon-only mode); on
  // desktop, respect the persisted collapsed flag.
  const showCollapsedLayout = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setMobileOpen(false)}
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      <aside
        className={cn(
          "flex flex-col border-0 border-r border-[#212225] border-opacity-100 bg-[#111113] bg-opacity-100",
          // Mobile: fixed drawer that slides in/out
          "fixed inset-y-0 left-0 z-50 w-[208px]",
          "transform transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: become a normal static flex child, drop the transform,
          // pick up the persisted width animation.
          "lg:static lg:translate-x-0 lg:transform-none",
          "lg:transition-[width] lg:duration-200",
          showCollapsedLayout ? "lg:w-[72px]" : "lg:w-[208px]",
        )}
        aria-hidden={
          // The drawer is always "present" on desktop. On mobile it's only
          // accessible to assistive tech when open.
          typeof window !== "undefined" &&
          window.innerWidth < 1024 &&
          !mobileOpen
        }
      >
        <div
          className={cn(
            " flex",
            showCollapsedLayout
              ? "px-[8px] h-auto pb-[4px] pt-[16px] flex flex-col items-center gap-2"
              : "px-[8px] h-[64px] pb-[8px] pt-[16px] ",
          )}
        >
          <div className="flex items-center justify-between gap-2 w-full">
            <NavLink
              to="/"
              className={cn(
                "flex px-[14px] items-center gap-2 group min-w-0",
                showCollapsedLayout && "justify-center w-full",
              )}
              title={showCollapsedLayout ? env.platformName : undefined}
            >
              <img
                src="/Images/Sidedrawer/pump-logo.svg"
                alt="Pump Logo"
                className="h-[24px] w-[24px] object-contain"
              />

              {!showCollapsedLayout ? (
                <div className="min-w-0">
                  <svg
                    className="mt-px"
                    fill="none"
                    height="16"
                    viewBox="0 0 73 16"
                    width="73"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 12.3234V0.13617H4.31202C5.09913 0.13617 5.80639 0.300709 6.4338 0.629787C7.06121 0.947518 7.55743 1.39574 7.92247 1.97447C8.29892 2.55319 8.48714 3.22269 8.48714 3.98298C8.48714 4.74326 8.29892 5.41844 7.92247 6.00851C7.55743 6.58723 7.06121 7.04113 6.4338 7.37021C5.80639 7.68794 5.09913 7.84681 4.31202 7.84681H1.28334V5.66808H4.38046C4.77972 5.66808 5.11624 5.58865 5.39002 5.42979C5.6638 5.27092 5.86913 5.06667 6.00602 4.81702C6.14291 4.55603 6.21136 4.27801 6.21136 3.98298C6.21136 3.68794 6.14291 3.4156 6.00602 3.16596C5.86913 2.91631 5.6638 2.71206 5.39002 2.55319C5.11624 2.39433 4.77972 2.31489 4.38046 2.31489H2.31001V12.3234H0Z"
                      fill="#FAFAFA"
                    ></path>
                    <path
                      d="M12.9086 12.5957C11.8363 12.5957 11.0321 12.2667 10.496 11.6085C9.95982 10.9504 9.69174 10.0539 9.69174 8.91915V3.64255H11.9333V8.64681C11.9333 9.23688 12.0759 9.70213 12.3611 10.0426C12.6577 10.3716 13.0341 10.5362 13.4904 10.5362C13.9353 10.5362 14.3118 10.4284 14.6198 10.2128C14.9278 9.98582 15.1616 9.68511 15.3213 9.31064C15.4924 8.93617 15.578 8.52199 15.578 8.06809V3.64255H17.8195V12.3234H15.7149V11.234H15.578C15.4069 11.5064 15.1844 11.7447 14.9106 11.9489C14.6369 12.1532 14.3289 12.3121 13.9866 12.4255C13.6558 12.539 13.2965 12.5957 12.9086 12.5957Z"
                      fill="#FAFAFA"
                    ></path>
                    <path
                      d="M19.6279 12.3234V3.64255H21.7325V4.73192H21.8694C22.0519 4.45957 22.2744 4.22128 22.5368 4.01702C22.7991 3.81277 23.0957 3.6539 23.4265 3.54043C23.7688 3.42695 24.1338 3.37021 24.5216 3.37021C25.1605 3.37021 25.7023 3.51773 26.1472 3.81277C26.6035 4.1078 26.9229 4.47092 27.1054 4.90213C27.3678 4.48227 27.7385 4.12482 28.2177 3.82979C28.7082 3.5234 29.3128 3.37021 30.0314 3.37021C31.0467 3.37021 31.8053 3.6766 32.3072 4.28936C32.8206 4.90213 33.0772 5.71915 33.0772 6.74043V12.3234H30.8528V7.14894C30.8528 6.59291 30.7216 6.17305 30.4592 5.88936C30.1969 5.59433 29.8432 5.44681 29.3983 5.44681C29.0105 5.44681 28.6683 5.55461 28.3717 5.77021C28.0865 5.97447 27.864 6.26383 27.7043 6.6383C27.556 7.01277 27.4819 7.44965 27.4819 7.94894V12.3234H25.2403V7.14894C25.2403 6.59291 25.1034 6.17305 24.8296 5.88936C24.5673 5.59433 24.1908 5.44681 23.7003 5.44681C23.3353 5.44681 23.0102 5.55461 22.725 5.77021C22.4512 5.97447 22.2402 6.26383 22.0919 6.6383C21.9436 7.01277 21.8694 7.44965 21.8694 7.94894V12.3234H19.6279Z"
                      fill="#FAFAFA"
                    ></path>
                    <path
                      d="M34.826 16V3.64255H36.9307V4.69787H37.0676C37.2159 4.47092 37.4098 4.25532 37.6494 4.05106C37.9004 3.84681 38.1969 3.68227 38.5392 3.55745C38.8814 3.43262 39.2635 3.37021 39.6856 3.37021C40.4841 3.37021 41.1971 3.56879 41.8245 3.96596C42.4633 4.35177 42.9653 4.89078 43.3303 5.58298C43.7067 6.27518 43.895 7.07518 43.895 7.98298C43.895 8.89078 43.7067 9.69078 43.3303 10.383C42.9653 11.0752 42.4633 11.6199 41.8245 12.017C41.1971 12.4028 40.4841 12.5957 39.6856 12.5957C39.0582 12.5957 38.5164 12.4652 38.0601 12.2043C37.6152 11.9319 37.2843 11.6255 37.0676 11.2851H36.9307L37.0676 12.5106V16H34.826ZM39.2921 10.5362C39.7141 10.5362 40.102 10.434 40.4556 10.2298C40.8207 10.0142 41.1116 9.71347 41.3283 9.32766C41.5564 8.94184 41.6705 8.49362 41.6705 7.98298C41.6705 7.46099 41.5564 7.01277 41.3283 6.6383C41.1116 6.26383 40.8207 5.97447 40.4556 5.77021C40.102 5.55461 39.7141 5.44681 39.2921 5.44681C38.8814 5.44681 38.4935 5.55461 38.1285 5.77021C37.7749 5.97447 37.484 6.2695 37.2558 6.65532C37.0391 7.02979 36.9307 7.47234 36.9307 7.98298C36.9307 8.49362 37.0391 8.94184 37.2558 9.32766C37.484 9.70213 37.7749 9.99716 38.1285 10.2128C38.4935 10.4284 38.8814 10.5362 39.2921 10.5362Z"
                      fill="#FAFAFA"
                    ></path>
                    <path
                      d="M46.3296 12.4255C45.9189 12.4255 45.5653 12.2837 45.2687 12C44.9835 11.705 44.8409 11.3532 44.8409 10.9447C44.8409 10.5362 44.9835 10.1901 45.2687 9.90638C45.5653 9.62269 45.9189 9.48085 46.3296 9.48085C46.7402 9.48085 47.0882 9.62269 47.3733 9.90638C47.6699 10.1901 47.8182 10.5362 47.8182 10.9447C47.8182 11.3532 47.6699 11.705 47.3733 12C47.0882 12.2837 46.7402 12.4255 46.3296 12.4255Z"
                      fill="#86EFAC"
                    ></path>
                    <path
                      d="M47.9958 5.54894V3.64255H49.6384V5.54894H47.9958ZM49.5529 12.3234V3.16596C49.5529 2.51915 49.6841 1.95745 49.9464 1.48085C50.2202 1.00426 50.5967 0.641135 51.0758 0.391489C51.5663 0.130496 52.1424 0 52.804 0C53.0322 0 53.266 0.0170214 53.5056 0.0510642C53.7451 0.0851063 53.9733 0.130496 54.19 0.187234V2.36596C53.9961 2.27518 53.8079 2.20709 53.6253 2.1617C53.4428 2.11631 53.2603 2.09362 53.0778 2.09362C52.6899 2.09362 52.3762 2.20709 52.1367 2.43404C51.9085 2.64965 51.7944 2.95603 51.7944 3.35319V12.3234H49.5529ZM51.7089 5.54894V3.64255H53.9333V5.54894H51.7089Z"
                      fill="#FAFAFA"
                    ></path>
                    <path
                      d="M58.153 12.5957C57.0807 12.5957 56.2765 12.2667 55.7403 11.6085C55.2042 10.9504 54.9361 10.0539 54.9361 8.91915V3.64255H57.1776V8.64681C57.1776 9.23688 57.3202 9.70213 57.6054 10.0426C57.902 10.3716 58.2785 10.5362 58.7348 10.5362C59.1797 10.5362 59.5561 10.4284 59.8641 10.2128C60.1721 9.98582 60.406 9.68511 60.5657 9.31064C60.7368 8.93617 60.8223 8.52199 60.8223 8.06809V3.64255H63.0639V12.3234H60.9592V11.234H60.8223C60.6512 11.5064 60.4288 11.7447 60.155 11.9489C59.8812 12.1532 59.5732 12.3121 59.231 12.4255C58.9002 12.539 58.5408 12.5957 58.153 12.5957Z"
                      fill="#FAFAFA"
                    ></path>
                    <path
                      d="M64.8722 12.3234V3.64255H66.9769V4.73192H67.1138C67.3761 4.31206 67.7469 3.98298 68.226 3.74468C68.7051 3.49504 69.2241 3.37021 69.7831 3.37021C70.8554 3.37021 71.6596 3.69362 72.1958 4.34043C72.7319 4.98723 73 5.84965 73 6.92766V12.3234H70.7584V7.2C70.7584 6.63262 70.6101 6.20142 70.3135 5.90638C70.0284 5.6 69.6348 5.44681 69.1329 5.44681C68.7222 5.44681 68.3629 5.56028 68.0549 5.78723C67.7583 6.00284 67.5244 6.29787 67.3533 6.67234C67.1936 7.03546 67.1138 7.44397 67.1138 7.89787V12.3234H64.8722Z"
                      fill="#FAFAFA"
                    ></path>
                  </svg>
                  {/* <span className="text-[10px] uppercase tracking-wider text-text-muted font-mono">
                    {env.solanaNetwork}
                  </span> */}
                </div>
              ) : null}
            </NavLink>

            {/* Close (mobile) — only renders <lg */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="ml-auto p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Collapse (desktop) — only renders ≥lg */}
            {!showCollapsedLayout ? (
              <button
                type="button"
                onClick={toggleDesktop}
                aria-label="Collapse sidebar"
                className="ml-[10px] mt-[4px] h-[36px] w-[36px] justify-center items-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors hidden lg:inline-flex"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {/* Expand button — desktop-only, shows when collapsed */}
          {showCollapsedLayout ? (
            <button
              type="button"
              onClick={toggleDesktop}
              aria-label="Expand sidebar"
              className="grid place-items-center h-[36px] w-[36px] rounded-md text-text-muted  hidden lg:grid"
            >
              <PanelLeftOpen
                className="h-4 w-4"
                style={{ color: "rgb(54, 58, 63 / var(--tw-text-opacity, 1))" }}
              />
            </button>
          ) : null}
        </div>

        <nav
          className={cn(
            "p-4 pt-[8px] pb-0 flex flex-col  gap-2",
            showCollapsedLayout ? " items-stretch" : "",
          )}
        >
          {NAV.map(({ to, label, icon: Icon, isImage, end }) => (
            <NavLink
              key={to}
              to={label === "Live" || label === "Support" || label === "Terminal" ? "#" : to}
              end={end}
              onClick={(e) => {
                if (label === "Callouts") {
                  e.preventDefault();
                  navigate("/callouts");
                }
                if (label === "Live") {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = "https://pump.fun/live";
                }
                if (label === "Terminal") {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open("https://trade.padre.gg/sign-in", "_blank", "noopener,noreferrer");
                }
                if (label === "Support") {
                  e.preventDefault();
                  e.stopPropagation();
                  setSupportWidgetOpen(true);
                }
              }}
              title={showCollapsedLayout ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center leading-[1.25rem] font-[Inter] rounded-md text-[14px] font-medium transition-colors",
                  showCollapsedLayout
                    ? "justify-center h-[40px] w-[40px]"
                    : "gap-2 p-2",
                  isActive && label !== "Live" && label !== "Terminal" ? "font-medium" : "font-normal",
                  isActive && label !== "Live" && label !== "Terminal"
                    ? "text-text-[#FAFAFA] bg-[#18191B]"
                    : "text-text-[#FAFAFA]  hover:bg-[#18191B]",
                )
              }
            >
              {/* {({ isActive }) => (
                <>
                  <Icon className="h-4 w-4 shrink-0" />
                  {!showCollapsedLayout ? label : null}
                </>
              )} */}
              {({ isActive }) => (
                <>
                  {isImage ? (
                    <img
                      src={
                        isActive && label === "Home"
                          ? "/Images/Sidedrawer/homefill.svg"
                          : isActive && label === "Live"
                            ? "/Images/Sidedrawer/livefill.svg"
                            : isActive && label === "Callouts"
                              ? "/Images/Sidedrawer/calloutfill.svg"
                              : Icon
                      }
                      alt={label}
                      className={cn(
                        "shrink-0 transition-all duration-200",
                        // Apply green filter only for icons without fill version
                        isActive &&
                          label !== "Home" &&
                          label !== "Live" &&
                          label !== "Callouts" &&
                          label !== "Terminal" &&
                          label !== "Support" &&
                          "icon-active-green",
                      )}
                    />
                  ) : (
                    <Icon
                      className={cn(
                        "shrink-0",
                        isActive ? "text-[#86EFAC]" : "text-white",
                      )}
                    />
                  )}
                  {!showCollapsedLayout ? label : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          className={cn(
            "flex flex-col  gap-[12px] justify-between h-full",
            showCollapsedLayout ? "p-2 items-center" : "p-[8px] pt-[12px]",
          )}
        >
          <div
            ref={createTriggerRef}
            className="relative w-full flex flex-col items-center"
          >
            <button
              type="button"
              onClick={() => setCreateMenuOpen((prev) => !prev)}
              className="w-full border-none border-0 box-unset text-left"
              title={showCollapsedLayout ? "Create" : undefined}
            >
              {showCollapsedLayout ? (
                <span
                  className={cn(
                    "flex items-center justify-center h-[40px] w-[40px] rounded-xl",
                    "bg-[#86EFAC] text-background hover:bg-[#86EFAC] hover:bg-opacity-75 transition-colors",
                  )}
                >
                  <Plus className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  className="font-[Inter]"
                >
                  Create
                </Button>
              )}
            </button>

            {createMenuOpen && (
              <div
                className={cn(
                  "absolute left-[calc(100%+5px)] z-50 min-w-[135.89px]",
                  "rounded-[8px] border border-[#212225] bg-[#141517] p-[2px] flex flex-col shadow-2xl animate-fade-in",
                  showCollapsedLayout ? "bottom-0" : "bottom-[3px]",
                )}
              >
                <NavLink
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!showCollapsedLayout) {
                      setCreateMenuOpen(false);
                      setCalloutModalOpen(true);
                    }
                  }}
                  className="flex items-center font-medium cursor-pointer gap-[8px] py-[0px] px-[12px] h-[40px] text-[14px] font-[Inter] leading-[1.25rem] text-[white] hover:bg-[#212225] hover:bg-opacity-100 transition-colors w-full text-left rounded-[6px]"
                >
                  <img
                    src="../../../public/Images/Sidedrawer/callout.svg"
                    className="text-[white] h-[24px]"
                  />
                  <span>Callout</span>
                </NavLink>
                <NavLink
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!showCollapsedLayout) {
                      setCreateMenuOpen(false);
                      setGoLiveModalOpen(true);
                    }
                  }}
                  className="flex items-center font-medium cursor-pointer gap-[8px] py-[0px] px-[12px] h-[40px] text-[14px] font-[Inter] leading-[1.25rem] text-[white] hover:bg-[#212225] hover:bg-opacity-100 transition-colors w-full text-left rounded-[6px]"
                >
                  <img
                    src="../../../public/Images/Sidedrawer/live.svg"
                    className="text-[white] h-[24px]"
                  />
                  <span>Go live</span>
                </NavLink>
                <NavLink
                  to="/create"
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center font-medium cursor-pointer whitespace-nowrap gap-[8px] py-[0px] px-[12px] h-[40px] text-[14px] font-[Inter] leading-[1.25rem] text-[white] hover:bg-[#212225] hover:bg-opacity-100 transition-colors w-full text-left rounded-[6px]"
                >
                  <img
                    src="../../../public/Images/Sidedrawer/plus.svg"
                    className="text-[white] h-[17px]"
                  />
                  <span>Create coin</span>
                </NavLink>
              </div>
            )}
          </div>
          <button
            type="button"
            className={cn(
              "flex items-center rounded-xl bg-[#212225] justify-center gap-[8px] border border-border text-[14px] font-semibold font-medium text-text-primary hover:border-text-muted/40 transition-colors",
              showCollapsedLayout
                ? "justify-center h-[40px] w-[40px]"
                : "gap-2 h-10 px-3",
            )}
            title="Try the mobile app (coming soon)"
            onClick={() => {
              if (!showCollapsedLayout) {
                setTryAppModalOpen(true);
              }
            }}
          >
            <img src="/Images/Sidedrawer/tryapp.svg" />
            {!showCollapsedLayout ? (
              <span className="font-[Inter]">Try app</span>
            ) : null}
          </button>
          {!showCollapsedLayout && publicKey ? (
            <div className="mt-auto w-full">
              <HoldingsDrawer />
            </div>
          ) : null}
        </div>

        <Modal
          open={calloutModalOpen}
          onClose={() => {
            setCalloutModalOpen(false);
            setSearchQuery("");
            setSelectedToken(null);
            setCalloutNote("");
          }}
          className="max-w-[480px] w-full bg-[#111113] border border-[#212225] overflow-hidden p-0 shadow-2xl"
        >
          {!selectedToken ? (
            /* Pane 1: Search Coin */
            <>
              {/* Custom Header */}
              <div className="bg-[#0B150F] border-b border-[#212225] p-5 relative">
                <button
                  type="button"
                  onClick={() => {
                    setCalloutModalOpen(false);
                    setSearchQuery("");
                    setSelectedToken(null);
                    setCalloutNote("");
                  }}
                  className="absolute top-4 right-4 p-1 rounded-md text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18191B] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#22C55E]/15 shrink-0">
                    <Megaphone className="h-5 w-5 text-[#22C55E]" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#22C55E] tracking-wider uppercase font-[Inter]">
                      New Callout
                    </span>
                    <h2 className="text-lg font-bold text-[#FAFAFA] mt-0.5 font-[Inter]">
                      Make a public bullish call
                    </h2>
                    <p className="text-xs text-[#A1A1AA] mt-1.5 leading-normal font-[Inter]">
                      Pin your call to the current market cap. We'll track the
                      multiple forward so your conviction is on record.
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Body */}
              <div className="p-5 flex flex-col gap-4">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-[#A1A1AA] pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a coin by name, symbol or mint"
                    className={cn(
                      "w-full bg-[#18191B] border border-[#212225] text-[#FAFAFA] placeholder:text-[#A1A1AA]",
                      "rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#22C55E]/40 focus:ring-1 focus:ring-[#22C55E]/20 transition-all font-[Inter]",
                    )}
                    autoFocus
                  />
                </div>

                {!searchQuery ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <span className="text-sm text-[#A1A1AA] font-[Inter]">
                      Start typing to find a coin.
                    </span>
                  </div>
                ) : tokensQuery.isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Loader2 className="h-6 w-6 text-[#22C55E] animate-spin" />
                    <span className="text-xs text-[#A1A1AA] font-[Inter]">
                      Searching...
                    </span>
                  </div>
                ) : tokenItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <span className="text-sm text-[#A1A1AA] font-[Inter]">
                      No coins found matching "{searchQuery}"
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col max-h-[250px] overflow-y-auto border border-[#212225] rounded-lg divide-y divide-[#212225] bg-[#18191B]/50">
                    {tokenItems.map((token) => (
                      <button
                        key={token.id}
                        type="button"
                        onClick={() => setSelectedToken(token)}
                        className="w-full flex items-center justify-between p-3 hover:bg-[#18191B] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {token.imageUrl ? (
                            <img
                              src={token.imageUrl}
                              alt={token.name}
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="grid place-items-center h-8 w-8 rounded-lg bg-surface-elevated text-sm border border-border">
                              🪙
                            </span>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#FAFAFA] font-[Inter] leading-tight">
                              {token.name}
                            </span>
                            <span className="text-xs text-[#A1A1AA] font-mono leading-tight mt-0.5">
                              ${token.symbol}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-[#A1A1AA] font-[Inter]">
                            Market Cap
                          </span>
                          <span className="text-xs font-mono font-medium text-[#22C55E] mt-0.5">
                            {formatMcap(token.marketCapUsd)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Pane 2: Confirm Callout */
            <>
              {/* Custom Header */}
              <div className="bg-[#0B150F] border-b border-[#212225] p-5 relative">
                <button
                  type="button"
                  onClick={() => setSelectedToken(null)}
                  className="absolute top-4 left-4 p-1 rounded-md text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18191B] transition-colors flex items-center gap-1 text-xs"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCalloutModalOpen(false);
                    setSearchQuery("");
                    setSelectedToken(null);
                    setCalloutNote("");
                  }}
                  className="absolute top-4 right-4 p-1 rounded-md text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18191B] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="mt-8 flex gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#22C55E]/15 shrink-0">
                    <Megaphone className="h-5 w-5 text-[#22C55E]" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#22C55E] tracking-wider uppercase font-[Inter]">
                      Confirm Callout
                    </span>
                    <h2 className="text-lg font-bold text-[#FAFAFA] mt-0.5 font-[Inter]">
                      Publish your callout
                    </h2>
                    <p className="text-xs text-[#A1A1AA] mt-1.5 leading-normal font-[Inter]">
                      Confirm your bullish call on {selectedToken.name} ($
                      {selectedToken.symbol}) at its current valuation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Body */}
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between p-3.5 bg-[#18191B] border border-[#212225] rounded-xl">
                  <div className="flex items-center gap-3">
                    {selectedToken.imageUrl ? (
                      <img
                        src={selectedToken.imageUrl}
                        alt={selectedToken.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="grid place-items-center h-10 w-10 rounded-lg bg-surface-elevated text-lg border border-border">
                        🪙
                      </span>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#FAFAFA] font-[Inter]">
                        {selectedToken.name}
                      </span>
                      <span className="text-xs text-[#A1A1AA] font-mono mt-0.5">
                        ${selectedToken.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-[#A1A1AA] font-[Inter]">
                      Current Mcap
                    </span>
                    <span className="text-sm font-mono font-bold text-[#22C55E] mt-0.5">
                      {formatMcap(selectedToken.marketCapUsd)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#A1A1AA] font-[Inter]">
                    Optional Note
                  </label>
                  <textarea
                    value={calloutNote}
                    onChange={(e) => setCalloutNote(e.target.value)}
                    placeholder="e.g. this one's heading to $50M, mark it"
                    className={cn(
                      "w-full bg-[#18191B] border border-[#212225] text-[#FAFAFA] placeholder:text-[#A1A1AA]",
                      "rounded-lg p-3 text-sm focus:outline-none focus:border-[#22C55E]/40 focus:ring-1 focus:ring-[#22C55E]/20 transition-all font-[Inter] h-20 resize-none",
                    )}
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={() => {
                    toast.success(
                      `Callout for $${selectedToken.symbol} published!`,
                    );
                    setCalloutModalOpen(false);
                    setSearchQuery("");
                    setSelectedToken(null);
                    setCalloutNote("");
                  }}
                  fullWidth
                  size="lg"
                  className="font-[Inter] bg-[#22C55E] text-[#111113] hover:bg-[#22C55E]/80 transition-colors"
                >
                  Publish call
                </Button>
              </div>
            </>
          )}
        </Modal>
        <Modal
          open={goLiveModalOpen}
          onClose={() => setGoLiveModalOpen(false)}
          className="max-w-[600px] w-full bg-[#14151c] border border-[#272A2D] rounded-[22px] overflow-hidden p-0 shadow-2xl"
        >
          <div className="p-[4px] text-center flex flex-col gap-8 text-[#FAFAFA]">
            <img src="/Images/Sidedrawer/start-livestream-no-coins.svg" />
            <div className="flex items-center flex-col">
              <h2 className="text-[20px] font-[Inter] text-text-on-muted leading-[1.75rem] font-semibold">
                Create your coin to go live
              </h2>
              <p className="text-[14px] leading-[1.25rem] font-[Inter] text-text-secondary text-center max-w-[460px] mt-2">
                In order to start a livestream, you first need to create a coin,
                then start streaming through it. As a creator you earn a split
                of all trading fees 💰
              </p>
            </div>
            <div className="flex justify-between items-center">
              <button
                // variant="primary"
                onClick={() => setGoLiveModalOpen(false)}
                className="leading-[1.5rem] font-[Inter] font-semibold text-[14px] px-[14px] h-[40px] bg-[#212225] rounded-[12px]"
              >
                Cancel
              </button>
              <button
                variant="primary"
                onClick={() => {
                  setGoLiveModalOpen(false);
                  navigate("/create");
                }}
                className="leading-[1.5rem] font-[Inter] font-semibold text-[14px] px-[14px] h-[40px] bg-[#86EFAC] text-[#052e16] rounded-[12px]"
              >
                Create coin
              </button>
            </div>
          </div>
        </Modal>
        <Modal
          open={tryAppModalOpen}
          onClose={() => setTryAppModalOpen(false)}
          className="max-w-[402px] h-[404px] w-full bg-[#111113] border rounded-[16px] border-[#212225] overflow-hidden p-[0px] shadow-2xl"
        >
          <div className="p-[4px] flex items-center justify-center flex-col text-center text-[#FAFAFA]">
            <h2 className="text-center text-[20px] leading-[1.75rem] font-semibold text-text-primary">
              Pump is faster on the app
            </h2>
            <p className="mt-2 text-[#A1A1AA] text-[16px] text-opacity-100 mt-[8px] ">
              Scan to download
            </p>
            <img
              src="/Images/Sidedrawer/QR-try-app.svg"
              className="my-[24px] h-[200px] w-[200px]"
            />

            <Button
              variant="primary"
              onClick={() => {
                setTryAppModalOpen(false);
                window.open("https://app.pump.fun/", "_blank");
              }}
              style={{ borderRadius: "16px" }}
              className="w-full cursor-pointer h-[48px] text-[14px] font-[Inter] text-[#052e16] leading-[1.5] font-semibold rounded-[16px]"
            >
              Learn more
            </Button>
          </div>
        </Modal>
      </aside>
    </>
  );
}

/* ─── Helpers for watchlist panel ──────────────────────────── */
function getWatchlistIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem("pump_watchlist") || "[]");
  } catch {
    return [];
  }
}

function getListsForDrawer(): string[] {
  try {
    return JSON.parse(localStorage.getItem("pump_lists") || '["Watchlist"]');
  } catch {
    return ["Watchlist"];
  }
}

/* ─── Manage Lists Modal (shared, portal-based) ─────────────── */
function DrawerManageListsModal({ onClose }: { onClose: () => void }) {
  const [lists, setLists] = useState<string[]>(getListsForDrawer);
  const [input, setInput] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);

  const save = (updated: string[]) => {
    setLists(updated);
    localStorage.setItem("pump_lists", JSON.stringify(updated));
  };

  const handleCreate = () => {
    const name = input.trim();
    if (!name || lists.includes(name)) return;
    save([...lists, name]);
    setInput("");
  };

  const handleRename = (idx: number, next: string) => {
    const updated = lists.map((l, i) => (i === idx ? next : l));
    save(updated);
    setEditingIdx(null);
  };

  const handleDelete = (idx: number) => {
    save(lists.filter((_, i) => i !== idx));
    setConfirmIdx(null);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-[22px] bg-slate-950 border border-slate-800/60 p-6 text-white shadow-2xl"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 transition-colors hover:bg-slate-800"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
        <div className="mb-5">
          <h2 className="text-[18px] font-semibold text-gray-200 mb-1">
            Manage lists
          </h2>
          <p className="text-[14px] text-gray-400">
            Create new lists or manage your existing lists here
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              className="flex-1 h-10 rounded-md border border-slate-700 bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Add new list..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className="h-10 px-4 flex items-center gap-1.5 bg-[#86EFAC] hover:bg-[#6EE7A0] font-[Inter] text-black text-[14px] font-semibold rounded-md transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              Create new list
            </button>
          </div>
          <div className="max-h-[300px] space-y-1 overflow-y-auto py-1">
            {lists.map((list, idx) =>
              confirmIdx === idx ? (
                <div
                  key={list + idx}
                  className="flex h-10 items-center gap-3 rounded px-2"
                >
                  <span className="text-sm text-red-400 font-medium flex-1">
                    Are you sure?
                  </span>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="h-7 px-3 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmIdx(null)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    No, cancel
                  </button>
                </div>
              ) : editingIdx === idx ? (
                <div
                  key={list + idx}
                  className="flex h-10 items-center gap-2 rounded px-2 bg-slate-800"
                >
                  <input
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const v = editVal.trim();
                        if (v && v !== list) handleRename(idx, v);
                        else setEditingIdx(null);
                      }
                      if (e.key === "Escape") setEditingIdx(null);
                    }}
                  />
                  <button
                    onClick={() => {
                      const v = editVal.trim();
                      if (v && v !== list) handleRename(idx, v);
                      else setEditingIdx(null);
                    }}
                    className="text-[#86EFAC] hover:text-white transition-colors p-0.5"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setEditingIdx(null)}
                    className="text-gray-400 hover:text-red-400 transition-colors p-0.5"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  key={list + idx}
                  className="group flex h-10 items-center gap-2 rounded px-2 hover:bg-slate-800 transition-colors"
                >
                  <span className="flex-1 text-sm text-white">{list}</span>
                  <button
                    onClick={() => {
                      setEditVal(list);
                      setEditingIdx(idx);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-white rounded"
                    title="Rename"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmIdx(idx)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded"
                    title="Delete"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              ),
            )}
            {lists.length === 0 && (
              <p className="flex h-7 flex-1 items-center px-1 py-0 font-[Inter] text-[#fff] text-[14px]">
                Watchlist
              </p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Holdings / Watchlist Drawer ───────────────────────────── */
function HoldingsDrawer(): JSX.Element {
  const [open, setOpen] = useState(true);
  const [view, setView] = useState<"Holdings" | "Watchlist">("Watchlist");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { publicKey } = useWallet();
  const sol = useSolBalance();

  // Mock watchlist tokens using IDs from localStorage (display placeholder data)
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() =>
    getWatchlistIds(),
  );

  // Refresh watchlist when dropdown closes
  useEffect(() => {
    if (!dropdownOpen) setWatchlistIds(getWatchlistIds());
  }, [dropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // Sample watchlist items for display (static demo tokens)
  const sampleWatchlistTokens = [
    {
      id: "1",
      name: "The Wandering Walrus",
      symbol: "WALRUS",
      value: "$2.40K",
      change: null,
      img: "https://pump.mypinata.cloud/ipfs/QmXWUkymk8K2d8ry1D22ycRrW84Bk5H8R3dAgfyJLbCJbN",
    },
    {
      id: "2",
      name: "1000x",
      symbol: "1000X",
      value: "$71.3K",
      change: -5,
      img: "https://pump.mypinata.cloud/ipfs/bafkreigoan5x7rvedravjqlaz2aemyzkgjwhvao57roasf7l4ds4mblh4i",
    },
    {
      id: "3",
      name: "Neuralink",
      symbol: "NL",
      value: "$2.40K",
      change: null,
      img: "https://pump.mypinata.cloud/ipfs/bafkreic755khegsq74hpfluzp2bgacz4bcprr6wxl2g36pvc6kdcrj222e",
    },
  ];

  return (
    <>
      {showManageModal && (
        <DrawerManageListsModal onClose={() => setShowManageModal(false)} />
      )}

      <div
        className="flex flex-col bg-bg-primary transition-all flex-grow"
        style={{ borderTop: "1px solid rgba(248, 250, 252, 0.1)" }}
      >
        {/* Header row */}
        <div className="py-2 px-4" style={{ zIndex: 2 }}>
          <div className="flex items-center justify-between">
            {/* Left: dropdown trigger */}
            <div className="flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="group/trigger -m-2 flex cursor-pointer items-center p-2 min-w-[80px]"
                >
                  <span className="ml-[2px] cursor-pointer truncate text-sm text-gray-200 transition-colors hover:text-white">
                    {view}
                  </span>
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className={cn(
                      "ml-1 inline h-4 w-4 text-gray-400 transition-all duration-300 hover:text-white",
                      dropdownOpen && "rotate-180",
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-1 z-50 w-[212px] rounded-[8px] border border-[#2A2B30] bg-[#18191B] shadow-2xl overflow-hidden py-0.5">
                    <div className="max-h-[199px] overflow-y-auto">
                      {(["Holdings", "Watchlist"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setView(option);
                            setDropdownOpen(false);
                          }}
                          className="group flex w-full items-center gap-2 px-3 py-2 transition-colors hover:bg-[#3f414b] focus-visible:outline-none"
                        >
                          <span className="w-full max-w-[160px] truncate text-left text-sm text-white">
                            {option}
                          </span>
                          {view === option && (
                            <svg
                              stroke="currentColor"
                              fill="none"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 min-w-4 text-white ml-auto"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setShowManageModal(true);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white transition-colors hover:bg-[#3f414b] focus-visible:outline-none"
                      >
                        {/* Gear icon */}
                        <svg
                          stroke="currentColor"
                          fill="none"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-white"
                        >
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span className="text-sm text-white">Manage lists</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: double-chevron collapse/expand */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="group/expand -m-2 flex items-center justify-center p-2"
              title={open ? "Collapse" : "Expand"}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={cn(
                  "h-4 w-4 text-gray-400 transition-all duration-300 hover:text-white",
                  open && "rotate-180",
                )}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 15.707a1 1 0 010-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 0zm0-6a1 1 0 010-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body — collapses/expands */}
        {open && (
          <div
            className="custom-scrollbar max-h-[300px] overflow-y-auto"
            style={{ height: "auto", opacity: 1 }}
          >
            <div className="scrollbar-hide flex flex-col overflow-y-auto transition-[height] duration-300 ease-in">
              {view === "Watchlist" ? (
                <div className="flex flex-col">
                  {sampleWatchlistTokens.map((token) => (
                    <a
                      key={token.id}
                      className="cursor-pointer hover:bg-[#18191B] flex-col items-center px-4 pt-2 pb-1.5"
                      href="#"
                    >
                      <div className="flex w-full items-center justify-between gap-1">
                        <div className="flex min-w-0 flex-grow items-center gap-2">
                          <div className="h-5 w-5 flex-shrink-0 overflow-hidden rounded-full">
                            <img
                              alt={token.name}
                              className="h-full w-full object-cover"
                              src={token.img}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "";
                              }}
                            />
                          </div>
                          <span className="truncate font-bold text-gray-200 max-w-[120px] text-xs">
                            {token.name}
                          </span>
                        </div>
                        <div className="flex flex-col items-end ml-2">
                          <span className="shrink-0 text-xs text-gray-200">
                            {token.value}
                          </span>
                        </div>
                      </div>
                      {token.change != null && (
                        <div className="flex w-full items-center justify-end text-xs font-[12px]">
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              token.change < 0
                                ? "text-red-500"
                                : "text-green-400",
                            )}
                          >
                            {token.change > 0 ? "+" : ""}
                            {token.change}%
                          </span>
                        </div>
                      )}
                    </a>
                  ))}
                  <button
                    onClick={() => {
                      window.location.href = "https://pump.fun/?feed=watchlist";
                    }}
                    className="flex h-5 w-full items-center justify-center bg-bg-primary px-4 text-xs text-gray-300 hover:bg-[#18191B]"
                  >
                    See more
                  </button>
                </div>
              ) : (
                /* Holdings view */
                <div className="flex flex-col px-4 pt-2 pb-3 gap-2">
                  {!publicKey ? (
                    <p className="text-xs text-gray-400">
                      Connect a wallet to see holdings.
                    </p>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 flex-shrink-0 overflow-hidden rounded-full bg-[#9945FF] flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">
                            ◎
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-200">
                          SOL
                        </span>
                      </div>
                      <span className="text-xs text-gray-200 font-mono">
                        {sol.lamports == null
                          ? "—"
                          : formatSol(sol.lamports, {
                              withUnit: false,
                              fractionDigits: 4,
                            })}
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500">
                    Tokens are listed on your profile.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
