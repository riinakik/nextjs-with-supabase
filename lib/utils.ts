import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

export type Note = { id: number; title: string };

export function isNoteArray(u: unknown): u is Note[] {
  return (
    Array.isArray(u) &&
    u.every(
      (n) =>
        n &&
        typeof n === "object" &&
        typeof (n as { id: unknown }).id === "number" &&
        typeof (n as { title: unknown }).title === "string"
    )
  );
}
