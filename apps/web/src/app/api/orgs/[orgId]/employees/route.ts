import { NextResponse } from "next/server";
import { assertOrgAdmin } from "@/lib/authz";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const auth = await assertOrgAdmin(orgId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { data, error } = await auth.supabase
    .from("employees")
    .insert({
      org_id: orgId,
      name: body.name,
      phone_e164: body.phone_e164,
      priority: Number(body.priority ?? 100),
      is_available: true,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ employee: data });
}
