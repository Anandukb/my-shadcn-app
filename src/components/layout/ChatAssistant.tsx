"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { LiveChatPanel } from "@/components/layout/LiveChatPanel";

export function ChatAssistant() {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Only render after mount so the <video> with autoplay isn't part of the
  // server-rendered HTML (otherwise React warns about hydration mismatches
  // on auto-normalized boolean attributes like autoPlay/playsInline).
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowGreeting(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    setChatOpen((open) => !open);
    setShowGreeting(false);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[9999] font-sans">
      <LiveChatPanel open={chatOpen} onClose={() => setChatOpen(false)} onUnreadChange={setUnread} />

      <button
        onClick={handleClick}
        className={`relative cursor-pointer items-center justify-center group focus:outline-none select-none ${chatOpen ? "hidden" : "flex"}`}
        aria-label={t('liveChat.openChat')}
      >
        {/* Speech bubble greeting */}
        {showGreeting && !chatOpen && (
          <div className="absolute bottom-[60%] left-[70%] w-max max-w-[200px]">
            <div className="relative bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 text-sm font-medium px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-lg border border-neutral-100 dark:border-neutral-700 leading-snug">
              {t('whatsapp.greeting')}
              {/* Tail pointing down-left toward avatar */}
              <span className="absolute -bottom-2 left-3 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white dark:border-t-neutral-800" />
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); setShowGreeting(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowGreeting(false);
                  }
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-200 dark:bg-neutral-600 rounded-full text-xs flex items-center justify-center cursor-pointer"
                aria-label={t('whatsapp.dismiss')}
              >
                ×
              </span>
            </div>
          </div>
        )}

        {/* Video Avatar */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-20 h-40 object-contain"
        >
          <source src="/whatsapp-avatar.webm" type="video/webm" />
          {t('whatsapp.videoUnsupported')}
        </video>

        {/* Chat badge — shows unread replies while the panel is closed */}
        <div className="absolute bottom-1 right-1 min-w-6 h-6 px-1 bg-[#25D366] rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          {unread > 0 ? (
            <span className="text-[10px] font-bold leading-none text-white">{unread > 9 ? "9+" : unread}</span>
          ) : (
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          )}
        </div>
      </button>
    </div>
  );
}
