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

  // Supabase client on vajalik autentimiseks
  const supabase = createClient();

  useEffect(() => {
    const checkUserAndFetchNotes = async () => {
      // 1. SAMM: Kontrollime kasutajat endiselt otse Supabase'ist
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // --- VANA KOOD (otse Supabasest) ---
        // const { data } = await supabase
        //   .from("notes")
        //   .select("id, title")
        //   .order("id", { ascending: false });
        // setNotes((data as Note[]) ?? []);

        // --- UUS KOOD (läbi meie API) ---
        // Teeme GET päringu omaenda API otspunkti.
        // Kliendipoolsed päringud lisavad automaatselt vajalikud küpsised,
        // seega API teab, kes on sisse logitud.
        const response = await fetch("/api/notes");
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        } else {
          console.error("Failed to fetch notes");
          setNotes([]);
        }
      } else {
        setNotes([]);
      }
    };
    checkUserAndFetchNotes();
    // Eemaldame 'supabase' sõltuvuse, et vältida liigseid päringuid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CREATE
  const addNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !user) return;

    // --- VANA KOOD ---
    // const { data: addedNote } = await supabase
    //   .from("notes")
    //   .insert({ title: newNote.trim(), user_id: user.id })
    //   .select()
    //   .single();

    // --- UUS KOOD ---
    // Teeme POST päringu, saates uue märkme pealkirja kehas (body).
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newNote.trim() }),
    });

    if (response.ok) {
      const addedNote = await response.json();
      setNotes([addedNote as Note, ...(notes || [])]);
      setNewNote("");
    } else {
      console.error("Failed to add note");
    }
  };

  // DELETE
  const deleteNote = async (id: number) => {
    // --- VANA KOOD ---
    // await supabase.from("notes").delete().eq("id", id);

    // --- UUS KOOD ---
    // Teeme DELETE päringu spetsiifilisele URL-ile, mis sisaldab märkme ID-d.
    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // DELETE tagastab 204, mis on "ok"
      setNotes((prev) => (prev ? prev.filter((n) => n.id !== id) : prev));
      // kui kustutad parajasti muudetava, sule paneel
      if (editId === id) {
        setEditId(null);
        setEditValue("");
      }
    } else {
      console.error("Failed to delete note");
    }
  };

  // OPEN CHANGE PANEEL - SEE JÄÄB SAMAKS, KUNA HALDAB AINULT UI OLEKUT
  const startEdit = (note: Note) => {
    if (editId === note.id) {
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

    // --- VANA KOOD ---
    // const { error } = await supabase
    //   .from("notes")
    //   .update({ title })
    //   .eq("id", id);
    // if (!error) {
    //   // ...
    // }

    // --- UUS KOOD ---
    // Teeme PATCH päringu, saates uue pealkirja kehas.
    const response = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (response.ok) {
      // uuendus
      setNotes((prev) =>
        prev ? prev.map((n) => (n.id === id ? { ...n, title } : n)) : prev
      );
      setEditId(null);
      setEditValue("");
    } else {
      const result = await response.json();
      console.error("Update failed:", result.error);
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
              key={`${note.id}-${note.title}`}
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
            >
              <span className="font-medium truncate">{note.title}</span>

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

                {/* Paneel paremale */}
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
        </ul>
      </div>
    </main>
  );
}
