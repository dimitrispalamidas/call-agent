"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Document } from "@call-agent/db";
import { Badge, Button, Card, Input, Label } from "@/components/ui";

function statusTone(status: Document["status"]) {
  switch (status) {
    case "ready":
      return "ok" as const;
    case "failed":
      return "danger" as const;
    case "processing":
    case "pending":
      return "warn" as const;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function KnowledgePanel({
  orgId,
  documents,
}: {
  orgId: string;
  documents: Document[];
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);

    const form = new FormData();
    form.set("file", file);
    form.set("title", title || file.name);

    const res = await fetch(`/api/orgs/${orgId}/documents`, {
      method: "POST",
      body: form,
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(body.error ?? "Upload failed");
      return;
    }

    setFile(null);
    setTitle("");
    router.refresh();
  }

  async function onDelete(documentId: string) {
    const res = await fetch(`/api/orgs/${orgId}/documents/${documentId}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2
          className="text-xl"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Ανέβασμα εγγράφου
        </h2>
        <form className="mt-4 space-y-3" onSubmit={onUpload}>
          <div>
            <Label>Τίτλος</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="FAQ, πολιτικές, ώρες λειτουργίας..."
            />
          </div>
          <div>
            <Label>Αρχείο (PDF, TXT, MD)</Label>
            <Input
              type="file"
              accept=".pdf,.txt,.md,text/plain,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>
          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
          <Button type="submit" disabled={loading || !file}>
            {loading ? "Επεξεργασία..." : "Ανέβασμα & indexing"}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-medium">Έγγραφα</h2>
        <div className="mt-4 space-y-3">
          {documents.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Δεν υπάρχουν έγγραφα ακόμα.</p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-3"
              >
                <div>
                  <div className="font-medium">{doc.title}</div>
                  {doc.error_message ? (
                    <div className="text-xs text-[var(--danger)]">
                      {doc.error_message}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(doc.status)}>{doc.status}</Badge>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onDelete(doc.id)}
                  >
                    Διαγραφή
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
