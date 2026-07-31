export type {
  Call,
  CallEvent,
  CallStatus,
  Database,
  Document,
  DocumentChunk,
  DocumentStatus,
  Employee,
  Membership,
  Organization,
  OrgRole,
} from "./types.js";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function chunkText(
  text: string,
  chunkSize = 1200,
  overlap = 200,
): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    chunks.push(normalized.slice(start, end).trim());
    if (end >= normalized.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks.filter(Boolean);
}
