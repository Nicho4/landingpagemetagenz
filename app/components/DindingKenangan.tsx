import { getApprovedNotes } from "@/lib/notes-store";
import { DindingKenanganBoard } from "./DindingKenanganBoard";

// ─── Types ────────────────────────────────────────────────────────────────────
// Dipindah ke sini karena ini sekarang file yang megang bentuk data dari
// getApprovedNotes(). DindingKenanganBoard (client component) import tipe
// ini dari sini, bukan mendefinisikan ulang.

export type NoteColor = "cream" | "blush" | "warm";
export type WashiPos = "left" | "center" | "right";
export type Attachment = "washi" | "pin" | "none";

export interface GuestNote {
  id: string;
  name: string;
  message: string;
  colorVariant: NoteColor;
  rotation: number;
  attachment: Attachment;
  attachmentPos: WashiPos;
  attachmentColor: string; // only meaningful when attachment === "washi"
  createdAt: number;
  pending?: boolean;
}

// Server Component (SENGAJA TANPA "use client"). Ini yang bikin pesan-pesan
// yang udah di-approve ikut masuk initial HTML — panggil getApprovedNotes()
// (fungsi yang sama persis dipakai GET /api/notes) langsung pas render di
// server, bukan nunggu fetch client-side setelah mount kayak sebelumnya.
// Google (dan siapapun yang "view source") sekarang langsung lihat isi
// papan tanpa perlu jalanin JS dulu. Efek sampingnya juga bagus: nggak ada
// lagi jeda "papan kosong dulu baru keisi" tiap kali halaman dibuka.
export async function DindingKenangan() {
  let notes: GuestNote[] = [];

  try {
    notes = await getApprovedNotes();
  } catch (error) {
    // Perilaku sama seperti sebelumnya: kalau gagal ambil data, biarkan
    // papan tampil kosong daripada mematahkan seluruh homepage.
    console.error("Gagal memuat Dinding Kenangan:", error);
  }

  return <DindingKenanganBoard initialNotes={notes} />;
}