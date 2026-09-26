import { NextResponse } from "next/server";
import { withAccess } from "@/lib/access/api";
import type { AdminMe } from "@/lib/access/types";

export async function GET() {
  return withAccess([], async (ctx) => {
    const me: AdminMe = {
      id: ctx.user.id,
      email: ctx.user.email ?? null,
      fullName: ctx.fullName,
      roleName: ctx.roleName,
      isSuperAdmin: ctx.isSuperAdmin,
      permissions: ctx.permissions,
    };
    return NextResponse.json(me);
  });
}
