import { getSupabaseEnv } from "@/lib/supabase/env";

export function marketingImageUrl(photoId: string): string {
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/site-assets/marketing/${photoId}.jpg`;
}
