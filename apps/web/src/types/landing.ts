export type LandingCallStatus = "in_progress" | "completed" | "transferred";

export const LANDING_CALL_STATUS = {
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  TRANSFERRED: "transferred",
} as const;

export type LandingSpeaker = "caller" | "agent";

export const LANDING_SPEAKER = {
  CALLER: "caller",
  AGENT: "agent",
} as const;

export interface LandingProof {
  label: string;
  detail: string;
}

export interface LandingStat {
  label: string;
  value: string;
}

export interface LandingCallRow {
  id: string;
  fromNumber: string;
  toNumber: string;
  startedAt: string;
  summary: string;
  status: LandingCallStatus;
}

export interface DemoUtterance {
  speaker: LandingSpeaker;
  text: string;
  src: string;
}
