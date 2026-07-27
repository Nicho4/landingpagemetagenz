"use client";

import { motion, useReducedMotion } from "motion/react";
import { Fastener, type FastenerType } from "./ui/Fastener";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  initials: string;
  rotate: number;
  width: string;
  marginTop?: string;
  fastener: FastenerType;
  fastenerColor: string;
  fastenerClass: string;
  featured?: boolean;
  badge?: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Dulu sering merasa alone dan nggak punya tujuan. Di MetaGenz aku ketemu teman-teman yang dengerin keluh kesah tanpa ngehakimi. Truly a second home.",
    author: "Hellen",
    role:'',
    initials: "K",
    rotate: -2,
    width: "md:w-[44%]",
    fastener: "tape",
    fastenerColor: "#D97757",
    fastenerClass: "-top-3 left-10",
  },
  {
    quote:
      "Ibadahnya asik. Khotbahnya related sama apa yang lagi dihadapin di kampus dan tempat kerja.",
    author: "Grace",
    role:'',
    initials: "G",
    rotate: 2.5,
    width: "md:w-[44%]",
    marginTop: "md:mt-14",
    fastener: "pin",
    fastenerColor: "#D97757",
    fastenerClass: "-top-3 left-9",
  },
  {
    quote:
      "MetaGenz ngajarin aku bahwa iman bukan soal kesempurnaan. .",
    author: "Nicho",
    role:'',
    initials: "N",
    rotate: -1.2,
    width: "md:w-[60%]",
    fastener: "paperclip",
    fastenerColor: "#A09080",
    fastenerClass: "-top-5 left-8",
    featured: true,
    
  },
];

export function Testimonials() {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 36, scale: 0.94 },
    visible: (rotate: number) =>
      shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, rotate },
  };

  const fastenerVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.2, y: -12 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <section className="relative py-16 md:py-24 bg-[#FDFBF7] overflow-hidden">
      {/* faint notebook dot-grid, fades toward the edges */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(160,144,128,0.4) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 35%, black 35%, transparent 85%)",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 35%, black 35%, transparent 85%)",
        }}
      />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 md:mb-16"
        >
          <p className="font-hand text-[#D97757] text-xl md:text-2xl mb-2">
            ✦ Kata mereka
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A202C] leading-tight">
            Cerita <span className="italic font-normal">Nyata.</span>
          </h2>
        </motion.div>

        <div className="flex flex-wrap gap-6 md:gap-8 items-start">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.author}
              custom={item.rotate}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { rotate: 0, y: -6, transition: { type: "spring", stiffness: 300, damping: 18 } }
              }
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 120, damping: 15, delay: index * 0.15 }}
              className={`relative bg-white shadow-md p-6 md:p-8 w-full ${item.width} ${item.marginTop ?? ""}`}
            >
              {/* paper grain overlay — filter global "paper-grain-dark",
                  didefinisikan sekali di page.tsx, dipakai bareng-bareng
                  di sini, Connect.tsx, dan HighlightReel.tsx */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none mix-blend-multiply"
                style={{ filter: "url(#paper-grain-dark)" }}
              />

              {/* fastener: tape / pin / paperclip, snaps down just after the card lands */}
              <motion.div
                aria-hidden
                className={`absolute z-20 ${item.fastenerClass}`}
                variants={fastenerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 480,
                  damping: 13,
                  delay: index * 0.15 + 0.35,
                }}
              >
                <Fastener type={item.fastener} color={item.fastenerColor} />
              </motion.div>

              {/* featured ribbon, explains why this card runs wider */}
              {item.featured && item.badge && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                  className="absolute -top-3 right-6 md:right-10 rotate-3 bg-[#1A202C] text-[#FDFBF7] text-[11px] font-sans tracking-wide px-3 py-1 shadow-md z-20"
                >
                  ✦ {item.badge}
                </motion.div>
              )}

              <div className="relative z-10">
                <span
                  aria-hidden
                  className="absolute -top-4 -left-1 font-serif text-7xl md:text-8xl leading-none select-none"
                  style={{ color: item.fastenerColor, opacity: 0.14 }}
                >
                  “
                </span>

                <p
                  className={`relative font-serif italic leading-relaxed text-[#2D3748] mb-6 ${
                    item.featured ? "text-lg md:text-xl lg:text-2xl" : "text-lg md:text-xl"
                  }`}
                >
                  {item.quote}
                </p>

                <div className="flex items-center gap-3 border-t border-[#E2D8CC] pt-4">
                  <div
                    className="w-10 h-10 shrink-0 rounded-full border-2 border-dashed flex items-center justify-center font-hand text-lg"
                    style={{
                      borderColor: `${item.fastenerColor}66`,
                      backgroundColor: `${item.fastenerColor}14`,
                      color: "#1A202C",
                      transform: `rotate(${item.rotate > 0 ? -6 : 6}deg)`,
                    }}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <p className="font-hand text-[#1A202C] text-xl leading-none">
                      {item.author}
                    </p>
                    <p className="font-sans text-[#A09080] text-sm mt-1">{item.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}