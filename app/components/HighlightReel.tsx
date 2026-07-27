"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play, Camera, X } from "lucide-react";
import Image from "next/image";
import { useBackgroundMusic } from "./BackgroundMusicContext";

// ─────────────────────────────────────────────────────────────────────────
// EVERYTHING YOU'D WANT TO UPDATE LIVES HERE.
// ─────────────────────────────────────────────────────────────────────────
const CONFIG = {
  // Paste the ID from the YouTube URL — e.g. from
  // youtube.com/shorts/AlAu4V52KzE or youtube.com/watch?v=AlAu4V52KzE
  // Upload as UNLISTED (Studio → Visibility: Unlisted) so it's not searchable
  // but still playable here — YouTube's CDN carries the bandwidth, free.
  // IMPORTANT: also check Studio → Details → "Show more" → Advanced settings
  // → "Allow embedding" is turned ON. If it's off, the embed silently fails
  // for everyone (this is a very common cause of "works for me, not for my
  // friend" reports).
  youtubeId: "AlAu4V52KzE",

  // Leave empty to auto-use YouTube's own thumbnail for youtubeId above.
  customThumbnail: "",

  // Section header
  eyebrow: "Rewind: Youth Camp 2026",
  titleMain: "Highlight",
  titleItalic: "Reel",
  subtitle: "Satu menit dari ribuan momen yang nggak bisa dilupakan.",

  // Film-strip label under the frame
  filmLabel: "Youth Camp 2026 · GBC MetaGenz",
  duration: "▸ 00:47",

  // Call-to-action button shown before playing
  ctaText: "Tonton reel highlight-nya di sini",

  // Small floating "photo strip" around the frame — now shown on every
  // screen size (sized down on mobile so they don't crowd the frame).
  // tapeColor cycles the little washi-tape corner so the props read as
  // part of the same pinned-photo family used elsewhere on the page.
  polaroids: [
    {
      src: "/Images/footer.webp",
      caption: "God",
      className: "-left-6 sm:-left-10 md:-left-14 lg:-left-20 top-2 sm:top-4 -rotate-[9deg]",
      delay: 0,
      tapeColor: "#D97757",
    },
    {
      src: "/Images/aboutus1.webp",
      caption: "Bless",
      className: "-right-4 sm:-right-8 md:-right-12 lg:-right-16 top-1/3 rotate-[7deg]",
      delay: 0.6,
      tapeColor: "#A09080",
    },
    {
      src: "/Images/whatwedo3.webp",
      caption: "You",
      className: "-left-4 sm:-left-6 md:-left-9 lg:-left-12 bottom-0 rotate-[5deg]",
      delay: 1.2,
      tapeColor: "#D97757",
    },
  ],
};

// Derived — no need to touch these directly.
const THUMBNAIL =
  CONFIG.customThumbnail ||
  (CONFIG.youtubeId ? `https://img.youtube.com/vi/${CONFIG.youtubeId}/maxresdefault.jpg` : "");
const THUMBNAIL_FALLBACK = CONFIG.youtubeId
  ? `https://img.youtube.com/vi/${CONFIG.youtubeId}/hqdefault.jpg`
  : "";
const WATCH_URL = CONFIG.youtubeId ? `https://youtu.be/${CONFIG.youtubeId}` : "";

// Any element that sits directly in the touch path of the video frame gets
// this. Without it, a swipe that *starts* on the thumbnail/button/iframe can
// get claimed as a horizontal-or-undecided gesture by the browser (and, once
// the iframe is live, by YouTube's own embedded player, which listens for
// touch to drive its scrub/seek UI). touch-action: pan-y is the standard fix:
// it tells the browser "vertical scrolling is always allowed to start here,"
// so a down-swipe over the video reliably scrolls the page instead of
// getting stuck or jumping once the finger lifts. Kept as an inline style
// (rather than only a Tailwind class) so it applies regardless of which
// Tailwind version/config is in the project.
const PAN_Y = { touchAction: "pan-y" as const };
// ─────────────────────────────────────────────────────────────────────────

