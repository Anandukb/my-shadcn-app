"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export function WhatsAppAssistant() {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  // Only render after mount so the <video> with autoplay isn't part of the
  // server-rendered HTML (otherwise React warns about hydration mismatches
  // on auto-normalized boolean attributes like autoPlay/playsInline).
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowGreeting(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    const phoneNumber = "919446678765";
    const text = t('whatsapp.prefilledMessage');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
    setShowGreeting(false);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[9999] font-sans select-none">
      <button
        onClick={handleClick}
        className="relative cursor-pointer flex items-center justify-center group focus:outline-none"
        aria-label={t('whatsapp.ariaLabel')}
      >
        {/* Speech bubble greeting */}
        {showGreeting && (
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

        {/* WhatsApp Green Badge */}
        <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#25D366] rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 animate-pulse">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.973 0c3.184.001 6.177 1.242 8.426 3.496 2.248 2.254 3.487 5.251 3.486 8.439-.004 6.625-5.34 11.97-11.914 11.97-1.996-.001-3.96-.5-5.707-1.45L0 24zm6.59-4.846c1.66.986 3.288 1.507 4.96 1.002 6.11 5.39 10.51 10.514 10.511 2.455-.001 4.763-.958 6.498-2.697 1.734-1.739 2.688-4.05 2.689-6.51-.003-5.115-4.131-9.245-9.243-9.245-2.456 0-4.764.959-6.5 2.699-1.734 1.74-2.688 4.051-2.688 6.512.002 1.83.493 3.52 1.464 5.03l-.993 3.626 3.714-.974zm11.233-6.05c-.3-.15-1.773-.875-2.047-.975-.275-.1-.475-.15-.675.15-.2.3-.775 1-.95 1.2-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.794-1.49-1.774-1.665-2.075-.175-.3-.018-.463.13-.61.134-.133.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525c-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.22 5.11 4.52.714.31 1.27.494 1.704.632.717.227 1.37.195 1.888.118.577-.087 1.773-.725 2.022-1.425.25-.7.25-1.294.175-1.425-.075-.13-.275-.205-.575-.355z" />
          </svg>
        </div>
      </button>
    </div>
  );
}
