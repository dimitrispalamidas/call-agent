import { NextResponse } from "next/server";
import { assertInternalSecret } from "@/lib/authz";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  if (!assertInternalSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = await params;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ organization: data });
}
