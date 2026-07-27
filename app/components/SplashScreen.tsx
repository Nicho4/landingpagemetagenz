"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

// Key sessionStorage buat nandain "splash udah pernah keliatan di tab/sesi
// browser ini". sessionStorage (bukan localStorage) sengaja dipilih supaya
// splash tetap tampil lagi kalau orang buka tab baru atau sesi browser baru
// — cuma nggak keulang-ulang tiap kali orang scroll/navigasi balik ke
// halaman ini DALAM sesi yang sama.
const SPLASH_SEEN_KEY = "metagenz-splash-seen";

export function SplashScreen() {
  const [step, setStep] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Cek dulu apakah splash-nya udah pernah diputer di sesi ini. Kalau
    // sudah, langsung skip total — nggak kunci scroll, nggak jalanin timer
    // 7.5 detik sama sekali. try/catch jaga-jaga kalau sessionStorage
    // diblokir (mode private/incognito ketat di sebagian browser bisa
    // nolak akses storage) — kalau gagal dibaca, anggap aja belum pernah
    // lihat, splash tetap jalan seperti biasa (bukan bug fatal).
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(SPLASH_SEEN_KEY) === "1";
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) {
      setStep(3);
      return;
    }

    const t1 = setTimeout(() => setStep(1), 500);

    // Splash mulai keluar
    const t2 = setTimeout(() => setStep(2), 6500);

    // Hapus splash dari DOM
    const t3 = setTimeout(() => {
      setStep(3);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      try {
        sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
      } catch {
        // Gagal disimpan cuma berarti splash bakal muncul lagi di
        // kunjungan berikutnya — tidak fatal, aman diabaikan.
      }
    }, 7500);

    timersRef.current = [t1, t2, t3];

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      timersRef.current.forEach(clearTimeout);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const handleSkip = () => {
    // Batalkan semua timer bawaan yang masih berjalan
    timersRef.current.forEach(clearTimeout);

    // Langsung mulai animasi keluar
    setStep(2);

    // Setelah animasi keluar selesai (durasi sama dengan transition di bawah), hapus dari DOM
    setTimeout(() => {
      setStep(3);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      try {
        sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
      } catch {
        // sama seperti di atas, aman diabaikan
      }
    }, 1000);
  };

  if (step === 3) return null;

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: step === 2 ? "-100%" : 0 }}
      transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFBF7] px-8"
    >
      {/* Subtle warm texture dots */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #1A1A1A 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Tombol Skip */}
      {step !== 2 && (
        <motion.button
          type="button"
          onClick={handleSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.8 } }}
          className="absolute bottom-8 right-8 z-20 font-serif text-sm tracking-wider text-[#1A1A1A]/50 transition-colors hover:text-[#D97757] md:bottom-10 md:right-10"
        >
          Lewati →
        </motion.button>
      )}

      <div className="relative z-10 max-w-3xl text-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="verse1"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 1.8, ease: "easeOut" },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 1.0, ease: "easeIn" },
              }}
              className="flex flex-col gap-8"
            >
              <p className="font-serif italic text-2xl md:text-3xl lg:text-[2.1rem] text-[#1A1A1A] leading-[1.75] md:leading-[1.8]">
                “Janganlah seorang pun menganggap engkau rendah karena engkau
                muda. Jadilah teladan bagi orang-orang percaya, dalam
                perkataanmu, dalam tingkah lakumu, dalam kasihmu, dalam
                kesetiaanmu dan dalam kesucianmu.”
              </p>

              <div className="flex flex-col items-center gap-2">
                <div className="h-px w-8 bg-[#D97757]" />
                <p className="font-serif text-base tracking-wider text-[#D97757] md:text-lg">
                  1 Timotius 4:12
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}