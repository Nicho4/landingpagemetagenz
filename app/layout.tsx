import type { Metadata } from "next";
import {
  Fraunces,
  Plus_Jakarta_Sans,
  Lora,
  Caveat,
} from "next/font/google";
import { BackgroundMusicProvider } from "./components/BackgroundMusicContext";
import SmoothScroll from "./components/SmoothScroll";
import "./globals.css";

// Heading Font
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
// Body Font
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
// Serif Font
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
// Handwritten Font
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://metagenzbukitcarmel.vercel.app"),
  applicationName: "MetaGenz Bukit Carmel",
  title: {
    default: "MetaGenz Bukit Carmel | Komunitas Youth Gereja Bukit Carmel",
    template: "%s | MetaGenz Bukit Carmel",
  },
  description:
    "Website resmi MetaGenz Bukit Carmel. Komunitas youth Gereja Bukit Carmel dengan ibadah pemuda, event, pelayanan, galeri, dan Dinding Kenangan.",
  keywords: [
    "MetaGenz",
    "MetaGenz Bukit Carmel",
    "Bukit Carmel",
    "Gereja Bukit Carmel",
    "Youth Bukit Carmel",
    "Ibadah Youth",
    "Ibadah Pemuda",
    "Youth Surabaya",
    "Komunitas Pemuda",
    "Gereja Surabaya",
  ],
  authors: [
    {
      name: "MetaGenz Bukit Carmel",
    },
  ],
  creator: "MetaGenz Bukit Carmel",
  publisher: "MetaGenz Bukit Carmel",
  category: "Church",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  alternates: {
    canonical: "https://metagenzbukitcarmel.vercel.app",
  },
  openGraph: {
    title: "MetaGenz Bukit Carmel",
    description:
      "Website resmi komunitas youth Gereja Bukit Carmel.",
    url: "https://metagenzbukitcarmel.vercel.app",
    siteName: "MetaGenz Bukit Carmel",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/Images/hero.webp",
        width: 1200,
        height: 630,
        alt: "MetaGenz Bukit Carmel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MetaGenz Bukit Carmel",
    description:
      "Website resmi komunitas youth Gereja Bukit Carmel.",
    images: ["/Images/hero.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
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
        <BackgroundMusicProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </BackgroundMusicProvider>
      </body>
    </html>
  );
}