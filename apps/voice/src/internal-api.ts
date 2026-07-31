import { config } from "./config.js";

async function internalFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${config.appUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": config.internalSecret(),
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error ?? `Internal API error ${res.status}`);
  }
  return body;
}

export type OrgPayload = {
  id: string;
  name: string;
  system_prompt: string;
  greeting: string;
  transfer_policy: string;
  twilio_phone_number: string | null;
};

export async function getOrg(orgId: string): Promise<OrgPayload> {
  const body = await internalFetch(`/api/internal/orgs/${orgId}`);
  if (!body.organization) throw new Error("Organization not found");
  return body.organization;
}

export async function searchKb(orgId: string, query: string) {
  const body = await internalFetch("/api/internal/search", {
    method: "POST",
    body: JSON.stringify({ orgId, query, matchCount: 5 }),
  });
  return (body.results ?? []) as Array<{ content: string; similarity: number }>;
}

export async function transferToHuman(orgId: string, callSid: string, reason: string) {
  return internalFetch("/api/internal/transfer", {
    method: "POST",
    body: JSON.stringify({ orgId, callSid, reason }),
  }) as Promise<{
    transferred: boolean;
    reason?: string;
    employee?: { id: string; name: string; phone_e164: string };
  }>;
}

export async function logCallEvent(
  callSid: string,
  type: string,
  payload: Record<string, unknown>,
) {
  await internalFetch("/api/internal/calls", {
    method: "POST",
    body: JSON.stringify({ action: "event", callSid, type, payload }),
  });
}

export async function completeCall(
  callSid: string,
  status: string,
  transcriptSummary?: string,
) {
  await internalFetch("/api/internal/calls", {
    method: "POST",
    body: JSON.stringify({
      action: "complete",
      callSid,
      status,
      transcript_summary: transcriptSummary,
    }),
  });
}
