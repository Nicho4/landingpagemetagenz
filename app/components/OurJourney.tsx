"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Maximize2, X } from "lucide-react";
import Image from "next/image";

const milestones = [
  {
    date: "Juni 2018",
    title: "The Loving Heart",
    description:
      "Retreat yang mengangkat tema \u201cThe Loving Heart\u201d, sekaligus jadi farewell pengurus lama kaum muda GBC Bukit Carmel sebelum diserahterimakan kepada pengurus yang baru.",
    image: "/Images/Journey1.webp",
    tilt: "-rotate-2",
    tiltDeg: -2,
    tape: { width: "w-14", color: "bg-[#D97757]/30", angle: "rotate-[-6deg]" },
  },
  {
    date: "7 Maret 2020",
    title: "Awal yang Baru",
    description:
      "Titik awal transisi kepengurusan baru di kaum muda GBC Bukit Carmel.",
    image: "/Images/Journey2.webp",
    tilt: "rotate-2",
    tiltDeg: 2,
    tape: { width: "w-12", color: "bg-[#A09080]/35", angle: "rotate-[5deg]" },
  },
  {
    date: "2020",
    title: "Ibadah Daring",
    description:
      "Selama masa pandemi, social distancing tidak membatasi semangat kami untuk terus mengadakan ibadah kaum muda kali ini lewat sarana daring.",
    image: "/Images/Journey3.webp",
    tilt: "-rotate-[1.5deg]",
    tiltDeg: -1.5,
    tape: { width: "w-16", color: "bg-[#D97757]/25", angle: "rotate-[-4deg]" },
  },
  {
    date: "4 April 2021",
    title: "Kembali Onsite",
    description:
      "Sukacita bertambah saat ibadah onsite mulai diijinkan kembali. Kami memulainya dengan Ibadah Paskah Kaum Muda.",
    image: "/Images/Journey4.webp",
    tilt: "rotate-[1.5deg]",
    tiltDeg: 1.5,
    tape: { width: "w-14", color: "bg-[#A09080]/30", angle: "rotate-[6deg]" },
  },
  {
    date: "11 Desember 2021",
    title: "Lahirnya MetaGenz",
    description:
      "Natal Kaum Muda, sekaligus hari lahirnya nama komunitas: \u201cMetanoia Generationz\u201d yang kini kita kenal sebagai MetaGenz. Lahir dari kerinduan akan transformasi mendasar yang membuat seseorang berbalik dari dosa dan berpaling kepada Allah, sehingga semakin serupa dengan Kristus.",
    image: "/Images/Journey5.webp",
    tilt: "-rotate-2",
    tiltDeg: -2,
    tape: { width: "w-16", color: "bg-[#D97757]/30", angle: "rotate-[-5deg]" },
  },
];

