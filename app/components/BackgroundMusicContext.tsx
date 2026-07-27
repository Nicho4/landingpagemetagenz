"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

// Ganti path/volume ini kalau file musiknya beda lokasi/nama, atau kamu
// mau volume default yang lain. Taruh file musiknya di public/audio
// (sesuai path di bawah).
const AUDIO_CONFIG = {
  src: "/audio/kau123.mp3",
  volume: 0.5,
};

interface BackgroundMusicContextValue {
  isPlaying: boolean;
  toggle: () => void;
  duck: () => void;
  unduck: () => void;
}

const BackgroundMusicContext = createContext<BackgroundMusicContextValue | null>(null);

export function BackgroundMusicProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Halaman admin nggak boleh ada musik latar sama sekali. Sesuaikan
  // prefix ini kalau ternyata route panel admin kamu bukan "/admin".
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isPlayingRef = useRef(false);
  const wasPlayingBeforeDuckRef = useRef(false);
  const duckCountRef = useRef(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = AUDIO_CONFIG.volume;
    }
  }, []);

  const play = useCallback(() => {
    // Guard ini yang paling penting: siapapun/apapun yang manggil play()
    // (klik manual toggle, autoplay-di-interaksi-pertama, atau unduck
    // sehabis video kelar) tetap nggak akan nyalain musik selama masih
    // di route admin.
    if (isAdminRoute) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [isAdminRoute]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const duck = useCallback(() => {
    duckCountRef.current += 1;
    if (duckCountRef.current === 1) {
      wasPlayingBeforeDuckRef.current = isPlayingRef.current;
      if (isPlayingRef.current) pause();
    }
  }, [pause]);

  const unduck = useCallback(() => {
    duckCountRef.current = Math.max(0, duckCountRef.current - 1);
    if (duckCountRef.current === 0 && wasPlayingBeforeDuckRef.current) {
      play();
    }
  }, [play]);

  // Begitu route berubah jadi admin (termasuk pindah lewat <Link>, bukan
  // cuma hard reload), musik yang kebetulan lagi nyala langsung di-pause.
  useEffect(() => {
    if (isAdminRoute) pause();
  }, [isAdminRoute, pause]);

  useEffect(() => {
    const audio = audioRef.current;
    // Di halaman admin, listener "mulai di interaksi pertama" ini sama
    // sekali nggak dipasang — jadi klik/scroll/keydown apapun di admin
    // nggak akan pernah memicu musik nyala sendiri.
    if (!audio || isAdminRoute) return;

    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "scroll"];

    const tryStartOnFirstInteraction = (event: Event) => {
      if ((event.target as HTMLElement | null)?.closest?.("[data-music-toggle]")) {
        return;
      }

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          events.forEach((e) => window.removeEventListener(e, tryStartOnFirstInteraction));
        })
        .catch(() => {
          setIsPlaying(false);
        });
    };

    events.forEach((e) => window.addEventListener(e, tryStartOnFirstInteraction));
    return () => {
      events.forEach((e) => window.removeEventListener(e, tryStartOnFirstInteraction));
    };
  }, [isAdminRoute]);

  return (
    <BackgroundMusicContext.Provider value={{ isPlaying, toggle, duck, unduck }}>
      <audio ref={audioRef} src={AUDIO_CONFIG.src} loop preload="none" />
      {children}
    </BackgroundMusicContext.Provider>
  );
}

export function useBackgroundMusic() {
  const ctx = useContext(BackgroundMusicContext);
  if (!ctx) {
    throw new Error("useBackgroundMusic harus dipakai di dalam BackgroundMusicProvider");
  }
  return ctx;
}