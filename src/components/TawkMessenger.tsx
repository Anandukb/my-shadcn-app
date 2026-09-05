"use client";

import Script from 'next/script';
import { useEffect } from 'react';

export default function TawkMessenger() {
  useEffect(() => {
    // We render our own animated Galia launcher (TawkChatAssistant) instead
    // of Tawk's default bubble, so the default widget button must never be
    // visible on its own. Also enable "Hide widget on load in desktop" in
    // the tawk.to dashboard (Chat Widget > Widget Behavior) for a
    // server-side guarantee — this JS is a client-side safety net on top
    // of that setting, and covers browsers/pages where that setting
    // doesn't apply (e.g. mobile).
    window.Tawk_API = window.Tawk_API || {};

    const forceHide = () => {
      window.Tawk_API?.hideWidget?.();
    };

    const existingOnLoad = window.Tawk_API.onLoad;
    window.Tawk_API.onLoad = function () {
      existingOnLoad?.();
      forceHide();
      // Tawk's embed can briefly flash the bubble in during its own
      // load/animation sequence even after hideWidget() is called once,
      // so re-assert the hidden state a few more times just after load.
      [300, 1000, 2500, 5000].forEach((delay) => setTimeout(forceHide, delay));
    };

    // If the script had already loaded before this effect ran (e.g. a
    // client-side route change remounted this component late), hide it
    // immediately rather than waiting for onLoad to fire again.
    if (window.Tawk_API.hideWidget) {
      forceHide();
    }
  }, []);

  return (
    <Script
      id="tawk-messenger"
      strategy="lazyOnload"
      src="https://embed.tawk.to/6a0991720a71ec1c34c47cf3/1joqm0a92"
      crossOrigin="anonymous"
    />
  );
}
