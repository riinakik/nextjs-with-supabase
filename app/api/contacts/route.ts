import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  // RLS filtreerib niikuinii, aga võib ka user_id järgi piirata:
  const { data, error } = await supabase
    .from("phonebook")
    .select("id,name,phone,created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = (body?.name ?? "").toString().trim();
  const phone = (body?.phone ?? "").toString().trim();
  if (!name || !phone) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { error } = await supabase
    .from("phonebook")
    .insert([{ name, phone, user_id: session.user.id }]); // RLS nõuab õiget user_id-d

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