// ─── Dekorasi ala scrapbook (washi tape) — dipakai di lightbox biar gayanya
// konsisten sama lightbox di MemoriesGallery. ──────────────────────────────
function ScrapDecoration({ variant }: { variant: number }) {
  const v = variant % 3;
  if (v === 0) {
    return (
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-2 w-14 h-5 bg-[#D97757]/35 shadow-sm z-10 [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.4)_4px,rgba(255,255,255,0.4)_6px)]"
      />
    );
  }
  if (v === 1) {
    return (
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2.5 right-5 w-11 h-5 rotate-6 bg-[#A09080]/45 shadow-sm z-10 [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.35)_4px,rgba(255,255,255,0.35)_6px)]"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-1.5 left-6 w-3 h-3 rounded-full bg-[#1A202C]/70 shadow-[0_2px_4px_rgba(0,0,0,0.35)] z-10"
    />
  );
}

// Sparkle dekoratif — cuma hidup selama lightbox kebuka (di-mount/unmount
// lewat AnimatePresence), jadi animasi loop Framer-nya nggak pernah jalan
// sia-sia di background waktu lightbox tertutup.
function FloatingSparkle({
  className,
  duration,
  delay,
}: {
  className: string;
  duration: number;
  delay: number;
}) {
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute font-hand text-[#D97757]/40 select-none ${className}`}
      animate={{ y: [0, -14, 0], opacity: [0.12, 0.35, 0.12] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      ✦
    </motion.span>
  );
}

// ─── Lightbox foto perjalanan: nampilin PERSIS foto yang diklik doang,
// nggak ada navigasi ganti foto (nggak ada panah/swipe/counter) dan nggak
// bisa di-scroll. Komponen ini cuma hidup pas lightbox kebuka, jadi nggak
// ada kalkulasi per-frame yang nempel terus di halaman dan bikin stutter. ──
function JourneyLightbox({
  item,
  index,
  onClose,
}: {
  item: (typeof milestones)[number];
  index: number;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Kunci scroll halaman selama lightbox kebuka — pola yang sama dengan
  // GalleryOverlay di MemoriesGallery, biar Lenis (smooth-scroll global
  // situs) nggak ikut ke-scroll di belakang modal.
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const stopBubble = (e: Event) => e.stopPropagation();
    const overlay = overlayRef.current;
    overlay?.addEventListener("wheel", stopBubble, { passive: true });
    overlay?.addEventListener("touchmove", stopBubble, { passive: true });

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      overlay?.removeEventListener("wheel", stopBubble);
      overlay?.removeEventListener("touchmove", stopBubble);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={overlayRef}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      // Sengaja TANPA backdrop-blur — background udah 97% opaque, jadi
      // blur nggak nambah efek visual berarti tapi lumayan berat di-render.
      className="fixed inset-0 z-[70] bg-[#1F1611]/97 flex items-center justify-center overscroll-none [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:26px_26px] px-6"
    >
      <FloatingSparkle className="text-xl top-20 left-8 md:left-16" duration={5} delay={0} />
      <FloatingSparkle className="text-2xl top-1/3 right-10 md:right-24" duration={6.5} delay={0.8} />
      <FloatingSparkle className="text-lg bottom-24 left-1/4" duration={5.5} delay={1.4} />
      <FloatingSparkle className="text-xl bottom-1/3 right-1/4" duration={7} delay={0.4} />

      <motion.button
        onClick={onClose}
        aria-label="Tutup"
        whileHover={{ scale: 1.08, rotate: 90 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757]"
      >
        <X className="w-5 h-5" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1, rotate: item.tiltDeg }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white shadow-2xl pt-3 px-3 pb-6 md:pt-4 md:px-4 md:pb-7 max-w-[90vw] flex flex-col items-center"
      >
        <ScrapDecoration variant={index} />
        <img
          src={item.image}
          alt={item.title}
          draggable={false}
          className="block max-h-[60vh] md:max-h-[68vh] max-w-[80vw] md:max-w-[62vw] w-auto h-auto select-none pointer-events-none"
        />
        <div className="mt-4 text-center px-2 max-w-md">
          <p className="font-hand text-[#D97757] text-base md:text-lg">
            {item.date}
          </p>
          <h3 className="font-heading text-lg md:text-xl font-bold text-[#1A202C]">
            {item.title}
          </h3>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function OurJourney() {
  const [selectedIndex, setSelectedIndex] = (require("react") as typeof import("react")).useState<number | null>(null);

  return (
    // Update: Added bg-gradient-to-br from-[#F6F0E6] via-white to-[#F6F0E6] for a livelier background
    <section className="relative py-16 md:py-24 lg:py-32 bg-[#F6F0E6] bg-gradient-to-br from-[#F6F0E6] via-white to-[#F6F0E6] overflow-hidden">

      {/* Keyframes CSS murni buat 3 doodle dekoratif di bawah. Sebelumnya
          ketiganya pakai Framer Motion `animate` dengan `repeat: Infinity`
          — itu artinya Framer terus menghitung ulang posisinya tiap frame
          lewat JS selama section ini ada di DOM, walaupun lagi nggak
          kelihatan di layar (misalnya orang udah scroll jauh ke bawah).
          CSS @keyframes berjalan di compositor thread browser, jauh lebih
          murah buat animasi loop terus-menerus kayak ini — pola yang sama
          juga sudah dipakai di HighlightReel.tsx (lihat `reelFloat`). */}
      <style>{`
        @keyframes journeyCrossFloat {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-20px) rotate(-8deg); }
        }
        @keyframes journeyFishDrift {
          0%, 100% { transform: translate(0, 0) rotate(12deg); }
          50% { transform: translate(15px, 10px) rotate(18deg); }
        }
        @keyframes journeySparklePulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>

      {/* --- BACKGROUND DECORATIONS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Glow/Blobs */}
        <div className="absolute top-10 left-[-10%] w-96 h-96 bg-[#D97757]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-[-5%] w-[30rem] h-[30rem] bg-[#A09080]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-[-5%] w-80 h-80 bg-[#D97757]/10 rounded-full blur-3xl" />

        {/* Animated Doodle 1 (Christian Cross Icon) - Slow float and rotate.
            motion-reduce:animate-none: kalau visitor set "reduce motion" di
            OS/browser-nya, doodle ini diam total lewat CSS media query,
            tanpa perlu JS tambahan buat cek useReducedMotion(). */}
        <svg
          className="absolute top-[15%] right-[15%] w-24 h-24 text-[#D97757]/20 motion-reduce:animate-none animate-[journeyCrossFloat_7s_ease-in-out_infinite]"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M11 2v9H2v2h9v9h2v-9h9v-2h-9V2z"/>
        </svg>

        {/* Animated Doodle 2 (Ichthys Fish Icon) - Slow drift and twist */}
        <svg
          className="absolute bottom-[20%] left-[10%] w-32 h-32 text-[#A09080]/20 motion-reduce:animate-none animate-[journeyFishDrift_9s_ease-in-out_infinite]"
          style={{ animationDelay: "1s" }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M2.2 12.16c.4-.73 1.16-1.37 2.1-1.8 1.1-.51 2.53-.76 4.1-.71.5.02.99.06 1.48.12l.06-.06.06.06c.5-.06 1-.1 1.5-.12 1.57-.05 3-.3 4.1-.71.94-.43 1.7-1.07 2.1-1.8.4-.73.66-1.57.73-2.48l1.08.08c-.1 1.1-.4 2.16-.89 3.12-.49.96-1.22 1.83-2.12 2.54 1 .71 1.8 1.58 2.12 2.54.4.96.69 2.02.89 3.12l-1.08.08c-.07-.91-.33-1.75-.73-2.48-.4-.73-1.16-1.37-2.1-1.8-1.1-.51-2.53-.76-4.1-.71-.5-.02-1-.06-1.5-.12l-.06.06-.06-.06c-.5.06-1-.1-1.5-.12-1.57-.05-3-.3-4.1-.71-.94-.43-1.7-1.07-2.1-1.8-.4-.73-.66-1.57-.73-2.48z"/>
        </svg>

        {/* New Animated Doodle 3 (Sparkle/Star) - Subtle pulsing */}
        <svg
          className="absolute top-[8%] left-[20%] w-8 h-8 text-[#D97757]/30 motion-reduce:animate-none animate-[journeySparklePulse_4s_linear_infinite]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/>
        </svg>
      </div>
      {/* ------------------------------ */}

      <div className="container relative z-10 mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-xl mx-auto mb-16 md:mb-24"
        >
          <p className="font-hand text-[#D97757] text-xl md:text-2xl mb-2">
            Sejak 2018
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A202C] leading-tight">
            Perjalanan yang <br />
            <span className="italic font-normal">Membentuk Kami.</span>
          </h2>
          <p className="font-sans text-[#718096] mt-4 text-base md:text-lg">
            Dari sebuah retreat kecil, sampai jadi nama yang kita pakai hari ini.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Wrapper khusus untuk garis + list milestone, supaya tinggi garis
              tidak ikut memanjang sampai ke teks penutup di bawahnya */}
          <div className="relative">
            {/* Hand-drawn connecting line — dibatasi hanya setinggi wrapper ini */}
            <div
              className="absolute top-0 bottom-0 left-6 md:left-1/2 w-px md:-translate-x-1/2 border-l-2 border-dashed border-[#D97757]/30 z-0"
              aria-hidden="true"
            />

            {/* Spacing adjusted for larger photos */}
            <div className="space-y-16 md:space-y-10">
              {milestones.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={item.date}
                    initial={{ opacity: 0, x: isEven ? 10 : -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: index * 0.1 }}
                    className="relative grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 items-center pl-16 md:pl-0 md:py-12"
                  >
                    {/* Pin marker on the line — Christian Cross Icon */}
                    <div className="absolute left-6 md:left-1/2 top-8 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-20">
                      <svg className="w-8 h-8 text-[#4A4238] shadow" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11 2v9H2v2h9v9h2v-9h9v-2h-9V2z"/>
                      </svg>
                    </div>

                    {/* Photo — Classic Film Photo Frame. Klik buat buka
                        lightbox khusus foto ini (lihat JourneyLightbox). */}
                    <div
                      className={`${isEven ? "md:order-1" : "md:order-2"} flex ${
                        isEven ? "md:justify-end" : "md:justify-start"
                      } justify-start`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        aria-label={`Perbesar foto: ${item.title}`}
                        className={`group relative bg-white shadow-xl ${item.tilt} hover:rotate-0 transition-transform duration-500 w-full max-w-[360px] appearance-none border-0 p-0 m-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757] focus-visible:ring-offset-2`}
                      >
                        {/* Film Strip Holes — Upper */}
                        <svg className="absolute -top-3 left-0 w-full h-3 text-[#F6F0E6]" fill="currentColor" viewBox="0 0 100 8">
                          <circle cx="5" cy="4" r="3" />
                          <circle cx="15" cy="4" r="3" />
                          <circle cx="25" cy="4" r="3" />
                          <circle cx="35" cy="4" r="3" />
                          <circle cx="45" cy="4" r="3" />
                          <circle cx="55" cy="4" r="3" />
                          <circle cx="65" cy="4" r="3" />
                          <circle cx="75" cy="4" r="3" />
                          <circle cx="85" cy="4" r="3" />
                          <circle cx="95" cy="4" r="3" />
                        </svg>

                        {/* Film Strip Holes — Lower */}
                        <svg className="absolute -bottom-3 left-0 w-full h-3 text-[#F6F0E6]" fill="currentColor" viewBox="0 0 100 8">
                          <circle cx="5" cy="4" r="3" />
                          <circle cx="15" cy="4" r="3" />
                          <circle cx="25" cy="4" r="3" />
                          <circle cx="35" cy="4" r="3" />
                          <circle cx="45" cy="4" r="3" />
                          <circle cx="55" cy="4" r="3" />
                          <circle cx="65" cy="4" r="3" />
                          <circle cx="75" cy="4" r="3" />
                          <circle cx="85" cy="4" r="3" />
                          <circle cx="95" cy="4" r="3" />
                        </svg>

                        {/* Photo Container */}
                        <div className="relative aspect-[4/3] overflow-hidden m-4">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(min-width: 768px) 360px, 90vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                            <Maximize2 className="w-6 h-6 text-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Story text */}
                    <div
                      className={`${isEven ? "md:order-2" : "md:order-1"} ${
                        isEven ? "md:text-left" : "md:text-right"
                      } text-left`}
                    >
                      <p className="font-hand text-[#D97757] text-lg md:text-xl mb-1">
                        {item.date}
                      </p>
                      <h3 className="font-heading text-lg md:text-xl font-bold text-[#1A202C] mb-2">
                        {item.title}
                      </h3>
                      <p className="font-sans text-sm md:text-base text-[#4A5568] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Closing note — sekarang berada di luar wrapper garis, jadi tidak bertabrakan */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-hand text-[#A09080] text-lg md:text-xl text-center mt-12 md:mt-16 pl-16 md:pl-0"
          >
            ...dan cerita ini terus berlanjut, bersama kamu ✦
          </motion.p>
        </div>
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <JourneyLightbox
            item={milestones[selectedIndex]}
            index={selectedIndex}
            onClose={() => setSelectedIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}