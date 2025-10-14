import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import ClientContactsPage from "./page";
import { useContacts } from "@/lib/hooks/useContacts";

// Mockime kogu useContacts hook'i
vi.mock("@/lib/hooks/useContacts");

// Hooki funktsioonide mokid
const mockAddContact = vi.fn();
const mockDeleteContact = vi.fn();
const mockUpdateContact = vi.fn();

describe("ClientContactsPage Component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render the list of contacts when loading is finished", () => {
    const mockContacts = [
      { id: 1, name: "Liis", phone: "123", created_at: "x" },
      { id: 2, name: "Mati", phone: "555", created_at: "y" },
    ];

    (useContacts as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      contacts: mockContacts,
      isLoading: false,
      addContact: mockAddContact,
      deleteContact: mockDeleteContact,
      updateContact: mockUpdateContact,
    });

    render(<ClientContactsPage />);

    // Põhilised kontrollid: nimi ja number on näha
    expect(screen.getByText("Liis:")).toBeTruthy();
    expect(screen.getByText("123")).toBeTruthy();
    expect(screen.getByText("Mati:")).toBeTruthy();
    expect(screen.getByText("555")).toBeTruthy();
  });

  it("should show 'Loading contacts...' while fetching", () => {
    (useContacts as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      contacts: [],
      isLoading: true,
      addContact: mockAddContact,
      deleteContact: mockDeleteContact,
      updateContact: mockUpdateContact,
    });

    render(<ClientContactsPage />);

    // Laadimise olek
    expect(screen.getByText(/Loading contacts/i)).toBeTruthy();
  });

  it("should call addContact on form submit", async () => {
    (useContacts as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      contacts: [],
      isLoading: false,
      addContact: mockAddContact,
      deleteContact: mockDeleteContact,
      updateContact: mockUpdateContact,
    });

    render(<ClientContactsPage />);

    // Lisa vorm
    const nameInput = screen.getByPlaceholderText(
      /Name\.\.\./i
    ) as HTMLInputElement;
    const phoneInput = screen.getByPlaceholderText(
      /Phone\.\.\./i
    ) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /Add/i });

    await userEvent.type(nameInput, "Mari");
    await userEvent.type(phoneInput, "777");
    await userEvent.click(addButton);

    expect(mockAddContact).toHaveBeenCalledTimes(1);
    expect(mockAddContact).toHaveBeenCalledWith("Mari", "777");
  });

  it("should call deleteContact with correct id", async () => {
    const mockContacts = [
      { id: 7, name: "Kustuta mind", phone: "000", created_at: "t" },
    ];
    (useContacts as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      contacts: mockContacts,
      isLoading: false,
      addContact: mockAddContact,
      deleteContact: mockDeleteContact,
      updateContact: mockUpdateContact,
    });

    render(<ClientContactsPage />);

    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    await userEvent.click(deleteButton);

    expect(mockDeleteContact).toHaveBeenCalledTimes(1);
    expect(mockDeleteContact).toHaveBeenCalledWith(7);
  });

  it("should call updateContact after saving changes", async () => {
    const mockContacts = [
      { id: 1, name: "Old", phone: "111", created_at: "x" },
    ];
    (useContacts as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      contacts: mockContacts,
      isLoading: false,
      addContact: mockAddContact,
      deleteContact: mockDeleteContact,
      updateContact: mockUpdateContact,
    });

    render(<ClientContactsPage />);

    // Ava muutmispaneel
    await userEvent.click(screen.getByRole("button", { name: /Change/i }));

    // Muuda väärtusi ja salvesta
    const nameEdit = screen.getByPlaceholderText("Name") as HTMLInputElement;
    const phoneEdit = screen.getByPlaceholderText("Phone") as HTMLInputElement;
    const saveButton = screen.getByRole("button", { name: /Save/i });

    await userEvent.clear(nameEdit);
    await userEvent.type(nameEdit, "New Name");
    await userEvent.clear(phoneEdit);
    await userEvent.type(phoneEdit, "222");
    await userEvent.click(saveButton);

    expect(mockUpdateContact).toHaveBeenCalledTimes(1);
    expect(mockUpdateContact).toHaveBeenCalledWith(1, "New Name", "222");
  });
});
