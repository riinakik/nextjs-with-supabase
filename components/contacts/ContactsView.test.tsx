import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import ContactsView from "./ContactsView";
import type { Contact } from "@/lib/utils";

// Puhasta DOM ja mockid pärast iga testi
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Võltsandmed
const mockContacts: Contact[] = [
  { id: 1, name: "Liis", phone: "123", created_at: "2023-10-27T10:00:00.000Z" },
  { id: 2, name: "Mati", phone: "555", created_at: "2023-10-27T11:00:00.000Z" },
];

// Võltsfunktsioonid
const mockAddContact = vi.fn();
const mockDeleteContact = vi.fn();
const mockUpdateContact = vi.fn();

describe("ContactsView Component", () => {
  it("should render the contacts list correctly", () => {
    render(
      <ContactsView
        contacts={mockContacts}
        addContact={mockAddContact}
        deleteContact={mockDeleteContact}
        updateContact={mockUpdateContact}
      />
    );

    // Pealkiri on olemas
    expect(
      screen.getByRole("heading", { name: /Phonebook \(Server\)/i })
    ).toBeDefined();

    // Mõlemad kontaktid on ekraanil (nimi ja number)
    expect(screen.getByText("Liis:")).toBeDefined();
    expect(screen.getByText("123")).toBeDefined();
    expect(screen.getByText("Mati:")).toBeDefined();
    expect(screen.getByText("555")).toBeDefined();

    // "Change" ja "Delete" nupud on olemas
    expect(screen.getAllByText("Change").length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /Delete/i }).length
    ).toBeGreaterThan(0);
  });

  it("should display an empty list when there are no contacts", () => {
    render(
      <ContactsView
        contacts={[]}
        addContact={mockAddContact}
        deleteContact={mockDeleteContact}
        updateContact={mockUpdateContact}
      />
    );

    // Esimese kontakti nimi ei tohiks nähtav olla
    const el = screen.queryByText("Liis:");
    expect(el).toBeNull();
  });

  it("should render the add form controls", () => {
    render(
      <ContactsView
        contacts={[]}
        addContact={mockAddContact}
        deleteContact={mockDeleteContact}
        updateContact={mockUpdateContact}
      />
    );

    // Kontrollime, et sisendväljad ja nupp on olemas
    expect(screen.getByPlaceholderText("Name...")).toBeDefined();
    expect(screen.getByPlaceholderText("Phone...")).toBeDefined();
    expect(screen.getByRole("button", { name: /Add/i })).toBeDefined();
  });
});
