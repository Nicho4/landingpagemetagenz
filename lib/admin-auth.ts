// Proteksi admin paling sederhana: satu kunci rahasia yang harus dikirim
// lewat header "x-admin-key", dicocokkan dengan env var ADMIN_KEY.
//
// Ini cukup untuk mencegah orang iseng menyetujui/menghapus pesan, TAPI
// bukan proteksi tingkat enterprise (tidak ada rate-limit, tidak ada expiry,
// dsb). Jangan sebar link halaman /admin/notes secara publik, dan jangan
// commit nilai ADMIN_KEY ke git — taruh di .env.local saja.
import { NextRequest } from "next/server";

export function isAdminAuthorized(req: NextRequest): boolean {
  const providedKey = req.headers.get("x-admin-key");
  const expectedKey = process.env.ADMIN_KEY;
  return Boolean(expectedKey) && providedKey === expectedKey;
}
