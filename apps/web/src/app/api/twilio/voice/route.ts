import { NextResponse } from "next/server";
import twilio from "twilio";
import { createServiceClient } from "@/lib/supabase/server";

function normalizePhone(value: string | null) {
  if (!value) return null;
  return value.replace(/[\s()-]/g, "");
}

export async function POST(request: Request) {
  const form = await request.formData();
  const to = normalizePhone(String(form.get("To") ?? ""));
  const from = normalizePhone(String(form.get("From") ?? ""));
  const callSid = String(form.get("CallSid") ?? "");

  const voiceWsUrl = process.env.VOICE_SERVER_WS_URL?.replace(/\/$/, "");
  if (!voiceWsUrl) {
    const vr = new twilio.twiml.VoiceResponse();
    vr.say(
      { language: "el-GR" },
      "Η υπηρεσία φωνής δεν είναι ρυθμισμένη. Παρακαλώ δοκιμάστε αργότερα.",
    );
    return new NextResponse(vr.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const supabase = createServiceClient();
  let orgId: string | null = null;

  if (to) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("twilio_phone_number", to)
      .maybeSingle();
    orgId = org?.id ?? null;
  }

  if (orgId && callSid) {
    await supabase.from("calls").upsert(
      {
        org_id: orgId,
        twilio_call_sid: callSid,
        from_number: from,
        to_number: to,
        status: "in_progress",
      },
      { onConflict: "twilio_call_sid" },
    );
  }

  const vr = new twilio.twiml.VoiceResponse();
  if (!orgId) {
    vr.say(
      { language: "el-GR" },
      "Αυτός ο αριθμός δεν αντιστοιχεί σε οργανισμό. Αντίο.",
    );
    vr.hangup();
  } else {
    const connect = vr.connect();
    const streamUrl = voiceWsUrl.endsWith("/media-stream")
      ? voiceWsUrl
      : `${voiceWsUrl}/media-stream`;
    const stream = connect.stream({
      url: streamUrl,
    });
    stream.parameter({ name: "orgId", value: orgId });
    stream.parameter({ name: "callSid", value: callSid });
    stream.parameter({ name: "from", value: from ?? "" });
    stream.parameter({ name: "to", value: to ?? "" });
  }

  return new NextResponse(vr.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
