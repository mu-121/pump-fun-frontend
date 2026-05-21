import { useState } from "react";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

import { SupportHomeTab } from "../support/SupportHomeTab";
import { SupportMessagesTab } from "../support/SupportMessagesTab";
import { SupportHelpTab } from "../support/SupportHelpTab";
import { SupportBottomNav } from "../support/SupportBottomNav";

export function SupportWidget(): JSX.Element | null {
  const open = useUiStore((s) => s.supportWidgetOpen);
  const setOpen = useUiStore((s) => s.setSupportWidgetOpen);

  const [activeTab, setActiveTab] = useState<"home" | "messages" | "help">("home");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  if (!open) return null;

  return createPortal(
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[9999] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-[#F9FAFB] animate-fade-in transition-all duration-300",
        isExpanded
          ? "w-[800px] h-[800px] max-w-[95vw] max-h-[95vh]"
          : "w-[380px] h-[600px]"
      )}
      style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif' }}
    >
      {activeTab === "home" && (
        <SupportHomeTab
          onClose={() => setOpen(false)}
          onArticleSelect={(article) => {
            setSelectedArticle(article);
            setActiveTab("help");
          }}
          onGoToMessages={() => setActiveTab("messages")}
        />
      )}
      
      {activeTab === "messages" && (
        <SupportMessagesTab
          onClose={() => setOpen(false)}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      )}

      {activeTab === "help" && (
        <SupportHelpTab
          onClose={() => setOpen(false)}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          selectedArticle={selectedArticle}
          setSelectedArticle={setSelectedArticle}
        />
      )}

      {/* Bottom Navigation */}
      <SupportBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>,
    document.body
  );
}
