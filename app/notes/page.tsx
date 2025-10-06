import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const supabase = await createClient();

  // Kontrollime, kas kasutaja on sisselogitud
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/auth/login");
  }

  // Toome kõik märkmed
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .order("id", { ascending: false });

  // Märkme lisamine
  async function addNote(formData: FormData) {
    "use server";

    const title = (formData.get("title") ?? "").toString().trim();
    if (!title) return;
    if (!session) {
      redirect("/auth/login");
    }

    const supabase = await createClient();
    await supabase.from("notes").insert({ title, user_id: session.user.id });

    revalidatePath("/notes");
  }

  // Märkme kustutamine
  async function deleteNote(formData: FormData) {
    "use server";

    const id = (formData.get("id") ?? "").toString();
    if (!id) return;

    const supabase = await createClient();
    await supabase.from("notes").delete().eq("id", id);

    revalidatePath("/notes");
  }

  // Lehe sisu
  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Notes (Server)</h1>

        {/* Vorm märkme lisamiseks */}
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

        {/* Märkmete nimekiri */}
        <ul className="space-y-3">
          {(notes ?? []).map((note) => (
            <li
              key={note.id}
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
            >
              <span className="font-medium truncate">{note.title}</span>
              <form action={deleteNote}>
                <input type="hidden" name="id" value={String(note.id)} />
                <button
                  type="submit"
                  className="text-sm rounded-md border border-red-600 text-red-500 px-3 py-1 hover:bg-red-600 hover:text-white transition"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}

          {!notes?.length && (
            <li className="text-sm text-muted-foreground text-center">
              No notes yet.
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
