export type CallMessageRole = "caller" | "agent" | "system";

export interface CallPreviewMessage {
  id: string;
  role: CallMessageRole;
  text: string;
}

export interface LandingProof {
  label: string;
  detail: string;
}
