export type Todo = {
  id: number;
  title: string;
  created_at: string;
};

// loome tüübikontrolli funktsiooni
export function isTodoArray(u: unknown): u is Todo[] {
  return (
    Array.isArray(u) &&
    u.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as Todo).id === "number" &&
        typeof (item as Todo).title === "string" &&
        typeof (item as Todo).created_at === "string"
    )
  );
}