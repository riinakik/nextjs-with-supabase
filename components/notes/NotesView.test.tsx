import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import NotesView from "./NotesView";
import type { Note } from "@/lib/utils";

// Puhasta DOM ja mockid pärast iga testi
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Võltsandmed
const mockNotes: Note[] = [
  { id: 1, title: "Esimene test-märge" },
  { id: 2, title: "Teine test-märge" },
];

// Võltsfunktsioonid
const mockAddNote = vi.fn();
const mockDeleteNote = vi.fn();
const mockUpdateNote = vi.fn();

describe("NotesView Component", () => {
  it("peaks renderdama märkmete nimekirja korrektselt", () => {
    render(
      <NotesView
        notes={mockNotes}
        addNote={mockAddNote}
        deleteNote={mockDeleteNote}
        updateNote={mockUpdateNote}
      />
    );

    // Pealkiri olemas
    expect(screen.getByRole("heading", { name: /Notes/i })).toBeDefined();

    // Mõlemad märkmed on ekraanil
    expect(screen.getByText("Esimene test-märge")).toBeDefined();
    expect(screen.getByText("Teine test-märge")).toBeDefined();
  });

  it("peaks kuvama tühja nimekirja, kui märkmeid pole", () => {
    render(
      <NotesView
        notes={[]}
        addNote={mockAddNote}
        deleteNote={mockDeleteNote}
        updateNote={mockUpdateNote}
      />
    );

    // Midagi ei tohi ekraanil olla esimesest märkmest
    const noteElement = screen.queryByText("Esimene test-märge");
    expect(noteElement).toBeNull();
  });
});
