import { Search, ChevronRight } from "lucide-react";
import { FAQs } from "./supportData";

interface SupportHomeTabProps {
  onClose: () => void;
  onArticleSelect: (article: string) => void;
  onGoToMessages: () => void;
}

export function SupportHomeTab({ onClose, onArticleSelect, onGoToMessages }: SupportHomeTabProps) {
  return (
    <>
      {/* Top Green Section */}
      <div className="relative bg-[#0A321A] px-6 pt-6 pb-16 shrink-0">
        {/* Row 1: Logo + Avatars + Close */}
        <div className="flex items-center justify-between mb-6">
          <img src="/Images/Sidedrawer/pump-logo.svg" alt="" className="w-8 h-8" />
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img src="/Images/Support/s1.jpg" alt="" className="w-10 h-10 rounded-full border-2 border-[#0A321A]" />
              <img src="/Images/Support/s2.jpg" alt="" className="w-10 h-10 rounded-full border-2 border-[#0A321A]" />
              <img src="/Images/Support/s3.jpg" alt="" className="w-10 h-10 rounded-full border-2 border-[#0A321A]" />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-white/70 hover:text-white transition-colors ml-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13.25 3.95L12.05 2.75L8 6.8L3.95 2.75L2.75 3.95L6.8 8L2.75 12.05L3.95 13.25L8 9.2L12.05 13.25L13.25 12.05L9.2 8L13.25 3.95Z"
                  fill="currentColor"
                ></path>
              </svg>
            </button>
          </div>
        </div>
        {/* Row 2: Heading */}
        <h2 className="text-white text-3xl font-bold leading-tight">
          Hi there 👋
          <br />
          How may we help?
        </h2>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 -mt-8 pb-4 relative z-10 space-y-4">
        {/* Recent Message Card */}
        <button
          onClick={onGoToMessages}
          className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col text-left hover:shadow-md transition-shadow"
        >
          <div className="font-bold text-[14px] text-gray-900 mb-3">Recent message</div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <img
                src="/Images/Sidedrawer/pump-logo.svg"
                alt="Pump.fun"
                className="w-8 h-8 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-[14px] text-gray-900 leading-tight">Pump.fun</span>
                <span className="text-[13px] text-gray-500">Coin Details</span>
              </div>
            </div>
            <span className="text-[12px] text-gray-400">3h</span>
          </div>
        </button>

        {/* Send us a message card */}
        <button
          onClick={onGoToMessages}
          className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between text-left hover:shadow-md transition-shadow group"
        >
          <div>
            <div className="font-bold text-gray-900 text-[14px]">Send us a message</div>
            <div className="text-gray-500 text-[13px]">We typically reply in under 5 minutes</div>
          </div>
          <div className="intercom-t3a5jf e1xqkdfq0">
            <div style={{ opacity: 1 }} className="intercom-peu8nq e1xqkdfq2">
              <i aria-hidden="true" className="intercom-1nc24gi e17z5v9w0 text-gray-900 flex shrink-0 group-hover:translate-x-1 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" fill="none" viewBox="0 0 17 16" aria-hidden="true">
                  <path fill="currentColor" fillRule="evenodd" d="m4.563 14.605 9.356-5.402c1-.577 1-2.02 0-2.598L4.563 1.203a1.5 1.5 0 0 0-2.25 1.3v10.803a1.5 1.5 0 0 0 2.25 1.3M6.51 8.387 2.313 9.512V6.297L6.51 7.42c.494.133.494.834 0 .966" clipRule="evenodd"></path>
                </svg>
              </i>
            </div>
          </div>
        </button>

        {/* Search & Help list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-[8px]">
          <div className="flex items-center justify-between w-full h-[40px] box-border px-3 py-[10px] font-semibold bg-[#F5F5F5] rounded-lg text-[#14161A] transition-colors duration-250">
            <span className="font-semibold text-[#16141A] text-[14px]">Search for help</span>
            <Search className="w-4 h-4 text-[#16141A]" />
          </div>
          <div className="flex flex-col">
            {FAQs?.map((faq, i) => (
              <button
                key={i}
                onClick={() => onArticleSelect(faq)}
                className="flex items-center justify-between py-3 px-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
              >
                <span className="text-[13px] text-[#6C6F74] font-medium pr-4 leading-snug">{faq}</span>
                <ChevronRight className="w-4 h-4  text-[#16141A] group-hover:text-gray-900 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Follow us card */}
   <button
  onClick={() => window.open("https://x.com/Pumpfun", "_blank")}
  className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between text-left hover:shadow-md transition-shadow"
>
  <span className="font-normal text-gray-900 text-[14px]">
    Follow Our X For The Latest Updates!
  </span>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className="text-gray-900"
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3 3.7h4V2H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2h-1.7v2a.3.3 0 0 1-.3.3H3a.3.3 0 0 1-.3-.3V4a.3.3 0 0 1 .3-.3M9.218 3c0 .47.38.85.85.85h1.88L8.296 7.502a.85.85 0 0 0 1.202 1.202l3.652-3.652v1.88a.85.85 0 0 0 1.7 0V3a.85.85 0 0 0-.85-.85h-3.932a.85.85 0 0 0-.85.85"
      clipRule="evenodd"
    />
  </svg>
</button>
      </div>
    </>
  );
}
