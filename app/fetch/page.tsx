export default async function Page() {
  const res = await fetch("https://catfact.ninja/fact", { cache: "no-store" });

  const data: { fact: string; length: number } = await res.json();

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Server-side fetch (Cat Fact)</h1>
      <p className="italic">{data.fact}</p>
      <small>Length: {data.length}</small>
    </main>
  );
}
