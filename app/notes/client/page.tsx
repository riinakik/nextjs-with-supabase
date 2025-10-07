"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, FormEvent } from "react";
import type { User } from "@supabase/supabase-js";

type Note = {
  id: number;
  title: string;
};

export default function ClientNotesPage() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [newNote, setNewNote] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("notes")
          .select("id, title")
          .order("id", { ascending: false });
        setNotes(data as Note[] | null);
      } else {
        setNotes([]);
      }
    };
    getData();
  }, [supabase]);

  const addNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !user) return;

    const { data: addedNote } = await supabase
      .from("notes")
      .insert({ title: newNote.trim(), user_id: user.id })
      .select()
      .single();

    if (addedNote) {
      setNotes([addedNote as Note, ...(notes || [])]);
      setNewNote("");
    }
  };

  const deleteNote = async (id: number) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotes(notes ? notes.filter((note) => note.id !== id) : null);
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Notes (Client)</h1>

        {/* Add form */}
        <form onSubmit={addNote} className="flex mb-6 gap-2">
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
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

        {/* Notes list */}
        <ul className="space-y-3">
          {notes?.map((note) => (
            <li
              key={note.id}
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
            >
              <span className="font-medium truncate">{note.title}</span>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-sm rounded-md border border-red-600 text-red-500 px-3 py-1 hover:bg-red-600 hover:text-white transition"
                aria-label={`Delete ${note.title}`}
              >
                Delete
              </button>
            </li>
          ))}

          {notes?.length === 0 && (
            <li className="text-sm text-muted-foreground text-center">
              {user ? "No notes yet." : "Please sign in to see your notes."}
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
