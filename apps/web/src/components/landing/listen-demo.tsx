"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEMO_CALL_SCRIPT,
  DEMO_CALL_TURN_GAP_MS,
} from "@/lib/demo-call";
import {
  LANDING_SPEAKER,
  type LandingSpeaker,
} from "@/types/landing";

const barHeights = [28, 52, 36, 64, 44, 72, 40, 58, 32, 68, 48, 60];

export function ListenDemo() {
  const [playing, setPlaying] = useState(false);
  const [speaker, setSpeaker] = useState<LandingSpeaker | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gapTimerRef = useRef<number | null>(null);
  const playIdRef = useRef(0);

  useEffect(() => {
    const preloads = DEMO_CALL_SCRIPT.map((line) => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = line.src;
      return audio;
    });

    return () => {
      playIdRef.current += 1;
      if (gapTimerRef.current !== null) {
        window.clearTimeout(gapTimerRef.current);
      }
      audioRef.current?.pause();
      for (const audio of preloads) {
        audio.removeAttribute("src");
      }
    };
  }, []);

  function clearGap() {
    if (gapTimerRef.current !== null) {
      window.clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
  }

  function stopPlayback() {
    playIdRef.current += 1;
    clearGap();
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.currentTime = 0;
    }
    audioRef.current = null;
    setPlaying(false);
    setSpeaker(null);
  }

  function playLine(index: number, playId: number) {
    const line = DEMO_CALL_SCRIPT[index];
    if (!line || playIdRef.current !== playId) {
      if (playIdRef.current === playId) {
        setPlaying(false);
        setSpeaker(null);
      }
      return;
    }

    setSpeaker(line.speaker);
    const audio = new Audio(line.src);
    audio.preload = "auto";
    audioRef.current = audio;

    audio.onended = () => {
      if (playIdRef.current !== playId) return;
      const next = index + 1;
      if (!DEMO_CALL_SCRIPT[next]) {
        stopPlayback();
        return;
      }
      gapTimerRef.current = window.setTimeout(() => {
        if (playIdRef.current !== playId) return;
        playLine(next, playId);
      }, DEMO_CALL_TURN_GAP_MS);
    };

    audio.onerror = () => {
      if (playIdRef.current !== playId) return;
      stopPlayback();
    };

    void audio.play().catch(() => {
      if (playIdRef.current === playId) stopPlayback();
    });
  }

  function play() {
    stopPlayback();
    const playId = playIdRef.current + 1;
    playIdRef.current = playId;
    setPlaying(true);
    playLine(0, playId);
  }

  const speakerLabel =
    speaker === LANDING_SPEAKER.CALLER
      ? "Καλών"
      : speaker === LANDING_SPEAKER.AGENT
        ? "Πράκτορας"
        : "Σε αναμονή";

  return (
    <article
      aria-label="Παράδειγμα τηλεφωνικής γραμμής"
      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            Εισερχόμενη γραμμή
          </p>
          <p className="mt-1 font-mono text-sm font-medium">+30 210 123 4567</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ok-soft)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--ok)]">
          <span className="size-1.5 rounded-full bg-[var(--ok)]" aria-hidden="true" />
          Live
        </span>
      </header>

      <WaveformBars active={playing} />

      <p className="mt-3 text-sm text-[var(--muted)]" aria-live="polite">
        {playing ? `${speakerLabel} μιλάει` : "Άκου ένα πραγματικό σενάριο κλήσης"}
      </p>

      <button
        type="button"
        onClick={playing ? stopPlayback : play}
        className="btn-primary mt-4 px-5 py-3"
      >
        {playing ? "Στοπ" : "Άκου την κλήση"}
      </button>

      <p className="mt-4 text-xs text-[var(--muted)]">
        Αν χρειαστεί, μεταφορά στη γραμματεία · Ιατρείο
      </p>
    </article>
  );
}

function WaveformBars({ active }: { active: boolean }) {
  return (
    <div
      className="mt-6 flex h-16 items-end gap-1.5"
      aria-hidden="true"
    >
      {barHeights.map((height, index) => (
        <span
          key={`bar-${index}`}
          className={`w-full max-w-2 rounded-full bg-[var(--brand)] ${
            active ? "landing-wave" : "opacity-40"
          }`}
          style={{
            height: `${height}%`,
            animationDelay: `${index * 70}ms`,
          }}
        />
      ))}
    </div>
  );
}
