"use client";

import { useState, FormEvent } from "react";
import { useNotes } from "@/lib/hooks/useNotes";

type Note = {
  id: number;
  title: string;
};

export default function ClientNotesPage() {
  // SAMM 2: Kogu andmeloogika on nüüd selle ühe rea taga peidus!
  const { notes, isLoading, addNote, deleteNote, updateNote } = useNotes();

  // SAMM 3: Alles jääb AINULT UI-ga seotud olek
  const [newNote, setNewNote] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // SAMM 4: Sündmuste käsitlejad (handlers) muutuvad väga lihtsaks.
  // Nad lihtsalt kutsuvad hook'ist saadud funktsioone.
  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    const success = await addNote(newNote);
    if (success) {
      setNewNote(""); // Tühjenda väli ainult õnnestumise korral
    }
  };

  const handleSaveEdit = async (e: FormEvent, id: number) => {
    e.preventDefault();
    await updateNote(id, editValue);
    // Sulge muutmise paneel
    setEditId(null);
    setEditValue("");
  };

  const handleDeleteNote = async (id: number) => {
    await deleteNote(id);
    // Kui kustutati parajasti muudetav märge, sulge paneel
    if (editId === id) {
      setEditId(null);
    }
  };

  // See funktsioon jääb samaks, kuna haldab ainult UI olekut
  const startEdit = (note: Note) => {
    if (editId === note.id) {
      setEditId(null); // Kui klikitakse uuesti, sulge
    } else {
      setEditId(note.id);
      setEditValue(note.title);
    }
  };

  // SAMM 5: Kasutame laadimise olekut, et kuvada kasutajale tagasisidet
  if (isLoading) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading notes...</p>
      </main>
    );
  }

  // SAMM 6: JSX jääb peaaegu samaks, aga on seotud uute, lihtsate handleritega
  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Notes (Client)</h1>

        {/* Add form */}
        <form onSubmit={handleAddNote} className="flex mb-6 gap-2">
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
              key={`${note.id}-${note.title}`} // Key peaks olema stabiilne
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
            >
              <span className="font-medium truncate">{note.title}</span>

              <div className="relative flex items-center gap-2 overflow-visible">
                {/* DELETE */}
                <button
                  onClick={() => handleDeleteNote(note.id)}
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
                      onSubmit={(e) => handleSaveEdit(e, note.id)}
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
