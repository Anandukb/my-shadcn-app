// scripts/codemod-marketing-images.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const FILES = [
  "src/app/[locale]/HomeClient.tsx",
  "src/app/[locale]/about/page.tsx",
  "src/app/[locale]/contact/page.tsx",
  "src/app/[locale]/cruise-packages/page.tsx",
  "src/app/[locale]/fixed-departures/page.tsx",
  "src/app/[locale]/global-visa/page.tsx",
  "src/app/[locale]/global-visa/[country]/page.tsx",
  "src/app/[locale]/holiday-packages/page.tsx",
  "src/app/[locale]/hotels/HotelsLandingClient.tsx",
  "src/app/[locale]/medical-tourism/MedicalTourismClient.tsx",
  "src/app/[locale]/packages/page.tsx",
  "src/app/[locale]/packages/[id]/PackageDetailClient.tsx",
  "src/components/packages/KeralaTourismClient.tsx",
  "src/components/packages/PackageIncludes.tsx",
  "src/lib/data/visa.ts",
];

const ATTRIBUTE_PATTERN = /(\w+)="https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]+)\?[^"]*"/g;
const EXPRESSION_PATTERN = /"https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]+)\?[^"]*"/g;

const IMPORT_LINE = 'import { marketingImageUrl } from "@/lib/marketing-images";';

function insertImport(content) {
  if (content.includes(IMPORT_LINE)) return content;

  const lines = content.split("\n");
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ")) lastImportIndex = i;
  }

  if (lastImportIndex === -1) {
    return `${IMPORT_LINE}\n${content}`;
  }

  lines.splice(lastImportIndex + 1, 0, IMPORT_LINE);
  return lines.join("\n");
}

let totalReplacements = 0;

for (const relativePath of FILES) {
  const filePath = path.resolve(repoRoot, relativePath);
  const original = readFileSync(filePath, "utf-8");

  const attributeMatches = [...original.matchAll(ATTRIBUTE_PATTERN)].length;
  const afterAttribute = original.replace(ATTRIBUTE_PATTERN, '$1={marketingImageUrl("$2")}');

  const expressionMatches = [...afterAttribute.matchAll(EXPRESSION_PATTERN)].length;
  const afterExpression = afterAttribute.replace(EXPRESSION_PATTERN, 'marketingImageUrl("$1")');

  const fileReplacements = attributeMatches + expressionMatches;
  totalReplacements += fileReplacements;

  if (fileReplacements === 0) {
    console.log(`${relativePath}: 0 replacements`);
    continue;
  }

  const finalContent = insertImport(afterExpression);
  writeFileSync(filePath, finalContent, "utf-8");
  console.log(`${relativePath}: ${fileReplacements} replacements`);
}

console.log(`Total: ${totalReplacements} replacements across ${FILES.length} files`);
