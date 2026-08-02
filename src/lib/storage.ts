import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadAsset(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType, upsert: true });

  if (error) throw new Error(`Failed to upload ${path} to ${bucket}: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}
