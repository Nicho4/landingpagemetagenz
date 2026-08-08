"use client";

import { motion, type Transition, type TargetAndTransition } from "motion/react";
import Image from "next/image";

const hoverTransition: Transition = { type: "spring", stiffness: 300, damping: 18 };
const tapTransition: Transition = { type: "spring", stiffness: 400, damping: 20 };

const photoInteraction: { whileHover: TargetAndTransition; whileTap: TargetAndTransition } = {
  whileHover: {
    scale: 1.07,
    rotate: 0,
    y: -10,
    zIndex: 50,
    boxShadow: "0 25px 45px -10px rgba(45, 55, 72, 0.35)",
    transition: hoverTransition,
  },
  whileTap: {
    scale: 0.95,
    rotate: 0,
    transition: tapTransition,
  },
};

export function AboutUs() {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-[#FDFBF7] text-[#2D3748] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* Photo Cluster — scrapbook style, no blobs */}
          <div className="relative isolate h-[400px] sm:h-[500px] lg:h-[600px] w-full max-w-md mx-auto lg:max-w-none mt-8 lg:mt-0">

            {/* Main photo — tilted, white border like a print */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              {...photoInteraction}
              className="absolute top-0 left-0 w-[60%] lg:w-[56%] bg-white p-3 pb-3 shadow-lg -rotate-3 z-0 cursor-pointer touch-manipulation"
            >
              {/* Washi tape strip across top corner */}
              <div className="absolute -top-2.5 left-6 w-14 h-5 bg-[#D97757]/30 rotate-[-3deg] z-10" />
              <div className="overflow-hidden">
                <Image
                  src="/Images/aboutus1.webp"
                  alt="Youth gathering"
                  width={500}
                  height={625}
                  sizes="(min-width: 1024px) 28vw, 55vw"
                  className="w-full h-auto block"
                />
              </div>
            </motion.div>

            {/* Third photo — small accent, tucked over the main photo's corner */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
              {...photoInteraction}
              className="absolute top-[2%] right-0 w-[42%] lg:w-[38%] bg-white p-2.5 pb-2.5 shadow-lg rotate-6 z-20 cursor-pointer touch-manipulation"
            >
              {/* Washi tape strip */}
              <div className="absolute -top-2 right-5 w-12 h-5 bg-[#8C7B6B]/30 rotate-[4deg] z-10" />
              <div className="overflow-hidden">
                <Image
                  src="/Images/aboutus3.webp"
                  alt="Serving together"
                  width={500}
                  height={625}
                  sizes="(min-width: 1024px) 19vw, 40vw"
                  className="w-full h-auto block"
                />
              </div>
            </motion.div>

            {/* Second photo — offset, opposite tilt */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3 }}
              {...photoInteraction}
              className="absolute bottom-0 right-[6%] w-[54%] lg:w-[50%] bg-white p-3 pb-3 shadow-lg rotate-2 z-10 cursor-pointer touch-manipulation"
            >
              {/* Pin dot at top center */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#4A4238] rounded-full shadow z-10" />
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#8C7B6B] rounded-full z-10" />
              <div className="overflow-hidden">
                <Image
                  src="/Images/aboutus2.webp"
                  alt="Friends laughing"
                  width={500}
                  height={625}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="w-full h-auto block"
                />
              </div>
              <p className="font-hand text-[#6B6055] text-sm mt-2 text-center">bareng terus ✦</p>
            </motion.div>

          </div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <p className="font-hand text-[#D97757] text-xl md:text-2xl mb-3 tracking-wide">
              Siapa MetaGenz?
            </p>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A202C] leading-tight mb-5">
              Bukan Sekadar <br />
              <span className="italic font-normal">Rutinitas.</span>
            </h2>

            <div className="space-y-4 text-[#4A5568] font-sans text-base md:text-lg leading-relaxed">
              <p>
                MetaGenz adalah youth ministry dari{" "}
                <span className="font-semibold text-[#2D3748]">GBT Bukit Carmel, Surabaya</span>.
                Kita percaya kalau ke gereja itu nggak harus kaku dan membosankan.
              </p>
              <p>
                Di sini, kita ngobrolin hal-hal <em>real</em> yang dihadapi Gen Z setiap harinya dari quarter-life crisis, mental health, hubungan, sampai gimana nemuin <em>purpose</em> hidup yang sejalan sama firman Tuhan.
              </p>
              <p>
                <em>No judgment, just love.</em> Kita adalah rumah buat kamu yang lagi cari jawaban, atau sekadar cari tempat untuk bersandar.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}