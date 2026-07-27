import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Lora, Caveat } from "next/font/google";
import { BackgroundMusicProvider } from "./components/BackgroundMusicContext";
import SmoothScroll from "./components/SmoothScroll";
import "./globals.css";

// font-heading — display serif for headings
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// font-sans — body text
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// font-serif — italic quotes / verses
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// font-hand — handwritten captions
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MetaGenz",
  description: "Welcome home, Gen Z. Komunitas anak muda Gereja Bukit Carmel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${plusJakartaSans.variable} ${lora.variable} ${caveat.variable}`}
    >
      <body className="antialiased bg-[#FDFBF7]">
        {/* BackgroundMusicProvider membungkus di titik paling luar (di atas
            SmoothScroll) supaya elemen <audio> dan status musiknya cuma
            ada SATU untuk seluruh halaman, dan bisa diakses dari komponen
            manapun di bawahnya — Navbar.tsx (tombol toggle-nya) maupun
            HighlightReel.tsx (buat "duck" musik pas video reel diputer). */}
        <BackgroundMusicProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </BackgroundMusicProvider>
      </body>
    </html>
  );
}