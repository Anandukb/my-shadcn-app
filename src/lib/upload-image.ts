import { extractErrorMessage } from "@/lib/extract-error-message";

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.set("file", file);

  const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });

  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to upload image"));

  const json = await res.json();
  return json.url as string;
}
