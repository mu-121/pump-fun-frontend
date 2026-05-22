import { useState } from "react";
import { X, ChevronLeft, MoreHorizontal, Send } from "lucide-react";

interface SupportMessagesTabProps {
  onClose: () => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}

interface Message {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
  isAgentName?: boolean;
}

export function SupportMessagesTab({ onClose, isExpanded, setIsExpanded }: SupportMessagesTabProps) {
  const [view, setView] = useState<"list" | "chat">("list");
  const [hasConversation, setHasConversation] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "agent",
      text: "How may we assist you today?",
      time: "Just now",
      isAgentName: true,
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const quickReplies = [
    "Coin Details",
    "Trading Problems",
    "Submit Your Feedback",
    "Speak to Support",
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setHasConversation(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "user",
        text,
        time: "Just now",
      },
    ]);
    setInputValue("");

    // Simulate auto-reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: "Thanks for reaching out! An agent will be with you shortly.",
          time: "Just now",
        },
      ]);
    }, 1000);
  };

  if (view === "chat") {
    return (
      <div className="flex-1 flex flex-col h-0 bg-white relative animate-fade-in">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-gray-100 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("list")}
              className="p-1 -ml-1 text-gray-500 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/Images/Sidedrawer/pump-logo.svg"
                alt="Pump.fun"
                className="w-7 h-7"
              />
              <div className="flex flex-col">
                <span className="font-bold text-[15px] text-gray-900 leading-tight">
                  Pump.fun
                </span>
                <span className="text-[12px] text-gray-500 leading-tight">
                  The team can also help
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-gray-500 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-50"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                ></div>
                <div className="absolute top-full right-6 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 animate-fade-in origin-top-right">
                  <button
                    onClick={() => {
                      setIsExpanded(!isExpanded);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors text-left font-medium"
                  >
                    {isExpanded ? (
                      <>
                       <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(-1,0,0,1,0,0)"><path d="M13.59 5.31h-1.7l3.3-3.3-1.2-1.2-3.3 3.3v-1.7a.85.85 0 1 0-1.7 0v4.6h4.6a.85.85 0 1 0 0-1.7M1.57 9.84c0 .47.38.85.85.85h1.7l-3.3 3.3 1.2 1.2 3.3-3.3v1.7a.85.85 0 1 0 1.7 0v-4.6h-4.6a.85.85 0 0 0-.85.85" fill="currentColor"></path></svg>
                        Collapse window
                      </>
                    ) : (
                      <>
                       <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(-1,0,0,1,0,0)"><path d="M6.49001 8.30999L3.69 11.11V9.40999C3.69 8.93999 3.31 8.55999 2.84 8.55999C2.37 8.55999 1.99001 8.93999 1.99001 9.40999V14.01H6.59C7.06 14.01 7.44 13.63 7.44 13.16C7.44 12.69 7.06 12.31 6.59 12.31H4.89L7.69 9.50999L6.49001 8.30999ZM9.41 1.98999C8.94 1.98999 8.56001 2.36999 8.56001 2.83999C8.56001 3.30999 8.94 3.68999 9.41 3.68999H11.11L8.31001 6.48999L9.51 7.68999L12.31 4.88999V6.58999C12.31 7.05999 12.69 7.43999 13.16 7.43999C13.63 7.43999 14.01 7.05999 14.01 6.58999V1.98999H9.41Z" fill="currentColor"></path></svg>
                        Expand window
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Info Banner */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 flex gap-3 text-[13px] text-gray-600 shadow-sm leading-relaxed">
            <div className="shrink-0 pt-[2px]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <p className="text-[#6C6F74] font-semibold">
              This chat is dedicated to pump.fun platform support. Please keep
              your messages focused on support-related inquiries. Thank you!
            </p>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-4 mt-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                    msg.sender === "user"
                      ? "bg-[#0A321A] text-white rounded-br-sm"
                      : "bg-[#F3F4F6] text-gray-900 rounded-bl-sm font-bold text-[17px]"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "agent" && msg.isAgentName && (
                  <span className="text-[11px] text-gray-500 mt-1 ml-1">
                    Pump.fun • AI Agent • {msg.time}
                  </span>
                )}
                {msg.sender === "user" && (
                  <span className="text-[11px] text-gray-500 mt-1 mr-1">
                    {msg.time}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Footer / Quick Replies */}
        <div className="p-4 bg-gradient-to-t from-white via-white to-transparent shrink-0">
          {/* Quick Replies (only show if user hasn't sent anything yet, or keep showing?) Let's show only if we want them as options */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 justify-end mb-4">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(reply)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-[14px] text-[#126D34] font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Area (Visible after first interaction or always) */}
          {messages.length > 1 && (
            <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 bg-white shadow-sm focus-within:border-[#0A321A] transition-colors">
              <input
                type="text"
                placeholder="Reply..."
                className="flex-1 bg-transparent border-none outline-none text-[14px] text-gray-900 placeholder:text-gray-400"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend(inputValue);
                }}
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim()}
                className="p-1.5 text-gray-400 hover:text-[#0A321A] disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="flex-1 flex flex-col h-0 bg-white relative animate-fade-in">
      {/* List Header */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-10 relative">
        <div className="w-8"></div>
        <h2 className="font-bold text-[16px] text-gray-900">Messages</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* List Content */}
      <div
        className="flex-1 overflow-y-auto px-4 py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {hasConversation ? (
          <button
            onClick={() => setView("chat")}
            className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/Images/Sidedrawer/pump-logo.svg"
                  alt="Pump.fun"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-[14px] text-gray-900 leading-tight">
                  Pump.fun
                </span>
                <span className="text-[13px] text-gray-500 mt-0.5 line-clamp-1 text-left">
                  {messages[messages.length - 1]?.text || "Coin Details"}
                </span>
              </div>
            </div>
            <span className="text-[12px] text-gray-400 shrink-0">
              {messages[messages.length - 1]?.time || "Just now"}
            </span>
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold text-[18px]">No messages</h3>
            <p className="text-gray-500 text-[14px] max-w-[200px]">
              Messages from the team will be shown here
            </p>
          </div>
        )}
      </div>

      {/* Send Message Button Overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4 pointer-events-none">
        <button
          onClick={() => setView("chat")}
          className="pointer-events-auto bg-[#86EFAC] text-[#0A321A] font-bold text-[14px] py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-[#6ce096] transition-all shadow-[0_4px_14px_rgba(134,239,172,0.4)] active:scale-95"
        >
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
      </div>
    </div>
  );
}
