// lib/hooks/useContacts.test.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useContacts } from "./useContacts";

// Kergem ResponseLike abityüp (vältimaks any)
interface ResponseLike {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

// Abifunktsioon mokitud JSON-vastuse loomiseks
function createJsonResponse(data: unknown, status = 200): ResponseLike {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  // Asendame globaalse fetchi mokiga
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  // Taasta globaalsed mokid
  vi.restoreAllMocks();
});

describe("useContacts hook", () => {
  it("loads contacts on initial render", async () => {
    const initial = [{ id: 1, name: "Liis", phone: "123", created_at: "x" }];

    // Esmane GET /api/contacts (hook kasutab { cache: 'no-store' })
    fetchMock.mockResolvedValueOnce(createJsonResponse(initial));

    const { result } = renderHook(() => useContacts());

    // Ootame kuni andmed on laetud
    await waitFor(() => expect(result.current.contacts).toEqual(initial));
    expect(result.current.isLoading).toBe(false);

    // Kontrollime nii URL-i kui init-objekti
    expect(fetchMock).toHaveBeenCalledWith("/api/contacts", { cache: "no-store" });
  });

  it("addContact -> POST then reloads list (GET)", async () => {
    const initial = [{ id: 1, name: "Liis", phone: "123", created_at: "x" }];
    const reloaded = [
      { id: 1, name: "Liis", phone: "123", created_at: "x" },
      { id: 2, name: "Mati", phone: "555", created_at: "y" },
    ];

    // Esmane GET
    fetchMock.mockResolvedValueOnce(createJsonResponse(initial));
    const { result } = renderHook(() => useContacts());
    await waitFor(() => expect(result.current.contacts).toEqual(initial));

    // POST (201) + seejärel reload GET
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({}, 201))   // POST /api/contacts
      .mockResolvedValueOnce(createJsonResponse(reloaded)); // GET /api/contacts (reload)

    await act(async () => {
      const ok = await result.current.addContact("Mati", "555");
      expect(ok).toBe(true);
    });

    await waitFor(() => expect(result.current.contacts).toEqual(reloaded));

    // Kontrollime, et POST tehti õigesse endpointi
    const postCall = fetchMock.mock.calls.find(
      (c) => c[0] === "/api/contacts" && (c[1] as RequestInit)?.method === "POST"
    );
    expect(postCall).toBeTruthy();
  });

  it("deleteContact -> DELETE then reloads list (GET)", async () => {
    const initial = [{ id: 7, name: "To delete", phone: "000", created_at: "t" }];

    // Esmane GET
    fetchMock.mockResolvedValueOnce(createJsonResponse(initial));
    const { result } = renderHook(() => useContacts());
    await waitFor(() => expect(result.current.contacts).toEqual(initial));

    // DELETE (204) + reload GET (tühi list)
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({}, 204))   // DELETE /api/contacts/7
      .mockResolvedValueOnce(createJsonResponse([]));       // GET /api/contacts (reload)

    await act(async () => {
      await result.current.deleteContact(7);
    });

    await waitFor(() => expect(result.current.contacts).toEqual([]));

    // Kontrollime, et DELETE kutse käis õigele id-le
    const delCall = fetchMock.mock.calls.find(
      (c) => typeof c[0] === "string" && c[0].includes("/api/contacts/7")
    );
    expect((delCall?.[1] as RequestInit).method).toBe("DELETE");
  });

  it("updateContact -> PATCH then reloads list (GET)", async () => {
    const initial = [{ id: 1, name: "Old", phone: "111", created_at: "x" }];
    const reloaded = [{ id: 1, name: "New", phone: "222", created_at: "x" }];

    // Esmane GET
    fetchMock.mockResolvedValueOnce(createJsonResponse(initial));
    const { result } = renderHook(() => useContacts());
    await waitFor(() => expect(result.current.contacts).toEqual(initial));

    // PATCH (200) + reload GET
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({}, 200))   // PATCH /api/contacts/1
      .mockResolvedValueOnce(createJsonResponse(reloaded)); // GET /api/contacts (reload)

    await act(async () => {
      await result.current.updateContact(1, "New", "222");
    });

    await waitFor(() => expect(result.current.contacts).toEqual(reloaded));

    // Kontrollime, et PATCH tehti õigele id-le
    const patchCall = fetchMock.mock.calls.find(
      (c) => typeof c[0] === "string" && c[0].includes("/api/contacts/1")
    );
    expect((patchCall?.[1] as RequestInit).method).toBe("PATCH");
  });
});
