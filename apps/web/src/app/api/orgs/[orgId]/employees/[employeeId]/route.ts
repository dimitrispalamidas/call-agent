import { NextResponse } from "next/server";
import { assertOrgAdmin } from "@/lib/authz";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; employeeId: string }> },
) {
  const { orgId, employeeId } = await params;
  const auth = await assertOrgAdmin(orgId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { data, error } = await auth.supabase
    .from("employees")
    .update({
      ...("name" in body ? { name: body.name } : {}),
      ...("phone_e164" in body ? { phone_e164: body.phone_e164 } : {}),
      ...("is_available" in body ? { is_available: Boolean(body.is_available) } : {}),
      ...("priority" in body ? { priority: Number(body.priority) } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", employeeId)
    .eq("org_id", orgId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ employee: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orgId: string; employeeId: string }> },
) {
  const { orgId, employeeId } = await params;
  const auth = await assertOrgAdmin(orgId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { error } = await auth.supabase
    .from("employees")
    .delete()
    .eq("id", employeeId)
    .eq("org_id", orgId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
