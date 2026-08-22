"use client";

import { useEffect, useState } from "react";
import {
  LANDING_SPEAKER,
  type DemoUtterance,
  type LandingSpeaker,
} from "@/types/landing";

const script: DemoUtterance[] = [
  {
    speaker: LANDING_SPEAKER.CALLER,
    text: "Τι ώρα ανοίγετε αύριο;",
  },
  {
    speaker: LANDING_SPEAKER.AGENT,
    text: "Ανοίγουμε 09:00 έως 17:00. Θέλετε να σας μεταφέρω στη ρεσεψιόν;",
  },
];

const barHeights = [28, 52, 36, 64, 44, 72, 40, 58, 32, 68, 48, 60];

export function ListenDemo() {
  const [playing, setPlaying] = useState(false);
  const [speaker, setSpeaker] = useState<LandingSpeaker | null>(null);

  useEffect(() => {
    window.speechSynthesis.getVoices();
    const onVoices = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  function stop() {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setSpeaker(null);
  }

  function play() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setPlaying(true);

    const voices = window.speechSynthesis.getVoices();
    const greekVoice =
      voices.find((voice) => voice.lang.toLowerCase().startsWith("el")) ?? null;

    let index = 0;

    const speakNext = () => {
      const line = script[index];
      if (!line) {
        setPlaying(false);
        setSpeaker(null);
        return;
      }

      setSpeaker(line.speaker);
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = "el-GR";
      utterance.rate = line.speaker === LANDING_SPEAKER.CALLER ? 1 : 0.95;
      if (greekVoice) utterance.voice = greekVoice;
      utterance.onend = () => {
        index += 1;
        speakNext();
      };
      utterance.onerror = () => {
        setPlaying(false);
        setSpeaker(null);
      };
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
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

      <p className="mt-3 text-sm text-[var(--muted)]">
        {playing ? `${speakerLabel} μιλάει` : "Άκου ένα πραγματικό σενάριο κλήσης"}
      </p>

      <button
        type="button"
        onClick={playing ? stop : play}
        className="btn-primary mt-4 px-5 py-3"
      >
        {playing ? "Στοπ" : "Άκου την κλήση"}
      </button>

      <p className="mt-4 text-xs text-[var(--muted)]">
        Αν χρειαστεί, μεταφορά στον Νίκο · Reception
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
