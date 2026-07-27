"use client";

import { useId } from "react";

export type FastenerType = "tape" | "pin" | "paperclip";

// Washi tape / push-pin / paperclip — dipakai buat "nempelin" kartu-kartu
// bergaya scrapbook di beberapa section (Visi & Misi di Connect.tsx,
// Testimonials.tsx, dst). Sebelumnya komponen ini di-copy-paste persis sama
// di dua file berbeda; disatukan di sini supaya cuma ada satu sumber
// kebenaran — kalau mau ubah tampilan fastener, cukup ubah di sini.
//
// gradientId sekarang dibikin otomatis lewat useId() (bukan diterima
// sebagai prop dari luar). Sebelumnya versi di Testimonials.tsx pakai id
// literal "pinGradient" yang sama persis untuk SETIAP instance — itu aman
// selama section itu cuma pernah punya satu fastener bertipe "pin", tapi
// begitu ada dua atau lebih di halaman yang sama, itu jadi duplicate id di
// DOM (HTML invalid, dan browser bisa salah ambil gradient punya instance
// lain). useId() menjamin tiap instance dapat id unik tanpa perlu si
// pemanggil mikirin itu sama sekali.
export function Fastener({ type, color }: { type: FastenerType; color: string }) {
  const gradientId = useId();

  if (type === "tape") {
    return (
      <div
        aria-hidden
        className="w-14 h-6"
        style={{
          background: `linear-gradient(135deg, ${color}66, ${color}33)`,
          clipPath:
            "polygon(3% 0%, 9% 22%, 3% 44%, 9% 66%, 3% 88%, 9% 100%, 91% 100%, 97% 88%, 91% 66%, 97% 44%, 91% 22%, 97% 0%)",
          boxShadow: "0 2px 5px rgba(26,32,44,0.12)",
        }}
      />
    );
  }

  if (type === "pin") {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        aria-hidden
        style={{ filter: "drop-shadow(0 3px 3px rgba(26,32,44,0.3))" }}
      >
        <defs>
          <radialGradient id={gradientId} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="40%" stopColor={color} />
            <stop offset="100%" stopColor="#8a3d24" />
          </radialGradient>
        </defs>
        <circle cx="13" cy="13" r="9" fill={`url(#${gradientId})`} />
      </svg>
    );
  }

  return (
    <svg
      width="30"
      height="46"
      viewBox="0 0 30 46"
      className="-rotate-6"
      aria-hidden
      style={{ filter: "drop-shadow(0 3px 3px rgba(26,32,44,0.2))" }}
    >
      <path
        d="M8 6C8 3 11 1 15 1C19 1 22 3 22 7L22 30C22 36 17 40 11 40C5 40 1 36 1 30L1 12"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}