import { createServiceClient } from "@/app/lib/supabase/service";
import type { Json } from "@/app/lib/supabase/types";

export async function savePreviewCore(
  base64Data: string,
  promptInput: Record<string, unknown>,
  userId: string | null,
  quoteId?: string
): Promise<{ success: boolean; previewId?: string; signedUrl?: string; error?: string }> {
  const supabase = createServiceClient();

  // Strip data URI prefix if present (e.g. "data:image/png;base64,...")
  const raw = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const buffer = Buffer.from(raw, "base64");
  const fileSize = buffer.length;

  const uuid = crypto.randomUUID();
  const folder = userId ? `users/${userId}` : "anonymous";
  const subFolder = quoteId || "unlinked";
  const storagePath = `${folder}/${subFolder}/${uuid}.png`;

  const { error: uploadError } = await supabase.storage
    .from("previews")
    .upload(storagePath, buffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload failed:", uploadError);
    return { success: false, error: uploadError.message };
  }

  const { data: urlData, error: urlError } = await supabase.storage
    .from("previews")
    .createSignedUrl(storagePath, 3600);

  if (urlError) {
    console.error("Signed URL generation failed:", urlError);
  }

  const promptStr = JSON.stringify(promptInput);
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(promptStr)
  );
  const promptHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const { data, error: insertError } = await supabase
    .from("previews")
    .insert({
      quote_id: quoteId || null,
      user_id: userId,
      storage_path: storagePath,
      prompt_hash: promptHash,
      prompt_input: promptInput as Json,
      file_size_bytes: fileSize,
      mime_type: "image/png",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Preview record insert failed:", insertError);
    return { success: false, error: insertError.message };
  }

  return {
    success: true,
    previewId: data.id,
    signedUrl: urlData?.signedUrl,
  };
}
