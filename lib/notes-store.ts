import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";

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
  attachmentColor: string;
  createdAt: number;
  pending: boolean;
}

export const MAX_CHARS = 140;

interface NoteRow {
  id: string;
  name: string;
  message: string;
  color_variant: NoteColor;
  rotation: number;
  attachment: Attachment;
  attachment_pos: WashiPos;
  attachment_color: string;
  created_at: number;
  pending: boolean;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rowToNote(row: NoteRow): GuestNote {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    colorVariant: row.color_variant,
    rotation: row.rotation,
    attachment: row.attachment,
    attachmentPos: row.attachment_pos,
    attachmentColor: row.attachment_color,
    createdAt: row.created_at,
    pending: row.pending,
  };
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

export async function getApprovedNotes(): Promise<GuestNote[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("pending", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getApprovedNotes:", error);
    throw new Error("Gagal mengambil catatan.");
  }

  return (data as NoteRow[]).map(rowToNote);
}

export async function getAllNotes(): Promise<GuestNote[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllNotes:", error);
    throw new Error("Gagal mengambil catatan.");
  }

  return (data as NoteRow[]).map(rowToNote);
}

export async function getPendingNotes(): Promise<GuestNote[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("pending", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getPendingNotes:", error);
    throw new Error("Gagal mengambil catatan pending.");
  }

  return (data as NoteRow[]).map(rowToNote);
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function addNote(
  rawName: string,
  rawMessage: string
): Promise<GuestNote> {
  const row: NoteRow = {
    id: randomUUID(),

    name: rawName.trim() || "Anonim",

    message: rawMessage
      .trim()
      .slice(0, MAX_CHARS),

    color_variant: pick<NoteColor>([
      "cream",
      "blush",
      "warm",
    ]),

    rotation: Number(
      ((Math.random() - 0.5) * 6).toFixed(2)
    ),

    attachment: pick<Attachment>([
      "washi",
      "washi",
      "pin",
      "none",
    ]),

    attachment_pos: pick<WashiPos>([
      "left",
      "center",
      "right",
    ]),

    attachment_color: pick([
      "bg-[#D97757]/25",
      "bg-[#A09080]/30",
      "bg-[#D97757]/15",
    ]),

    created_at: Date.now(),

    pending: true,
  };

  const { data, error } = await supabase
    .from("notes")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error("addNote:", error);
    throw new Error("Gagal menyimpan catatan.");
  }

  return rowToNote(data as NoteRow);
}

// ─────────────────────────────────────────────
// APPROVE
// ─────────────────────────────────────────────

export async function approveNote(
  id: string
): Promise<GuestNote | null> {
  const { data, error } = await supabase
    .from("notes")
    .update({
      pending: false,
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("approveNote:", error);
    throw new Error("Gagal menyetujui catatan.");
  }

  if (!data) {
    return null;
  }

  return rowToNote(data as NoteRow);
}

// ─────────────────────────────────────────────
// EDIT
// ─────────────────────────────────────────────

export async function editNote(
  id: string,
  name: string | undefined,
  message: string
): Promise<GuestNote | null> {
  const updates: {
    message: string;
    name?: string;
  } = {
    message: message
      .trim()
      .slice(0, MAX_CHARS),
  };

  if (name !== undefined) {
    updates.name =
      name.trim() || "Anonim";
  }

  const { data, error } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("editNote:", error);
    throw new Error("Gagal mengedit catatan.");
  }

  if (!data) {
    return null;
  }

  return rowToNote(data as NoteRow);
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

export async function deleteNote(
  id: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("deleteNote:", error);
    throw new Error("Gagal menghapus catatan.");
  }

  return (data?.length ?? 0) > 0;
}