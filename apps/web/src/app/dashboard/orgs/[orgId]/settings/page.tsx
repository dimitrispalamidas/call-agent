import { notFound } from "next/navigation";
import { OrgSettingsForm } from "@/components/org-settings-form";
import { PageHeader } from "@/components/ui";
import { getOrganization } from "@/lib/org";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const org = await getOrganization(orgId);
  if (!org) notFound();

  return (
    <div>
      <PageHeader
        title="Ρυθμίσεις agent"
        description="Prompt, greeting, Twilio number και πολιτική transfer."
      />
      <OrgSettingsForm org={org} />
    </div>
  );
}
