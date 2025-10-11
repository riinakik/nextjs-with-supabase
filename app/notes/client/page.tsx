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

  // Change paneeli state
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

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
        setNotes((data as Note[]) ?? []);
      } else {
        setNotes([]);
      }
    };
    getData();
  }, [supabase]);

  // CREATE
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

  // DELETE
  const deleteNote = async (id: number) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotes((prev) => (prev ? prev.filter((n) => n.id !== id) : prev));
    // kui kustutad parajasti muudetava, sule paneel
    if (editId === id) {
      setEditId(null);
      setEditValue("");
    }
  };

  // OPEN CHANGE PANEEL
  const startEdit = (note: Note) => {
    if (editId === note.id) {
      // kui juba avatud, sulge
      setEditId(null);
      setEditValue("");
    } else {
      setEditId(note.id);
      setEditValue(note.title);
    }
  };

  // SAVE (UPDATE)
  const saveEdit = async (e: FormEvent, id: number) => {
    e.preventDefault();
    const title = editValue.trim();
    if (!title) return;

    const { error } = await supabase
      .from("notes")
      .update({ title })
      .eq("id", id);
    if (!error) {
      // optimistlik uuendus
      setNotes((prev) =>
        prev ? prev.map((n) => (n.id === id ? { ...n, title } : n)) : prev
      );
      setEditId(null);
      setEditValue("");
    } else {
      console.error("Update failed:", error.message);
    }
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
              key={`${note.id}-${note.title}`} // kui pealkiri muutub, remountib rea (hea fallback)
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
            >
              <span className="font-medium truncate">{note.title}</span>

              {/* Parempoolsed nupud; paneel avaneb nupugrupi paremale */}
              <div className="relative flex items-center gap-2 overflow-visible">
                {/* DELETE */}
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-sm rounded-md border border-red-600 text-red-500 px-3 py-1 hover:bg-red-600 hover:text-white transition"
                  aria-label={`Delete ${note.title}`}
                >
                  Delete
                </button>

                {/* CHANGE */}
                <button
                  type="button"
                  onClick={() => startEdit(note)}
                  className="text-sm rounded-md border px-3 py-1 hover:bg-accent"
                >
                  Change
                </button>

                {/* Paneel paremale, nähtav ainult aktiivsel real */}
                {editId === note.id && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-10">
                    <form
                      onSubmit={(e) => saveEdit(e, note.id)}
                      className="flex items-center gap-2 bg-card border border-border rounded-md p-2 shadow-lg"
                    >
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="rounded-md border px-2 py-1 text-sm bg-background w-44"
                        placeholder="New title"
                        required
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="text-sm rounded-md px-3 py-1 bg-primary text-primary-foreground hover:opacity-90"
                      >
                        Save
                      </button>
                    </form>
                  </div>
                )}
              </div>
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
