import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request: Request) {
  const form = await request.formData();
  const url = new URL(request.url);
  const conferenceName = String(
    form.get("conferenceName") ??
      url.searchParams.get("conferenceName") ??
      "transfer",
  );
  const vr = new twilio.twiml.VoiceResponse();
  const dial = vr.dial();
  dial.conference(
    {
      startConferenceOnEnter: true,
      endConferenceOnExit: false,
      beep: "false",
    },
    conferenceName,
  );

  return new NextResponse(vr.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
