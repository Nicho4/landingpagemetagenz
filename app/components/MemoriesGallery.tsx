"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useDragControls,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

const rotations = [
  "-rotate-2",
  "rotate-2",
  "-rotate-3",
  "rotate-3",
  "-rotate-1",
  "rotate-1",
];

// Derajat rotasi yang sama persis dengan `rotations` di atas, dalam angka.
// Dipakai di elemen yang transform-nya dikontrol Framer Motion (motion.div
// dengan drag/animate/whileHover) — Framer menulis transform lewat inline
// style, yang akan MENIMPA class Tailwind seperti `-rotate-2` (sama-sama
// menyasar properti `transform`). Supaya tilt pigora-nya tetap kelihatan di
// elemen-elemen itu, kita kasih rotate lewat variants/whileHover, bukan
// class Tailwind.
const rotationDegrees = [-2, 2, -3, 3, -1, 1];

interface PhotoItem {
  src: string;
  rotation: string;
  rotationDeg: number;
}

// Daftar foto (`src`) dikirim lewat prop `photos` dari Memories.tsx (server
// component yang scan folder public/Images) — lihat file itu buat
// penjelasan lengkapnya. Di sinilah tiap foto dipasangkan sama rotasi
// dekoratifnya berdasarkan urutan index (lihat `photoItems` di dalam
// komponen MemoriesGallery di bawah), bukan lagi hardcode di module scope.

// Kecepatan geser marquee dalam pixel per detik.
// Makin besar angkanya, makin cepat geraknya.
const SPEED_PX_PER_SEC = 90;

// ─── Tuning untuk momentum setelah drag dilepas ────────────────────────────
const MOMENTUM_TRIGGER_VELOCITY = 80; // px/s — di bawah ini nggak usah momentum
const MOMENTUM_MIN_VELOCITY = 40; // px/s — di bawah ini momentum dianggap selesai
const MOMENTUM_FRICTION = 2.2; // makin besar, makin cepat momentum-nya meluruh
const MAX_FLICK_VELOCITY = 3500; // px/s — batas atas biar nggak "terbang" kalau di-flick keras

const SWIPE_THRESHOLD = 80; // px — jarak geser minimum di lightbox buat ganti foto

// ─── Tuning untuk deteksi arah gesture MANUAL di track marquee ────────────
// (dipakai buat gantiin `dragDirectionLock` bawaan Framer — lihat komentar
// panjang di useEffect deteksi arah, di bawah, buat alasan lengkapnya)
const DIRECTION_LOCK_THRESHOLD = 10; // px — gerakan minimum sebelum kita berani nebak arah
const HORIZONTAL_BIAS = 1.15; // gerakan X harus > gerakan Y dikali segini biar dianggap "sengaja horizontal"

function clampVelocity(v: number) {
  const sign = v < 0 ? -1 : 1;
  return sign * Math.min(Math.abs(v), MAX_FLICK_VELOCITY);
}

// Akses instance Lenis (smooth-scroll global situs ini) buat di-pause pas
// user beneran lagi drag horizontal, dan di-resume begitu selesai — biar
// Lenis nggak pernah "rebutan" sama drag horizontal si marquee.
//
// PENTING: ini nebak Lenis-nya diekspos lewat `window.lenis` (pola umum
// buat instance "global"). Kalau di project ini aksesnya beda — misalnya
// pakai hook `useLenis()` dari package `lenis/react` — ganti isi function
// ini (dan pindahin manggilnya ke dalam komponen kalau perlu pakai hook).
// Dibungkus optional chaining di semua pemanggilannya, jadi kalaupun
// tebakan ini salah, nggak bakal nge-crash — cuma nggak berefek sama sekali.
function getLenis(): { stop?: () => void; start?: () => void } | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { lenis?: { stop?: () => void; start?: () => void } })
    .lenis;
}

// ─── Dekorasi ala scrapbook (washi tape / pin) — dipakai di marquee, grid
// galeri, dan lightbox biar tampilan "pigora"-nya konsisten di semua tempat
// foto ditampilkan. ──────────────────────────────────────────────────────
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

// Sparkle dekoratif yang melayang pelan di background galeri — murni hiasan,
// bikin suasana galeri terasa lebih "hidup" tanpa mengganggu interaksi.
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

