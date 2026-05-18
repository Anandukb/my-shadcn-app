"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export function WhatsAppAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneNumber = "919446678765";
    
    // Custom formatted text including the user's name
    let text = "Hi! I need some assistance.";
    if (name.trim()) {
      text += ` My name is ${name.trim()}.`;
    }
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] font-sans select-none">
      {/* 1. The Floating Animated Character Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 group focus:outline-none"
        aria-label="Contact Assistant"
      >
        {/* Video Avatar Container */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-20 h-40 object-contain"
        >
          <source src="/whatsapp-avatar.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        
        {/* WhatsApp Green Badge Indicator */}
        <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#25D366] rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 animate-pulse">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.973 0c3.184.001 6.177 1.242 8.426 3.496 2.248 2.254 3.487 5.251 3.486 8.439-.004 6.625-5.34 11.97-11.914 11.97-1.996-.001-3.96-.5-5.707-1.45L0 24zm6.59-4.846c1.66.986 3.288 1.507 4.96c1.002 6.11 5.39 10.51 10.514 10.511 2.455-.001 4.763-.958 6.498-2.697 1.734-1.739 2.688-4.05 2.689-6.51-.003-5.115-4.131-9.245-9.243-9.245-2.456 0-4.764.959-6.5 2.699-1.734 1.74-2.688 4.051-2.688 6.512.002 1.83.493 3.52 1.464 5.03l-.993 3.626 3.714-.974zm11.233-6.05c-.3-.15-1.773-.875-2.047-.975-.275-.1-.475-.15-.675.15-.2.3-.775 1-.95 1.2-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.794-1.49-1.774-1.665-2.075-.175-.3-.018-.463.13-.61.134-.133.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525c-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8 0-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.22 5.11 4.52.714.31 1.27.494 1.704.632.717.227 1.37.195 1.888.118.577-.087 1.773-.725 2.022-1.425.25-.7.25-1.294.175-1.425-.075-.13-.275-.205-.575-.355z" />
          </svg>
        </div>
      </button>

      {/* 2. Mini Name Prompt Modal */}
      {isOpen && (
        <div className="absolute bottom-28 left-0 w-[300px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-4 text-white text-center font-bold tracking-wide">
            Maram Assistant
          </div>
          <form onSubmit={handleConnect} className="p-5 flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold block">
                Please enter your name to connect:
              </label>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold py-3 rounded-xl border-0 shadow-md text-sm cursor-pointer transition-all flex items-center justify-center"
            >
              Chat on WhatsApp
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
