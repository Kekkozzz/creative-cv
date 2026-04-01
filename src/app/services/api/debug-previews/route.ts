import { createServiceClient } from "@/app/lib/supabase/service";
import { createServerClient } from "@/app/lib/supabase/server";

export async function GET() {
  const service = createServiceClient();
  const checks: Record<string, unknown> = {};

  // 1. Check current user from cookies
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    checks.currentUser = user ? { id: user.id, email: user.email } : null;
    checks.authError = error?.message ?? null;
  } catch (e) {
    checks.currentUser = null;
    checks.authError = String(e);
  }

  // 2. Check if storage bucket exists
  try {
    const { data: buckets, error } = await service.storage.listBuckets();
    checks.buckets = buckets?.map((b) => ({ name: b.name, public: b.public })) ?? [];
    checks.bucketsError = error?.message ?? null;

    const previewsBucket = buckets?.find((b) => b.name === "previews");
    checks.previewsBucketExists = !!previewsBucket;

    // If bucket doesn't exist, try to create it
    if (!previewsBucket) {
      const { error: createErr } = await service.storage.createBucket("previews", {
        public: false,
        fileSizeLimit: 10 * 1024 * 1024,
      });
      checks.bucketCreated = !createErr;
      checks.bucketCreateError = createErr?.message ?? null;
    }
  } catch (e) {
    checks.bucketsError = String(e);
  }

  // 3. Check preview records in DB
  try {
    const { data: previews, error } = await service
      .from("previews")
      .select("id, quote_id, user_id, storage_path, created_at, file_size_bytes")
      .order("created_at", { ascending: false })
      .limit(10);

    checks.previewRecords = previews ?? [];
    checks.previewCount = previews?.length ?? 0;
    checks.previewsError = error?.message ?? null;
  } catch (e) {
    checks.previewsError = String(e);
  }

  // 4. Check recent quotes
  try {
    const { data: quotes, error } = await service
      .from("quotes")
      .select("id, user_id, status, business_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    checks.recentQuotes = quotes ?? [];
    checks.quotesError = error?.message ?? null;
  } catch (e) {
    checks.quotesError = String(e);
  }

  // 5. Check storage files and signed URLs for each preview record
  if (checks.previewsBucketExists || checks.bucketCreated) {
    try {
      const { data: files, error } = await service.storage
        .from("previews")
        .list("users", { limit: 10 });

      checks.storageTopLevel = files?.map((f) => ({ name: f.name, type: f.metadata ? "file" : "folder" })) ?? [];
      checks.storageError = error?.message ?? null;
    } catch (e) {
      checks.storageError = String(e);
    }

    // For each preview record, check if the file exists and signed URL works
    const previewRecords = (checks.previewRecords as Array<{ id: string; storage_path: string }>) ?? [];
    const storageChecks = await Promise.all(
      previewRecords.map(async (p) => {
        // Try to get signed URL
        const { data: urlData, error: urlErr } = await service.storage
          .from("previews")
          .createSignedUrl(p.storage_path, 3600);

        // Try to check if file exists by downloading first byte
        const { data: fileData, error: downloadErr } = await service.storage
          .from("previews")
          .download(p.storage_path);

        return {
          previewId: p.id,
          storagePath: p.storage_path,
          signedUrl: urlData?.signedUrl ? urlData.signedUrl.slice(0, 80) + "..." : null,
          signedUrlError: urlErr?.message ?? null,
          fileExists: !!fileData,
          fileSize: fileData?.size ?? null,
          downloadError: downloadErr?.message ?? null,
        };
      })
    );
    checks.storageChecks = storageChecks;
  }

  return Response.json(checks, { status: 200 });
}
