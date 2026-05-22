import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

/* ── chevron icon ── */
const ChevronDown = () => (
  <svg
    className="h-3 w-3 transition-transform duration-200"
    aria-hidden="true"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 9L12.7071 16.2929C12.3166 16.6834 11.6834 16.6834 11.2929 16.2929L4 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ── generic dropdown ── */
interface DropdownItem {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterDropdownProps {
  label: string;
  items: DropdownItem[];
}

function FooterDropdown({ label, items }: FooterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* close on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="footer-dropdown-trigger"
      >
        {label}
        <span
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-flex",
            transition: "transform 0.2s",
          }}
        >
          <ChevronDown />
        </span>
      </button>

      {open && (
        <div className="footer-dropdown-menu">
        {items?.map((item) =>
  item.external ? (
    <a
      key={item.label}
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="footer-dropdown-item"
      onClick={() => setOpen(false)}
    >
      {item.label}
    </a>
  ) : (
    <a
      key={item.label}
      href={item.href}
      className="footer-dropdown-item"
      onClick={() => setOpen(false)}
    >
      {item.label}
    </a>
  )
)}
        </div>
      )}
    </div>
  );
}

/* ── data ── */
const resourcesItems: DropdownItem[] = [
  {
    label: "PumpSwap",
    href: "https://swap.pump.fun",
    external: false,
  },
  {
    label: "Fees",
    href: "https://fees.pump.fun",
    external: false,
  },
  {
    label: "Docs Fees",
    href: "https://pump.fun/docs/fees",
    external: true, // ✅ now opens in new tab
  },
  {
    label: "Revenue",
    href: "https://revenue.pump.fun",
    external: true,
  },
  {
    label: "Tech updates",
    href: "https://t.me/pump_tech_updates",
    external: true,
  },
];
const legalItems: DropdownItem[] = [
  { label: "Privacy policy",              href: "https://pump.fun/docs/privacy-policy" },
  { label: "Terms of service",            href: "https://pump.fun/docs/terms-and-conditions" },
  { label: "Tokenized agent disclaimer",  href: "https://pump.fun/docs/tokenized-agent-disclaimer" },
  { label: "Livestream policy",           href: "https://pump.fun/docs/livestream-moderation-policy" },
  { label: "DMCA policy",                 href: "https://pump.fun/docs/dmca-policy" },
  { label: "Trademark guidelines",        href: "https://pump.fun/docs/trademark-guidelines" },
  { label: "Charity coins",               href: "https://pump.fun/docs/charitycoins" },
];

/* ── social icons ── */
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="h-4 w-4"
  >
    <path
      d="M5.48242 2.76892L8.08887 6.21814L8.41211 6.6449L8.76465 6.24158L11.8008 2.76892H12.5635L8.99805 6.84705L8.76465 7.11365L8.97852 7.39685L13.3887 13.2308H10.6133L7.71582 9.43982L7.3916 9.01697L7.04102 9.41736L3.70605 13.2308H2.94141L6.7998 8.81873L7.03418 8.55017L6.81738 8.26697L2.61621 2.76892H5.48242ZM3.63184 3.68884L10.582 12.7806L10.7129 12.9515H12.8682L12.3398 12.2533L5.46777 3.16052L5.33691 2.98767H3.0957L3.63184 3.68884Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.871795"
    />
  </svg>
);

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="h-4 w-4"
  >
    <path
      d="M13.8093 6.80899C12.6228 6.80899 11.5244 6.43201 10.6274 5.79136V10.4485C10.6274 12.7781 8.73784 14.6667 6.40703 14.6667C5.53737 14.6667 4.72905 14.4039 4.05758 13.9532C2.92935 13.1961 2.18652 11.9087 2.18652 10.4484C2.18652 8.1189 4.07609 6.23033 6.4071 6.23037C6.60081 6.23028 6.79429 6.24343 6.98619 6.26965V6.78673L6.98608 8.6027C6.80137 8.54412 6.60446 8.51233 6.40017 8.51233C5.33388 8.51233 4.46965 9.37627 4.46965 10.4418C4.46965 11.1953 4.90165 11.8477 5.5316 12.1654C5.7928 12.2971 6.0878 12.3713 6.40019 12.3713C7.46428 12.3713 8.32703 11.5109 8.3307 10.4484V1.33337H10.6273V1.6269C10.6354 1.71465 10.6471 1.80207 10.6623 1.88892C10.8217 2.79762 11.3653 3.574 12.1199 4.04461C12.6266 4.36073 13.2121 4.52784 13.8093 4.52694L13.8093 6.80899Z"
      fill="currentColor"
    />
  </svg>
);

const YouTubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="h-4 w-4"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.4695 2.67188C14.0722 2.85846 14.5459 3.4062 14.7073 4.10321C14.9988 5.36528 15 8.00004 15 8.00004C15 8.00004 15 10.6348 14.7073 11.8969C14.5459 12.5939 14.0722 13.1416 13.4695 13.3282C12.3782 13.6667 7.99998 13.6667 7.99998 13.6667C7.99998 13.6667 3.62183 13.6667 2.53045 13.3282C1.92773 13.1416 1.45407 12.5939 1.29272 11.8969C1 10.6348 1 8.00004 1 8.00004C1 8.00004 1 5.36528 1.29272 4.10321C1.45407 3.4062 1.92773 2.85846 2.53045 2.67188C3.62183 2.33337 7.99998 2.33337 7.99998 2.33337C7.99998 2.33337 12.3782 2.33337 13.4695 2.67188ZM10.3422 8.00025L6.5319 10.2V5.80048L10.3422 8.00025Z"
      fill="currentColor"
    />
  </svg>
);

/* ── main footer ── */
export function Footer(): JSX.Element {
  return (
    <>
      {/* inline styles scoped to footer only */}
      <style>{`
        .footer-root {
          display: none;
          width: 100%;
        }
        @media (min-width: 768px) {
          .footer-root {
            display: flex;
          }
        }
        .footer-inner {
          margin-left: auto;
          margin-right: auto;
          width: 100%;
          max-width: 1536px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          column-gap: 1.5rem;
          row-gap: 0.5rem;
          padding-left: var(--padding-x-main, 1.5rem);
          padding-right: var(--padding-x-main, 1.5rem);
          padding-top: 1.5rem;
          margin-bottom: 30px;
          font-size: 0.75rem;
          line-height: 1rem;
        }
        .footer-copyright {
          white-space: nowrap;
          color: #A1A1A1;
        }
        .footer-nav {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          column-gap: 1.25rem;
          row-gap: 0.5rem;
        }
        .footer-link {
           color: #A1A1A1;
          transition: color 0.15s;
          text-decoration: none;
        }
        .footer-link:hover {
          color: var(--color-text-primary, #e2e8f0);
        }
        .footer-dropdown-trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
         color: #A1A1A1;
          transition: color 0.15s;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: inherit;
          outline: none;
        }
        .footer-dropdown-trigger:hover {
          color: var(--color-text-primary, #e2e8f0);
        }
        .footer-dropdown-menu {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 0;
          min-width: 140px;
          background: #18191B;
          border: 1px solid var(--color-border, rgba(255,255,255,0.08));
          border-radius: 8px;
          padding: 4px 0;
          z-index: 50;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .footer-dropdown-item {
          display: block;
          padding: 8px 14px;
          color: #FAFAFA;
          font-size: 0.8125rem;
          text-decoration: none;
          transition: background 0.1s;
          white-space: nowrap;
        }
        .footer-dropdown-item:hover {
          background: var(--color-surface-3, rgba(255,255,255,0.06));
        }
        .footer-socials {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .footer-social-link {
          color: var(--color-text-tertiary, #64748b);
          transition: color 0.15s;
        }
        .footer-social-link:hover {
          color: var(--color-text-primary, #e2e8f0);
        }
      `}</style>

      <footer className="mt-auto z-[1] border-t border-border-secondary bg-bg-primary text-text-tertiary max-md:mb-12 footer-root">
        <div className="footer-inner">
          {/* left – copyright */}
          <p className="footer-copyright">© Pump.fun 2026</p>

          {/* centre – nav */}
          <nav aria-label="Footer" className="footer-nav">
        <a href="https://pump.fun/coins" className="footer-link">
  Top coins
</a>

            <a
              href="https://medium.com/@pumpdotfun_"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Blog
            </a>

            <FooterDropdown label="Resources" items={resourcesItems} />
            <FooterDropdown label="Legal" items={legalItems} />
          </nav>

          {/* right – socials */}
          <div className="footer-socials">
            <a
              href="https://twitter.com/pumpfun"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="text-text-tertiary transition-colors hover:text-text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="M5.48242 2.76892L8.08887 6.21814L8.41211 6.6449L8.76465 6.24158L11.8008 2.76892H12.5635L8.99805 6.84705L8.76465 7.11365L8.97852 7.39685L13.3887 13.2308H10.6133L7.71582 9.43982L7.3916 9.01697L7.04102 9.41736L3.70605 13.2308H2.94141L6.7998 8.81873L7.03418 8.55017L6.81738 8.26697L2.61621 2.76892H5.48242ZM3.63184 3.68884L10.582 12.7806L10.7129 12.9515H12.8682L12.3398 12.2533L5.46777 3.16052L5.33691 2.98767H3.0957L3.63184 3.68884Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="0.871795"
                />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@pump.fun"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-text-tertiary transition-colors hover:text-text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  d="M13.8093 6.80899C12.6228 6.80899 11.5244 6.43201 10.6274 5.79136V10.4485C10.6274 12.7781 8.73784 14.6667 6.40703 14.6667C5.53737 14.6667 4.72905 14.4039 4.05758 13.9532C2.92935 13.1961 2.18652 11.9087 2.18652 10.4484C2.18652 8.1189 4.07609 6.23033 6.4071 6.23037C6.60081 6.23028 6.79429 6.24343 6.98619 6.26965V6.78673L6.98608 8.6027C6.80137 8.54412 6.60446 8.51233 6.40017 8.51233C5.33388 8.51233 4.46965 9.37627 4.46965 10.4418C4.46965 11.1953 4.90165 11.8477 5.5316 12.1654C5.7928 12.2971 6.0878 12.3713 6.40019 12.3713C7.46428 12.3713 8.32703 11.5109 8.3307 10.4484V1.33337H10.6273V1.6269C10.6354 1.71465 10.6471 1.80207 10.6623 1.88892C10.8217 2.79762 11.3653 3.574 12.1199 4.04461C12.6266 4.36073 13.2121 4.52784 13.8093 4.52694L13.8093 6.80899Z"
                  fill="currentColor"
                ></path>
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@pumpfunofficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-text-tertiary transition-colors hover:text-text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.4695 2.67188C14.0722 2.85846 14.5459 3.4062 14.7073 4.10321C14.9988 5.36528 15 8.00004 15 8.00004C15 8.00004 15 10.6348 14.7073 11.8969C14.5459 12.5939 14.0722 13.1416 13.4695 13.3282C12.3782 13.6667 7.99998 13.6667 7.99998 13.6667C7.99998 13.6667 3.62183 13.6667 2.53045 13.3282C1.92773 13.1416 1.45407 12.5939 1.29272 11.8969C1 10.6348 1 8.00004 1 8.00004C1 8.00004 1 5.36528 1.29272 4.10321C1.45407 3.4062 1.92773 2.85846 2.53045 2.67188C3.62183 2.33337 7.99998 2.33337 7.99998 2.33337C7.99998 2.33337 12.3782 2.33337 13.4695 2.67188ZM10.3422 8.00025L6.5319 10.2V5.80048L10.3422 8.00025Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
