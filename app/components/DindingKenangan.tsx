"use client";

import { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { PenLine, Check, Pin } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteColor = "cream" | "blush" | "warm";
type WashiPos = "left" | "center" | "right";
type Attachment = "washi" | "pin" | "none";

interface GuestNote {
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

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_CHARS = 140;
const INITIAL_SHOW = 9;

const COLOR_CLASSES: Record<NoteColor, string> = {
  cream: "bg-[#FDFBF7]",
  blush: "bg-[#FAF0EB]",
  warm: "bg-[#F6F0E6]",
};

// A touch darker than each card color, used for the folded-corner detail so
// it reads as "the back of the same paper" rather than a random shadow.
const CORNER_SHADE: Record<NoteColor, string> = {
  cream: "#E9E0CE",
  blush: "#EEDCCF",
  warm: "#E7DBC1",
};

// Washi tape horizontal offset from card edge
const WASHI_X: Record<WashiPos, string> = {
  left: "left-3",
  center: "left-[40%]",
  right: "right-3",
};

// Push-pin horizontal offset (narrower than tape, so its own offsets)
const PIN_X: Record<WashiPos, string> = {
  left: "left-4",
  center: "left-1/2 -translate-x-1/2",
  right: "right-4",
};

// Faint diagonal fiber lines + soft cast shadow so washi tape reads as a
// semi-translucent strip sitting slightly above the paper, not a flat rectangle.
const WASHI_TEXTURE = {
  backgroundImage:
    "repeating-linear-gradient(50deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 1.5px, transparent 1.5px, transparent 4px)",
  boxShadow: "0 2px 3px rgba(0,0,0,0.08)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Small deterministic string hash — turns a note's id into a stable numeric
// seed so each card gets its own crease pattern, but that pattern never
// changes on re-render (no need to store extra random fields per note).
function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Builds a "crumpled / folded paper" texture: a few thin diagonal
// highlight+shadow crease lines plus soft grain blotches, layered on top of
// the card's base color via multiply blending. Pure CSS gradients — cheap
// to render even with many notes on the board at once.
function paperTexture(id: string): { backgroundImage: string; backgroundBlendMode: string } {
  const s = seedFromId(id);

  const angle1 = 15 + (s % 50); // 15–64deg
  const angle2 = 95 + ((s >> 3) % 55); // 95–149deg
  const angle3 = 145 + ((s >> 6) % 60); // 145–204deg

  const pos1 = 12 + (s % 20);
  const pos2 = 42 + ((s >> 4) % 22);
  const pos3 = 68 + ((s >> 8) % 20);

  const grainX1 = 15 + (s % 55);
  const grainY1 = 15 + ((s >> 2) % 55);
  const grainX2 = 100 - grainX1;
  const grainY2 = 100 - grainY1;

  const crease = (angle: number, pos: number, strength: number) =>
    `linear-gradient(${angle}deg, transparent ${pos - 1.4}%, rgba(0,0,0,${strength}) ${pos}%, rgba(255,255,255,${strength * 8}) ${pos + 0.6}%, transparent ${pos + 1.8}%)`;

  return {
    backgroundImage: [
      crease(angle1, pos1, 0.05),
      crease(angle2, pos2, 0.045),
      crease(angle3, pos3, 0.035),
      `radial-gradient(ellipse at ${grainX1}% ${grainY1}%, rgba(0,0,0,0.035) 0%, transparent 45%)`,
      `radial-gradient(ellipse at ${grainX2}% ${grainY2}%, rgba(0,0,0,0.03) 0%, transparent 40%)`,
    ].join(", "),
    backgroundBlendMode: "multiply, multiply, multiply, multiply, multiply",
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// Wrapped in memo() so a card only re-renders when ITS OWN note data changes.
// Without this, typing a single character into the message textarea below
// re-renders the whole board — recomputing paperTexture()'s five gradient
// layers for every visible card on every keystroke. On a mid-range phone
// that's exactly the kind of per-frame work that shows up as stutter while
// someone is typing or scrolling the board right after. Since `notes` itself
// only changes on fetch/submit (not on every keystroke), the note object
// reference each card receives is stable across those re-renders, so memo
// lets almost every card bail out instantly.
const NoteCard = memo(function NoteCard({
  note,
  reduceMotion,
}: {
  note: GuestNote;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.6, opacity: 0, rotate: note.rotation - 9 }}
      animate={{ scale: 1, opacity: 1, rotate: note.rotation }}
      exit={{ scale: 0.6, opacity: 0 }}
      whileHover={{ rotate: 0, y: -5, boxShadow: "0 14px 26px rgba(0,0,0,0.16)" }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`relative p-3.5 md:p-4 shadow-sm ${COLOR_CLASSES[note.colorVariant]}`}
      style={paperTexture(note.id)}
    >
      {/* Washi tape */}
      {note.attachment === "washi" && (
        <div
          className={`absolute -top-2.5 ${WASHI_X[note.attachmentPos]} w-11 h-[18px] ${note.attachmentColor} -rotate-1 z-10 pointer-events-none`}
          style={WASHI_TEXTURE}
        />
      )}

      {/* Push pin — occasional alternative to tape, for variety */}
      {note.attachment === "pin" && (
        <div className={`absolute -top-3 ${PIN_X[note.attachmentPos]} z-10 pointer-events-none`}>
          <Pin
            className="w-4 h-4 drop-shadow-md"
            style={{ color: "#D97757", transform: "rotate(-25deg)" }}
            fill="#D97757"
            strokeWidth={1.5}
          />
        </div>
      )}

      {/* Folded paper corner */}
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: "0 0 13px 13px",
          borderColor: `transparent transparent ${CORNER_SHADE[note.colorVariant]} transparent`,
        }}
      />

      {/* Pending badge — kept in case a future admin-preview view ever
          passes pending notes into this component; the public board only
          ever receives approved notes from the API, so this never shows there. */}
      {note.pending && (
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 font-sans text-[9px] uppercase tracking-wide text-[#A09080] bg-[#F0E8D8] px-1.5 py-0.5 pointer-events-none">
          <motion.span
            className="w-1 h-1 rounded-full bg-[#D97757]"
            animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
          ditinjau
        </span>
      )}

      {/* Message — handwritten font */}
      <p className="font-hand text-[#2D2418] leading-snug text-[0.95rem] md:text-base mb-3 mt-1">
        {note.message}
      </p>

      {/* Author — body font for legibility */}
      <p className="font-sans text-[#8C7060] text-[10px] uppercase tracking-wider">
        — {note.name}
      </p>
    </motion.div>
  );
});

// Small hand-drawn flourish under the section heading — the one signature
// touch, kept quiet everywhere else. Skips the draw-on animation (just
// renders the finished line) when the visitor prefers reduced motion.
function HandDrawnUnderline({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 160 14" className="w-28 md:w-36 h-auto mt-1.5" aria-hidden="true">
      <motion.path
        d="M3 8.5C28 3 55 2 82 6C110 10 132 4 157 7"
        fill="none"
        stroke="#D97757"
        strokeWidth={3}
        strokeLinecap="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        whileInView={animate ? { pathLength: 1, opacity: 1 } : undefined}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeInOut", delay: 0.25 }}
      />
    </svg>
  );
}

