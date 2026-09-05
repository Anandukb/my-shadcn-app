"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export function TawkChatAssistant() {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Only render after mount so the <video> with autoplay isn't part of the
  // server-rendered HTML (avoids hydration warnings on autoPlay/playsInline).
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowGreeting(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Keep our launcher's open/closed visual state in sync with the actual
  // Tawk chat window, in case the visitor closes it from inside the widget.
  // Tawk's own onChatMinimized re-reveals its default bubble (that's what
  // "minimize" means to Tawk), so we immediately hideWidget() again
  // whenever that happens — the only launcher that should ever be visible
  // is our own animated Galia button.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.Tawk_API = window.Tawk_API || {};
    const prevMaximized = window.Tawk_API.onChatMaximized;
    const prevMinimized = window.Tawk_API.onChatMinimized;
    const prevHidden = window.Tawk_API.onChatHidden;
    window.Tawk_API.onChatMaximized = function () {
      prevMaximized?.();
      setChatOpen(true);
    };
    window.Tawk_API.onChatMinimized = function () {
      prevMinimized?.();
      setChatOpen(false);
      // Re-hide immediately so Tawk's default bubble doesn't flash in.
      window.Tawk_API?.hideWidget?.();
    };
    window.Tawk_API.onChatHidden = function () {
      prevHidden?.();
      setChatOpen(false);
    };
  }, []);

  const handleClick = () => {
    setShowGreeting(false);
    const api = window.Tawk_API;
    if (!api) return;
    if (chatOpen) {
      // Fully hide (not minimize) — minimize() would leave Tawk's own
      // default bubble showing, which is exactly what we don't want.
      api.hideWidget?.();
      setChatOpen(false);
    } else {
      api.showWidget?.();
      api.maximize?.();
      setChatOpen(true);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans select-none">
      <button
        onClick={handleClick}
        className="relative cursor-pointer flex items-center justify-center group focus:outline-none"
        aria-label={t('tawkChat.ariaLabel')}
      >
        {/* Speech bubble greeting */}
        {showGreeting && (
          <div className="absolute bottom-[60%] right-[70%] w-max max-w-[200px]">
            <div className="relative bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 text-sm font-medium px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg border border-neutral-100 dark:border-neutral-700 leading-snug">
              {t('tawkChat.greeting')}
              {/* Tail pointing down-right toward avatar */}
              <span className="absolute -bottom-2 right-3 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white dark:border-t-neutral-800" />
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
                className="absolute -top-2 -left-2 w-5 h-5 bg-neutral-200 dark:bg-neutral-600 rounded-full text-xs flex items-center justify-center cursor-pointer"
                aria-label={t('tawkChat.dismiss')}
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
          {t('tawkChat.videoUnsupported')}
        </video>

        {/* Chat badge */}
        <div className="absolute bottom-1 left-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 animate-pulse">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
            <path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.77 1.44 5.24 3.7 6.86-.12.98-.48 2.55-1.44 3.9-.13.18.01.42.24.38 1.94-.33 3.4-1.14 4.3-1.76.99.28 2.05.42 3.2.42 5.52 0 10-3.94 10-8.8S17.52 2 12 2z" />
          </svg>
        </div>
      </button>
    </div>
  );
}
