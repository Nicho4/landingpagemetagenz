"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useBackgroundMusic } from "./BackgroundMusicContext";

// Warna piringannya sengaja dipetik dari token yang udah ada di file ini
// (bukan nambah warna baru), biar toggle-nya tetap kebaca sebagai bagian
// dari identitas cream & terracotta situs ini.
const VINYL_COLORS = {
  disc: "#1A202C",
  accent: "#D97757",
  light: "#E8F0E4",
};

// Nada-nada kecil yang "kabur" dari piringan selama musik nyala. Tiap nada
// punya titik awal (left), delay mulai, dan arah kabur (driftX/rotateEnd)
// yang beda-beda biar ketiganya nggak keliatan gerak barengan/sinkron.
const FLOATING_NOTES = [
  { glyph: "♪", left: "18%", delay: 0, driftX: -12, rotateEnd: -16 },
  { glyph: "♫", left: "50%", delay: 0.6, driftX: 6, rotateEnd: 10 },
  { glyph: "♬", left: "76%", delay: 1.2, driftX: 14, rotateEnd: -8 },
];

// Berapa lama keterangan "tap buat nyalain/matiin musik" nongol sebelum
// meredup sendiri.
const HINT_AUTO_HIDE_MS = 7000;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // Status musik (nyala/mati) dan fungsi toggle-nya sekarang datang dari
  // BackgroundMusicContext — komponen ini nggak lagi pegang <audio>
  // sendiri, supaya komponen lain (misalnya HighlightReel) bisa
  // "duck"/"unduck" musiknya juga lewat context yang sama, tanpa perlu
  // tahu-menahu soal Navbar ini sama sekali.
  const { isPlaying, toggle } = useBackgroundMusic();
  const isPlayingRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  // Keterangan kecil di bawah tombol yang ngasih tau fungsinya. Sengaja
  // DIPICU sama isPlaying (bukan langsung nongol pas komponen mount),
  // soalnya musiknya sendiri baru beneran nyala belakangan — lewat
  // mekanisme autoplay-di-interaksi-pertama yang dipegang
  // BackgroundMusicContext (liat komentar di atas tombol). Begitu musik
  // itu kedengeran nyala sendiri, itulah momen yang paling pas buat
  // ngasih tau user "oh, ini yang bisa di-tap buat nyala/matiin".
  //
  // hasShownHintRef bikin ini cuma kejadian SEKALI per kunjungan halaman:
  // begitu HighlightReel nge-duck musiknya (pause) terus di-unduck lagi
  // (resume) pas videonya kelar, isPlaying bakal balik true lagi — tapi
  // keterangannya nggak perlu nongol ulang tiap siklus duck/unduck itu.
  const [showHint, setShowHint] = useState(false);
  const hasShownHintRef = useRef(false);

  // Effect ini CUMA nentuin kapan keterangannya mulai nongol (dependency:
  // isPlaying). Sengaja nggak masang setTimeout di sini juga — soalnya
  // kalau isPlaying berubah lagi di tengah-tengah 5 detik itu (misalnya
  // HighlightReel nge-duck musiknya), effect ini bakal jalan ulang dan
  // cleanup dari run sebelumnya bakal ke-trigger duluan, yang otomatis
  // MEMBATALKAN timer yang lagi jalan — akibatnya keterangannya nyangkut
  // nggak pernah ilang. Makanya timer-nya dipindah ke effect terpisah di
  // bawah, yang dependency-nya showHint doang, jadi nggak kebawa-bawa
  // sama perubahan isPlaying setelah keterangannya nongol.
  useEffect(() => {
    if (!isPlaying || hasShownHintRef.current) return;
    hasShownHintRef.current = true;
    setShowHint(true);
  }, [isPlaying]);

  // Effect ini yang megang hitung mundurnya, terpisah dari isPlaying —
  // begitu showHint jadi true, 5 detik kemudian dia PASTI disembunyiin
  // lagi, nggak peduli musiknya di-duck/unduck atau di-toggle manual di
  // tengah jalan.
  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => setShowHint(false), HINT_AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [showHint]);

  // onClick tombolnya sendiri nggak diubah logic-nya (masih manggil toggle()
  // dari context apa adanya) — cuma ditambahin nyembunyiin keterangan lebih
  // cepet kalau usernya udah keburu ngerti begitu die-tap sendiri.
  const handleToggleClick = () => {
    toggle();
    setShowHint(false);
  };

  // Dipakai di dalam useAnimationFrame di bawah, karena callback itu nggak
  // "lihat" state React yang ter-update (stale closure) — jadi status
  // isPlaying paling baru (dari context) selalu disalin ke ref ini.
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Puteran piringannya dijalanin lewat rAF Framer Motion sendiri (motion
  // value), bukan CSS keyframes terpisah — ini mekanisme yang sama yang
  // udah kebukti jalan buat lengan tonearm & tombolnya. Nilainya cuma
  // nambah terus selama musik nyala, dan otomatis "diam" di sudut
  // terakhirnya begitu dipause (nggak perlu direset manual, jadi nggak ada
  // efek muter balik).
  const discRotation = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    if (!isPlayingRef.current || prefersReducedMotion) return;
    // Satu putaran penuh tiap 2.4 detik.
    discRotation.set(discRotation.get() + (delta / 2400) * 360);
  });

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a
          href="#"
          className={`font-heading text-2xl font-bold tracking-normal transition-colors ${
            scrolled ? "text-[#1A202C]" : "text-white"
          }`}
        >
          Meta
          <span className={scrolled ? "text-[#D97757]" : "text-[#E8F0E4]"}>
            Genz.
          </span>
        </a>

        {/* Wrapper buat positioning tooltip-nya doang (relative). Trigger
            hover/keyboard-focus-nya sendiri dipasang lewat "peer" di
            tombolnya (lihat bawah), bukan "group" di div ini — soalnya
            group-focus-within bakal ikut aktif tiap kali tombolnya DIKLIK
            (klik = tombol dapet DOM focus juga, bukan cuma trigger
            onClick), jadi tooltip-nya nyangkut nongol sampe focus-nya
            pindah ke elemen lain. Pakai peer-focus-visible sebagai
            gantinya, yang browser sengaja bikin cuma aktif pas navigasi
            keyboard (Tab), bukan pas diklik mouse. */}
        <div className="relative">
          <motion.button
            type="button"
            // Attribute penanda ini dibaca sama BackgroundMusicContext buat
            // ngecek "apakah interaksi pertama user di halaman ini kena
            // tombol toggle sendiri" — kalau iya, context sengaja diemin
            // (biarin onClick di bawah ini yang nanganin), biar musik nggak
            // ke-start-lalu-langsung-ke-pause sama klik yang sama persis.
            data-music-toggle=""
            onClick={handleToggleClick}
            aria-pressed={isPlaying}
            aria-label={isPlaying ? "Matikan musik latar" : "Nyalakan musik latar"}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={`peer relative flex items-center justify-center w-11 h-11 rounded-full border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757] ${
              scrolled
                ? "border-[#1A202C]/15 hover:bg-[#1A202C]/5"
                : "border-white/25 hover:bg-white/10"
            }`}
          >
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              {/* Piringan hitam + alur groove-nya. Muter pelan terus selama
                  musik nyala (origin rotasinya otomatis di tengah, karena
                  elemen-elemennya lingkaran konsentris). Tambahan sekarang:
                  piringannya juga "berdenyut" membesar-mengecil sedikit
                  (1 → 1.08 → 1) selama musik nyala, biar kerasa hidup/menyala
                  kayak lagi ikut irama — bukan cuma muter datar. Berhenti
                  total (statis di ukuran normal) pas dipause. */}
              <motion.g
                style={{ rotate: discRotation }}
                animate={
                  prefersReducedMotion
                    ? { scale: 1.2 }
                    : { scale: isPlaying ? [1.1, 1.15, 1.1] : 1 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        scale: {
                          duration: 1.1,
                          repeat: isPlaying ? Infinity : 0,
                          ease: "easeInOut",
                        },
                      }
                }
              >
                <circle cx="20" cy="20" r="15" fill={VINYL_COLORS.disc} />
                <circle cx="20" cy="20" r="11.5" fill="none" stroke={VINYL_COLORS.light} strokeOpacity="0.18" />
                <circle cx="20" cy="20" r="8.5" fill="none" stroke={VINYL_COLORS.light} strokeOpacity="0.18" />
                <circle cx="20" cy="20" r="5.5" fill={VINYL_COLORS.accent} />
                <circle cx="20" cy="20" r="1.3" fill={VINYL_COLORS.light} />
              </motion.g>

              {/* Lengan turntable-nya. Pas musik nyala, "jarumnya" turun
                  nyentuh pinggir piringan; pas di-pause, ngangkat balik ke
                  posisi istirahat — niru gestur nurunin jarum piringan hitam
                  beneran, biar toggle-nya kerasa related sama fungsinya
                  (nyalain musik), bukan sekadar ikon speaker generik. */}
              <g
                style={{
                  transformOrigin: "33px 7px",
                  transform: `rotate(${isPlaying ? 6 : -24}deg)`,
                  transition: prefersReducedMotion
                    ? undefined
                    : "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <circle cx="33" cy="7" r="2.1" fill={VINYL_COLORS.disc} />
                <line
                  x1="33"
                  y1="7"
                  x2="19"
                  y2="19"
                  stroke={VINYL_COLORS.disc}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="19" cy="19" r="1.6" fill={VINYL_COLORS.accent} />
              </g>
            </svg>

            {/* Nada-nada kecil yang kabur ke atas selama musik nyala, lalu
                perlahan hilang pas di-pause. Cuma dirender kalau musik nyala
                dan user nggak minta reduced motion, jadi gerakan ekstra ini
                nggak muncul buat yang sensitif sama animasi. */}
            <AnimatePresence>
              {isPlaying && !prefersReducedMotion && (
                <motion.div
                  key="floating-notes"
                  className="pointer-events-none absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.25 } }}
                >
                  {FLOATING_NOTES.map((note) => (
                    <motion.span
                      key={note.glyph}
                      className="absolute text-[10px] font-bold select-none"
                      style={{ left: note.left, top: "2px", color: VINYL_COLORS.accent }}
                      animate={{
                        y: [0, -20, -38],
                        x: [0, note.driftX * 0.5, note.driftX],
                        opacity: [0, 1, 0],
                        rotate: [0, note.rotateEnd * 0.6, note.rotateEnd],
                        scale: [0.6, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1.2,
                        delay: note.delay,
                        ease: "easeOut",
                      }}
                    >
                      {note.glyph}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Keterangan "tap buat nyalain/matiin musik". Warnanya sengaja
              dibalik dari tombolnya (dasar gelap #1A202C, teks krem
              #E8F0E4, aksen terracotta buat notenya) supaya kontrasnya
              tetap kebaca baik pas navbar transparan (di atas hero gelap)
              maupun pas udah solid putih habis discroll. pointer-events-none
              biar dia nggak pernah "nyolong" tap dari tombol di baliknya.
              Begitu showHint balik false (abis 5 detik atau abis di-tap),
              dia nggak ilang total — cuma nunggu di-hover mouse atau
              di-fokus lewat keyboard (peer-hover / peer-focus-visible),
              bukan cuma diklik biasa. */}
          <span
            role="presentation"
            aria-hidden="true"
            className={`pointer-events-none absolute right-0 top-full z-10 mt-3 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium shadow-lg transition-opacity duration-300 ${
              showHint
                ? "opacity-100"
                : "opacity-0 peer-hover:opacity-100 peer-focus-visible:opacity-100"
            }`}
            style={{ backgroundColor: VINYL_COLORS.disc, color: VINYL_COLORS.light }}
          >
            {/* Segitiga kecil nunjuk ke tombolnya, biar keterangannya
                kebaca sebagai bagian dari tombol, bukan elemen lepas. */}
            <span
              className="absolute -top-1 right-4 h-2 w-2 rotate-45"
              style={{ backgroundColor: VINYL_COLORS.disc }}
            />
            <span style={{ color: VINYL_COLORS.accent }} className="mr-1">
              ♪
            </span>
            {isPlaying ? "Tap buat matiin musik" : "Tap buat nyalain musik"}
          </span>
        </div>
      </div>
    </motion.nav>
  );
}