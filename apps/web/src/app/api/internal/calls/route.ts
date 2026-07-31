import { NextResponse } from "next/server";
import { assertInternalSecret } from "@/lib/authz";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!assertInternalSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = createServiceClient();

  if (body.action === "event") {
    const { data: call } = await supabase
      .from("calls")
      .select("id")
      .eq("twilio_call_sid", body.callSid)
      .maybeSingle();

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const { error } = await supabase.from("call_events").insert({
      call_id: call.id,
      type: body.type,
      payload: body.payload ?? {},
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "complete") {
    const { error } = await supabase
      .from("calls")
      .update({
        status: body.status ?? "completed",
        transcript_summary: body.transcript_summary ?? null,
        ended_at: new Date().toISOString(),
      })
      .eq("twilio_call_sid", body.callSid);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
