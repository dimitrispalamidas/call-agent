import { NextResponse } from "next/server";
import { assertOrgAdmin } from "@/lib/authz";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const auth = await assertOrgAdmin(orgId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const payload = {
    name: body.name,
    twilio_phone_number: body.twilio_phone_number,
    greeting: body.greeting,
    system_prompt: body.system_prompt,
    transfer_policy: body.transfer_policy,
    timezone: body.timezone,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await auth.supabase
    .from("organizations")
    .update(payload)
    .eq("id", orgId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ organization: data });
}
