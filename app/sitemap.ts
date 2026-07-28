import { MetadataRoute } from "next";

// PENTING: ganti tanggal ini secara MANUAL setiap kali konten utama
// homepage benar-benar berubah. Sebelumnya ini pakai `new Date()`, yang
// artinya lastModified selalu "hari ini" di setiap build/request — padahal
// isinya belum tentu berubah. Google secara eksplisit bilang lastmod yang
// nggak akurat begini akan membuat mereka mengabaikan sinyal ini sama
// sekali. Update angkanya (YYYY-MM-DD) tiap kali kamu ganti copy, foto
// utama, atau struktur section di homepage.
const LAST_CONTENT_UPDATE = new Date("2026-07-28");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://metagenzbukitcarmel.vercel.app",
      priority: 1,
      changeFrequency: "weekly",
      lastModified: LAST_CONTENT_UPDATE,
    },
  ];
}