import { NextResponse } from "next/server";
import { withAccess, parseBody } from "@/lib/access/api";
import { accessService } from "@/lib/access/access-service";
import { roleInputSchema } from "@/lib/access/schema";
import { requireAdminContext } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/access/permissions";

export async function GET() {
  // Listing roles is needed to pick one when adding a user, so either view permission works.
  return withAccess([], async (ctx) => {
    if (!hasPermission(ctx, "roles:view") && !hasPermission(ctx, "users:view")) {
      await requireAdminContext("roles:view");
    }
    return NextResponse.json({ roles: await accessService.listRoles() });
  });
}

export async function POST(request: Request) {
  return withAccess(["roles:create"], async (ctx) => {
    const input = await parseBody(request, roleInputSchema);
    return NextResponse.json(await accessService.createRole(ctx, input), { status: 201 });
  });
}