function PhotoCard({
  photo,
  index,
  onOpen,
}: {
  photo: PhotoItem;
  index: number;
  onOpen: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      className={`flex-shrink-0 h-72 md:h-80 bg-white border border-black/5 shadow-[0_10px_26px_-14px_rgba(26,18,8,0.4)] hover:shadow-[0_20px_40px_-16px_rgba(26,18,8,0.5)] transition-all duration-300 cursor-pointer select-none ${photo.rotation} hover:rotate-0 hover:scale-[1.04] active:scale-[0.98] hover:z-10 relative pt-2.5 px-2.5 pb-7`}
    >
      <ScrapDecoration variant={index} />
      <div className="h-full w-full overflow-hidden bg-gray-100">
        <img
          src={photo.src}
          alt={`Memory ${index + 1}`}
          loading="lazy"
          decoding="async"
          className="h-full w-auto object-contain block pointer-events-none select-none"
        />
      </div>
    </div>
  );
}

// Animasi container grid — anak-anaknya (tiap foto) muncul bergantian
// sedikit demi sedikit (staggerChildren) begitu grid mount, biar kesannya
// foto-foto "berjatuhan" ke tempatnya alih-alih muncul serentak dan kaku.
const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.012, delayChildren: 0.05 },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.85, rotate: 0 },
  visible: (rotationDeg: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: rotationDeg,
    // Tween (bukan spring) sengaja dipilih di sini: spring butuh simulasi
    // fisik tiap frame, dan kalau dikali puluhan item yang stagger hampir
    // bareng, itu numpuk jadi beban CPU yang lumayan — apalagi di layar
    // lebar/PC yang sekaligus nampilin lebih banyak item. Tween tinggal
    // interpolasi langsung, jauh lebih murah, bedanya di mata nggak terlalu
    // kentara buat animasi masuk sesingkat ini.
    transition: {
      type: "tween" as const,
      duration: 0.35,
      ease: "easeOut" as const,
    },
  }),
};

