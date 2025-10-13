import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import ClientNotesPage from "./page";
import { useNotes } from "@/lib/hooks/useNotes";

// Mock the entire useNotes hook
vi.mock("@/lib/hooks/useNotes");

// Mock functions for hook
const mockAddNote = vi.fn();
const mockDeleteNote = vi.fn();
const mockUpdateNote = vi.fn();

describe("ClientNotesPage Component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render the list of notes when loading is finished", () => {
    const mockNotes = [
      { id: 1, title: "First mock note" },
      { id: 2, title: "Second mock note" },
    ];

    (useNotes as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      notes: mockNotes,
      isLoading: false,
      addNote: mockAddNote,
      deleteNote: mockDeleteNote,
      updateNote: mockUpdateNote,
    });

    render(<ClientNotesPage />);

    // Basic existence checks
    expect(screen.getByText("First mock note")).toBeTruthy();
    expect(screen.getByText("Second mock note")).toBeTruthy();
  });

  it("should show 'Loading...' when data is being fetched", () => {
    (useNotes as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      notes: [],
      isLoading: true,
      addNote: mockAddNote,
      deleteNote: mockDeleteNote,
      updateNote: mockUpdateNote,
    });

    render(<ClientNotesPage />);

    expect(screen.getByText(/Loading notes/i)).toBeTruthy();
  });

  it("should call addNote when form is submitted", async () => {
    (useNotes as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      notes: [],
      isLoading: false,
      addNote: mockAddNote,
      deleteNote: mockDeleteNote,
      updateNote: mockUpdateNote,
    });

    render(<ClientNotesPage />);

    const input = screen.getByPlaceholderText(/New note/i) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /Add/i });

    await userEvent.type(input, "Brand new note");
    await userEvent.click(addButton);

    expect(mockAddNote).toHaveBeenCalledTimes(1);
    expect(mockAddNote).toHaveBeenCalledWith("Brand new note");
  });

  it("should call deleteNote with correct id", async () => {
    const mockNotes = [{ id: 7, title: "Delete me" }];
    (useNotes as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      notes: mockNotes,
      isLoading: false,
      addNote: mockAddNote,
      deleteNote: mockDeleteNote,
      updateNote: mockUpdateNote,
    });

    render(<ClientNotesPage />);

    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    await userEvent.click(deleteButton);

    expect(mockDeleteNote).toHaveBeenCalledTimes(1);
    expect(mockDeleteNote).toHaveBeenCalledWith(7);
  });

  it("should call updateNote after saving changes", async () => {
    const mockNotes = [{ id: 1, title: "Old title" }];
    (useNotes as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      notes: mockNotes,
      isLoading: false,
      addNote: mockAddNote,
      deleteNote: mockDeleteNote,
      updateNote: mockUpdateNote,
    });

    render(<ClientNotesPage />);

    await userEvent.click(screen.getByRole("button", { name: /Change/i }));
    const editInput = screen.getByPlaceholderText(
      /New title/i
    ) as HTMLInputElement;
    const saveButton = screen.getByRole("button", { name: /Save/i });

    await userEvent.clear(editInput);
    await userEvent.type(editInput, "Updated title");
    await userEvent.click(saveButton);

    expect(mockUpdateNote).toHaveBeenCalledTimes(1);
    expect(mockUpdateNote).toHaveBeenCalledWith(1, "Updated title");
  });
});
