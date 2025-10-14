import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import TodoView from "./TodoView";
import type { Todo } from "./utils";

// Puhasta DOM ja mockid pärast iga testi
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Võltsandmed, mis vastavad Todo tüübile
const mockTodos: Todo[] = [
  { id: 1, title: "Buy milk", created_at: "2023-10-27T10:00:00.000Z" },
  {
    id: 2,
    title: "Write Vitest tests",
    created_at: "2023-10-27T11:00:00.000Z",
  },
];

// Võltsfunktsioonid
const mockAddTodo = vi.fn();
const mockDeleteTodo = vi.fn();
const mockUpdateTodo = vi.fn();

describe("TodoView Component", () => {
  it("should render the TODO list correctly", () => {
    render(
      <TodoView
        todos={mockTodos}
        addTodo={mockAddTodo}
        deleteTodo={mockDeleteTodo}
        updateTodo={mockUpdateTodo}
      />
    );

    // Pealkiri on nähtav
    expect(screen.getByRole("heading", { name: /TODO App/i })).toBeDefined();

    // Mõlemad ülesanded on ekraanil
    expect(screen.getByText("Buy milk")).toBeDefined();
    expect(screen.getByText("Write Vitest tests")).toBeDefined();

    // Kuupäevad on samuti nähtaval (kontrollime, et element eksisteerib, mitte täpset vormingut)
    expect(
      screen.getByText(new Date(mockTodos[0].created_at).toLocaleString())
    ).toBeDefined();
  });

  it("should display an empty list when there are no tasks", () => {
    render(
      <TodoView
        todos={[]}
        addTodo={mockAddTodo}
        deleteTodo={mockDeleteTodo}
        updateTodo={mockUpdateTodo}
      />
    );

    // Otsime elementi, mida ei tohiks olla
    const todoElement = screen.queryByText("Buy milk");
    expect(todoElement).toBeNull();
  });

  it("should render the add task form", () => {
    render(
      <TodoView
        todos={[]}
        addTodo={mockAddTodo}
        deleteTodo={mockDeleteTodo}
        updateTodo={mockUpdateTodo}
      />
    );

    // Kontrollime, et sisendväli ja nupp on olemas
    expect(screen.getByPlaceholderText("Add a new task...")).toBeDefined();
    expect(screen.getByRole("button", { name: /Add/i })).toBeDefined();
  });
});
