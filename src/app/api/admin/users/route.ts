import { NextResponse } from "next/server";
import { withAccess, parseBody } from "@/lib/access/api";
import { accessService } from "@/lib/access/access-service";
import { userCreateSchema } from "@/lib/access/schema";

export async function GET() {
  return withAccess(["users:view"], async () =>
    NextResponse.json({ users: await accessService.listUsers() }),
  );
}

export async function POST(request: Request) {
  return withAccess(["users:create"], async (ctx) => {
    const input = await parseBody(request, userCreateSchema);
    return NextResponse.json(await accessService.createUser(ctx, input), { status: 201 });
  });
}
