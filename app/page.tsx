import { Navbar } from "./components/Navbar";
import { SplashScreen } from "./components/SplashScreen";
import { Hero } from "./components/Hero";
import { AboutUs } from "./components/AboutUs";
import { WhatWeDo } from "./components/WhatWeDo";
import { OurJourney } from "./components/OurJourney";
import { Memories } from "./components/Memories";
import { HighlightReel } from "./components/HighlightReel";
import { DindingKenangan } from "./components/DindingKenangan";
import { Testimonials } from "./components/Testimonials";
import { Connect } from "./components/Connect";
import { ServiceCountdown } from "./components/ServiceCountdown";

// SVG feTurbulence grain — single consistent asset used across all sections
const PAPER_GRAIN = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`;

function PaperTear({
  fill,
  className = "",
}: {
  fill: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute left-0 right-0 z-20 pointer-events-none ${className}`}
      style={{ lineHeight: 0 }}
    >
      <svg
        viewBox="0 0 1440 28"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "28px" }}
      >
        <path
          d="M0,28 L0,18 Q36,10 72,16 Q108,22 144,14 Q180,6 216,12 Q252,18 288,10
             Q324,2 360,8 Q396,14 432,8 Q468,2 504,9 Q540,16 576,10
             Q612,4 648,11 Q684,18 720,12 Q756,6 792,13 Q828,20 864,13
             Q900,6 936,12 Q972,18 1008,10 Q1044,2 1080,8 Q1116,14 1152,8
             Q1188,2 1224,9 Q1260,16 1296,10 Q1332,4 1368,11 Q1404,18 1440,12
             L1440,28 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

function WashiMarker({ color = "#D97757" }: { color?: string }) {
  return (
    <div className="relative z-10 flex justify-center -mt-3 mb-0 pointer-events-none">
      <div
        className="w-20 h-5 opacity-30"
        style={{
          background: color,
          transform: "rotate(-2deg)",
        }}
      />
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen font-sans selection:bg-[#D97757] selection:text-white bg-[#FDFBF7] overflow-x-hidden">
      {/* Paper grain */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          opacity: 0.045,
          backgroundImage: PAPER_GRAIN,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Definisi SVG filter grain kertas — dipakai bareng-bareng oleh
          beberapa section (Connect.tsx, Testimonials.tsx, HighlightReel.tsx)
          lewat referensi `filter: url(#id)`. Sebelumnya tiap file itu
          nge-define ulang filter feTurbulence-nya sendiri-sendiri
          (paperGrain / visi-grain / reel-grain) padahal isinya sama
          persis (atau cuma beda satu variant terang/gelap) — sekarang
          cukup didefinisikan sekali di sini karena id SVG filter itu
          scope-nya global di seluruh dokumen, jadi section manapun di
          halaman yang sama bisa langsung referensi tanpa perlu bikin
          definisi sendiri lagi.
          - paper-grain-dark: bintik gelap halus, dipakai di atas
            kartu/background terang (notecard, testimoni).
          - paper-grain-light: bintik terang halus, dipakai di atas
            frame/background gelap (bingkai video Highlight Reel). */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="paper-grain-dark">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.035 0"
          />
        </filter>
        <filter id="paper-grain-light">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0"
          />
        </filter>
      </svg>

      <SplashScreen />
      <Navbar />

      <main className="overflow-x-hidden">
        {/* Hero */}
        <section id="hero" className="relative">
          <Hero />
          <PaperTear fill="#FDFBF7" className="-bottom-1" />
        </section>

        {/* About */}
        <section id="about">
          <AboutUs />
        </section>

        {/* Programs */}
        <WashiMarker />
        <section id="program">
          <WhatWeDo />
        </section>

        {/* Our Journey */}
        <WashiMarker color="#A09080" />
        <section id="journey" className="relative">
          <OurJourney />
          <PaperTear fill="#FDFBF7" className="-bottom-1" />
        </section>

        {/* Memories */}
        <section id="memories">
          <Memories />
        </section>

        {/* Highlight Reel */}
        <section id="highlight">
          <HighlightReel />
        </section>

        {/* Testimonials */}
        <section id="testimoni">
          <Testimonials />
        </section>

        {/* Connect */}
        <section id="connect">
          <Connect />
        </section>
        
        {/* Dinding Kenangan */}
        <section id="dinding">
          <DindingKenangan />
        </section>


        {/* Countdown */}
        <section id="countdown" className="relative">
          <div
            className="absolute -top-1 left-0 right-0 z-20 pointer-events-none rotate-180"
            style={{ lineHeight: 0 }}
          >
            <svg
              viewBox="0 0 1440 28"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block", width: "100%", height: "28px" }}
            >
              <path
                d="M0,28 L0,18 Q36,10 72,16 Q108,22 144,14 Q180,6 216,12 Q252,18 288,10
                   Q324,2 360,8 Q396,14 432,8 Q468,2 504,9 Q540,16 576,10
                   Q612,4 648,11 Q684,18 720,12 Q756,6 792,13 Q828,20 864,13
                   Q900,6 936,12 Q972,18 1008,10 Q1044,2 1080,8 Q1116,14 1152,8
                   Q1188,2 1224,9 Q1260,16 1296,10 Q1332,4 1368,11 Q1404,18 1440,12
                   L1440,28 Z"
                fill="#1A1208"
              />
            </svg>
          </div>

          <ServiceCountdown />
        </section>
      </main>
    </div>
  );
}