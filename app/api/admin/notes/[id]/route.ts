import { NextRequest, NextResponse } from "next/server";

import {
  approveNote,
  deleteNote,
  editNote,
  MAX_CHARS,
} from "@/lib/notes-store";

import { isAdminAuthorized } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const body = await req
      .json()
      .catch(() => null);

    // EDIT
    if (
      body &&
      typeof body.message === "string"
    ) {
      const message =
        body.message.trim();

      const name =
        typeof body.name === "string"
          ? body.name
          : undefined;

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

      const edited =
        await editNote(
          id,
          name,
          message
        );

      if (!edited) {
        return NextResponse.json(
          {
            error: "Catatan tidak ditemukan.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json({
        note: edited,
      });
    }

    // APPROVE

    const note =
      await approveNote(id);

    if (!note) {
      return NextResponse.json(
        {
          error: "Catatan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      note,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const ok =
      await deleteNote(id);

    if (!ok) {
      return NextResponse.json(
        {
          error: "Catatan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );
  }
}