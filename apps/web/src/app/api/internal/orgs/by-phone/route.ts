import { NextResponse } from "next/server";
import { assertInternalSecret } from "@/lib/authz";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!assertInternalSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phone = new URL(request.url).searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "Missing phone" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("twilio_phone_number", phone)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ organization: data });
}
