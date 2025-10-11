export function absUrl(path: string) {
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    vercel ||
    "http://localhost:3000";
  return `${base}${path}`;
}
