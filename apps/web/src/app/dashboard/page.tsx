import Link from "next/link";
import { CreateOrgForm } from "@/components/create-org-form";
import { SchemaSetupBanner } from "@/components/schema-setup-banner";
import { Card, PageHeader } from "@/components/ui";
import { getUserOrganizations, isDatabaseReady } from "@/lib/org";

export default async function DashboardPage() {
  const [orgs, dbReady] = await Promise.all([
    getUserOrganizations(),
    isDatabaseReady(),
  ]);

  return (
    <div>
      <PageHeader
        title="Οργανισμοί"
        description="Διαχειρίσου βάσεις γνώσης, αριθμούς και υπαλλήλους ανά οργανισμό."
      />
      {!dbReady ? <SchemaSetupBanner /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {orgs.map((org) => (
          <Card key={org.id}>
            <h2 className="font-display text-xl">
              {org.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {org.twilio_phone_number ?? "Χωρίς συνδεδεμένο αριθμό"}
            </p>
            <Link
              href={`/dashboard/orgs/${org.id}`}
              className="mt-4 inline-block text-sm font-medium text-[var(--brand-ink)]"
            >
              Άνοιγμα →
            </Link>
          </Card>
        ))}
        <CreateOrgForm />
      </div>
    </div>
  );
}
