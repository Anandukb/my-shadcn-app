"use client";

import { useQuery } from "@tanstack/react-query";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { hasPermission } from "@/lib/access/permissions";
import type { AdminMe } from "@/lib/access/types";

export const ADMIN_ME_KEY = ["admin-me"] as const;

async function fetchMe(): Promise<AdminMe> {
  const res = await fetch("/api/admin/me", { cache: "no-store" });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load your account"));
  return res.json();
}

/** The signed-in staff member and a `can()` helper for their role's permissions. */
export function useAdminMe() {
  const query = useQuery({ queryKey: ADMIN_ME_KEY, queryFn: fetchMe, staleTime: 0, refetchOnMount: "always" });
  const me = query.data;
  const can = (permission: string) => (me ? hasPermission(me, permission) : false);
  return { me, can, isLoading: query.isLoading };
}
