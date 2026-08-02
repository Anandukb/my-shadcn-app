// scripts/migrate-brand-assets.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envFile = readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
  const env = {};
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const FILES = ["Logo.png", "Logo2.png", "travel-pic.png", "munnar-hillstation.jpg", "theyyam-image.webp"];

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results = [];

  for (const filename of FILES) {
    const localPath = path.resolve(__dirname, "../public/images", filename);
    const file = readFileSync(localPath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = CONTENT_TYPES[ext];
    const storagePath = `brand/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(storagePath, file, { contentType, upsert: true });

    if (uploadError) {
      console.error(`Failed to upload ${filename}:`, uploadError);
      process.exit(1);
    }

    const { data } = supabase.storage.from("site-assets").getPublicUrl(storagePath);
    results.push({ filename, url: data.publicUrl });
  }

  console.log("Migrated brand assets:");
  for (const { filename, url } of results) {
    console.log(`  ${filename} -> ${url}`);
  }
}

main();
