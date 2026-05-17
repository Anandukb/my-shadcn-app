"use client";

import Script from 'next/script';

export default function TawkMessenger() {
  return (
    <Script
      id="tawk-messenger"
      strategy="lazyOnload"
      src="https://embed.tawk.to/6a0991720a71ec1c34c47cf3/1joqm0a92"
      crossOrigin="anonymous"
    />
  );
}