export function HighlightReel() {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { duck, unduck } = useBackgroundMusic();

  // NOTE: no mute=1 here. Because this iframe is only created *after* the
  // person taps our own Play button (a real, direct user gesture), mobile
  // browsers reliably allow it to autoplay with sound. Starting muted was
  // what caused the "can't adjust volume" reports — the YouTube mobile
  // player has no on-screen volume slider, only a small mute/unmute icon,
  // so people had no obvious way to turn sound back on. Not muting it in
  // the first place removes that dead end entirely.
  const buildSrc = () =>
    CONFIG.youtubeId
      ? `https://www.youtube.com/embed/${CONFIG.youtubeId}?autoplay=1&loop=1&playlist=${CONFIG.youtubeId}&controls=1&modestbranding=1&playsinline=1&rel=0`
      : null;

  // Musik latar "minggir" begitu reel mulai diputer, biar dua sumber suara
  // nggak numpuk bareng.
  const handlePlay = () => {
    setPlaying(true);
    duck();
  };

  // Dua jalan buat nyampe ke sini: tombol close manual (di bawah), atau
  // auto-detect scroll-away (lihat useEffect IntersectionObserver di
  // bawah). Keduanya sama-sama unmount iframe-nya (lewat setPlaying(false))
  // yang otomatis MEMATIKAN video YouTube-nya juga (bukan cuma
  // nyembunyikan) — begitu elemen iframe dilepas dari DOM, konteks
  // browsing di dalamnya ikut dihancurkan, jadi audionya beneran berhenti,
  // bukan lanjut muter diam-diam di background.
  const handleStop = () => {
    setPlaying(false);
    unduck();
  };

  // Auto-detect "selesai nonton" versi pasif: kalau section reel ini
  // di-scroll keluar layar SEMENTARA video masih dianggap "terbuka" (orang
  // lupa/malas mencet tombol close, cuma lanjut scroll ke bawah), anggap
  // aja itu tanda selesai — video di-stop otomatis dan musik latar
  // dinyalain lagi. Tanpa ini, orang yang nggak nutup videonya secara
  // manual bakal lanjut browsing sisa halaman tanpa backsound sama sekali,
  // padahal reel-nya udah nggak keliatan lagi.
  //
  // Observer ini CUMA dipasang selama `playing` true (lihat dependency di
  // bawah) — begitu video berhenti (lewat cara apapun), observer-nya
  // otomatis lepas sendiri, jadi nggak ada listener nganggur pas nggak
  // dibutuhin.
  useEffect(() => {
    if (!playing) return;
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setPlaying(false);
          unduck();
        }
      },
      { threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [playing, unduck]);

  const videoSrc = playing ? buildSrc() : null;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 bg-[#F6F0E6] overflow-hidden"
    >
      {/* Local keyframes for the floating polaroids / ambient pulse — plain
          CSS so this runs on the compositor instead of via JS every frame. */}
      <style>{`
        @keyframes reelFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* One small light-leak glow — kept subtle, no blend mode so the
          browser doesn't have to recomposite the whole section on every paint. */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 -right-1/5 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(217,119,87,0.25),transparent_70%)] blur-2xl" />
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="grid md:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Left column — header, CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                {!prefersReducedMotion && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D97757] opacity-75" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D97757]" />
              </span>
              <p className="font-hand text-[#D97757] text-xl md:text-2xl">{CONFIG.eyebrow}</p>
            </div>

            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A202C] leading-tight">
              {CONFIG.titleMain}{" "}
              <span className="relative inline-block italic font-normal">
                {CONFIG.titleItalic}
                <motion.svg
                  aria-hidden
                  viewBox="0 0 160 14"
                  className="absolute left-0 -bottom-2 w-full h-3 text-[#D97757]"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                >
                  <motion.path
                    d="M2 9 C 30 2, 60 12, 80 6 S 130 2, 158 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </span>
            </h2>

            <p className="font-sans text-[#718096] mt-5 text-base md:text-lg max-w-md">
              {CONFIG.subtitle}
            </p>

            <div className="mt-8">
              <button
                onClick={handlePlay}
                className="inline-flex items-center gap-2 bg-[#1A202C] text-[#F6F0E6] font-sans text-sm font-medium tracking-wide px-5 py-3 rounded-full hover:bg-[#2A211A] transition-colors shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                {CONFIG.ctaText}
              </button>

              {/* Escape hatch: some campus / office networks and ad-blockers
                  quietly block YouTube's embed player even when youtube.com
                  itself loads fine. This link always works because it opens
                  the normal watch page instead of the embedded iframe. */}
              {WATCH_URL && (
                <a
                  href={WATCH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block font-sans text-xs text-[#8C7060] underline underline-offset-2 hover:text-[#D97757] transition-colors"
                >
                  Video tidak mau muncul? Tonton langsung di YouTube ↗
                </a>
              )}
            </div>
          </motion.div>

          {/* Right column — the framed reel, with floating photo props around it */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
          >
            {/* Floating polaroid props — visible on every screen size now,
                sized down on mobile. Float loop is plain CSS (see <style> above),
                so it costs nothing on the JS thread even with 3 of them on screen.
                pointer-events-none because these are pure decoration: nothing on
                them is interactive, and it keeps them out of the touch/hit-testing
                surface entirely. */}
            {CONFIG.polaroids.map((p, i) => (
              <div
                key={i}
                aria-hidden
                className={`absolute w-16 sm:w-20 md:w-24 lg:w-28 bg-white p-1.5 sm:p-2 pb-3 sm:pb-4 rounded-sm shadow-xl z-0 pointer-events-none ${p.className} ${
                  prefersReducedMotion ? "" : "animate-[reelFloat_4.5s_ease-in-out_infinite]"
                }`}
                style={prefersReducedMotion ? undefined : { animationDelay: `${p.delay}s` }}
              >
                {/* tiny washi-tape corner, ties these props to the pinned-note
                    photos used in the rest of the page */}
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-2.5 -rotate-3"
                  style={{
                    background: `linear-gradient(135deg, ${p.tapeColor}88, ${p.tapeColor}44)`,
                    boxShadow: "0 1px 2px rgba(26,32,44,0.15)",
                  }}
                />
                <div className="relative w-full h-14 sm:h-16 md:h-20 rounded-[1px] overflow-hidden">
                  <Image
                    src={p.src}
                    alt={p.caption}
                    fill
                    sizes="112px"
                    className="object-cover rounded-[1px]"
                  />
                </div>
                <p className="font-hand text-[#8C7060] text-[10px] sm:text-xs mt-1 text-center">{p.caption}</p>
              </div>
            ))}

            {/* Ambient glow — plain CSS pulse, no JS-driven animation */}
            {!prefersReducedMotion && (
              <div
                aria-hidden
                className="absolute -inset-6 md:-inset-10 rounded-[2.5rem] bg-[radial-gradient(closest-side,rgba(217,119,87,0.3),transparent)] blur-lg -z-10 animate-pulse pointer-events-none"
              />
            )}

            {/* Outer frame — worn paper/cardboard feel. Hover lift is a plain
                CSS transition now instead of an animated box-shadow.
                touch-pan-y (see PAN_Y above) keeps vertical swipe-to-scroll
                working over the whole frame, including on mobile. */}
            <div
              className="relative z-10 bg-[#2A211A] p-3 md:p-4 shadow-2xl transition-transform duration-300 hover:-translate-y-1"
              style={PAN_Y}
            >
              {/* Film grain — filter global "paper-grain-light", didefinisikan
                  sekali di page.tsx (versi terang buat di atas frame gelap
                  kayak ini), dipakai bareng-bareng sama Connect.tsx dan
                  Testimonials.tsx yang pakai versi gelapnya. Sits behind the
                  sprockets/video/label since it has no z-index of its own
                  (auto stacks below explicit z-index siblings) — visible on
                  the frame's surface, never over content. */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{ filter: "url(#paper-grain-light)" }}
              />

              {/* Sprocket holes — left (plain CSS pulse, no per-element JS animation) */}
              <div className="absolute -left-5 top-0 bottom-0 w-4 flex flex-col justify-around py-2 pointer-events-none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 bg-[#1A120D] border border-[#3A2D25] rounded-sm mx-auto ${
                      prefersReducedMotion ? "" : "animate-pulse"
                    }`}
                    style={prefersReducedMotion ? undefined : { animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              {/* Sprocket holes — right */}
              <div className="absolute -right-5 top-0 bottom-0 w-4 flex flex-col justify-around py-2 pointer-events-none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 bg-[#1A120D] border border-[#3A2D25] rounded-sm mx-auto ${
                      prefersReducedMotion ? "" : "animate-pulse"
                    }`}
                    style={prefersReducedMotion ? undefined : { animationDelay: `${1.2 + i * 0.15}s` }}
                  />
                ))}
              </div>

              {/* Video area — portrait, reel-shaped. touch-pan-y here is the
                  main fix for the mobile swipe bug: it applies to the thumbnail
                  button *and* to the iframe once it mounts, so a down-swipe that
                  starts anywhere on the video reliably scrolls the page instead
                  of being swallowed by the embedded YouTube player. */}
              <div
                className="relative overflow-hidden aspect-[9/16] bg-black"
                style={PAN_Y}
              >

                {playing && videoSrc ? (
                  <>
                    <iframe
                      ref={iframeRef}
                      src={videoSrc}
                      title="MetaGenz Highlight Reel"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                      style={PAN_Y}
                    />
                    {/* Tombol berhenti manual — cara paling eksplisit buat
                        bilang "selesai nonton", jadi musik latar nggak
                        nunggu sampai orang scroll keluar section ini dulu
                        (lihat IntersectionObserver di atas buat jalan
                        satunya). */}
                    <button
                      onClick={handleStop}
                      aria-label="Berhenti nonton reel"
                      style={PAN_Y}
                      className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/85 hover:bg-black/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97757]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[#1A120D]">
                    {THUMBNAIL && (
                      <img
                        src={THUMBNAIL}
                        alt="Highlight reel thumbnail"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (THUMBNAIL_FALLBACK && img.src !== THUMBNAIL_FALLBACK) {
                            img.src = THUMBNAIL_FALLBACK;
                          }
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
                    {videoSrc || CONFIG.youtubeId ? (
                      <button
                        onClick={handlePlay}
                        className="absolute inset-0 flex items-center justify-center group"
                        style={PAN_Y}
                        aria-label="Putar highlight reel"
                      >
                        <span className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20">
                          {!prefersReducedMotion && (
                            <span className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" />
                          )}
                          <span className="relative w-full h-full bg-white/25 border border-white/40 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-white ml-1" />
                          </span>
                        </span>
                      </button>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="font-hand text-white/70 text-lg md:text-xl text-center px-4">
                          Video coming soon ✦
                        </p>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 rounded-full px-3 py-1.5">
                      <Camera className="w-3.5 h-3.5 text-white/90" />
                      <span className="font-sans text-[11px] text-white/90 tracking-wide">Reel</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Film strip bottom label */}
              <div className="relative mt-2.5 flex items-center justify-between px-1">
                <p className="font-hand text-[#8C7060] text-sm md:text-base">{CONFIG.filmLabel}</p>
                <p className="font-hand text-[#6A5548] text-sm hidden md:block">{CONFIG.duration}</p>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}