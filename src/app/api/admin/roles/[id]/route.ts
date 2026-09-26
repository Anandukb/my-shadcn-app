import { NextResponse } from "next/server";
import { withAccess, parseBody } from "@/lib/access/api";
import { accessService } from "@/lib/access/access-service";
import { roleInputSchema } from "@/lib/access/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withAccess(["roles:edit"], async (ctx) => {
    const { id } = await params;
    const input = await parseBody(request, roleInputSchema);
    return NextResponse.json(await accessService.updateRole(ctx, id, input));
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAccess(["roles:delete"], async () => {
    const { id } = await params;
    await accessService.deleteRole(id);
    return NextResponse.json({ ok: true });
  });
}
