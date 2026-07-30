import { createAdminClient } from "@/lib/supabase/admin";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function currentWindowStart(): string {
  const now = Date.now();
  const floored = now - (now % WINDOW_MS);
  return new Date(floored).toISOString();
}

export async function checkRateLimit(ipAddress: string | null): Promise<boolean> {
  if (!ipAddress) return true;

  const supabase = createAdminClient();
  const windowStart = currentWindowStart();

  const { data: existing, error: selectError } = await supabase
    .from("enquiry_rate_limits")
    .select("count")
    .eq("ip_address", ipAddress)
    .eq("window_start", windowStart)
    .maybeSingle();

  if (selectError) throw new Error(`Failed to check rate limit: ${selectError.message}`);

  const currentCount = (existing as { count: number } | null)?.count ?? 0;

  if (currentCount >= MAX_PER_WINDOW) return false;

  // Read-then-write, not atomic — acceptable for a spam deterrent (not a
  // security boundary): a rare race under concurrent requests from the same
  // IP in the same 10-minute window can let one extra request through, but
  // can never let unbounded requests through.
  const { error: upsertError } = await supabase
    .from("enquiry_rate_limits")
    .upsert(
      { ip_address: ipAddress, window_start: windowStart, count: currentCount + 1 },
      { onConflict: "ip_address,window_start" }
    );

  if (upsertError) throw new Error(`Failed to record rate limit: ${upsertError.message}`);

  return true;
}
