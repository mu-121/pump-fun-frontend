import { useState } from "react";
import { X, Search, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { HELP_COLLECTIONS } from "./supportData";

interface SupportHelpTabProps {
  onClose: () => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  selectedArticle: string | null;
  setSelectedArticle: (val: string | null) => void;
}

export function SupportHelpTab({
  onClose,
  isExpanded,
  setIsExpanded,
  selectedArticle,
  setSelectedArticle,
}: SupportHelpTabProps) {
  const [selectedCollection, setSelectedCollection] = useState<
    (typeof HELP_COLLECTIONS)[0] | null
  >(null);
  const [showBox, setShowBox] = useState(false);
  const [selected, setSelected] = useState(null);
  return (
    <div className="flex-1 flex flex-col h-0 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0 border-b border-[rgb(237,237,237)]">
        {selectedArticle ? (
          <button
            onClick={() => setSelectedArticle(null)}
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
        ) : selectedCollection ? (
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
        {selectedArticle ? (
          <div className="flex-1 flex justify-center px-4">
            {/* <h2 className="font-bold text-[15px] text-gray-900 text-center line-clamp-1 truncate">{selectedArticle}</h2> */}
          </div>
        ) : (
          <h2 className="font-bold text-[15px] text-gray-900">Help</h2>
        )}

        <div className="flex items-center gap-1">
          {selectedArticle && (
            <>
              {/* Expand/Collapse Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              {/* <button className="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button> */}
            </>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {!selectedArticle && (
        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center justify-between w-full h-[40px] px-3 bg-[#F5F5F5] rounded-lg">
            <span className="font-medium text-[#6C6F74] text-[14px]">
              Search for help
            </span>
            <Search className="w-4 h-4 text-[#16141A]" />
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {selectedArticle ? (
          /* Article Detail View */
          <div className="flex flex-col pb-6">
            {/* Title (Only if expanded, as we want to simulate the screenshot where it looks like a full page) */}
            <h1 className="pt-[10px] font-bold text-[24px] text-gray-900 mb-4 leading-tight">
              {selectedArticle}
            </h1>

            {/* Author Info */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#B22222] flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M12 2c0 0-5 4.5-5 10a5 5 0 0 0 10 0c0-2.5-1.5-4.5-2.5-5.5 0 2-1.5 3-2.5 3.5C13 8 12 5 12 2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-[#6C6F74]">
                  Written by <span className="text-[#6C6F74]">Fire Doji</span>
                </span>
                <span className="text-[13px] text-[#6C6F74]">
                  August 9, 2025
                </span>
              </div>
            </div>

            {/* Article Content (Dummy) */}
            <div className="text-[14px] text-[#14161A] font-medium leading-relaxed mb-6">
              <p>
                Coin creation in itself is free on Pump.fun, but the coin will be offchain and not seen by the public. To get it onchain a first buy must be made by you, the dev, or by anyone who has the coin web address.
              </p>
            </div>

            {/* Accordions */}
     <div className="flex flex-col mb-1">
  {[
    "How much does it cost to create and buy?",
    "What is a ticker?",
    "What kind of images can I use for my coin?",
    "How do I add my website and socials?",
    "What does \"offchain coin\" mean?"
  ].map((title, i) => (
    <div
      key={i}
      className="border-b-[3px] border-[#E6E6E6] last:border-b-0 py-4 flex items-start gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="mt-1 text-gray-900 shrink-0"
      >
        <path d="M8 5v14l11-7z" />
      </svg>

      <span className="font-bold text-[16px] text-[#14161A]">
        {title}
      </span>
    </div>
  ))}
</div>

            <div className="h-[3px] w-full bg-[#E6E6E6] mb-6"></div>

            {/* Related Articles */}
            <div className="mb-8">
              <h3 className="font-bold text-[18px] text-[#14161A] mb-2">
                Related Articles
              </h3>
              <div className="flex flex-col">
                {[
                  "Coin Isn't Showing When I Search",
                  "Coin Isn't Showing When I Search on the Mobile App",
                  "Create a Coin on the Mobile App"
                ].map((article, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedArticle(article)}
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

            {/* Feedback */}
            <div className="flex flex-col items-center justify-center mt-4">
              <span className="text-[14px] text-[#6C6F74] mb-3">
                Did this answer your question?
              </span>
               

            <div className="flex items-center gap-3 mb-6 text-3xl">
              <button
                onClick={() => {
                  setSelected("sad");
                  setShowBox(true);
                }}
                className="hover:scale-110 transition-transform grayscale hover:grayscale-0"
              >
                😞
              </button>

              <button
                onClick={() => {
                  setSelected("neutral");
                  setShowBox(false);
                }}
                className="hover:scale-110 transition-transform grayscale hover:grayscale-0"
              >
                😐
              </button>

              <button
                onClick={() => {
                  setSelected("happy");
                  setShowBox(false);
                }}
                className="hover:scale-110 transition-transform grayscale hover:grayscale-0"
              >
                😃
              </button>
            </div>

             {showBox && selected === "sad" && (
        <div className="bg-[#E5E5E5] w-full max-w-sm rounded-xl p-4 flex flex-col items-center mb-6 relative">
          {/* caret */}
          <div className="absolute -top-2 left-[25%] -translate-x-1/2 w-4 h-4 bg-[#E5E5E5] rotate-45"></div>

          <button className="bg-[#86EFAC] text-gray-900 font-bold py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-[#6ce096] transition-colors mb-2 z-10">
            Send us a message
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="m4.394 14.7 9.356-5.4c1-.577 1-2.02 0-2.598L4.394 1.299a1.5 1.5 0 0 0-2.25 1.3v3.438l4.059 1.088c.494.132.494.833 0 .966l-4.06 1.087v4.224a1.5 1.5 0 0 0 2.25 1.299"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <span className="text-[14px] text-[#14161A] z-10">
            We typically reply in under 5 minutes
          </span>
        </div>
      )}

              <button
                onClick={() =>
                  window.open(
                    "https://intercom.help/pumpfun-web/en/articles/11002198-how-to-edit-coin-image-description-and-socials",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="flex items-center gap-2 text-[14px] text-[#6C6F74] hover:text-[#14161A] transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
                Open in help center
              </button>
            </div>
          </div>
        ) : selectedCollection ? (
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
                  onClick={() => setSelectedArticle(article)}
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
  );
}
