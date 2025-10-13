// lib/hooks/useNotes.test.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useNotes } from "./useNotes";

// Kergeresponse tüübi kirjeldus (vältimaks any)
interface ResponseLike {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

function createJsonResponse(data: unknown, status = 200): ResponseLike {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useNotes Hook", () => {
  it("should load notes on initial render", async () => {
    const initialNotes = [{ id: 1, title: "First" }];

    // initial GET /api/notes (ilma init-argumendita)
    fetchMock.mockResolvedValueOnce(createJsonResponse(initialNotes));

    const { result } = renderHook(() => useNotes());

    await waitFor(() => expect(result.current.notes).toEqual(initialNotes));
    // Kontrolli ainult URL-i, sest init puudub
    expect(fetchMock).toHaveBeenCalledWith("/api/notes");
  });

  it("should add a new note to the list", async () => {
    const initialNotes = [{ id: 1, title: "First" }];
    const newNote = { id: 2, title: "New" };

    // GET
    fetchMock.mockResolvedValueOnce(createJsonResponse(initialNotes));
    // POST
    fetchMock.mockResolvedValueOnce(createJsonResponse(newNote, 201));

    const { result } = renderHook(() => useNotes());
    await waitFor(() => expect(result.current.notes).toEqual(initialNotes));

    await act(async () => {
      await result.current.addNote("New");
    });

    // Hook lisab ettepoole → oota vastavalt
    expect(result.current.notes).toEqual([newNote, ...initialNotes]);

    const [, postCall] = fetchMock.mock.calls;
    expect(postCall[0]).toBe("/api/notes");
    expect((postCall[1] as RequestInit).method).toBe("POST");
  });

  it("should delete a note from the list", async () => {
    const initialNotes = [{ id: 7, title: "Note to be deleted" }];

    // GET
    fetchMock.mockResolvedValueOnce(createJsonResponse(initialNotes));
    // DELETE
    fetchMock.mockResolvedValueOnce(createJsonResponse({}, 204));

    const { result } = renderHook(() => useNotes());
    await waitFor(() => expect(result.current.notes).toEqual(initialNotes));

    await act(async () => {
      await result.current.deleteNote(7);
    });

    expect(result.current.notes).toEqual([]);

    const [, deleteCall] = fetchMock.mock.calls;
    expect(deleteCall[0]).toMatch(/\/api\/notes/);
    expect((deleteCall[1] as RequestInit).method).toBe("DELETE");
  });

  it("should update a note's title in the list", async () => {
    const initialNotes = [{ id: 1, title: "Old title" }];
    const updated = { id: 1, title: "New title" };

    // GET
    fetchMock.mockResolvedValueOnce(createJsonResponse(initialNotes));
    // PATCH (hook kasutab PATCH-i)
    fetchMock.mockResolvedValueOnce(createJsonResponse(updated));

    const { result } = renderHook(() => useNotes());
    await waitFor(() => expect(result.current.notes).toEqual(initialNotes));

    await act(async () => {
      await result.current.updateNote(1, "New title");
    });

    expect(result.current.notes).toEqual([updated]);

    const [, patchCall] = fetchMock.mock.calls;
    expect(patchCall[0]).toMatch(/\/api\/notes/);
    expect((patchCall[1] as RequestInit).method).toBe("PATCH");
  });
});

