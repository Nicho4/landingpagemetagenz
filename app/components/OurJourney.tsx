"use client";

import { motion } from "motion/react";
import Image from "next/image";

const milestones = [
  {
    date: "Juni 2018",
    title: "The Loving Heart",
    description:
      "Retreat yang mengangkat tema \u201cThe Loving Heart\u201d, sekaligus jadi farewell pengurus lama kaum muda GBC Bukit Carmel sebelum diserahterimakan kepada pengurus yang baru.",
    image: "/Images/Journey1.webp",
    tilt: "-rotate-2",
    tape: { width: "w-14", color: "bg-[#D97757]/30", angle: "rotate-[-6deg]" },
  },
  {
    date: "7 Maret 2020",
    title: "Awal yang Baru",
    description:
      "Titik awal transisi kepengurusan baru di kaum muda GBC Bukit Carmel.",
    image: "/Images/Journey2.webp",
    tilt: "rotate-2",
    tape: { width: "w-12", color: "bg-[#A09080]/35", angle: "rotate-[5deg]" },
  },
  {
    date: "2020",
    title: "Ibadah Daring",
    description:
      "Selama masa pandemi, social distancing tidak membatasi semangat kami untuk terus mengadakan ibadah kaum muda kali ini lewat sarana daring.",
    image: "/Images/Journey3.webp",
    tilt: "-rotate-[1.5deg]",
    tape: { width: "w-16", color: "bg-[#D97757]/25", angle: "rotate-[-4deg]" },
  },
  {
    date: "4 April 2021",
    title: "Kembali Onsite",
    description:
      "Sukacita bertambah saat ibadah onsite mulai diijinkan kembali. Kami memulainya dengan Ibadah Paskah Kaum Muda.",
    image: "/Images/Journey4.webp",
    tilt: "rotate-[1.5deg]",
    tape: { width: "w-14", color: "bg-[#A09080]/30", angle: "rotate-[6deg]" },
  },
  {
    date: "11 Desember 2021",
    title: "Lahirnya MetaGenz",
    description:
      "Natal Kaum Muda, sekaligus hari lahirnya nama komunitas: \u201cMetanoia Generationz\u201d yang kini kita kenal sebagai MetaGenz. Lahir dari kerinduan akan transformasi mendasar yang membuat seseorang berbalik dari dosa dan berpaling kepada Allah, sehingga semakin serupa dengan Kristus.",
    image: "/Images/Journey5.webp",
    tilt: "-rotate-2",
    tape: { width: "w-16", color: "bg-[#D97757]/30", angle: "rotate-[-5deg]" },
  },
];

export function OurJourney() {
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

                    {/* Photo — Classic Film Photo Frame */}
                    <div
                      className={`${isEven ? "md:order-1" : "md:order-2"} flex ${
                        isEven ? "md:justify-end" : "md:justify-start"
                      } justify-start`}
                    >
                      <div
                        className={`relative bg-white shadow-xl ${item.tilt} hover:rotate-0 transition-transform duration-500 w-full max-w-[360px]`}
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
                            className="object-cover"
                          />
                        </div>
                      </div>
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
    </section>
  );
}