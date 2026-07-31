"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Organization } from "@call-agent/db";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";

export function OrgSettingsForm({ org }: { org: Organization }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: org.name,
    twilio_phone_number: org.twilio_phone_number ?? "",
    greeting: org.greeting,
    system_prompt: org.system_prompt,
    transfer_policy: org.transfer_policy,
    timezone: org.timezone,
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await fetch(`/api/orgs/${org.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        twilio_phone_number: form.twilio_phone_number || null,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(body.error ?? "Save failed");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <Label>Όνομα οργανισμού</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Twilio phone number (E.164)</Label>
          <Input
            placeholder="+1..."
            value={form.twilio_phone_number}
            onChange={(e) =>
              setForm((f) => ({ ...f, twilio_phone_number: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Timezone</Label>
          <Input
            value={form.timezone}
            onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
          />
        </div>
        <div>
          <Label>Greeting</Label>
          <Textarea
            rows={2}
            value={form.greeting}
            onChange={(e) => setForm((f) => ({ ...f, greeting: e.target.value }))}
          />
        </div>
        <div>
          <Label>System prompt</Label>
          <Textarea
            rows={6}
            value={form.system_prompt}
            onChange={(e) =>
              setForm((f) => ({ ...f, system_prompt: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Transfer policy</Label>
          <Textarea
            rows={3}
            value={form.transfer_policy}
            onChange={(e) =>
              setForm((f) => ({ ...f, transfer_policy: e.target.value }))
            }
          />
        </div>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        {saved ? <p className="text-sm text-[var(--ok)]">Αποθηκεύτηκε.</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Αποθήκευση..." : "Αποθήκευση ρυθμίσεων"}
        </Button>
      </form>
    </Card>
  );
}
