"use client";

import { useState, useEffect, useCallback } from "react";

export type Contact = {
  id: number;
  name: string;
  phone: string;
  created_at: string;
};

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await fetch("/api/contacts", { cache: "no-store" });
      if (!r.ok) throw new Error("failed");
      const data = (await r.json()) as Contact[];
      setContacts(data);
    } catch {
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchContacts();
  }, [fetchContacts]);

  const addContact = async (name: string, phone: string) => {
    const n = name.trim();
    const p = phone.trim();
    if (!n || !p) return false;

    const r = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: n, phone: p }),
    });

    if (r.ok) {
      await fetchContacts(); // hoia API-ga sünkis
      return true;
    }
    console.error("Failed to add contact");
    return false;
  };

  const deleteContact = async (id: number) => {
    const r = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    if (r.ok) {
      await fetchContacts();
    } else {
      console.error("Failed to delete contact");
    }
  };

  const updateContact = async (id: number, name: string, phone: string) => {
    const n = name.trim();
    const p = phone.trim();
    if (!n || !p) return;

    const r = await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: n, phone: p }),
    });

    if (r.ok) {
      await fetchContacts();
    } else {
      console.error("Failed to update contact");
    }
  };

  return { contacts, isLoading, addContact, deleteContact, updateContact };
}
