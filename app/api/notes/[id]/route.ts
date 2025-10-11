import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Note = { id: number; title: string };
type TitlePayload = { title: string };

type Ctx = { params: Promise<{ id: string }> };

function isTitlePayload(u: unknown): u is TitlePayload {
  return !!u && typeof u === "object" && "title" in u && typeof (u as { title: unknown }).title === "string";
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bodyUnknown: unknown = await request.json();
  if (!isTitlePayload(bodyUnknown)) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = bodyUnknown.title.trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("notes")
    .update({ title })
    .eq("id", id)
    .eq("user_id", userRes.user.id)
    .select("id, title")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data as Note);
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", userRes.user.id)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(null, { status: 204 });
}
