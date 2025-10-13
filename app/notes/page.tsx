// app/notes/page.tsx

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { absUrl } from "@/lib/abs-url";
import { isNoteArray, type Note } from "@/lib/utils";
import NotesView from "@/components/notes/NotesView";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  // --- Andmete hankimine ja serveri loogika
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/auth/login");

  const cookieHeader = (await cookies()).toString();

  const notesResponse = await fetch(absUrl("/api/notes"), {
    cache: "no-store",
    headers: { Cookie: cookieHeader },
  });

  const parsed: unknown = notesResponse.ok ? await notesResponse.json() : [];
  const notes: Note[] = isNoteArray(parsed) ? parsed : [];

  // --- Server Actions ---
  async function addNote(formData: FormData) {
    "use server";
    const title = (formData.get("title") ?? "").toString().trim();
    if (!title) return;

    const cookieHeader = (await cookies()).toString();
    await fetch(absUrl("/api/notes"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ title }),
    });

    revalidatePath("/notes");
  }

  async function deleteNote(formData: FormData) {
    "use server";
    const id = (formData.get("id") ?? "").toString();
    if (!id) return;

    const cookieHeader = (await cookies()).toString();
    await fetch(absUrl(`/api/notes/${id}`), {
      method: "DELETE",
      headers: { Cookie: cookieHeader },
    });

    revalidatePath("/notes");
  }

  async function updateNote(formData: FormData) {
    "use server";
    const id = (formData.get("id") ?? "").toString();
    const title = (formData.get("title") ?? "").toString().trim();
    if (!id || !title) return;

    const cookieHeader = (await cookies()).toString();
    await fetch(absUrl(`/api/notes/${id}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ title }),
    });

    revalidatePath("/notes");
  }

  // ---renderdame ainult visuaalset komponenti ---
  return (
    <NotesView
      notes={notes}
      addNote={addNote}
      deleteNote={deleteNote}
      updateNote={updateNote}
    />
  );
}
