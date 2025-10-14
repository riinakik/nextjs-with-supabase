"use client";

import { useState, FormEvent } from "react";
import { useContacts, type Contact } from "@/lib/hooks/useContacts";

export default function ClientContactsPage() {
  // Andmeloogika hook'is
  const { contacts, isLoading, addContact, deleteContact, updateContact } =
    useContacts();

  // Ainult UI olek
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await addContact(newName, newPhone);
    if (ok) {
      setNewName("");
      setNewPhone("");
    }
  };

  const handleSaveEdit = async (e: FormEvent, id: number) => {
    e.preventDefault();
    await updateContact(id, editName, editPhone);
    setEditId(null);
    setEditName("");
    setEditPhone("");
  };

  const handleDelete = async (id: number) => {
    await deleteContact(id);
    if (editId === id) setEditId(null);
  };

  const startEdit = (c: Contact) => {
    if (editId === c.id) {
      setEditId(null);
      setEditName("");
      setEditPhone("");
    } else {
      setEditId(c.id);
      setEditName(c.name);
      setEditPhone(c.phone);
    }
  };

  if (isLoading) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading contacts...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Phonebook (Client)
        </h1>

        {/* Add form */}
        <form onSubmit={handleAdd} className="flex mb-6 gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-md border border-blue-400 bg-blue-100 text-black placeholder-gray-600 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Name..."
            required
          />
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="flex-1 rounded-md border border-blue-400 bg-blue-100 text-black placeholder-gray-600 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Phone..."
            required
          />
          <button
            type="submit"
            className="rounded-md px-4 py-2 bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
          >
            Add
          </button>
        </form>

        {/* Contacts list */}
        <ul className="space-y-3">
          {contacts?.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
            >
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="font-medium truncate">{c.name}:</span>
                <span className="font-mono tabular-nums whitespace-nowrap">
                  {c.phone}
                </span>
              </div>

              <div className="relative flex items-center gap-2 overflow-visible">
                {/* DELETE */}
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-sm rounded-md border border-red-600 text-red-500 px-3 py-1 hover:bg-red-600 hover:text-white transition"
                  aria-label={`Delete ${c.name}`}
                >
                  Delete
                </button>

                {/* CHANGE */}
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="text-sm rounded-md border px-3 py-1 hover:bg-accent"
                >
                  Change
                </button>

                {/* Edit panel */}
                {editId === c.id && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-10">
                    <form
                      onSubmit={(e) => handleSaveEdit(e, c.id)}
                      className="flex items-center gap-2 bg-card border border-border rounded-md p-2 shadow-lg"
                    >
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="rounded-md border px-2 py-1 text-sm bg-background w-40"
                        placeholder="Name"
                        required
                        autoFocus
                      />
                      <input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="rounded-md border px-2 py-1 text-sm bg-background w-40"
                        placeholder="Phone"
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
                )}
              </div>
            </li>
          ))}
          {contacts.length === 0 && (
            <li className="text-center text-muted-foreground">
              No contacts yet.
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
