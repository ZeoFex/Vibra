import { audiusBase } from "@/lib/audius";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!/^[\w-]+$/.test(id)) {
    return new Response("Invalid track", { status: 400 });
  }

  return Response.redirect(`${audiusBase()}/tracks/${id}/stream`, 302);
}
