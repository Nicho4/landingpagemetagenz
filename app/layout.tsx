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
    "Website resmi MetaGenz Bukit Carmel. Komunitas youth Gereja GBT Bukit Carmel dengan ibadah pemuda, event, pelayanan, galeri, dan Dinding Kenangan.",
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
    "GBT Bukit Carmel",
    "gbt",
    "Bukit karmel"
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

// Structured data (JSON-LD) — membantu Google paham MetaGenz sebagai
// organisasi + jam ibadah rutinnya secara eksplisit, bukan cuma dari teks
// bebas. Alamat di bawah ini sekarang alamat asli, diambil dari listing
// Google Business Profile "GBT Bukit Carmel" yang sudah terverifikasi.
//
// @type sengaja pakai "Organization" (generik), bukan "ReligiousOrganization".
// Schema.org tidak punya tipe resmi untuk "komunitas/kelompok pemuda", dan
// MetaGenz sendiri lebih tepat digambarkan sebagai komunitas youth di dalam
// gereja, bukan organisasi keagamaan formalnya itu sendiri (yang lebih pas
// untuk GBT Bukit Carmel langsung). Identitas "komunitas youth gereja Bukit
// Carmel" tetap disampaikan lewat teks di `description`, bukan lewat `@type`
// — karena `@type` harus istilah resmi schema.org supaya Google bisa
// membacanya sebagai structured data yang valid.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MetaGenz Bukit Carmel",
  alternateName: "MetaGenz",
  url: "https://metagenzbukitcarmel.vercel.app",
  logo: "https://metagenzbukitcarmel.vercel.app/Images/hero.webp",
  image: "https://metagenzbukitcarmel.vercel.app/Images/hero.webp",
  description:
    "Komunitas youth Gereja Bukit Carmel, Surabaya. Ibadah pemuda tiap Sabtu, komunitas, dan event untuk Gen Z.",
  sameAs: ["https://www.instagram.com/metagenz/"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Kupang Jaya No.102, Simomulyo, Kec. Sukomanunggal",
    addressLocality: "Surabaya",
    addressRegion: "Jawa Timur",
    postalCode: "60281",
    addressCountry: "ID",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Saturday",
    opens: "18:30",
    closes: "20:00",
  },
};

// Structured data (JSON-LD) tambahan — khusus tipe `WebSite`. Ini BEDA
// dari `jsonLd` di atas (yang tipenya ReligiousOrganization, menjelaskan
// MetaGenz sebagai *organisasi*). Google Search Central secara eksplisit
// bilang sinyal PALING PENTING untuk menentukan "site name" yang tampil
// tebal di hasil pencarian adalah structured data bertipe WebSite dengan
// properti `name` — bukan Organization/ReligiousOrganization. Sebelum ini
// ditambahkan, Google cuma punya ReligiousOrganization untuk dibaca, jadi
// preferensi nama situs kita nggak pernah tersampaikan lewat jalur yang
// paling dipercaya Google.
//
// `alternateName` diisi dua opsi cadangan:
// - "MetaGenz": biar konsisten sama heading besar yang tampil di Hero
//   section (lihat Hero.tsx), yang kemungkinan juga jadi salah satu
//   sinyal yang dibaca Google dari konten halaman.
// - "metagenzbukitcarmel.vercel.app": nama domain, direkomendasikan
//   Google sebagai opsi cadangan khusus untuk situs yang masih baru /
//   belum banyak sinyal kepercayaan, supaya kalau nama utama nggak
//   dipilih, sistem Google tetap punya opsi lain yang relevan alih-alih
//   fallback ke "Vercel".
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MetaGenz Bukit Carmel",
  alternateName: ["MetaGenz", "metagenzbukitcarmel.vercel.app"],
  url: "https://metagenzbukitcarmel.vercel.app",
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
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#FDFBF7]">
        <BackgroundMusicProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </BackgroundMusicProvider>
      </body>
    </html>
  );
}