import { NextResponse } from "next/server";
import { assertOrgAdmin } from "@/lib/authz";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orgId: string; documentId: string }> },
) {
  const { orgId, documentId } = await params;
  const auth = await assertOrgAdmin(orgId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: document } = await auth.supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("org_id", orgId)
    .maybeSingle();

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await auth.supabase.storage.from("knowledge-docs").remove([document.storage_path]);
  const { error } = await auth.supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("org_id", orgId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