// Tiny paper-scrap confetti burst on successful submit — themed as bits of
// washi/paper rather than generic dots, so it reads as part of the same
// board rather than a bolted-on effect. Rendered only once, briefly.
const CONFETTI_PIECES = [
  { x: -34, y: -18, rotate: -35, color: "#D97757" },
  { x: 30, y: -22, rotate: 18, color: "#B99B6B" },
  { x: -20, y: 18, rotate: 60, color: "#E7B896" },
  { x: 36, y: 14, rotate: -50, color: "#D97757" },
  { x: -8, y: -32, rotate: 10, color: "#C9B896" },
  { x: 12, y: -34, rotate: -12, color: "#E7B896" },
];

function SuccessConfetti() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-8 w-0 h-0">
      {CONFETTI_PIECES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block w-1.5 h-2.5 rounded-[1px]"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate }}
          transition={{ duration: 0.85, delay: i * 0.03, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// Stamp-style submit button
function StampButton({ disabled }: { disabled: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      whileHover={disabled ? undefined : { rotate: 0, scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.94, rotate: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="group self-start -rotate-[1.5deg] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <div className="border-2 border-[#D97757] p-0.5">
        <div className="border border-[#D97757]/45 px-5 py-2.5 bg-white group-hover:bg-[#FDF5F1] transition-colors">
          <span className="font-heading uppercase tracking-[0.16em] text-[#D97757] text-[0.7rem] md:text-xs">
            {disabled ? "Mengirim..." : "Tempel Catatanku"}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

// Paper-label "load more" button
function LoadMoreButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <div className="flex justify-center mt-6">
      <motion.button
        onClick={onClick}
        whileHover={{ rotate: 0, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="relative inline-block group"
      >
        {/* Washi tape at top of label */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#D97757]/25 z-10" />
        <div className="bg-[#FDFBF7] px-5 py-2.5 shadow border border-[#C4B89A]/50 rotate-1 group-hover:rotate-0 transition-transform duration-300">
          <span className="font-hand text-[#D97757] text-base md:text-lg">
            Lihat kenangan lainnya (+{count})
          </span>
        </div>
      </motion.button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DindingKenangan() {
  const prefersReducedMotion = !!useReducedMotion();

  // Kosong dulu saat render pertama (server & client match), lalu diisi
  // dari GET /api/notes setelah mount. Backend hanya pernah mengembalikan
  // catatan yang sudah disetujui, jadi tidak perlu filter pending di sini lagi.
  const [notes, setNotes] = useState<GuestNote[]>([]);
  const [notesLoaded, setNotesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/notes")
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setNotes(data.notes ?? []);
      })
      .catch(() => {
        // Biarkan papan tampil kosong kalau fetch gagal, daripada mematahkan halaman.
      })
      .finally(() => {
        if (!cancelled) setNotesLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [showAll, setShowAll] = useState(false);
  const [formName, setFormName] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const successTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sectionRef = useRef<HTMLElement>(null);
  const dummyHistoryPushed = useRef(false);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearTimeout(successTimer.current);
    };
  }, []);

  // Guard against a well-known Android Chrome / WebView quirk: dismissing
  // the on-screen keyboard — whether via its own back-chevron, the system
  // back button, or an edge swipe-back gesture — is sometimes reported to
  // the browser as a genuine "back" press. That actually navigates away
  // from the page instead of just closing the keyboard, which is exactly
  // the "gets kicked back out of this section" bug being reported.
  //
  // Fix: the first time someone focuses the message or name field, push one
  // harmless extra history entry (same URL). If an accidental "back" fires
  // while they're typing, it just consumes that dummy entry — they stay on
  // the same page, the keyboard finishes closing properly, and nothing they
  // typed is lost.
  //
  // IMPORTANT: the guard must re-arm itself. The previous version only ever
  // set `dummyHistoryPushed` back to false inside the popstate handler — so
  // if someone focused a field, typed, and tapped away normally (the common
  // case: no back-press ever fires), the flag stayed stuck at `true`
  // forever. The very next time they focused a field — even much later,
  // after scrolling away and back to this section — handleFocusIn saw the
  // flag already armed and silently skipped pushing a fresh entry, leaving
  // that second (and every later) visit to the form completely unprotected.
  // That's why the bug read as "fixed the first time, back after scrolling
  // back and trying again." handleFocusOut below re-arms the guard once
  // focus fully leaves the form, so every new session gets its own entry.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let blurCheckId: ReturnType<typeof setTimeout> | undefined;

    const isFieldElement = (el: EventTarget | null): el is HTMLElement =>
      el instanceof HTMLElement && (el.tagName === "TEXTAREA" || el.tagName === "INPUT");

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (!isFieldElement(target) || !section.contains(target)) return;
      if (blurCheckId) clearTimeout(blurCheckId);
      if (dummyHistoryPushed.current) return;

      window.history.pushState({ guestbookGuard: true }, "", window.location.href);
      dummyHistoryPushed.current = true;
    };

    const handleFocusOut = () => {
      // focusout fires before the next element's focusin, so defer the
      // check until the browser has settled on whatever's focused next.
      blurCheckId = setTimeout(() => {
        const active = document.activeElement;
        if (isFieldElement(active) && section.contains(active)) return; // moved between fields, same session
        // Focus left the form entirely with no back-press ever firing —
        // re-arm so the next focus-in gets its own fresh history entry.
        dummyHistoryPushed.current = false;
      }, 0);
    };

    const handlePopState = () => {
      if (!dummyHistoryPushed.current) return;
      dummyHistoryPushed.current = false;
      // The accidental "back" was absorbed by the dummy entry — finish
      // closing the keyboard properly instead of leaving anything focused.
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("popstate", handlePopState);
      if (blurCheckId) clearTimeout(blurCheckId);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const active = document.activeElement;

      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement
      ) {
        active.blur();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // `notes` sudah berupa hasil approved dari server, terbaru dulu — tidak
  // perlu filter/sort ulang di client.
  const approvedNotes = notes;
  const visibleNotes = showAll ? approvedNotes : approvedNotes.slice(0, INITIAL_SHOW);
  const extraCount = approvedNotes.length - INITIAL_SHOW;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, message: formMessage }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Gagal mengirim pesan, coba lagi.");
      }

      // Catatan tersimpan sebagai pending di server — BELUM tampil di papan
      // mana pun sampai disetujui lewat halaman admin. Cukup tampilkan
      // konfirmasi ke pengirim.
      setFormName("");
      setFormMessage("");
      setSubmitted(true);
      successTimer.current = setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengirim pesan, coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={sectionRef} className="relative py-16 md:py-24 bg-[#F6F0E6]">
      {/* Layer tekstur kertas kusut, sangat samar di atas background cream */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/Images/background.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.15,
          mixBlendMode: "multiply",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10 md:mb-14"
        >
          <p className="font-hand text-[#D97757] text-xl md:text-2xl mb-2">
            giliran kamu
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A202C] leading-tight">
            Dinding{" "}
            <span className="italic font-normal">Kenangan</span>
          </h2>
          <HandDrawnUnderline animate={!prefersReducedMotion} />
          <p className="font-sans text-[#718096] mt-3 text-base md:text-lg max-w-md">
            Bukan cuma kita yang simpan kenangan giliran kamu ikut nulis di sini.
          </p>
        </motion.div>

        {/* ── Cork board ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative rounded-sm p-5 md:p-7"
          style={{
            backgroundColor: "#D9C9AE",
            backgroundImage: [
              "radial-gradient(circle, rgba(150,118,72,0.5) 1px, transparent 1px)",
              "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15), transparent 55%)",
              "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.12), transparent 60%)",
            ].join(", "),
            backgroundSize: "9px 9px, 100% 100%, 100% 100%",
            boxShadow:
              "inset 0 3px 14px rgba(0,0,0,0.16), inset 0 0 0 1px rgba(0,0,0,0.08), 0 18px 40px -20px rgba(56,42,24,0.35)",
          }}
        >
          {/* Notes grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <AnimatePresence>
              {visibleNotes.map(note => (
                <NoteCard key={note.id} note={note} reduceMotion={prefersReducedMotion} />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state, hanya kalau sudah selesai fetch dan memang kosong */}
          {notesLoaded && approvedNotes.length === 0 && (
            <p className="font-hand text-[#8C7060] text-center py-6">
              Belum ada kenangan yang tampil — jadilah yang pertama menulis ✦
            </p>
          )}

          {/* Load more */}
          {!showAll && extraCount > 0 && (
            <LoadMoreButton count={extraCount} onClick={() => setShowAll(true)} />
          )}
        </motion.div>

        {/* Note count line */}
        <p className="font-hand text-[#A09080] text-sm text-right mt-3 mb-14 md:mb-20 pr-1">
          {approvedNotes.length} kenangan terkumpul
        </p>

        {/* ── Writing desk / form ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-lg mx-auto"
        >
          {/*
            NOTE: this card intentionally has NO `transform: rotate(...)` on it
            (an earlier version had a subtle -0.4deg tilt here). On iOS Safari
            and several Android WebViews, a focusable <input>/<textarea> nested
            inside a transformed ancestor breaks the browser's own "scroll the
            focused field into view" logic — when the on-screen keyboard opens
            or closes, it miscalculates and either locks scrolling or snaps the
            page straight back to this section. That matches the bug exactly,
            so the fix is to keep this container transform-free. Don't add a
            rotate/scale/etc. transform back onto this specific div even for
            visual polish — put any tilt on elements that don't wrap the
            actual <input>/<textarea> (the note cards, the buttons, etc. are
            all safe, since none of them are ancestors of a text field).
          */}
          <div className="relative bg-white shadow-md p-6 md:p-8">
            {/* Washi tape across top of form */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#D97757]/25 rotate-[1deg]" />

            <AnimatePresence mode="wait">
              {submitted ? (
                /* ── Success state ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="relative py-10 text-center flex flex-col items-center gap-3"
                >
                  {!prefersReducedMotion && <SuccessConfetti />}
                  <div className="w-12 h-12 bg-[#F6F0E6] flex items-center justify-center relative z-10">
                    <Check className="w-5 h-5 text-[#D97757]" strokeWidth={2.5} />
                  </div>
                  <p className="font-heading text-lg font-bold text-[#1A202C]">
                    Terima kasih! 🙏
                  </p>
                  <p className="font-sans text-[#718096] text-sm leading-relaxed text-center">
                    Pesan kamu akan ditampilkan di papan<br />
                    setelah direview tim MetaGenz.
                  </p>
                  <p className="font-hand text-[#C4B49A] text-base mt-1">
                    ✦ nantikan pesanmu muncul di papan ✦
                  </p>
                </motion.div>
              ) : (
                /* ── Write form ── */
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-5"
                >
                  {/* Desk heading */}
                  <div className="flex items-center gap-2 mb-1">
                    <PenLine className="w-4 h-4 text-[#B8A898]" strokeWidth={1.5} />
                    <span className="font-hand text-[#B8A898] text-lg tracking-wide">
                      tulis kenangan kamu di sini
                    </span>
                  </div>

                  {/* Message textarea — Caveat font, ruled-paper feel */}
                  <div className="relative">
                    <textarea
                      value={formMessage}
                      onChange={e => {
                        if (e.target.value.length <= MAX_CHARS) {
                          setFormMessage(e.target.value);
                        }
                      }}
                      placeholder="Cerita singkat kamu di MetaGenz..."
                      rows={4}
                      required
                      className="w-full bg-transparent font-hand text-[#2D2418] text-base md:text-lg placeholder:text-[#D4C8B8] border-0 border-b-2 border-[#EAE0D4] pb-2 resize-none focus:outline-none focus:border-b-[#D97757] transition-colors leading-relaxed"
                    />
                    {/* Character counter */}
                    <span
                      className={`absolute -bottom-5 right-0 font-sans text-[10px] transition-colors ${
                        formMessage.length >= MAX_CHARS * 0.85
                          ? "text-[#D97757]"
                          : "text-[#C4B49A]"
                      }`}
                    >
                      {formMessage.length} / {MAX_CHARS}
                    </span>
                  </div>

                  {/* Name input — text-base (16px) on mobile is deliberate:
                      below 16px, iOS Safari auto-zooms the whole page in when
                      this field gets focus, which is the other half of what
                      caused the "stuck after keyboard closes" bug. */}
                  <div className="pt-4">
                    <input
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="Nama kamu (kosongkan = Anonim)"
                      className="w-full bg-transparent font-sans text-base md:text-sm placeholder:text-[#C4B49A] border-0 border-b border-[#EAE0D4] pb-2 focus:outline-none focus:border-b-[#D97757] transition-colors"
                    />
                  </div>

                  {/* Submit row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
                    <StampButton disabled={!formMessage.trim() || isSubmitting} />
                    {/* Moderation notice / error */}
                    {submitError ? (
                      <p className="font-sans text-[#C0392B] text-[11px] leading-snug">
                        {submitError}
                      </p>
                    ) : (
                      <p className="font-sans text-[#BFB0A0] text-[11px] leading-snug">
                        Pesanmu akan tampil setelah<br className="hidden sm:block" />
                        direview tim MetaGenz.
                      </p>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  );
}