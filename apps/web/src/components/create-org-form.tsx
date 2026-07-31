"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { slugify, type Organization } from "@call-agent/db";
import { Button, Card, Input, Label } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export function CreateOrgForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error: rpcError } = await supabase.rpc("create_organization", {
      org_name: name,
      org_slug: slug,
    });
    setLoading(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    const org = (Array.isArray(data) ? data[0] : data) as Organization;
    router.push(`/dashboard/orgs/${org.id}`);
    router.refresh();
  }

  return (
    <Card>
      <h2
        className="text-xl"
        style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
      >
        Νέος οργανισμός
      </h2>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div>
          <Label>Όνομα</Label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="π.χ. Acme Support"
          />
        </div>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Δημιουργία..." : "Δημιουργία"}
        </Button>
      </form>
    </Card>
  );
}
