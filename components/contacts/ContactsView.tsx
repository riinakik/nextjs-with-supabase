"use client";

import type { Contact } from "@/lib/utils";

type Props = {
  contacts: Contact[];
  addContact: (formData: FormData) => Promise<void>;
  deleteContact: (formData: FormData) => Promise<void>;
  updateContact: (formData: FormData) => Promise<void>;
};

export default function ContactsView({
  contacts,
  addContact,
  deleteContact,
  updateContact,
}: Props) {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Phonebook (Server)
        </h1>

        {/* Lisa kontakt */}
        <form action={addContact} className="flex mb-6 gap-2">
          <input
            name="name"
            className="flex-1 rounded-md border border-blue-400 bg-blue-100 text-black placeholder-gray-600 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Name..."
            required
          />
          <input
            name="phone"
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

        {/* Kontaktide nimekiri */}
        <ul className="space-y-3">
          {(contacts ?? []).map((c) => (
            <li
              key={`${c.id}-${c.name}`}
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-medium truncate">{c.name}:</span>
                <span className="truncate">{c.phone}</span>
              </div>

              <div className="relative flex items-center gap-2 overflow-visible">
                {/* Delete */}
                <form action={deleteContact}>
                  <input type="hidden" name="id" value={String(c.id)} />
                  <button
                    type="submit"
                    className="text-sm rounded-md border border-red-600 text-red-500 px-3 py-1 hover:bg-red-600 hover:text-white transition"
                    aria-label={`Delete ${c.name}`}
                  >
                    Delete
                  </button>
                </form>

                {/* Edit (details/summary nagu NotesView) */}
                <details className="relative">
                  <summary className="list-none cursor-pointer text-sm rounded-md border px-3 py-1 hover:bg-accent">
                    Change
                  </summary>

                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-10">
                    <form
                      action={updateContact}
                      className="flex items-center gap-2 bg-card border border-border rounded-md p-2 shadow-lg"
                    >
                      <input type="hidden" name="id" value={String(c.id)} />

                      <input
                        name="name"
                        defaultValue={c.name}
                        className="rounded-md border px-2 py-1 text-sm bg-background w-44"
                        placeholder="Name"
                        required
                      />
                      <input
                        name="phone"
                        defaultValue={c.phone}
                        className="rounded-md border px-2 py-1 text-sm bg-background w-44"
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
                </details>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
