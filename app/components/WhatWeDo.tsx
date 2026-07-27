"use client";

import { motion } from "motion/react";
import Image from "next/image";

const programs = [
  {
    index: "01",
    title: "Saturday Service",
    description: "Ibadah youth yang seru, musik praise & worship yang relatable, dan firman yang aplikatif buat kehidupan Gen Z.",
    image: "/Images/whatwedo1.webp",
    caption: "every saturday, 18:30",
    tilt: "-rotate-1",
    accent: "#D97757",
  },
  {
    index: "02",
    title: "Small Groups",
    description: "group tempat kamu bisa cerita jujur, saling doain, dan deep talk bareng temen-temen sefrekuensi.",
    image: "/Images/whatwedo2.webp",
    caption: "komunitas kecil, dampak besar",
    tilt: "rotate-1",
    accent: "#8FA37E",
  },
  {
    index: "03",
    title: "Special Events",
    description: "Mulai dari Youth Camp, Retreat, Fellowship, sampai Baksos. Waktunya healing sambil jadi berkat buat sesama!",
    image: "/Images/whatwedo3.webp",
    caption: "memories dibuat di sini",
    tilt: "-rotate-2",
    accent: "#D9A441",
  },
];

export function WhatWeDo() {
  return (
    <section className="relative py-16 md:py-24 bg-[#F6F0E6] overflow-hidden">
      {/* Decorative background — static gradients + dot grid, no filters/blur so scroll stays cheap */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 12% 15%, rgba(217,119,87,0.14) 0%, transparent 42%),
            radial-gradient(circle at 88% 12%, rgba(143,163,126,0.16) 0%, transparent 40%),
            radial-gradient(circle at 78% 92%, rgba(217,164,65,0.14) 0%, transparent 42%),
            radial-gradient(rgba(26,32,44,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 22px 22px",
          backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat",
        }}
      />

      <div className="container mx-auto px-6 relative">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 md:mb-20"
        >
          <div className="flex items-center gap-2 mb-2">
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-[2px] w-8 bg-[#D97757] origin-left"
            />
            <p className="font-hand text-[#D97757] text-xl md:text-2xl">
              What We Do
            </p>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A202C] leading-tight max-w-lg">
            Lebih dari sekadar{" "}
            <span className="italic font-normal">kumpul-kumpul.</span>
          </h2>
        </motion.div>

        {/* Cards — notecard / pinned photo style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 items-start">
          {programs.map((program, index) => (
            <motion.div
              key={program.index}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className={`relative bg-white shadow-md hover:shadow-xl ring-1 ring-black/5 ${program.tilt} hover:rotate-0 hover:-translate-y-2 transition-all duration-500 flex flex-col group cursor-default`}
            >
              {/* Washi tape — pinned corner accent, color varies per card */}
              <div
                className="absolute -top-2 left-6 w-12 h-5 rotate-[-4deg] z-20 opacity-80"
                style={{ backgroundColor: program.accent }}
              />

              {/* Photo */}
              <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                {/* Washi tape at top */}
                <div className="absolute top-0 left-0 right-0 h-3 z-10" style={{
                  background: 'linear-gradient(180deg, rgba(217,119,87,0.18) 0%, transparent 100%)'
                }} />
                <Image
                  src={program.image}
                  alt={program.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>

              {/* Content */}
              <div className="p-5 md:p-6 flex flex-col gap-3">
                <h3 className="font-heading text-xl md:text-2xl font-bold text-[#1A202C]">
                  {program.title}
                </h3>
                <p className="font-sans text-[#4A5568] leading-relaxed text-sm md:text-base">
                  {program.description}
                </p>
                {/* Handwritten caption at bottom */}
                <p className="font-hand text-[#A09080] text-base mt-1 flex items-center gap-1.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: program.accent }}
                  />
                  {program.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}