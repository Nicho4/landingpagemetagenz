"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Fastener, type FastenerType } from "./ui/Fastener";

interface Vision {
  num: string;
  title: string;
  description: string;
  rotate: number;
  offsetClass: string;
  fastener: FastenerType;
  fastenerColor: string;
  fastenerClass: string;
}

const visions: Vision[] = [
  {
    num: "01",
    title: "Menemukan Identitas",
    description:
      "Membantu anak muda menemukan identitas sejati mereka di dalam Kristus, bukan dari standar dunia.",
    rotate: -1,
    offsetClass: "md:mr-10",
    fastener: "tape",
    fastenerColor: "#D97757",
    fastenerClass: "-top-3 left-6",
  },
  {
    num: "02",
    title: "Bertumbuh Bersama",
    description:
      "Membangun komunitas yang sehat dimana setiap orang bisa saling menguatkan, mendukung, dan bertumbuh dalam iman.",
    rotate: 2,
    offsetClass: "md:ml-6",
    fastener: "pin",
    fastenerColor: "#A09080",
    fastenerClass: "-top-3 right-10",
  },
  {
    num: "03",
    title: "Berdampak",
    description:
      "Mempersiapkan generasi muda untuk menjadi terang dan garam yang membawa dampak positif di lingkungan mereka.",
    rotate: -1.5,
    offsetClass: "md:mr-4",
    fastener: "paperclip",
    fastenerColor: "#D97757",
    fastenerClass: "-top-5 left-10",
  },
];

export function Connect() {
  const shouldReduceMotion = useReducedMotion();

  const cardHidden = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 28, scale: 0.95 };
  const cardVisible = (rotate: number) =>
    shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0, scale: 1, rotate };
  const fastenerHidden = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.2, y: -10 };
  const fastenerVisible = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, y: 0 };

  return (
    <section className="relative py-16 md:py-24 lg:py-32 bg-[#F6F0E6] overflow-hidden">
      {/* faint notebook dot-grid, matches the board feel across sections */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(107,96,85,0.35) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 60% at 30% 40%, black 30%, transparent 85%)",
          maskImage:
            "radial-gradient(ellipse 65% 60% at 30% 40%, black 30%, transparent 85%)",
        }}
      />

      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          {/* Polaroid photo — pinned alongside the vision cards, same board */}
          <motion.div
            initial={cardHidden}
            whileInView={cardVisible(-2)}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 110, damping: 16 }}
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    rotate: 0,
                    y: -6,
                    transition: { type: "spring", stiffness: 280, damping: 18 },
                  }
            }
            // *** PERBAIKAN: Padding bawah disesuaikan dari pb-16/pb-20 menjadi pb-6/pb-8 ***
            className="relative bg-white p-3 pb-6 md:p-4 md:pb-8 shadow-xl w-full max-w-sm mx-auto lg:max-w-none lg:w-[85%] lg:sticky lg:top-24"
          >
            {/* paper grain — filter global "paper-grain-dark", didefinisikan
                sekali di page.tsx dan dipakai bareng-bareng di sini,
                Testimonials.tsx, dan HighlightReel.tsx */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none mix-blend-multiply"
              style={{ filter: "url(#paper-grain-dark)" }}
            />

            {/* Washi tape — terracotta diagonal, snaps down a beat after the photo lands */}
            <motion.div
              aria-hidden
              className="absolute -top-3 left-10 z-20"
              initial={fastenerHidden}
              whileInView={fastenerVisible}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 480,
                damping: 13,
                delay: 0.35,
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "24px",
                  background: "linear-gradient(135deg, #D9775766, #D9775733)",
                  clipPath:
                    "polygon(3% 0%, 9% 22%, 3% 44%, 9% 66%, 3% 88%, 9% 100%, 91% 100%, 97% 88%, 91% 66%, 97% 44%, 91% 22%, 97% 0%)",
                  boxShadow: "0 2px 5px rgba(26,32,44,0.12)",
                }}
              />
            </motion.div>

            <div className="relative z-10">
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                <Image
                  src="/Images/connect.webp"
                  alt="Ketua MetaGenz"
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>

              {/* *** PERBAIKAN: Menghapus positioning 'absolute' agar teks mengalir di bawah foto *** */}
              {/* *** Kami juga menambahkan padding atas (pt-4) agar ada jarak dari foto *** */}
              <div className="px-4 md:px-5 pt-4 md:pt-5 pb-0 text-center">
                <p className="font-heading text-lg md:text-xl font-bold text-[#1A202C] mb-0.5">
                Pengurus Metagenz
                </p>
                <p className="font-hand text-[#6B6055] text-base">
                  2026-2028
                </p>
              </div>
            </div>
          </motion.div>

          {/* Visi & Misi — notecards on a board */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col justify-start"
          >
            <p className="font-hand text-[#D97757] text-xl md:text-2xl mb-3">
              ✦ Visi &amp; Misi
            </p>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A202C] leading-tight mb-6">
              Membangun Generasi yang{" "}
              <span className="italic font-normal">Berakar &amp; Berbuah.</span>
            </h2>

            <p className="font-sans text-base md:text-lg text-[#4A5568] mb-10 leading-relaxed">
              Kami percaya bahwa masa muda adalah saat terbaik untuk menanamkan
              nilai-nilai kebenaran. MetaGenz hadir bukan sekadar sebagai tempat
              berkumpul, tapi sebagai wadah transformasi karakter dan iman.
            </p>

            {/* Notecards — scattered like pinned to a board, each held by a different fastener */}
            <div className="space-y-6">
              {visions.map((item, index) => (
                <motion.div
                  key={item.num}
                  initial={cardHidden}
                  whileInView={cardVisible(item.rotate)}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 130,
                    damping: 15,
                    delay: 0.1 + index * 0.12,
                  }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          rotate: 0,
                          y: -5,
                          transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 18,
                          },
                        }
                  }
                  className={`relative bg-white shadow-md p-5 md:p-6 ${item.offsetClass}`}
                >
                  {/* paper grain */}
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none mix-blend-multiply"
                    style={{ filter: "url(#paper-grain-dark)" }}
                  />

                  {/* fastener, snaps down a beat after the card lands */}
                  <motion.div
                    aria-hidden
                    className={`absolute z-20 ${item.fastenerClass}`}
                    initial={fastenerHidden}
                    whileInView={fastenerVisible}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 480,
                      damping: 13,
                      delay: 0.1 + index * 0.12 + 0.3,
                    }}
                  >
                    <Fastener type={item.fastener} color={item.fastenerColor} />
                  </motion.div>

                  <div className="relative z-10">
                    {/* Hand-inked stage number, echoes the avatar treatment used elsewhere on the page */}
                    <div
                      className="absolute top-2 right-3 w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center font-hand text-base"
                      style={{
                        borderColor: `${item.fastenerColor}66`,
                        backgroundColor: `${item.fastenerColor}14`,
                        color: "#1A202C",
                      }}
                    >
                      {item.num}
                    </div>

                    <h3 className="font-heading text-lg md:text-xl font-bold text-[#1A202C] mb-2 pr-10">
                      {item.title}
                    </h3>
                    <p className="font-sans text-sm md:text-base text-[#718096] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}