// ─── Galeri lightbox: grid semua foto + tampilan satu foto full ────────────
function GalleryOverlay({
  photos,
  selectedIndex,
  setSelectedIndex,
  onClose,
}: {
  photos: PhotoItem[];
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
  onClose: () => void;
}) {
  const [direction, setDirection] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Kunci scroll halaman & pasang keyboard shortcut selama galeri kebuka.
  // Nilai overflow sebelumnya disimpan & dikembalikan biar nggak nabrak
  // kalau ada elemen lain yang juga ngatur overflow.
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Overlay ini modal full-screen, jadi aman di-`data-lenis-prevent` total
    // (beda dengan area marquee di halaman utama yang perlu tetap bisa
    // di-scroll vertical normal). Wheel/touchmove dari dalam overlay di-stop
    // biar nggak nyampe ke listener global Lenis, sementara scroll native di
    // dalam overlay (grid foto) tetap jalan seperti biasa.
    const stopBubble = (e: Event) => e.stopPropagation();
    const overlay = overlayRef.current;
    overlay?.addEventListener("wheel", stopBubble, { passive: true });
    overlay?.addEventListener("touchmove", stopBubble, { passive: true });

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (selectedIndex !== null) {
        if (e.key === "ArrowRight") {
          setDirection(1);
          setSelectedIndex((selectedIndex + 1) % photos.length);
        } else if (e.key === "ArrowLeft") {
          setDirection(-1);
          setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
        }
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      overlay?.removeEventListener("wheel", stopBubble);
      overlay?.removeEventListener("touchmove", stopBubble);
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedIndex, onClose, setSelectedIndex, photos.length]);

  const goToNext = () => {
    if (selectedIndex === null) return;
    setDirection(1);
    setSelectedIndex((selectedIndex + 1) % photos.length);
  };

  const goToPrev = () => {
    if (selectedIndex === null) return;
    setDirection(-1);
    setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
  };

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
      aria-label="Galeri foto"
      // Sengaja TANPA backdrop-blur di sini: background-nya udah 97% opaque
      // (bg-[#1F1611]/97), jadi efek blur ke konten di baliknya nyaris nggak
      // kelihatan — tapi biaya render-nya (blur real-time seluas layar
      // penuh) tinggi banget, apalagi di monitor PC yang pixel-nya jauh
      // lebih banyak daripada layar HP. Buang blur di sini = perubahan
      // visual minim, tapi lumayan ngurangin beban paint pas galeri dibuka.
      className="fixed inset-0 z-[70] bg-[#1F1611]/97 flex flex-col overscroll-none [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:26px_26px]"
    >
      {/* Sparkle latar — murni dekorasi, bikin galeri terasa lebih hidup */}
      <FloatingSparkle className="text-xl top-20 left-8 md:left-16" duration={5} delay={0} />
      <FloatingSparkle className="text-2xl top-1/3 right-10 md:right-24" duration={6.5} delay={0.8} />
      <FloatingSparkle className="text-lg bottom-24 left-1/4" duration={5.5} delay={1.4} />
      <FloatingSparkle className="text-xl bottom-1/3 right-1/4" duration={7} delay={0.4} />

      {/* Tombol tutup — selalu ada, di mode grid maupun mode satu foto */}
      <motion.button
        onClick={onClose}
        aria-label="Tutup galeri"
        whileHover={{ scale: 1.08, rotate: 90 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757]"
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* Tombol kembali ke grid — cuma muncul waktu lagi lihat 1 foto,
          biar bisa balik ke "Semua Foto" tanpa harus nutup galeri. */}
      {selectedIndex !== null && (
        <motion.button
          onClick={() => setSelectedIndex(null)}
          aria-label="Kembali ke semua foto"
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-1.5 h-10 pl-3 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757]"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-hand text-sm md:text-base">Semua Foto</span>
        </motion.button>
      )}

      {selectedIndex === null ? (
        // ── Mode grid: grid biasa (bukan masonry) biar urutannya
        // baca kiri-ke-kanan-atas-ke-bawah per baris (memories1..N di baris
        // 1, dst) — makanya tiap sel di-crop ke rasio seragam (aspect-square
        // + object-cover) supaya semua foto dalam satu baris tingginya sama
        // dan barisnya kelihatan rapi, bukan ragged kayak masonry. ──
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 md:px-10 py-16 md:py-20 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-center mb-10 md:mb-14"
            >
              <p className="font-hand text-[#D97757] text-lg md:text-xl mb-1">
                {photos.length} kenangan tersimpan
              </p>
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-white">
                Semua Foto
              </h3>
            </motion.div>

            <motion.div
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
            >
              {photos.map((photo, i) => (
                <motion.button
                  key={i}
                  custom={photo.rotationDeg}
                  variants={gridItemVariants}
                  whileHover={{
                    rotate: 0,
                    scale: 1.05,
                    zIndex: 10,
                    transition: { type: "tween", duration: 0.2, ease: "easeOut" },
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setDirection(0);
                    setSelectedIndex(i);
                  }}
                  aria-label={`Buka foto ${i + 1}`}
                  className="group relative block w-full bg-white border border-black/5 shadow-[0_10px_26px_-14px_rgba(0,0,0,0.5)] hover:shadow-[0_18px_38px_-16px_rgba(0,0,0,0.6)] transition-shadow duration-300 pt-2.5 px-2.5 pb-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F1611]"
                >
                  <ScrapDecoration variant={i} />
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={photo.src}
                      alt={`Memory ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="pointer-events-none absolute top-2.5 left-2.5 right-2.5 bottom-7 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors duration-300">
                    <Maximize2 className="w-5 h-5 text-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      ) : (
        // ── Mode satu foto: pigora tetap ada, rasio asli, swipe & drag
        // dipertahankan ──
        <div className="flex-1 flex items-center justify-center relative px-16 md:px-24">
          <motion.button
            onClick={goToPrev}
            aria-label="Foto sebelumnya"
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="absolute left-2 md:left-6 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757]"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={selectedIndex}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  opacity: 0,
                  x: dir >= 0 ? 60 : -60,
                  scale: 0.92,
                  rotate: 0,
                }),
                center: {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  rotate: photos[selectedIndex].rotationDeg,
                },
                exit: (dir: number) => ({
                  opacity: 0,
                  x: dir >= 0 ? -60 : 60,
                  scale: 0.92,
                  rotate: 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(_e: unknown, info: { offset: { x: number } }) => {
                if (info.offset.x < -SWIPE_THRESHOLD) goToNext();
                else if (info.offset.x > SWIPE_THRESHOLD) goToPrev();
              }}
              className="relative bg-white shadow-2xl pt-3 px-3 pb-10 md:pt-4 md:px-4 md:pb-12 cursor-grab active:cursor-grabbing max-w-[90vw]"
            >
              <ScrapDecoration variant={selectedIndex} />
              <img
                src={photos[selectedIndex].src}
                alt={`Memory ${selectedIndex + 1}`}
                draggable={false}
                className="block max-h-[60vh] md:max-h-[64vh] max-w-[78vw] md:max-w-[66vw] w-auto h-auto select-none pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>

          <motion.button
            onClick={goToNext}
            aria-label="Foto berikutnya"
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="absolute right-2 md:right-6 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757]"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            aria-live="polite"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10"
          >
            <p className="font-hand text-white/85 text-base">
              {selectedIndex + 1} / {photos.length}
            </p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export function MemoriesGallery({ photos }: { photos: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [setWidth, setSetWidth] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Foto + rotasi dekoratifnya dihitung dari prop `photos` (daftar path
  // gambar hasil scan folder public/Images, dikirim dari Memories.tsx yang
  // jadi server component pembungkusnya). useMemo di sini cuma buat skip
  // hitung ulang kalau referensi array `photos` nggak berubah antar
  // re-render — yang dalam praktiknya nggak pernah berubah sama sekali
  // selama komponen ini hidup, karena datanya sudah final begitu dikirim
  // dari server.
  const photoItems = useMemo<PhotoItem[]>(
    () =>
      photos.map((src, i) => ({
        src,
        rotation: rotations[i % rotations.length],
        rotationDeg: rotationDegrees[i % rotationDegrees.length],
      })),
    [photos]
  );

  const repeatedPhotos = useMemo(
    () => [...photoItems, ...photoItems],
    [photoItems]
  );

  const x = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const momentumActiveRef = useRef(false);
  const momentumVelocityRef = useRef(0);
  // isPaused sengaja pakai ref, BUKAN useState. Nilainya cuma dibaca di
  // dalam useAnimationFrame (bukan buat kondisi render JSX apapun), jadi
  // nge-set-nya lewat useState bakal nge-trigger re-render SELURUH komponen
  // Memories (termasuk 94 PhotoCard) tiap kali jari nyentuh/lepas dari
  // track — persis pas gesture scroll vertical baru mulai dideteksi browser.
  // Itu penyebab stutter yang kerasa spesifik di area foto: dulu tiap
  // touchstart di foto → onTapStart → setState → re-render besar, lalu
  // begitu browser nentuin ini scroll (bukan tap) → onTapCancel → setState
  // lagi → re-render besar lagi. Dengan ref, dua momen itu nggak lagi
  // numpuk beban render ke thread yang sama saat scroll vertical dimulai.
  const isPausedRef = useRef(false);

  // ─── Deteksi arah gesture manual (lihat useEffect di bawah) ───
  const dragControls = useDragControls();
  const gestureStartRef = useRef<{ x: number; y: number } | null>(null);
  const gestureDecidedRef = useRef(false);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // scrollWidth track = lebar TOTAL (2 set foto), jadi 1 set = setengahnya.
    // Diukur ulang tiap ukuran track berubah (mis. gambar baru selesai load)
    // supaya titik sambungan loop selalu presisi, tidak pernah "nyentak".
    const measure = () => {
      const half = track.scrollWidth / 2;
      setSetWidth((prev) => (Math.abs(prev - half) > 1 ? half : prev));
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    const images = Array.from(track.querySelectorAll("img"));
    images.forEach((img) => {
      if (!img.complete) img.addEventListener("load", measure);
    });

    return () => {
      resizeObserver.disconnect();
      images.forEach((img) => img.removeEventListener("load", measure));
    };
  }, []);

  // Track ini di-drag horizontal pakai Framer Motion, dan situsnya pakai
  // smooth-scroll global (Lenis) yang nge-listen touch di window/document.
  // Tiga hal yang bikin ini AMAN dipakai bareng tanpa bikin scroll vertical
  // patah-patah:
  //
  // 1) Deteksi arah gesture MANUAL (lihat useEffect di atas, gantiin
  //    `dragDirectionLock` bawaan Framer yang nggak punya toleransi) —
  //    drag horizontal Framer cuma di-`start()` kalau gerakan udah jelas
  //    lebih dominan ke X daripada Y. Selama itu, listener kita full
  //    passive dan nggak pernah manggil preventDefault, jadi kalau ternyata
  //    dominan vertical, event touch-nya lolos begitu saja ke Lenis seperti
  //    biasa dari awal sampai akhir.
  // 2) `touchAction: "pan-y"` di style track (lihat di bawah) bikin browser
  //    dari awal udah tau arah vertical itu default action yang sah, jadi
  //    nggak ada jeda/keraguan sebelum scroll vertical mulai jalan.
  // 3) Lenis di-`stop()` HANYA di `onDragStart` (yaitu momen Framer udah
  //    mastiin gesture-nya horizontal) dan di-`start()` lagi di
  //    `onDragEnd` — jadi kalau gesture-nya vertical, Lenis nggak pernah
  //    disentuh sama sekali dan tetap full aktif dari awal sampai akhir.
  //    stopPropagation di bawah ini juga CUMA jalan kalau
  //    `isDraggingRef.current` true (drag horizontal beneran lagi aktif),
  //    biar event touchmove vertical normal tetap full nyampe ke Lenis.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const stopIfDragging = (e: TouchEvent) => {
      if (isDraggingRef.current) {
        e.stopPropagation();
      }
    };

    track.addEventListener("touchmove", stopIfDragging, { passive: true });

    return () => {
      track.removeEventListener("touchmove", stopIfDragging);
    };
  }, []);

  // Deteksi arah gesture SENDIRI, gantiin `dragDirectionLock` bawaan Framer.
  //
  // Masalahnya: `dragDirectionLock` bawaan Framer mastiin arah dari SAMPLE
  // GERAKAN PERTAMA doang, tanpa toleransi — begitu displacement X > Y
  // walau cuma beda 1px (dan jari manusia jarang gerak lurus sempurna pas
  // awal swipe), Framer langsung nge-klaim ini "drag horizontal" dan manggil
  // `onDragStart` (yang men-stop Lenis). Kalau ternyata user maksudnya
  // scroll vertical, gesture-nya kepotong/nyendat di tengah jalan — itu yang
  // masih kerasa sebagai stutter meskipun re-render `isPaused` udah dibenerin.
  //
  // Framer nggak nyediain opsi threshold/toleransi buat direction lock ini,
  // jadi kita bikin sendiri lewat listener pointer manual di sini — SEMUANYA
  // `passive: true`, jadi nggak pernah manggil `preventDefault` dan nggak
  // pernah bikin browser nunggu JS sebelum mulai native scroll:
  //
  // 1) Tunggu gerakan minimal `DIRECTION_LOCK_THRESHOLD` px dulu sebelum
  //    berani nebak arah (biar nggak salah nebak dari noise/jitter kecil).
  // 2) Begitu ambang itu kelewat, baru dibandingin: gerakan X harus lebih
  //    besar dari gerakan Y dikali `HORIZONTAL_BIAS` biar dianggap "sengaja
  //    horizontal". Kalau nggak jelas (ambigu/lebih condong vertical),
  //    kita diam aja — nggak sentuh apa-apa, biarin scroll native jalan
  //    dari awal sampai akhir tanpa pernah nyerempet JS kita sama sekali.
  // 3) Cuma kalau udah yakin horizontal, kita panggil `dragControls.start()`
  //    buat nyalain drag Framer-nya secara manual (makanya di motion.div
  //    di bawah dragnya pakai `dragListener={false}` — Framer nggak lagi
  //    nebak sendiri, kita yang kasih tau kapan mulai).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handlePointerDown = (e: PointerEvent) => {
      gestureStartRef.current = { x: e.clientX, y: e.clientY };
      gestureDecidedRef.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (gestureDecidedRef.current || !gestureStartRef.current) return;

      const dx = e.clientX - gestureStartRef.current.x;
      const dy = e.clientY - gestureStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < DIRECTION_LOCK_THRESHOLD && absDy < DIRECTION_LOCK_THRESHOLD) {
        return; // belum cukup gerak buat berani nebak
      }

      gestureDecidedRef.current = true;

      if (absDx > absDy * HORIZONTAL_BIAS) {
        // Jelas horizontal → baru sekarang serahin ke Framer buat di-drag.
        dragControls.start(e);
      }
      // Kalau nggak (vertical/ambigu): sengaja nggak ngapa-ngapain. Nggak
      // ada preventDefault yang pernah dipanggil, jadi native scroll (yang
      // udah mulai duluan lewat touchAction: pan-y) nggak pernah keganggu.

      gestureStartRef.current = null;
    };

    const resetGesture = () => {
      gestureStartRef.current = null;
      gestureDecidedRef.current = false;
    };

    track.addEventListener("pointerdown", handlePointerDown, { passive: true });
    track.addEventListener("pointermove", handlePointerMove, { passive: true });
    track.addEventListener("pointerup", resetGesture, { passive: true });
    track.addEventListener("pointercancel", resetGesture, { passive: true });

    return () => {
      track.removeEventListener("pointerdown", handlePointerDown);
      track.removeEventListener("pointermove", handlePointerMove);
      track.removeEventListener("pointerup", resetGesture);
      track.removeEventListener("pointercancel", resetGesture);
    };
  }, [dragControls]);

  // Safety-net: kalau komponen ini unmount pas lagi di tengah drag
  // horizontal (Lenis lagi di-stop), pastiin Lenis balik aktif lagi biar
  // nggak nyangkut mati di halaman lain.
  useEffect(() => {
    return () => {
      getLenis()?.start?.();
    };
  }, []);

  // Marquee digerakkan manual tiap frame. Tiga mode yang saling eksklusif:
  // 1) lagi di-drag → posisi ngikutin pointer, rAF ini nggak ngapa-ngapain
  // 2) momentum → habis dilepas dengan kecepatan, geser terus sambil melambat
  // 3) auto-scroll konstan → kecepatan tetap seperti biasa
  // Marquee cuma berhenti total saat foto sedang ditekan (isPaused).
  useAnimationFrame((_, delta) => {
    if (galleryOpen || setWidth === 0 || prefersReducedMotion) return;
    if (isDraggingRef.current) return;

    if (momentumActiveRef.current) {
      const dt = delta / 1000;
      let next = x.get() + momentumVelocityRef.current * dt;
      const decayed = momentumVelocityRef.current * Math.exp(-MOMENTUM_FRICTION * dt);

      if (next <= -setWidth) next += setWidth;
      if (next > 0) next -= setWidth;
      x.set(next);

      if (Math.abs(decayed) < MOMENTUM_MIN_VELOCITY) {
        momentumActiveRef.current = false;
        momentumVelocityRef.current = 0;
        isPausedRef.current = false;
      } else {
        momentumVelocityRef.current = decayed;
      }
      return;
    }

    if (isPausedRef.current) return;

    let next = x.get() - (SPEED_PX_PER_SEC * delta) / 1000;
    // Track isinya 2 set foto identik, jadi geser balik sejauh satu "set"
    // bakal keliatan mulus — sambungan loop-nya nggak pernah kelihatan.
    if (next <= -setWidth) next += setWidth;
    x.set(next);
  });

  const openGalleryGrid = () => {
    setSelectedIndex(null);
    setGalleryOpen(true);
  };

  const openPhotoAt = (index: number) => {
    if (isDraggingRef.current) return;
    setSelectedIndex(index);
    setGalleryOpen(true);
  };

  return (
    <section className="py-16 md:py-24 bg-[#FDFBF7] overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="container mx-auto px-6 mb-12 md:mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5"
      >
        <div>
          <p className="font-hand text-[#D97757] text-xl md:text-2xl mb-2">
            Foto-foto kita
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A202C] leading-tight">
            Memories
          </h2>
          <p className="font-sans text-[#718096] mt-3 text-base md:text-lg max-w-md">
            Karena tiap momen bareng berharga untuk dikenang.
          </p>
        </div>

        <button
          onClick={openGalleryGrid}
          className="group shrink-0 self-start inline-flex items-center gap-2 bg-[#1A202C] text-[#FDFBF7] font-sans text-sm md:text-base px-5 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757] focus-visible:ring-offset-2"
        >
          Lihat Semua Foto
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:rotate-90"
          >
            ✦
          </span>
        </button>
      </motion.div>

      {/* Marquee — tekan & tahan buat jeda, geser buat menjelajah, klik buat
          buka foto. Deteksi arah gesture manual (lihat useEffect di atas)
          + stopPropagation yang dikondisikan ke isDraggingRef bikin drag
          horizontal nggak kebawa jadi scroll halaman, TANPA bikin scroll
          vertical normal jadi patah-patah (tidak pakai data-lenis-prevent
          di sini). */}
      <div className="relative w-full flex overflow-hidden">
        <motion.div
          ref={trackRef}
          // touchAction "pan-y" (bukan "pan-x") adalah kuncinya: ini bikin
          // browser tetap pegang kendali native scroll utk gesture VERTICAL
          // (makanya scroll atas/bawah di atas foto jadi mulus, nggak
          // stutter), sementara gesture HORIZONTAL dilepas ke Framer buat
          // di-drag manual. Kalau kebalik jadi "pan-x" (seperti sebelumnya),
          // browser malah menahan/menunda default action utk arah vertical,
          // itu yang bikin scroll kerasa patah-patah saat jari nempel di
          // area foto.
          style={{ x, touchAction: "pan-y" }}
          drag="x"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ left: -setWidth * 1.4, right: setWidth * 0.4 }}
          dragElastic={0.08}
          dragMomentum={false}
          onTapStart={() => {
            momentumActiveRef.current = false;
            isPausedRef.current = true;
          }}
          onTap={() => {
            isPausedRef.current = false;
          }}
          onTapCancel={() => {
            if (!isDraggingRef.current) isPausedRef.current = false;
          }}
          onDragStart={() => {
            isDraggingRef.current = true;
            momentumActiveRef.current = false;
            isPausedRef.current = true;
            // Baru di titik INI deteksi arah manual kita udah mastiin bahwa
            // gesture-nya emang horizontal — jadi baru sekarang Lenis
            // dimatiin. Selama gesture masih vertical (atau masih belum
            // ketahuan arahnya), Lenis nggak pernah disentuh sama sekali,
            // jadi scroll ke bawah/atas tetap smooth seperti biasa.
            getLenis()?.stop?.();
          }}
          onDragEnd={(_e: unknown, info: { velocity: { x: number } }) => {
            // Balikin posisi ke dalam rentang satu "set" foto biar loop-nya
            // tetap konsisten setelah orang selesai geser manual.
            if (setWidth > 0) {
              let wrapped = x.get() % setWidth;
              if (wrapped > 0) wrapped -= setWidth;
              x.set(wrapped);
            }

            const velocity = clampVelocity(info.velocity.x);
            if (!prefersReducedMotion && Math.abs(velocity) > MOMENTUM_TRIGGER_VELOCITY) {
              // Lepas dengan kecepatan → lanjutkan gerakannya sebagai momentum
              // yang melambat pelan-pelan, biar terasa mulus kayak native scroll.
              momentumVelocityRef.current = velocity;
              momentumActiveRef.current = true;
            } else {
              isPausedRef.current = false;
            }

            // Jari udah lepas → Lenis aman diaktifin lagi. Momentum horizontal
            // marquee (kalau ada) nggak butuh Lenis tetap mati.
            getLenis()?.start?.();

            // delay dikit biar klik yang nempel di ujung drag nggak
            // ke-anggep sebagai "buka foto"
            setTimeout(() => {
              isDraggingRef.current = false;
            }, 100);
          }}
          className="flex gap-5 md:gap-7 w-max px-4 py-8 cursor-grab active:cursor-grabbing select-none will-change-transform"
        >
          {repeatedPhotos.map((photo, index) => (
            <PhotoCard
              key={index}
              photo={photo}
              index={index}
              onOpen={() => openPhotoAt(index % photoItems.length)}
            />
          ))}
        </motion.div>
      </div>

      <p className="text-center font-hand text-[#A09080] text-sm mt-1">
        tekan & tahan buat jeda, geser buat menjelajah ✦
      </p>

      <AnimatePresence>
        {galleryOpen && (
          <GalleryOverlay
            photos={photoItems}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            onClose={() => setGalleryOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}