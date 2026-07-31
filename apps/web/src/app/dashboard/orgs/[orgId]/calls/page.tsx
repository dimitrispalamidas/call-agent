import { notFound } from "next/navigation";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getOrganization } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import type { Call, CallStatus } from "@call-agent/db";

function toneForStatus(status: CallStatus) {
  switch (status) {
    case "completed":
      return "ok" as const;
    case "transferred":
      return "warn" as const;
    case "failed":
    case "no_answer":
      return "danger" as const;
    case "in_progress":
      return "neutral" as const;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export default async function CallsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const org = await getOrganization(orgId);
  if (!org) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("calls")
    .select("*")
    .eq("org_id", orgId)
    .order("started_at", { ascending: false })
    .limit(50);

  const calls = (data ?? []) as Call[];

  return (
    <div>
      <PageHeader
        title="Κλήσεις"
        description={`Ιστορικό εισερχόμενων κλήσεων για ${org.name}`}
      />
      <Card>
        {calls.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Δεν υπάρχουν κλήσεις ακόμα.</p>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-3"
              >
                <div>
                  <div className="font-medium">
                    {call.from_number ?? "Άγνωστος καλών"} →{" "}
                    {call.to_number ?? org.twilio_phone_number}
                  </div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {new Date(call.started_at).toLocaleString("el-GR")}
                    {call.transcript_summary
                      ? ` · ${call.transcript_summary}`
                      : ""}
                  </div>
                </div>
                <Badge tone={toneForStatus(call.status)}>{call.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
