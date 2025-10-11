import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const supabase = await createClient();

  // Auth
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  // READ
  const { data: notes } = await supabase
    .from("notes")
    .select("id, title")
    .order("id", { ascending: false });

  // CREATE
  async function addNote(formData: FormData) {
    "use server";
    const title = (formData.get("title") ?? "").toString().trim();
    if (!title) return;

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) redirect("/auth/login");

    await supabase.from("notes").insert({ title, user_id: session.user.id });
    revalidatePath("/notes");
  }

  // DELETE
  async function deleteNote(formData: FormData) {
    "use server";
    const id = (formData.get("id") ?? "").toString();
    if (!id) return;

    const supabase = await createClient();
    await supabase.from("notes").delete().eq("id", id);
    revalidatePath("/notes");
  }

  // UPDATE
  async function updateNote(formData: FormData) {
    "use server";
    const id = (formData.get("id") ?? "").toString();
    const title = (formData.get("title") ?? "").toString().trim();
    if (!id || !title) return;

    const supabase = await createClient();
    await supabase.from("notes").update({ title }).eq("id", id);

    redirect("/notes"); // sulgeb <details> ja värskendab
  }

  // UI
  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Notes (Server)</h1>

        {/* ADD */}
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

        {/* LIST */}
        <ul className="space-y-3">
          {(notes ?? []).map((note) => (
            <li
              key={note.id}
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
            >
              <span className="font-medium truncate">{note.title}</span>

              <div className="relative flex items-center gap-2 overflow-visible">
                {/* DELETE */}
                <form action={deleteNote}>
                  <input type="hidden" name="id" value={String(note.id)} />
                  <button
                    type="submit"
                    className="text-sm rounded-md border border-red-600 text-red-500 px-3 py-1 hover:bg-red-600 hover:text-white transition"
                  >
                    Delete
                  </button>
                </form>

                {/* UPDATE -> paremale paneel */}
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
