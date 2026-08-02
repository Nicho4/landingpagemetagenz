"use client";

import { motion } from "motion/react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background — dusk/golden hour mood.
          Sebelumnya ini CSS background-image biasa. Diganti ke next/image
          + `priority` karena gambar ini kemungkinan besar jadi elemen LCP
          (Largest Contentful Paint) halaman — langsung memenuhi layar di
          atas fold begitu halaman kebuka. `priority` bikin Next preload
          gambar ini lebih awal (skip lazy-loading default yang biasanya
          dipakai next/image), yang biasanya kerasa langsung di skor LCP
          dibanding background-image CSS yang browser baru tau perlu di-load
          setelah CSS-nya di-parse. `alt=""` karena ini murni dekoratif —
          makna halaman ada di teks headline "Welcome Home, Gen Z", bukan di
          foto latar ini, jadi screen reader boleh skip. */}
      <Image
        src="/Images/hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="z-0 object-cover object-center"
      />
      {/* Gradient overlay — warm dusk, not pure black */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#3d2518]/50 via-[#1f1208]/55 to-[#0d0604]/80" />
      {/* Warm amber tint at horizon */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 z-0 bg-gradient-to-t from-[#D97757]/20 to-transparent" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center"
      >
        {/* Handwritten context label */}
        <p className="font-hand text-[#D97757]/90 text-xl md:text-2xl mb-4 tracking-wide">
          Youth Ministry · Gereja GBT Bukit Carmel, Surabaya
        </p>

        <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-[#FDFBF7] tracking-tight mb-5 max-w-4xl leading-[1.05]">
          Welcome Home,{" "}
          <span className="italic font-normal">Gen Z.</span>
        </h1>

        <p className="font-sans text-base sm:text-lg md:text-xl text-[#FDFBF7]/70 max-w-xl mb-10 leading-relaxed px-2">
          Temukan komunitas yang mendukung, bertumbuh bersama, dan temukan tujuan hidupmu. Di sini, kamu diterima apa adanya.
        </p>

        {/* Sabtu 18:30 badge — subtle, handwritten */}
        <div className="flex items-center gap-2">
          <span className="w-6 h-px bg-[#D97757]/60" />
          <p className="font-hand text-[#FDFBF7]/60 text-lg">Setiap Sabtu, 18:30</p>
          <span className="w-6 h-px bg-[#D97757]/60" />
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <div className="w-px h-10 bg-white/20 animate-pulse" />
      </motion.div>
    </section>
  );
}