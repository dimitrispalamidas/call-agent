import { notFound } from "next/navigation";
import { KnowledgePanel } from "@/components/knowledge-panel";
import { PageHeader } from "@/components/ui";
import { getOrganization } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";
import type { Document } from "@call-agent/db";

export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const org = await getOrganization(orgId);
  if (!org) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Knowledge base"
        description={`Έγγραφα για ${org.name}. Το AI απαντά μόνο από αυτά.`}
      />
      <KnowledgePanel orgId={orgId} documents={(data ?? []) as Document[]} />
    </div>
  );
}
