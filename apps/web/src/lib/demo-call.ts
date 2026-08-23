import { LANDING_SPEAKER, type DemoUtterance } from "@/types/landing";

export const DEMO_CALL_SCRIPT: DemoUtterance[] = [
  {
    speaker: LANDING_SPEAKER.CALLER,
    text: "Γεια σας... μια ερώτηση μόνο. Τι ώρα ανοίγει το ιατρείο αύριο;",
    src: "/demo/caller-1.mp3",
  },
  {
    speaker: LANDING_SPEAKER.AGENT,
    text: "Καλημέρα σας. Αύριο το ιατρείο είναι ανοιχτό από τις εννιά το πρωί, μέχρι τις πέντε το απόγευμα.",
    src: "/demo/agent-1.mp3",
  },
  {
    speaker: LANDING_SPEAKER.CALLER,
    text: "Ωραία, ευχαριστώ. Μπορείτε να με περάσετε στη γραμματεία;",
    src: "/demo/caller-2.mp3",
  },
  {
    speaker: LANDING_SPEAKER.AGENT,
    text: "Βεβαίως. Σας μεταφέρω τώρα στη γραμματεία.",
    src: "/demo/agent-2.mp3",
  },
];

export const DEMO_CALL_TURN_GAP_MS = 420;
