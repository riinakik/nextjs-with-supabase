import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { absUrl } from "@/lib/abs-url";

export const dynamic = "force-dynamic";

type Note = { id: number; title: string };

function isNoteArray(u: unknown): u is Note[] {
  return (
    Array.isArray(u) &&
    u.every(
      (n) =>
        n &&
        typeof n === "object" &&
        typeof (n as { id: unknown }).id === "number" &&
        typeof (n as { title: unknown }).title === "string"
    )
  );
}

export default async function NotesPage() {
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

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Notes (Server)</h1>

        <form action={addNote} className="flex mb-6 gap-2">
          <input
            name="title"
            className="flex-1 rounded-md border border-blue-400 bg-blue-100 text-black placeholder-gray-600 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="New note..."
            required
          />
          <button
            type="submit"
            className="rounded-md px-4 py-2 bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
          >
            Add
          </button>
        </form>

        <ul className="space-y-3">
          {(notes ?? []).map((note) => (
            <li
              key={`${note.id}-${note.title}`}
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
            >
              <span className="font-medium truncate">{note.title}</span>

              <div className="relative flex items-center gap-2 overflow-visible">
                <form action={deleteNote}>
                  <input type="hidden" name="id" value={String(note.id)} />
                  <button
                    type="submit"
                    className="text-sm rounded-md border border-red-600 text-red-500 px-3 py-1 hover:bg-red-600 hover:text-white transition"
                  >
                    Delete
                  </button>
                </form>

                <details className="relative">
                  <summary className="list-none cursor-pointer text-sm rounded-md border px-3 py-1 hover:bg-accent">
                    Change
                  </summary>

                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-10">
                    <form
                      action={updateNote}
                      className="flex items-center gap-2 bg-card border border-border rounded-md p-2 shadow-lg"
                    >
                      <input type="hidden" name="id" value={String(note.id)} />
                      <input
                        name="title"
                        defaultValue={note.title}
                        className="rounded-md border px-2 py-1 text-sm bg-background w-44"
                        placeholder="New title"
                        required
                      />
                      <button
                        type="submit"
                        className="text-sm rounded-md px-3 py-1 bg-primary text-primary-foreground hover:opacity-90"
                      >
                        Save
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
