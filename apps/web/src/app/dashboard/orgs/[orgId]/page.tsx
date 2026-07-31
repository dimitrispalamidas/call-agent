import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, PageHeader } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getOrganization } from "@/lib/org";

export default async function OrgOverviewPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const org = await getOrganization(orgId);
  if (!org) notFound();

  const supabase = await createClient();
  const [{ count: docCount }, { count: employeeCount }, { count: callCount }] =
    await Promise.all([
      supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId),
      supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId),
      supabase
        .from("calls")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId),
    ]);

  return (
    <div>
      <PageHeader
        title={org.name}
        description="Επισκόπηση AI τηλεφωνικού πράκτορα"
        actions={
          <Badge tone={org.twilio_phone_number ? "ok" : "warn"}>
            {org.twilio_phone_number ?? "Χρειάζεται αριθμός Twilio"}
          </Badge>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-sm text-[var(--muted)]">Documents</div>
          <div className="mt-2 text-3xl">{docCount ?? 0}</div>
          <Link
            className="mt-3 inline-block text-sm text-[var(--brand)]"
            href={`/dashboard/orgs/${orgId}/knowledge`}
          >
            Διαχείριση KB
          </Link>
        </Card>
        <Card>
          <div className="text-sm text-[var(--muted)]">Υπάλληλοι</div>
          <div className="mt-2 text-3xl">{employeeCount ?? 0}</div>
          <Link
            className="mt-3 inline-block text-sm text-[var(--brand)]"
            href={`/dashboard/orgs/${orgId}/employees`}
          >
            Διαχείριση υπαλλήλων
          </Link>
        </Card>
        <Card>
          <div className="text-sm text-[var(--muted)]">Κλήσεις</div>
          <div className="mt-2 text-3xl">{callCount ?? 0}</div>
          <Link
            className="mt-3 inline-block text-sm text-[var(--brand)]"
            href={`/dashboard/orgs/${orgId}/calls`}
          >
            Ιστορικό κλήσεων
          </Link>
        </Card>
      </div>
    </div>
  );
}
