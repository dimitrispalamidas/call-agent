import { NextResponse } from "next/server";
import { assertOrgAdmin } from "@/lib/authz";
import { processDocument } from "@/lib/documents";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const auth = await assertOrgAdmin(orgId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const form = await request.formData();
  const file = form.get("file");
  const title = String(form.get("title") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${orgId}/${Date.now()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await auth.supabase.storage
    .from("knowledge-docs")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: document, error } = await auth.supabase
    .from("documents")
    .insert({
      org_id: orgId,
      title: title || file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error || !document) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create document" },
      { status: 400 },
    );
  }

  try {
    await processDocument(document.id);
  } catch (err) {
    return NextResponse.json(
      {
        document,
        error: err instanceof Error ? err.message : "Processing failed",
      },
      { status: 202 },
    );
  }

  const { data: refreshed } = await auth.supabase
    .from("documents")
    .select("*")
    .eq("id", document.id)
    .single();

  return NextResponse.json({ document: refreshed ?? document });
}
