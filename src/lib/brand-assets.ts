import { getSupabaseEnv } from "@/lib/supabase/env";

function brandAssetUrl(filename: string): string {
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/site-assets/brand/${filename}`;
}

export const LOGO_URL = brandAssetUrl("Logo.png");
export const LOGO_SECONDARY_URL = brandAssetUrl("Logo2.png");
export const TRAVEL_PIC_URL = brandAssetUrl("travel-pic.png");
export const MUNNAR_HILLSTATION_URL = brandAssetUrl("munnar-hillstation.jpg");
export const THEYYAM_IMAGE_URL = brandAssetUrl("theyyam-image.webp");
