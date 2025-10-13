import { useState, useEffect, useCallback } from "react";

// Veendu, et Note tüüp on kättesaadav, impordi see vajadusel
// näiteks: import type { Note } from "@/lib/utils";
type Note = {
  id: number;
  title: string;
};

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        console.error("Failed to fetch notes");
        setNotes([]);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (title: string) => {
    if (!title.trim()) return;

    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });

    if (response.ok) {
      const addedNote = await response.json();
      setNotes((prevNotes) => [addedNote, ...prevNotes]);
      return true;
    }
    console.error("Failed to add note");
    return false;
  };

  const deleteNote = async (id: number) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } else {
      console.error("Failed to delete note");
    }
  };

  const updateNote = async (id: number, title: string) => {
    if (!title.trim()) return;

    const response = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (response.ok) {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, title } : n))
      );
    } else {
      console.error("Update failed");
    }
  };

  return { notes, isLoading, addNote, deleteNote, updateNote };
}