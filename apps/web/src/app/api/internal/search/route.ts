import { NextResponse } from "next/server";
import { assertInternalSecret } from "@/lib/authz";
import { searchKnowledgeBase } from "@/lib/kb-search";

export async function POST(request: Request) {
  if (!assertInternalSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const orgId = String(body.orgId ?? "");
  const query = String(body.query ?? "");
  if (!orgId || !query) {
    return NextResponse.json({ error: "Missing orgId or query" }, { status: 400 });
  }

  try {
    const results = await searchKnowledgeBase(orgId, query, Number(body.matchCount ?? 5));
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 },
    );
  }
}
