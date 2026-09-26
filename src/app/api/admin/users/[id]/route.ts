import { NextResponse } from "next/server";
import { withAccess, parseBody } from "@/lib/access/api";
import { accessService } from "@/lib/access/access-service";
import { userUpdateSchema } from "@/lib/access/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return withAccess(["users:edit"], async (ctx) => {
    const { id } = await params;
    const input = await parseBody(request, userUpdateSchema);
    return NextResponse.json(await accessService.updateUser(ctx, id, input));
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAccess(["users:delete"], async (ctx) => {
    const { id } = await params;
    await accessService.deleteUser(ctx, id);
    return NextResponse.json({ ok: true });
  });
}
