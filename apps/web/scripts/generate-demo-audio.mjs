import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "demo");

const callerStyle = [
  "Affect: A Greek woman in her early thirties, calling a medical clinic from her mobile.",
  "Tone: Casual, polite, a little hurried — a real customer, not an announcer.",
  "Pacing: Natural spoken Greek with a short breath before the question.",
  "Pronunciation: Native modern Greek. Conversational. Never sound like you are reading a script.",
].join(" ");

const agentStyle = [
  "Affect: A warm, composed Greek clinic assistant answering the phone at a doctor's office.",
  "Tone: Friendly, clear, helpful, with a slight smile. Professional but human.",
  "Pacing: Unhurried telephone diction. Small pause after the greeting.",
  "Pronunciation: Native modern Greek. Speak times as words, never as digits.",
].join(" ");

const lines = [
  {
    file: "caller-1.mp3",
    voice: "coral",
    speed: 1.02,
    instructions: callerStyle,
    input: "Γεια σας... μια ερώτηση μόνο. Τι ώρα ανοίγει το ιατρείο αύριο;",
  },
  {
    file: "agent-1.mp3",
    voice: "marin",
    speed: 0.96,
    instructions: agentStyle,
    input:
      "Καλημέρα σας. Αύριο το ιατρείο είναι ανοιχτό από τις εννιά το πρωί, μέχρι τις πέντε το απόγευμα.",
  },
  {
    file: "caller-2.mp3",
    voice: "coral",
    speed: 1.02,
    instructions: callerStyle,
    input: "Ωραία, ευχαριστώ. Μπορείτε να με περάσετε στη γραμματεία;",
  },
  {
    file: "agent-2.mp3",
    voice: "marin",
    speed: 0.96,
    instructions: agentStyle,
    input: "Βεβαίως. Σας μεταφέρω τώρα στη γραμματεία.",
  },
];

const openai = new OpenAI();

await mkdir(outDir, { recursive: true });

for (const line of lines) {
  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: line.voice,
    input: line.input,
    instructions: line.instructions,
    response_format: "mp3",
    speed: line.speed,
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(outDir, line.file), buffer);
  console.log(`wrote ${line.file} (${buffer.length} bytes)`);
}
