import { NextResponse } from "next/server";
import twilio from "twilio";
import { assertInternalSecret } from "@/lib/authz";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!assertInternalSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const orgId = String(body.orgId ?? "");
  const callSid = String(body.callSid ?? "");
  const reason = String(body.reason ?? "");

  if (!orgId || !callSid) {
    return NextResponse.json({ error: "Missing orgId or callSid" }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!accountSid || !authToken || !appUrl) {
    return NextResponse.json(
      { error: "Twilio or app URL not configured" },
      { status: 500 },
    );
  }

  const supabase = createServiceClient();
  const [{ data: employee }, { data: org }] = await Promise.all([
    supabase
      .from("employees")
      .select("*")
      .eq("org_id", orgId)
      .eq("is_available", true)
      .order("priority", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("organizations")
      .select("twilio_phone_number")
      .eq("id", orgId)
      .maybeSingle(),
  ]);

  if (!employee) {
    return NextResponse.json({
      transferred: false,
      reason: "no_available_employee",
    });
  }

  const fromNumber =
    org?.twilio_phone_number ?? process.env.TWILIO_PHONE_NUMBER ?? null;
  if (!fromNumber) {
    return NextResponse.json(
      { error: "No Twilio from-number configured for organization" },
      { status: 500 },
    );
  }

  const client = twilio(accountSid, authToken);
  const conferenceName = `org-${orgId}-${callSid}`;
  const transferUrl = `${appUrl}/api/twilio/transfer?conferenceName=${encodeURIComponent(conferenceName)}`;

  await client.calls(callSid).update({
    url: transferUrl,
    method: "POST",
  });

  await client.calls.create({
    to: employee.phone_e164,
    from: fromNumber,
    url: transferUrl,
    method: "POST",
  });

  const { data: call } = await supabase
    .from("calls")
    .select("id")
    .eq("twilio_call_sid", callSid)
    .maybeSingle();

  if (call) {
    await supabase
      .from("calls")
      .update({
        status: "transferred",
        transferred_to: employee.id,
        transcript_summary: reason || "Transferred to human",
        ended_at: new Date().toISOString(),
      })
      .eq("id", call.id);

    await supabase.from("call_events").insert({
      call_id: call.id,
      type: "transfer_to_human",
      payload: {
        employee_id: employee.id,
        employee_name: employee.name,
        reason,
      },
    });
  }

  return NextResponse.json({
    transferred: true,
    employee: {
      id: employee.id,
      name: employee.name,
      phone_e164: employee.phone_e164,
    },
  });
}
