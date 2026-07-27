"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Pencil,
  Trash2,
  Save,
  X,
  Lock,
  RefreshCw,
  Loader2,
  Inbox,
  ClipboardList,
  ClipboardCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Search,
  SearchX,
} from "lucide-react";

// Harus sama dengan MAX_CHARS di lib/notes-store.ts — komponen client gak
// bisa import dari file itu (dia menyentuh fs), jadi disalin nilainya di sini.
const MAX_CHARS = 140;

interface AdminNote {
  id: string;
  name: string;
  message: string;
  createdAt: number;
  pending: boolean;
}

function matchesQuery(note: AdminNote, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return note.message.toLowerCase().includes(q) || note.name.toLowerCase().includes(q);
}

// Bungkus bagian teks yang cocok dengan kata pencarian pakai <mark>, biar
// keliatan langsung kenapa suatu pesan muncul di hasil pencarian.
function highlightMatch(text: string, query: string): React.ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark key={i} className="bg-[#F6DFA0] text-[#2D2418] rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function AdminNotesPage() {
  const [key, setKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pencarian terpisah untuk tiap section — biar bisa cari hal berbeda
  // di antrian pending dan di daftar yang sudah tampil tanpa saling ganggu.
  const [pendingSearch, setPendingSearch] = useState("");
  const [approvedSearch, setApprovedSearch] = useState("");

  // State untuk mode edit — cuma satu pesan yang bisa diedit dalam satu waktu.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Id pesan yang lagi ditanya konfirmasi Tolak/Hapus-nya. Cuma satu pesan
  // yang bisa dalam mode konfirmasi ini dalam satu waktu (sama kayak edit).
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  // Simpan key di sessionStorage biar gak perlu ketik ulang tiap reload.
  useEffect(() => {
    const saved = sessionStorage.getItem("dinding-kenangan-admin-key");
    if (saved) {
      setKey(saved);
      setKeySaved(true);
    }
  }, []);

  useEffect(() => {
    if (keySaved) loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keySaved]);

  // Ambil SEMUA catatan (pending + yang sudah tampil), lalu dipisah di
  // render-nya di bawah — jadi satu halaman ini bisa urus keduanya.
  async function loadNotes() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/notes", {
        headers: { "x-admin-key": key },
      });
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Admin key salah." : "Gagal memuat data.");
      }
      const data = await res.json();
      setNotes(data.notes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    sessionStorage.setItem("dinding-kenangan-admin-key", key);
    setKeySaved(true);
  }

  async function handleApprove(id: string) {
    setError("");
    try {
      const res = await fetch(`/api/admin/notes/${id}`, {
        method: "PATCH",
        headers: { "x-admin-key": key },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Gagal menyetujui pesan.");
      }
      setNotes(prev => prev.map(n => (n.id === id ? { ...n, pending: false } : n)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    }
  }

  // Satu fungsi hapus, dipakai baik untuk "Tolak" (pesan pending)
  // maupun "Hapus" (pesan yang sudah tampil) — keduanya sama saja di backend.
  async function handleDelete(id: string) {
    setError("");
    try {
      const res = await fetch(`/api/admin/notes/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": key },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Gagal menghapus pesan.");
      }
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    }
  }

  // Dipanggil setelah admin klik "Ya, Tolak/Hapus" di kotak konfirmasi.
  async function confirmDelete(id: string) {
    await handleDelete(id);
    setConfirmingDeleteId(null);
  }

  function startEdit(note: AdminNote) {
    setError("");
    setEditingId(note.id);
    setEditName(note.name);
    setEditMessage(note.message);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    if (!editMessage.trim()) return;
    setEditSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
        body: JSON.stringify({ name: editName, message: editMessage }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Gagal menyimpan perubahan.");
      }
      const data = await res.json();
      setNotes(prev =>
        prev.map(n => (n.id === id ? { ...n, name: data.note.name, message: data.note.message } : n))
      );
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Gerbang admin key ──────────────────────────────────────────────
  if (!keySaved) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#EAE0D4] p-8">
          <div className="w-11 h-11 rounded-full bg-[#F6F0E6] flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-[#D97757]" strokeWidth={2} />
          </div>
          <h1 className="font-heading text-xl font-bold text-[#1A202C] mb-1">
            Masuk sebagai admin
          </h1>
          <p className="font-sans text-sm text-[#8C7060] mb-6">
            Dinding Kenangan — panel moderasi pesan.
          </p>
          <form onSubmit={handleKeySubmit} className="flex flex-col gap-3">
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Admin key"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#EAE0D4] bg-[#FDFBF7] font-sans text-sm text-[#1A202C] placeholder:text-[#C4B49A] focus:outline-none focus:ring-2 focus:ring-[#D97757]/40 focus:border-[#D97757] transition-colors"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#C1613C] text-white font-sans text-sm font-semibold hover:bg-[#AC5433] transition-colors"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingNotes = notes.filter(n => n.pending);
  const approvedNotes = notes.filter(n => !n.pending);
  const filteredPending = pendingNotes.filter(n => matchesQuery(n, pendingSearch));
  const filteredApproved = approvedNotes.filter(n => matchesQuery(n, approvedSearch));

  return (
    <div
      className="min-h-screen py-10 px-4 sm:px-6"
      style={{
        backgroundColor: "#FAF6EF",
        backgroundImage:
          "radial-gradient(ellipse 900px 420px at 50% -12%, rgba(217,119,87,0.08), transparent)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-[#F6F0E6] flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5 text-[#D97757]" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-[#1A202C] tracking-tight">
                Tinjau Kenangan
              </h1>
              <p className="font-sans text-sm text-[#718096] mt-1">
                Setujui, edit, atau hapus pesan sebelum maupun sesudah tampil di papan publik.
              </p>
            </div>
          </div>
          <button
            onClick={loadNotes}
            disabled={loading}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EAE0D4] bg-white font-sans text-xs text-[#718096] hover:text-[#D97757] hover:border-[#D97757]/40 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={2} />
            Muat ulang
          </button>
        </div>

        {/* Ringkasan */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex items-center gap-3 bg-white rounded-xl border border-[#EAE0D4] px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-[#FBEDE3] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#C1613C]" strokeWidth={2} />
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-[#1A202C] leading-none">
                {pendingNotes.length}
              </p>
              <p className="font-sans text-xs text-[#8C7060] mt-0.5">Menunggu</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 bg-white rounded-xl border border-[#EAE0D4] px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-[#E9F0EA] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#5F8265]" strokeWidth={2} />
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-[#1A202C] leading-none">
                {approvedNotes.length}
              </p>
              <p className="font-sans text-xs text-[#8C7060] mt-0.5">Tampil di papan</p>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-[#FBEAE8] border border-[#F0C4BE] text-[#A4161A] px-4 py-3 text-sm font-sans mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm font-sans text-[#A09080] mb-5">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat pesan...
          </div>
        )}

        {/* ── Menunggu persetujuan ── */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-base font-bold text-[#1A202C]">Menunggu Persetujuan</h2>
              <span className="inline-flex items-center justify-center min-w-[1.4rem] h-5 px-1.5 rounded-full bg-[#C1613C] text-white font-sans text-[11px] font-semibold">
                {pendingNotes.length}
              </span>
            </div>
            <SearchBox
              value={pendingSearch}
              onChange={setPendingSearch}
              placeholder="Cari pesan atau nama..."
            />
          </div>

          {!loading && pendingNotes.length === 0 && (
            <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-[#EAE0D4] bg-white/60 px-4 py-5 font-sans text-sm text-[#A09080]">
              <Inbox className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              Tidak ada pesan yang menunggu saat ini.
            </div>
          )}

          {!loading && pendingNotes.length > 0 && filteredPending.length === 0 && (
            <EmptySearchState query={pendingSearch} onClear={() => setPendingSearch("")} />
          )}

          <ul className="flex flex-col gap-3">
            {filteredPending.map(note => (
              <li
                key={note.id}
                className="bg-white rounded-xl border-l-4 border-[#D97757] shadow-sm hover:shadow-md transition-shadow px-5 py-4"
              >
                {editingId === note.id ? (
                  <EditForm
                    editMessage={editMessage}
                    editName={editName}
                    editSaving={editSaving}
                    onMessageChange={setEditMessage}
                    onNameChange={setEditName}
                    onCancel={cancelEdit}
                    onSave={() => saveEdit(note.id)}
                  />
                ) : confirmingDeleteId === note.id ? (
                  <ConfirmDelete
                    actionLabel="Tolak"
                    onConfirm={() => confirmDelete(note.id)}
                    onCancel={() => setConfirmingDeleteId(null)}
                  />
                ) : (
                  <>
                    <p className="font-hand text-lg text-[#2D2418] leading-snug mb-2">
                      {highlightMatch(note.message, pendingSearch)}
                    </p>
                    <p className="font-sans text-xs text-[#8C7060] mb-3">
                      — {highlightMatch(note.name, pendingSearch)} ·{" "}
                      {new Date(note.createdAt).toLocaleString("id-ID")}
                    </p>
                    <div className="flex items-center gap-2">
                      <ActionButton color="#2D6A4F" onClick={() => handleApprove(note.id)} icon={<Check className="w-3.5 h-3.5" />}>
                        Setujui
                      </ActionButton>
                      <ActionButton color="#6B5540" onClick={() => startEdit(note)} icon={<Pencil className="w-3.5 h-3.5" />}>
                        Edit
                      </ActionButton>
                      <ActionButton color="#A4161A" onClick={() => setConfirmingDeleteId(note.id)} icon={<Trash2 className="w-3.5 h-3.5" />}>
                        Tolak
                      </ActionButton>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Sudah tampil di papan ── */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-base font-bold text-[#1A202C]">Sudah Tampil di Papan</h2>
              <span className="inline-flex items-center justify-center min-w-[1.4rem] h-5 px-1.5 rounded-full bg-[#5F8265] text-white font-sans text-[11px] font-semibold">
                {approvedNotes.length}
              </span>
            </div>
            <SearchBox
              value={approvedSearch}
              onChange={setApprovedSearch}
              placeholder="Cari pesan atau nama..."
            />
          </div>

          {!loading && approvedNotes.length === 0 && (
            <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-[#EAE0D4] bg-white/60 px-4 py-5 font-sans text-sm text-[#A09080]">
              <ClipboardList className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              Belum ada pesan yang tampil.
            </div>
          )}

          {!loading && approvedNotes.length > 0 && filteredApproved.length === 0 && (
            <EmptySearchState query={approvedSearch} onClear={() => setApprovedSearch("")} />
          )}

          <ul className="flex flex-col gap-3">
            {filteredApproved.map(note => (
              <li
                key={note.id}
                className="bg-white rounded-xl border-l-4 border-[#7A9B7E] shadow-sm hover:shadow-md transition-shadow px-5 py-4"
              >
                {editingId === note.id ? (
                  <EditForm
                    editMessage={editMessage}
                    editName={editName}
                    editSaving={editSaving}
                    onMessageChange={setEditMessage}
                    onNameChange={setEditName}
                    onCancel={cancelEdit}
                    onSave={() => saveEdit(note.id)}
                  />
                ) : confirmingDeleteId === note.id ? (
                  <ConfirmDelete
                    actionLabel="Hapus"
                    onConfirm={() => confirmDelete(note.id)}
                    onCancel={() => setConfirmingDeleteId(null)}
                  />
                ) : (
                  <>
                    <p className="font-hand text-lg text-[#2D2418] leading-snug mb-2">
                      {highlightMatch(note.message, approvedSearch)}
                    </p>
                    <p className="font-sans text-xs text-[#8C7060] mb-3">
                      — {highlightMatch(note.name, approvedSearch)} ·{" "}
                      {new Date(note.createdAt).toLocaleString("id-ID")}
                    </p>
                    <div className="flex items-center gap-2">
                      <ActionButton color="#6B5540" onClick={() => startEdit(note)} icon={<Pencil className="w-3.5 h-3.5" />}>
                        Edit
                      </ActionButton>
                      <ActionButton color="#A4161A" onClick={() => setConfirmingDeleteId(note.id)} icon={<Trash2 className="w-3.5 h-3.5" />}>
                        Hapus
                      </ActionButton>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

// Kotak pencarian kecil dengan ikon + tombol clear, dipakai di kedua section.
function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:w-60">
      <Search className="w-4 h-4 text-[#C4B49A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#EAE0D4] bg-white font-sans text-sm text-[#1A202C] placeholder:text-[#C4B49A] focus:outline-none focus:ring-2 focus:ring-[#D97757]/40 focus:border-[#D97757] transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C4B49A] hover:text-[#8C7060] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// Tampil kalau pencarian gak nemu apa-apa (tapi section-nya sendiri gak kosong).
function EmptySearchState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[#EAE0D4] bg-white/60 px-4 py-6 font-sans text-sm text-[#A09080] text-center mb-3">
      <SearchX className="w-5 h-5" strokeWidth={1.5} />
      <span>
        Gak ada hasil untuk &ldquo;{query}&rdquo;.{" "}
        <button onClick={onClear} className="text-[#D97757] underline hover:text-[#AC5433] transition-colors">
          Hapus pencarian
        </button>
      </span>
    </div>
  );
}

// Kotak konfirmasi inline sebelum Tolak/Hapus beneran dieksekusi — muncul
// menggantikan baris tombol aksi, sama seperti cara EditForm menggantikan isi pesan.
function ConfirmDelete({
  actionLabel,
  onConfirm,
  onCancel,
}: {
  actionLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="font-sans text-xs text-[#6B5540]">
        Yakin mau {actionLabel.toLowerCase()} pesan ini?
      </span>
      <button
        onClick={onConfirm}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#A4161A] text-white font-sans text-xs font-medium hover:brightness-110 transition-[filter]"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Ya, {actionLabel}
      </button>
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#EAE0D4] text-[#8C7060] font-sans text-xs font-medium hover:bg-[#F6F0E6] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Batal
      </button>
    </div>
  );
}

// Tombol aksi kecil dengan ikon — warnanya beda tiap jenis aksi
// (hijau = setujui, cokelat = edit, merah = hapus/tolak) supaya cepat dikenali.
function ActionButton({
  color,
  icon,
  onClick,
  children,
}: {
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: color }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white font-sans text-xs font-medium hover:brightness-110 transition-[filter]"
    >
      {icon}
      {children}
    </button>
  );
}

// Form edit inline — dipakai baik untuk pesan pending maupun yang sudah tampil.
function EditForm({
  editMessage,
  editName,
  editSaving,
  onMessageChange,
  onNameChange,
  onCancel,
  onSave,
}: {
  editMessage: string;
  editName: string;
  editSaving: boolean;
  onMessageChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div>
      <textarea
        value={editMessage}
        onChange={e => {
          if (e.target.value.length <= MAX_CHARS) onMessageChange(e.target.value);
        }}
        rows={3}
        className="w-full px-3 py-2 rounded-md border border-[#EAE0D4] bg-[#FDFBF7] font-sans text-sm text-[#1A202C] resize-none focus:outline-none focus:ring-2 focus:ring-[#D97757]/40 focus:border-[#D97757] transition-colors mb-1"
      />
      <div className="text-right font-sans text-[11px] text-[#C4B49A] mb-2.5">
        {editMessage.length} / {MAX_CHARS}
      </div>
      <input
        type="text"
        value={editName}
        onChange={e => onNameChange(e.target.value)}
        placeholder="Nama (kosongkan = Anonim)"
        className="w-full px-3 py-2 rounded-md border border-[#EAE0D4] bg-[#FDFBF7] font-sans text-sm text-[#1A202C] mb-3 focus:outline-none focus:ring-2 focus:ring-[#D97757]/40 focus:border-[#D97757] transition-colors"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={editSaving || !editMessage.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#C1613C] text-white font-sans text-xs font-medium hover:bg-[#AC5433] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {editSaving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#EAE0D4] text-[#8C7060] font-sans text-xs font-medium hover:bg-[#F6F0E6] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Batal
        </button>
      </div>
    </div>
  );
}