import { embedTexts } from "@/lib/openai";
import { createServiceClient } from "@/lib/supabase/server";

export async function searchKnowledgeBase(
  orgId: string,
  query: string,
  matchCount = 5,
) {
  const supabase = createServiceClient();
  const [embedding] = await embedTexts([query]);
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: JSON.stringify(embedding),
    match_org_id: orgId,
    match_count: matchCount,
  });

  if (error) throw error;
  return data ?? [];
}
