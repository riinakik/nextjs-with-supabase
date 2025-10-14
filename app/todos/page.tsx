import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TodoView from "./TodoView";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function TodoPage() {
  // READ
  const supabase = await createClient();
  const { data: todos } = await supabase
    .from("todos")
    .select("id, title, created_at")
    .order("id", { ascending: false });

  // Kõik serveri tegevused
  async function addTodo(formData: FormData) {
    "use server";
    const title = (formData.get("title") ?? "").toString().trim();
    if (!title) return;

    const supabase = await createClient();
    await supabase.from("todos").insert({ title });

    revalidatePath("/todos");
  }

  async function deleteTodo(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (!id) return;

    const supabase = await createClient();
    await supabase.from("todos").delete().eq("id", id);

    revalidatePath("/todos");
  }

  async function updateTodo(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    const title = (formData.get("title") ?? "").toString().trim();
    if (!id || !title) return;

    const supabase = await createClient();
    await supabase.from("todos").update({ title }).eq("id", id);

    redirect("/todos");
  }

  // Renderdame kliendipoolse komponendi ja anname kõik vajaliku props-idena kaasa
  return (
    <TodoView
      todos={todos ?? []}
      addTodo={addTodo}
      deleteTodo={deleteTodo}
      updateTodo={updateTodo}
    />
  );
}
