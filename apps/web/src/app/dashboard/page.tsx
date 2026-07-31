import Link from "next/link";
import { CreateOrgForm } from "@/components/create-org-form";
import { Card, PageHeader } from "@/components/ui";
import { getUserOrganizations } from "@/lib/org";

export default async function DashboardPage() {
  const orgs = await getUserOrganizations();

  return (
    <div>
      <PageHeader
        title="Οργανισμοί"
        description="Διαχειρίσου βάσεις γνώσης, αριθμούς και υπαλλήλους ανά οργανισμό."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {orgs.map((org) => (
          <Card key={org.id}>
            <h2
              className="text-xl"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              {org.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {org.twilio_phone_number ?? "Χωρίς συνδεδεμένο αριθμό"}
            </p>
            <Link
              href={`/dashboard/orgs/${org.id}`}
              className="mt-4 inline-block text-sm font-medium text-[var(--brand)]"
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
