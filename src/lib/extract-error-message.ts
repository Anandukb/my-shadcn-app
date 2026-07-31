export async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const json = await res.json();
    if (json?.details?.formErrors?.length || json?.details?.fieldErrors) {
      const fieldMessages = json.details.fieldErrors
        ? Object.entries(json.details.fieldErrors as Record<string, string[]>)
            .filter(([, msgs]) => Array.isArray(msgs) && msgs.length > 0)
            .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
        : [];
      const formMessages: string[] = json.details.formErrors ?? [];
      const combined = [...formMessages, ...fieldMessages].join("; ");
      if (combined) return `${json.error ?? fallback} — ${combined}`;
    }
    if (typeof json?.error === "string") return json.error;
  } catch {
    // response body wasn't JSON — fall through to the generic message
  }
  return fallback;
}
