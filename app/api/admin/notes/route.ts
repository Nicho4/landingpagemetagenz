import { NextRequest, NextResponse } from "next/server";
import {
  getAllNotes,
  getPendingNotes,
} from "@/lib/notes-store";

import { isAdminAuthorized } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const onlyPending =
      req.nextUrl.searchParams.get("pending") === "true";

    const notes = onlyPending
      ? await getPendingNotes()
      : await getAllNotes();

    return NextResponse.json({
      notes,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Gagal mengambil catatan.",
      },
      {
        status: 500,
      }
    );
  }
}