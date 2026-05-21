import { useState } from "react";
import {
  X,
  Send,
  Search,
  ChevronRight,
  ExternalLink,
  Home,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

const FAQs = [
  "Create a Coin on Pump.fun",
  "Transaction Fees on Pump.fun",
  "How to Edit Coin Image, Description, and Socials?",
  "Liquidity on PumpSwap",
];

const HELP_COLLECTIONS = [
  {
    title: "Creating and Managing Coins: Everything You Need to Know",
    desc: "Details about coin creation and getting it onchain.",
    count: "3 articles",
    avatar: "/Images/Support/s5.jpg",
    articles: [
      "How to Edit Coin Image, Description, and Socials?",
      "Create a Coin on Pump.fun",
      "Coin Isn't Showing When I Search",
    ],
  },
  {
    title: "Managing Your Wallet",
    desc: "Depositing, Making a Trade, Withdrawing.",
    count: "3 articles",
    avatar: "/Images/Support/s5.jpg",
    articles: ["Depositing Funds", "Making a Trade", "Withdrawing Funds"],
  },
  {
    title: "Tokenomics & Fees",
    desc: "Everything you need to know about your coin and the associated fees.",
    count: "4 articles",
    avatar: "/Images/Support/s5.jpg",
    articles: [
      "Token Contracts",
      "Total Token Supply",
      "Transaction Fees on Pump.fun",
      "Liquidity on PumpSwap",
    ],
  },
  {
    title: "PumpSwap",
    desc: "How to use PumpSwap",
    count: "2 articles",
    avatar: "/Images/Support/s5.jpg",
    articles: ["Creating a Liquidity Pool", "Withdrawing Liquidity"],
  },
  {
    title: "Pump.fun Official TOS/Guidelines",
    desc: "Pump.fun's official TOS & Guidelines",
    count: "2 articles",
    avatar: "/Images/Support/s5.jpg",
    articles: ["Trademark Guidelines", "Livestream Moderation Policy"],
  },
  {
    title: "Job",
    desc: "Job opening",
    count: "1 article",
    avatar: "/Images/Support/s3.jpg",
    articles: ["Job Openings"],
  },
  {
    title: "General",
    desc: "General app questions",
    count: "1 article",
    avatar: "/Images/Support/s3.jpg",
    articles: ["App updates"],
  },
  {
    title: "Mobile App",
    desc: "Mobile App Walkthrough",
    count: "9 articles",
    avatar: "/Images/Support/s3.jpg",
    articles: [
      "Depositing Funds on the Mobile App",
      "Making a Trade on the Mobile App",
      "Create a Coin on the Mobile App",
      "Withdrawing Funds on the Mobile App",
      "Coin Isn't Showing When I Search on the Mobile App",
      "How to Export Seed Phrase or Private Key on the Mobile App",
      "How to Import an Existing Wallet Using a Private Key on the Mobile App",
      "How to Delete Your Account on the Mobile App",
      "How to Get RTMP key - Mobile",
    ],
  },
];

export function SupportWidget(): JSX.Element | null {
  const open = useUiStore((s) => s.supportWidgetOpen);
  const setOpen = useUiStore((s) => s.setSupportWidgetOpen);
  const [activeTab, setActiveTab] = useState<"home" | "messages" | "help">(
    "home",
  );
  const [selectedCollection, setSelectedCollection] = useState<
    (typeof HELP_COLLECTIONS)[0] | null
  >(null);

  if (!open) return null;



  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col w-[380px] h-[600px] rounded-2xl shadow-2xl overflow-hidden bg-[#F9FAFB] animate-fade-in"
      style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif' }}
    >
      {activeTab === "home" && (
        <>
          {/* Top Green Section */}
          <div className="relative bg-[#0A321A] px-6 pt-6 pb-16 shrink-0">
            <div className="flex items-center justify-between mb-8">
              {/* Logo / Pill icon */}
              <img
                src="/Images/Sidedrawer/pump-logo.svg"
                alt=""
                className="w-8 h-8"
              />

              <div className="flex items-center gap-3">
                {/* Avatars */}
                <div className="flex -space-x-2">
                  <img
                    src="/Images/Support/s1.jpg"
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <img
                    src="/Images/Support/s2.jpg"
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <img
                    src="/Images/Support/s3.jpg"
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                </div>
                {/* Close button */}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-md text-white/70 hover:text-white transition-colors ml-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.25 3.95L12.05 2.75L8 6.8L3.95 2.75L2.75 3.95L6.8 8L2.75 12.05L3.95 13.25L8 9.2L12.05 13.25L13.25 12.05L9.2 8L13.25 3.95Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <h2 className="text-white text-3xl font-bold leading-tight">
              Hi there 👋
              <br />
              How may we help?
            </h2>
          </div>

          {/* Main Content Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-4 -mt-8 pb-4 relative z-10 space-y-4">
            {/* Send us a message card */}
            <button className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between text-left hover:shadow-md transition-shadow group">
              <div>
                <div className="font-semibold text-gray-900 text-[14px]">
                  Send us a message
                </div>
                <div className="text-gray-500 text-[14px]">
                  We typically reply in under 5 minutes
                </div>
              </div>
              <div className="intercom-t3a5jf e1xqkdfq0">
                <div
                  style={{ opacity: 1 }}
                  className="intercom-peu8nq e1xqkdfq2"
                >
                  <i
                    aria-hidden="true"
                    className="intercom-1nc24gi e17z5v9w0 text-gray-900 flex shrink-0 group-hover:translate-x-1 transition-transform"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="16"
                      fill="none"
                      viewBox="0 0 17 16"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="m4.563 14.605 9.356-5.402c1-.577 1-2.02 0-2.598L4.563 1.203a1.5 1.5 0 0 0-2.25 1.3v10.803a1.5 1.5 0 0 0 2.25 1.3M6.51 8.387 2.313 9.512V6.297L6.51 7.42c.494.133.494.834 0 .966"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </i>
                </div>
              </div>
            </button>

            {/* Search & Help list */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-[8px]">
              <div className="flex items-center justify-between w-full h-[40px] box-border px-3 py-[10px] font-semibold bg-[#F5F5F5] rounded-lg text-[#14161A] transition-colors duration-250">
                <span className="font-semibold text-[#16141A] text-[14px]">
                  Search for help
                </span>
                <Search className="w-4 h-4 text-[#16141A]" />
              </div>
              <div className="flex flex-col">
                {FAQs?.map((faq, i) => (
                  <button
                    key={i}
                    className="flex items-center justify-between py-[8px] px-[12px] text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
                  >
                    <span className="text-[14px] text-[#6C6F74] font-medium pr-4">
                      {faq}
                    </span>
                    <ChevronRight className="w-4 h-4  text-[#16141A] group-hover:text-gray-900 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Follow us card */}
            <button className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between text-left hover:shadow-md transition-shadow group">
              <span className="font-normal text-gray-900 text-[14px]">
                Follow Our X For The Latest Updates!
              </span>
              {/* <ExternalLink className="w-4 h-4 text-gray-900" /> */}
              <i
                aria-hidden="true"
                className="intercom-1nc24gi e17z5v9w0 text-gray-900 flex shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M3 3.7h4V2H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2h-1.7v2a.3.3 0 0 1-.3.3H3a.3.3 0 0 1-.3-.3V4a.3.3 0 0 1 .3-.3M9.218 3c0 .47.38.85.85.85h1.88L8.296 7.502a.85.85 0 0 0 1.202 1.202l3.652-3.652v1.88a.85.85 0 0 0 1.7 0V3a.85.85 0 0 0-.85-.85h-3.932a.85.85 0 0 0-.85.85"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </i>
            </button>
          </div>
        </>
      )}

      {activeTab === "help" && (
        <div className="flex-1 flex flex-col h-0 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 shrink-0">
            {selectedCollection ? (
              <button
                onClick={() => setSelectedCollection(null)}
                className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            ) : (
              <div className="w-8"></div>
            )}
            <h2 className="font-bold text-[15px] text-gray-900">Help</h2>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3 shrink-0">
            <div className="flex items-center justify-between w-full h-[40px] px-3 bg-[#F5F5F5] rounded-lg">
              <span className="font-medium text-[#6C6F74] text-[14px]">
                Search for help
              </span>
              <Search className="w-4 h-4 text-[#16141A]" />
            </div>
          </div>

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto px-4 pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {selectedCollection ? (
              /* Detail View */
              <div>
                <div className="mb-4">
                  <div className="font-bold text-[15px] text-[#14161A] leading-tight mb-1">
                    {selectedCollection.title}
                  </div>
                  <div className="text-[13px] text-[#14161A] mb-3">
                    {selectedCollection.desc}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] text-[#6C6F74]">
                        {selectedCollection.count}
                      </div>
                      <div className="text-[13px] text-[#6C6F74]">By Fire</div>
                    </div>
                    {/* Flame icon */}
                    {/* <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2c0 0-5 4.5-5 10a5 5 0 0 0 10 0c0-2.5-1.5-4.5-2.5-5.5 0 2-1.5 3-2.5 3.5C13 8 12 5 12 2z"/>
                      </svg>
                    </div> */}
                    <img
                      src={selectedCollection.avatar}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col border-t border-gray-100">
                  {selectedCollection?.articles?.map((article, i) => (
                    <button
                      key={i}
                      className="flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 group"
                    >
                      <span className="text-[14px] text-[#14161A] font-medium pr-4">
                        {article}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#16141A] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Collections List */
              <div>
                <div className="font-bold text-[15px] text-[#14161A] pb-[20px] border-b border-[rgba(20,22,26,0.06)]">
                  8 collections
                </div>
                <div className="flex flex-col">
                  {HELP_COLLECTIONS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedCollection(c)}
                      className="flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 group"
                    >
                      <div className="flex flex-col pr-4">
                        <span className="text-[14px] font-bold text-[#14161A] mb-1 leading-tight">
                          {c.title}
                        </span>
                        <span className="text-[13px] text-[#14161A] mb-1 leading-snug">
                          {c.desc}
                        </span>
                        <span className="text-[12px] text-[#6C6F74]">
                          {c.count}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#16141A] group-hover:text-gray-900 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="flex-1 flex flex-col h-0 bg-white items-center justify-center">
          <span className="text-gray-400 text-sm">No messages yet</span>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="shrink-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 pb-1 z-20 rounded-b-2xl">
        <button
          onClick={() => setActiveTab("home")}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
            activeTab === "home"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600",
          )}
        >
          {activeTab === "home" ? (
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <mask id="a98da" fill="none">
                <path
                  fillRule="evenodd"
                  d="M10.5 2.335 3 7.51c-.625.437-1 1.116-1 1.84V19.7C2 20.965 3.125 22 4.5 22h15c1.375 0 2.5-1.035 2.5-2.3V9.35c0-.724-.375-1.403-1-1.84l-7.5-5.175a2.69 2.69 0 0 0-3 0M7.316 14.366a.85.85 0 1 0-1.132 1.268A8.7 8.7 0 0 0 12 17.852a8.7 8.7 0 0 0 5.816-2.218.85.85 0 1 0-1.132-1.268A7 7 0 0 1 12 16.152c-1.8 0-3.44-.675-4.684-1.786"
                  clipRule="evenodd"
                ></path>
              </mask>
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M10.5 2.335 3 7.51c-.625.437-1 1.116-1 1.84V19.7C2 20.965 3.125 22 4.5 22h15c1.375 0 2.5-1.035 2.5-2.3V9.35c0-.724-.375-1.403-1-1.84l-7.5-5.175a2.69 2.69 0 0 0-3 0M7.316 14.366a.85.85 0 1 0-1.132 1.268A8.7 8.7 0 0 0 12 17.852a8.7 8.7 0 0 0 5.816-2.218.85.85 0 1 0-1.132-1.268A7 7 0 0 1 12 16.152c-1.8 0-3.44-.675-4.684-1.786"
                clipRule="evenodd"
              ></path>
              <path
                fill="currentColor"
                d="m3 7.51-.965-1.4-.01.007zm7.5-5.175L9.538.934l-.003.002zM21 7.51l.974-1.393-.009-.006zm-7.5-5.175.966-1.4-.004-.001zM6.116 14.434l1.268 1.132zm1.2-.068 1.133-1.268zm-1.132 1.268L5.05 16.902zm11.632 0 1.133 1.268zm.068-1.2-1.268 1.132zm-1.2-.068-1.133-1.268zM3.965 8.91l7.5-5.175L9.536.936l-7.5 5.175zm-.265.44c0-.12.063-.299.274-.447L2.026 6.117C.987 6.843.3 8.022.3 9.35zm0 10.35V9.35H.3V19.7zm.8.6a.9.9 0 0 1-.615-.227.5.5 0 0 1-.185-.373H.3c0 2.335 2.022 4 4.2 4zm15 0h-15v3.4h15zm.8-.6a.5.5 0 0 1-.185.373.9.9 0 0 1-.615.227v3.4c2.178 0 4.2-1.665 4.2-4zm0-10.35V19.7h3.4V9.35zm-.274-.447c.211.148.274.326.274.447h3.4c0-1.328-.687-2.507-1.726-3.233zm-7.491-5.169 7.5 5.175 1.93-2.798-7.5-5.175zm-1.073.002a.99.99 0 0 1 1.076 0L14.462.934a4.39 4.39 0 0 0-4.924 0zm-4.078 11.83a.85.85 0 0 1-1.2.068l2.265-2.536a2.55 2.55 0 0 0-3.6.203zm-.068-1.2c.35.313.38.85.068 1.2l-2.536-2.265a2.55 2.55 0 0 0 .203 3.6zM12 16.152c-1.8 0-3.44-.675-4.684-1.786l-2.265 2.536A10.4 10.4 0 0 0 12 19.552zm4.684-1.786A7 7 0 0 1 12 16.152v3.4c2.667 0 5.105-1.004 6.949-2.65zm-.068 1.2a.85.85 0 0 1 .068-1.2l2.265 2.536a2.55 2.55 0 0 0 .203-3.6zm1.2.068a.85.85 0 0 1-1.2-.068l2.536-2.265a2.55 2.55 0 0 0-3.6-.203zM12 17.852a8.7 8.7 0 0 0 5.816-2.218l-2.265-2.536A5.3 5.3 0 0 1 12 14.452zm-5.816-2.218A8.7 8.7 0 0 0 12 17.852v-3.4a5.3 5.3 0 0 1-3.551-1.354z"
                mask="url(#a98da)"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeWidth="1.7"
                d="M2.85 9.35c0-.423.218-.85.635-1.143l7.496-5.172h.001a1.84 1.84 0 0 1 2.036 0l7.495 5.17.002.002c.417.293.635.72.635 1.142V19.7c0 .73-.676 1.45-1.65 1.45h-15c-.974 0-1.65-.72-1.65-1.45z"
                className="6a4d9aa4stroke"
              ></path>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
                d="M17.25 15A7.86 7.86 0 0 1 12 17.002 7.86 7.86 0 0 1 6.75 15"
                className="6a4d9aa4stroke"
              ></path>
            </svg>
          )}
          <span className="text-[11px] font-semibold">Home</span>
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
            activeTab === "messages"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600",
          )}
        >
          {activeTab === "messages" ? (
            // ✅ SELECTED SVG
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <mask id="4093a" fill="none">
                <path
                  fillRule="evenodd"
                  d="M22 5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10.558l3.883 3.87c.946.942 2.559.272 2.559-1.063zm-4.15 2.85A.85.85 0 0 0 17 7H7a.85.85 0 0 0 0 1.7h10c.47 0 .85-.38.85-.85m-5 4A.85.85 0 0 0 12 11H7a.85.85 0 0 0 0 1.7h5c.47 0 .85-.38.85-.85"
                  clipRule="evenodd"
                />
              </mask>

              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M22 5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10.558l3.883 3.87c.946.942 2.559.272 2.559-1.063zm-4.15 2.85A.85.85 0 0 0 17 7H7a.85.85 0 0 0 0 1.7h10c.47 0 .85-.38.85-.85m-5 4A.85.85 0 0 0 12 11H7a.85.85 0 0 0 0 1.7h5c.47 0 .85-.38.85-.85"
                clipRule="evenodd"
              />

              <path
                fill="currentColor"
                d="M15.558 18v-1.7h.702l.498.496zm3.883 3.87 1.2-1.205zM19 .3A4.7 4.7 0 0 1 23.7 5h-3.4A1.3 1.3 0 0 0 19 3.7zM5 .3h14v3.4H5zM.3 5A4.7 4.7 0 0 1 5 .3v3.4A1.3 1.3 0 0 0 3.7 5zm0 10V5h3.4v10zM5 19.7A4.7 4.7 0 0 1 .3 15h3.4A1.3 1.3 0 0 0 5 16.3zm10.558 0H5v-3.4h10.558zm2.683 3.374-3.883-3.87 2.4-2.408 3.883 3.87zm5.459-2.267c0 2.848-3.441 4.277-5.459 2.267l2.4-2.409a.23.23 0 0 0-.218-.043.23.23 0 0 0-.123.185zm0-4.307v4.307h-3.4V16.5zm0-2.543V16.5h-3.4v-2.543zM23.7 5v8.957h-3.4V5z"
                mask="url(#4093a)"
              />
            </svg>
          ) : (
            // ❌ UNSELECTED SVG
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <mask id="2b42a" fill="#fff">
                <path
                  fillRule="evenodd"
                  d="M19 2a3 3 0 0 1 3 3v15.806c0 1.335-1.613 2.005-2.559 1.062L15.56 18H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z"
                  clipRule="evenodd"
                />
              </mask>

              <path
                fill="currentColor"
                d="m19.441 21.868 1.2-1.204zM15.56 18v-1.7h.702l.498.496zM20.3 5A1.3 1.3 0 0 0 19 3.7V.3A4.7 4.7 0 0 1 23.7 5zm0 8.956V5h3.4v8.956zm0 2.544v-2.544h3.4V16.5zm0 4.306V16.5h3.4v4.306zm.341-.142a.23.23 0 0 0-.218-.043.23.23 0 0 0-.123.185h3.4c0 2.848-3.441 4.277-5.459 2.267zm-3.882-3.868 3.882 3.868-2.4 2.409-3.882-3.869zM5 16.3h10.559v3.4H5zM3.7 15A1.3 1.3 0 0 0 5 16.3v3.4A4.7 4.7 0 0 1 .3 15zm0-10v10H.3V5zM5 3.7A1.3 1.3 0 0 0 3.7 5H.3A4.7 4.7 0 0 1 5 .3zm14 0H5V.3h14z"
                mask="url(#2b42a)"
              />

              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M17 7a.85.85 0 0 1 0 1.7H7A.85.85 0 1 1 7 7zm-5 4a.85.85 0 0 1 0 1.7H7A.85.85 0 0 1 7 11z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="text-[11px] font-semibold">Messages</span>
        </button>
        <button
          onClick={() => setActiveTab("help")}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
            activeTab === "help"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600",
          )}
        >
          {activeTab === "help" ? (
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <mask id="cea2a" fill="none">
                <path
                  fillRule="evenodd"
                  d="M22.5 12c0 5.799-4.701 10.5-10.5 10.5S1.5 17.799 1.5 12 6.201 1.5 12 1.5 22.5 6.201 22.5 12M11.926 7.85a1.56 1.56 0 0 0-1.465 1.02.85.85 0 1 1-1.594-.588 3.26 3.26 0 1 1 5.547 3.233l-.019.022-.02.021-1.075 1.105-.006.006-.006.006c-.319.315-.512.534-.512.94v.363a.85.85 0 0 1-1.7 0v-.364c0-1.144.664-1.8 1.003-2.134l.009-.008 1.046-1.076a1.56 1.56 0 0 0-1.208-2.546m0 9.917a.884.884 0 1 0 0-1.767.884.884 0 0 0 0 1.767"
                  clipRule="evenodd"
                  shapeRendering="crispEdges"
                ></path>
              </mask>
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M22.5 12c0 5.799-4.701 10.5-10.5 10.5S1.5 17.799 1.5 12 6.201 1.5 12 1.5 22.5 6.201 22.5 12M11.926 7.85a1.56 1.56 0 0 0-1.465 1.02.85.85 0 1 1-1.594-.588 3.26 3.26 0 1 1 5.547 3.233l-.019.022-.02.021-1.075 1.105-.006.006-.006.006c-.319.315-.512.534-.512.94v.363a.85.85 0 0 1-1.7 0v-.364c0-1.144.664-1.8 1.003-2.134l.009-.008 1.046-1.076a1.56 1.56 0 0 0-1.208-2.546m0 9.917a.884.884 0 1 0 0-1.767.884.884 0 0 0 0 1.767"
                clipRule="evenodd"
              ></path>
              <path
                fill="currentColor"
                d="m10.462 8.87 1.595.588zm-1.092.503-.588 1.595zm-.503-1.091-1.595-.589zm5.547 3.233-1.297-1.099zm-.019.022 1.22 1.185.04-.042.038-.044zm-.02.021 1.219 1.186zM13.3 12.663l1.22 1.185zm-.006.006 1.195 1.21.012-.012.012-.013zm-.006.006-1.194-1.21zM12.08 11.48l1.194 1.21zm.009-.008 1.194 1.21.012-.013.013-.012zm1.046-1.076 1.218 1.186.051-.053.046-.056zM12 24.2c6.738 0 12.2-5.462 12.2-12.2h-3.4a8.8 8.8 0 0 1-8.8 8.8zM-.2 12c0 6.738 5.462 12.2 12.2 12.2v-3.4A8.8 8.8 0 0 1 3.2 12zM12-.2C5.262-.2-.2 5.262-.2 12h3.4A8.8 8.8 0 0 1 12 3.2zM24.2 12C24.2 5.262 18.738-.2 12-.2v3.4a8.8 8.8 0 0 1 8.8 8.8zM12.057 9.458a.14.14 0 0 1-.05.065.15.15 0 0 1-.081.027v-3.4a3.26 3.26 0 0 0-3.06 2.132zm-3.275 1.51a2.55 2.55 0 0 0 3.274-1.51l-3.19-1.176a.85.85 0 0 1 1.092-.504zm-1.51-3.275a2.55 2.55 0 0 0 1.51 3.275l1.176-3.19a.85.85 0 0 1 .503 1.092zm4.654-3.243a4.96 4.96 0 0 0-4.654 3.243l3.19 1.177a1.56 1.56 0 0 1 1.464-1.02zm4.96 4.96a4.96 4.96 0 0 0-4.96-4.96v3.4c.861 0 1.56.698 1.56 1.56zm-1.174 3.203a4.95 4.95 0 0 0 1.173-3.203h-3.4c0 .384-.138.734-.368 1.006zm-.019.023.019-.023-2.595-2.197-.02.023zm-.1.108.021-.021-2.437-2.371-.02.021zm-1.074 1.104 1.075-1.104-2.438-2.371-1.074 1.105zm-.006.006.006-.006-2.437-2.37-.006.006zm-.03.031.006-.006-2.389-2.42-.006.007zm-.007-.27a.8.8 0 0 1-.112.382c-.025.04-.039.052-.018.028.023-.026.06-.065.137-.14l-2.389-2.42c-.33.326-1.018.985-1.018 2.15zm0 .363v-.364h-3.4v.364zm-2.55 2.55a2.55 2.55 0 0 0 2.55-2.55h-3.4c0-.47.38-.85.85-.85zm-2.55-2.55a2.55 2.55 0 0 0 2.55 2.55v-3.4c.469 0 .85.38.85.85zm0-.364v.364h3.4v-.364zm1.51-3.344c-.372.366-1.51 1.455-1.51 3.344h3.4c0-.4.19-.621.497-.923zm.008-.009-.009.01 2.388 2.42.009-.01zm1.021-1.05-1.046 1.075 2.438 2.37 1.045-1.074zm-.13.199a.14.14 0 0 1 .033-.09l2.631 2.153a3.25 3.25 0 0 0 .736-2.063zm.14.14a.14.14 0 0 1-.14-.14h3.4c0-1.8-1.46-3.26-3.26-3.26zm-.815 7.334c0-.451.366-.817.817-.817v3.4a2.584 2.584 0 0 0 2.583-2.583zm.817.816a.816.816 0 0 1-.817-.816h3.4a2.584 2.584 0 0 0-2.583-2.584zm.816-.816c0 .45-.366.816-.816.816v-3.4a2.584 2.584 0 0 0-2.584 2.584zm-.816-.817c.45 0 .816.366.816.817h-3.4a2.584 2.584 0 0 0 2.584 2.583z"
                mask="url(#cea2a)"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9.65"
                stroke="currentColor"
                strokeWidth="1.7"
                className="ae9bb383stroke 776cb343circle"
              ></circle>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
                d="M9.664 8.576a2.41 2.41 0 1 1 4.102 2.39l-1.075 1.104c-.326.322-.765.76-.765 1.544v.364"
                className="ae9bb383stroke b31825banegative"
              ></path>
              <circle
                cx="11.927"
                cy="16.884"
                r="0.884"
                fill="currentColor"
                className="8d78da9dfill b31825banegative"
              ></circle>
            </svg>
          )}
          <span className="text-[11px] font-semibold">Help</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
