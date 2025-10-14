import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(_req: Request, ctx: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await _req.json().catch(() => ({}));
  const name = (body?.name ?? "").toString().trim();
  const phone = (body?.phone ?? "").toString().trim();
  if (!name || !phone) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const idNum = Number(ctx.params.id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  // RLS tagab, et muuta saab vaid oma rida
  const { error } = await supabase
    .from("phonebook")
    .update({ name, phone })
    .eq("id", idNum);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const idNum = Number(ctx.params.id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const { error } = await supabase
    .from("phonebook")
    .delete()
    .eq("id", idNum);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
