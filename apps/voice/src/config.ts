import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), "../../.env") });
loadEnv({ path: resolve(process.cwd(), "../../.env.local") });
loadEnv();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.VOICE_PORT ?? 3001),
  openaiApiKey: () => required("OPENAI_API_KEY"),
  appUrl: () => required("NEXT_PUBLIC_APP_URL"),
  internalSecret: () => required("INTERNAL_API_SECRET"),
  realtimeModel: process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime",
};
