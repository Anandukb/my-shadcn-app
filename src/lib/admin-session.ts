import type { QueryClient } from "@tanstack/react-query";

// UI preference, not account data, so it survives sign-out.
const KEEP_LOCAL_STORAGE_KEYS = ["admin-theme"];

/**
 * Wipes everything the browser remembers about the previous staff member:
 * cached API data (including their role and permissions) and stored keys.
 * Call on sign-out and again right after sign-in so a new account never sees
 * the last account's permissions.
 */
export function resetAdminClientState(queryClient: QueryClient) {
  queryClient.clear();

  try {
    sessionStorage.clear();
  } catch {
    // Storage can be blocked; nothing to clear then.
  }

  try {
    const keep = new Map(KEEP_LOCAL_STORAGE_KEYS.map((k) => [k, localStorage.getItem(k)] as const));
    localStorage.clear();
    keep.forEach((value, key) => {
      if (value !== null) localStorage.setItem(key, value);
    });
  } catch {
    // Storage can be blocked; nothing to clear then.
  }
}
