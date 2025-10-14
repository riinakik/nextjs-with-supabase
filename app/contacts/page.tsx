// app/contacts/page.tsx
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { absUrl } from "@/lib/abs-url";
import { isContactArray, type Contact } from "@/lib/utils";
import ContactsView from "@/components/contacts/ContactsView";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  // --- Autentimine
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  // --- Andmete laadimine API kaudu
  const cookieHeader = (await cookies()).toString();
  const resp = await fetch(absUrl("/api/contacts"), {
    cache: "no-store",
    headers: { Cookie: cookieHeader },
  });

  const parsed: unknown = resp.ok ? await resp.json() : [];
  const contacts: Contact[] = isContactArray(parsed) ? parsed : [];

  // --- Server Actions ---
  async function addContact(formData: FormData) {
    "use server";
    const name = (formData.get("name") ?? "").toString().trim();
    const phone = (formData.get("phone") ?? "").toString().trim();
    if (!name || !phone) return;

    const cookieHeader = (await cookies()).toString();
    await fetch(absUrl("/api/contacts"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ name, phone }),
    });

    revalidatePath("/contacts");
  }

  async function deleteContact(formData: FormData) {
    "use server";
    const id = (formData.get("id") ?? "").toString();
    if (!id) return;

    const cookieHeader = (await cookies()).toString();
    await fetch(absUrl(`/api/contacts/${id}`), {
      method: "DELETE",
      headers: { Cookie: cookieHeader },
    });

    revalidatePath("/contacts");
  }

  async function updateContact(formData: FormData) {
    "use server";
    const id = (formData.get("id") ?? "").toString();
    const name = (formData.get("name") ?? "").toString().trim();
    const phone = (formData.get("phone") ?? "").toString().trim();
    if (!id || !name || !phone) return;

    const cookieHeader = (await cookies()).toString();
    await fetch(absUrl(`/api/contacts/${id}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ name, phone }),
    });

    revalidatePath("/contacts");
  }

  // --- Render: ainult UI-komponent
  return (
    <ContactsView
      contacts={contacts}
      addContact={addContact}
      deleteContact={deleteContact}
      updateContact={updateContact}
    />
  );
}
