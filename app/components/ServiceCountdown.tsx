"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";

export function ServiceCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();

      const nextSaturday = new Date();
      nextSaturday.setDate(
        now.getDate() + ((6 - now.getDay() + 7) % 7)
      );

      if (
        now.getDay() === 6 &&
        (now.getHours() > 18 ||
          (now.getHours() === 18 && now.getMinutes() >= 30))
      ) {
        nextSaturday.setDate(now.getDate() + 7);
      }

      nextSaturday.setHours(18, 30, 0, 0);

      const diff = nextSaturday.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();

    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: "HARI", value: timeLeft.days },
    { label: "JAM", value: timeLeft.hours },
    { label: "MENIT", value: timeLeft.minutes },
    { label: "DETIK", value: timeLeft.seconds },
  ];

  return (
    <section className="relative min-h-[760px] md:min-h-[900px] overflow-hidden flex items-center justify-center pt-24 pb-16">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/Images/footer.webp')",
          backgroundPosition: "center 72%",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-[#120D08]/88 to-[#120D08]/65" />

      {/* Warm Light */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#D97757]/15 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 container mx-auto px-6 text-center translate-y-10 md:translate-y-14"
      >
        {/* Subtitle */}
        <p className="font-hand text-[#D97757]/80 text-xl md:text-2xl mb-2">
          next service
        </p>

        {/* Title */}
        <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-[#FDFBF7] leading-none mb-1">
          Every Saturday
        </h2>

        <p className="font-serif italic text-2xl md:text-3xl text-[#FDFBF7]/45 mb-10">
          at 6:30 PM
        </p>

        {/* Countdown */}
        <div className="flex justify-center items-end gap-6 md:gap-10 mb-10 flex-wrap">
          {units.map((item, index) => (
            <div key={item.label} className="flex items-end">
              <div className="flex flex-col items-center">
                <span
                  className="font-heading font-bold text-[#FDFBF7] leading-none"
                  style={{
                    fontSize: "clamp(4rem,10vw,7rem)",
                  }}
                >
                  {item.value.toString().padStart(2, "0")}
                </span>

                <span className="mt-2 text-[11px] md:text-xs tracking-[0.35em] uppercase text-[#FDFBF7]/35">
                  {item.label}
                </span>
              </div>

              {index !== units.length - 1 && (
                <span className="hidden md:block text-[#FDFBF7]/25 text-3xl mx-5 mb-7">
                  •
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Location */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="flex items-center gap-2 text-[#FDFBF7]/60">
            <MapPin className="w-4 h-4 text-[#D97757]" />
            <span>GBT Bukit Carmel · Jl. Kupang Jaya No.102, Surabaya</span>
          </div>

          <span className="text-xs text-[#FDFBF7]/35">
            Opengate jam 18:00
          </span>

          <a
            href="https://maps.app.goo.gl/YZFLxaPUyzh1UWrT8?g_st=aw"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#D97757]/30 px-6 py-3 text-sm text-[#FDFBF7]/75 hover:bg-[#D97757]/10 hover:border-[#D97757]/60 hover:text-white transition-all duration-300"
          >
            <MapPin className="w-4 h-4 text-[#D97757]" />
            Lihat Lokasi di Google Maps
          </a>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-[#FDFBF7]/15 mx-auto mb-8" />

        {/* Social */}
        <div className="flex justify-center">
          <a
            href="https://www.instagram.com/metagenz?igsh=dXk5ZWJwb3o4bHFq"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="px-6 py-3 border border-white/10 flex items-center justify-center gap-3 text-white/55 hover:text-white hover:border-white/30 transition-all duration-300 rounded-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle
                cx="17.2"
                cy="6.8"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            <span className="text-sm tracking-wide">Ikuti kami di Instagram</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}