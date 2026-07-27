import fs from "node:fs";
import path from "node:path";
import { MemoriesGallery } from "./MemoriesGallery";

// Folder tempat semua foto section "Memories" disimpan. Nama filenya harus
// ikut pola "memories<angka>.ext" (contoh: memories1.webp, memories2.webp,
// ..., memories48.webp) — angkanya boleh berapa aja dan nggak harus
// berurutan tanpa "lubang" (kalau salah satu pernah dihapus, tetap aman),
// yang penting nama filenya kena pola regex di bawah.
const IMAGES_DIR = path.join(process.cwd(), "public", "Images");
const MEMORY_FILE_PATTERN = /^memories(\d+)\.(webp|jpe?g|png)$/i;

// Di-scan ulang tiap kali halaman ini di-build/di-render di server — jadi
// kalau kamu nambah atau hapus file "memoriesN.ext" di folder
// public/Images, jumlah foto yang tampil di section ini otomatis ikut
// nambah/berkurang, tanpa perlu edit angka manapun di kode lagi.
//
// CATATAN: karena section ini nggak baca data yang beda-beda tiap request
// (cookies, searchParams, dll), Next.js kemungkinan besar bakal
// nge-generate halaman ini sebagai halaman statis saat `next build` —
// artinya daftar foto ini "dibekukan" di titik build itu. Foto baru yang
// kamu tambahkan bakal kepakai begitu kamu build & deploy ulang (misalnya
// lewat git push ke Vercel), bukan langsung muncul di server yang masih
// jalan dari build sebelumnya tanpa rebuild.
function getMemoryPhotos(): string[] {
  let filenames: string[];
  try {
    filenames = fs.readdirSync(IMAGES_DIR);
  } catch {
    // Folder nggak ketemu / nggak bisa dibaca — jangan bikin build gagal,
    // cukup tampilkan section ini kosong.
    return [];
  }

  return filenames
    .map((name) => {
      const match = name.match(MEMORY_FILE_PATTERN);
      return match ? { name, num: parseInt(match[1], 10) } : null;
    })
    .filter((entry): entry is { name: string; num: number } => entry !== null)
    // Urut berdasarkan ANGKA di nama file, bukan alfabet — kalau diurut
    // sebagai teks biasa, "memories10.webp" bakal nongol sebelum
    // "memories2.webp".
    .sort((a, b) => a.num - b.num)
    .map((entry) => `/Images/${entry.name}`);
}

export function Memories() {
  const photos = getMemoryPhotos();
  return <MemoriesGallery photos={photos} />;
}