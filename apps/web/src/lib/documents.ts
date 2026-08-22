import { chunkText } from "@call-agent/db";
import { embedTexts } from "@/lib/openai";
import { createServiceClient } from "@/lib/supabase/server";

export { searchKnowledgeBase } from "@/lib/kb-search";

async function extractText(
  buffer: Buffer,
  mimeType: string | null,
  fileName: string,
) {
  const lower = fileName.toLowerCase();
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  return buffer.toString("utf8");
}

export async function processDocument(documentId: string) {
  const supabase = createServiceClient();

  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error || !document) {
    throw error ?? new Error("Document not found");
  }

  await supabase
    .from("documents")
    .update({
      status: "processing",
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId);

  try {
    const { data: file, error: downloadError } = await supabase.storage
      .from("knowledge-docs")
      .download(document.storage_path);

    if (downloadError || !file) {
      throw downloadError ?? new Error("Failed to download document");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractText(buffer, document.mime_type, document.title);
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      throw new Error("No extractable text found in document");
    }

    await supabase.from("document_chunks").delete().eq("document_id", documentId);

    const embeddings = await embedTexts(chunks);
    const rows = chunks.map((content, index) => ({
      document_id: documentId,
      org_id: document.org_id,
      content,
      chunk_index: index,
      embedding: JSON.stringify(embeddings[index]),
    }));

    const { error: insertError } = await supabase
      .from("document_chunks")
      .insert(rows);
    if (insertError) throw insertError;

    await supabase
      .from("documents")
      .update({ status: "ready", updated_at: new Date().toISOString() })
      .eq("id", documentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    await supabase
      .from("documents")
      .update({
        status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);
    throw err;
  }
}
