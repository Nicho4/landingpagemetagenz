"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.2, // makin besar = makin "ngayun" pas berhenti
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // kurva deselerasi ala iOS
        smoothWheel: true, // aktifkan drift untuk mouse wheel
        syncTouch: true,   // aktifkan drift untuk touchscreen
        touchMultiplier: 1.5,
      }}
    >
      {children}
    </ReactLenis>
  );
}