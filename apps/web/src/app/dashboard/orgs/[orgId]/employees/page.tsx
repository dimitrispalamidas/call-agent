import { notFound } from "next/navigation";
import { EmployeesPanel } from "@/components/employees-panel";
import { PageHeader } from "@/components/ui";
import { getOrganization } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import type { Employee } from "@call-agent/db";

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const org = await getOrganization(orgId);
  if (!org) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("employees")
    .select("*")
    .eq("org_id", orgId)
    .order("priority", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Υπάλληλοι"
        description="Διαθέσιμοι για transfer όταν το AI δεν μπορεί να βοηθήσει."
      />
      <EmployeesPanel orgId={orgId} employees={(data ?? []) as Employee[]} />
    </div>
  );
}
