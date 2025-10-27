"use client";
import { useEffect, useState } from "react";

export default function CatFactClient() {
  const [fact, setFact] = useState("");
  const [loading, setLoading] = useState(false);

  async function getFact() {
    setLoading(true);
    const res = await fetch("https://catfact.ninja/fact");
    if (res.ok) {
      const data = await res.json();
      setFact(data.fact);
    }
    setLoading(false);
  }

  useEffect(() => {
    getFact();
  }, []);

  return (
    <section className="p-4 space-y-3">
      <h2 className="text-xl font-semibold">Client-side Fetch (Cat Fact)</h2>
      <button
        onClick={getFact}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
      >
        {loading ? "Loading..." : "New Cat Fact"}
      </button>

      {fact && <p className="italic">{fact}</p>}
    </section>
  );
}
