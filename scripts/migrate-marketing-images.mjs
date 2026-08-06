// scripts/migrate-marketing-images.mjs
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

const PHOTO_IDS = [
  "1436491865332-7a61a109cc05",
  "1438761681033-6461ffad8d80",
  "1454165804606-c3d57bc86b40",
  "1469854523086-cc02fe5d8800",
  "1476514525535-07fb3b4ae5f1",
  "1477959858617-67f85cf4f1df",
  "1488646953014-85cb44e25828",
  "1494790108377-be9c29b29330",
  "1498307833015-e7b400441eb8",
  "1500375592092-40eb2168fd21",
  "1500530855697-b586d89ba3ee",
  "1500648767791-00dcc994a43e",
  "1501555088652-021faa106b9b",
  "1501594907352-04cda38ebc29",
  "1501785888041-af3ef285b470",
  "1503614472-8c93d56e92ce",
  "1505761671935-60b3a7427bad",
  "1506905925346-21bda4d32df4",
  "1507608616759-54f48f0af0ee",
  "1509316785289-025f5b846b35",
  "1512446816042-444d641267d4",
  "1512453979798-5ea266f8880c",
  "1512632578888-169bbbc64f33",
  "1513635269975-59663e0ac1ad",
  "1514282401047-d79a71a590e8",
  "1515542622106-78bda8ba0e5b",
  "1516549655169-df83a0774514",
  "1519494026892-80bbd2d6fd0d",
  "1520250497591-112f2f40a3f4",
  "1751157462805-2e88f0c6bb1a",
  "1524231757912-21f4fe3a7200",
  "1524492412937-b28074a5d7da",
  "1741230127615-8334deb6b463",
  "1530053969600-caed2596d242",
  "1530521954074-e64f6810b32d",
  "1587351021759-3e566b6af7cc",
  "1539635278303-d4002c07eae3",
  "1540555700478-4be289fbecef",
  "1541432901042-2d8bd64b4a9b",
  "1542314831-068cd1dbfeeb",
  "1543857778-c4a1a3e0b2eb",
  "1544161515-4ab6ce6db874",
  "1544367567-0f2fcb009e0b",
  "1547471080-7cc2caa01a7e",
  "1548574505-5e239809ee19",
  "1552465011-b4e21bf6e79a",
  "1552832230-c0197dd311b5",
  "1559827260-dc66d52bef19",
  "1565008576549-57569a49371d",
  "1566073771259-6a8506099945",
  "1569098644584-210bcd375b59",
  "1602174423520-daa2d87175a0",
  "1573843981267-be1999ff37cd",
  "1575881875475-31023242e3f9",
  "1741243781232-acf45970e1a5",
  "1586724237569-f3d0c1dee8c6",
  "1586773860418-d37222d8fce3",
  "1588166524941-3bf61a9c41db",
  "1590050752117-238cb0fb12b1",
  "1593693397690-362cb9666fc2",
  "1599940824399-b87987ceb72a",
  "1602216056096-3b40cc0c9944",
  "1632833239869-a37e3a5806d2",
];

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results = [];

  for (const photoId of PHOTO_IDS) {
    const sourceUrl = `https://images.unsplash.com/photo-${photoId}?q=80&w=2400&auto=format&fit=crop&fm=jpg`;
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      console.error(`Failed to fetch ${photoId}: HTTP ${response.status}`);
      process.exit(1);
    }

    const arrayBuffer = await response.arrayBuffer();
    const file = Buffer.from(arrayBuffer);
    const storagePath = `marketing/${photoId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(storagePath, file, { contentType: "image/jpeg", upsert: true });

    if (uploadError) {
      console.error(`Failed to upload ${photoId}:`, uploadError);
      process.exit(1);
    }

    const { data } = supabase.storage.from("site-assets").getPublicUrl(storagePath);
    results.push({ photoId, url: data.publicUrl });
  }

  console.log(`Migrated ${results.length} marketing images:`);
  for (const { photoId, url } of results) {
    console.log(`  ${photoId} -> ${url}`);
  }
}

main();
