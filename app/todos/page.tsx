import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Todo = {
  id: number;
  title: string;
  created_at: string;
};

export default async function TodoPage() {
  // READ
  const supabase = await createClient();
  const { data: todos } = await supabase
    .from("todos")
    .select("id, title, created_at")
    .order("id", { ascending: false });

  // CREATE
  async function addTodo(formData: FormData) {
    "use server";
    const title = (formData.get("title") ?? "").toString().trim();
    if (!title) return;

    const supabase = await createClient();
    await supabase.from("todos").insert({ title });

    revalidatePath("/todos");
  }

  // DELETE
  async function deleteTodo(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (!id) return;

    const supabase = await createClient();
    await supabase.from("todos").delete().eq("id", id);

    revalidatePath("/todos");
  }

  // UPDATE
  async function updateTodo(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const title = (formData.get("title") ?? "").toString().trim();
    if (!id || !title) return;

    const supabase = await createClient();
    await supabase.from("todos").update({ title }).eq("id", id);

    redirect("/todos");
  }

  // UI
  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">TODO App</h1>

        {/* CREATE */}
        <form action={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            name="title"
            placeholder="Add a new task..."
            className="flex-1 rounded-md border border-blue-400 bg-blue-100 text-black placeholder-gray-600 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
          <button
            type="submit"
            className="rounded-md px-4 py-2 bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
          >
            Add
          </button>
        </form>

        {/* TODO LIST */}
        <ul className="space-y-3">
          {todos?.map((t: Todo) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(t.created_at).toLocaleString()}
                </p>
              </div>

              <div className="relative flex items-center gap-2 overflow-visible">
                {/* DELETE */}
                <form action={deleteTodo}>
                  <input type="hidden" name="id" value={String(t.id)} />
                  <button
                    type="submit"
                    className="text-sm rounded-md border border-red-600 text-red-500 px-3 py-1 hover:bg-red-600 hover:text-white transition"
                  >
                    Delete
                  </button>
                </form>

                {/* CHANGE / UPDATE */}
                <details className="relative">
                  <summary className="list-none cursor-pointer text-sm rounded-md border px-3 py-1 hover:bg-accent">
                    Change
                  </summary>

                  {/* Avaneb paremale */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-10">
                    <form
                      action={updateTodo}
                      className="flex items-center gap-2 bg-card border border-border rounded-md p-2 shadow-lg"
                    >
                      <input type="hidden" name="id" value={String(t.id)} />
                      <input
                        name="title"
                        defaultValue={t.title}
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
