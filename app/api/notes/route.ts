import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Note = { id: number; title: string };
type TitlePayload = { title: string };

function isTitlePayload(u: unknown): u is TitlePayload {
  return !!u && typeof u === "object" && "title" in u && typeof (u as { title: unknown }).title === "string";
}

export async function GET() {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("notes")
    .select("id, title")
    .eq("user_id", userRes.user.id)
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []) as Note[]);
}

export async function POST(request: Request) {
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
    .insert({ title, user_id: userRes.user.id })
    .select("id, title")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as Note, { status: 201 });
}
