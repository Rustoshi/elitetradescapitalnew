"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export function LiveChatWidget() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Script
        id="smartsupp-key"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `var _smartsupp = _smartsupp || {}; _smartsupp.key = 'bb5a6bde76994b583895c1651c088d88a9d404eb';`,
        }}
      />
      <Script
        id="smartsupp-loader"
        src="https://www.smartsuppchat.com/loader.js?"
        strategy="afterInteractive"
      />
    </>
  );
}