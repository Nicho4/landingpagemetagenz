import { NextRequest, NextResponse } from "next/server";
import {
  addNote,
  getApprovedNotes,
  MAX_CHARS,
} from "@/lib/notes-store";

export async function GET() {
  try {
    const notes = await getApprovedNotes();

    return NextResponse.json({
      notes,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal mengambil catatan." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    const name =
      typeof body?.name === "string"
        ? body.name
        : "";

    if (!message) {
      return NextResponse.json(
        {
          error: "Pesan tidak boleh kosong.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > MAX_CHARS) {
      return NextResponse.json(
        {
          error: `Pesan maksimal ${MAX_CHARS} karakter.`,
        },
        {
          status: 400,
        }
      );
    }

    const note = await addNote(
      name,
      message
    );

    return NextResponse.json(
      { note },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Gagal menyimpan pesan.",
      },
      {
        status: 500,
      }
    );
  }
}