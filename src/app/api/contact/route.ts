import { profile } from "@/content/profile";

/*
 * Contact form delivery via Resend. The key stays on the server
 * (RESEND_API_KEY). Input is re-validated here; a honeypot field and a small
 * per-IP rate limit keep casual spam out.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const trap = String(body.company ?? "");

  // Bots fill the hidden field; pretend it worked.
  if (trap) return Response.json({ ok: true });

  const errors: Record<string, string> = {};
  if (!name || name.length > 100) errors.name = "invalid";
  if (!EMAIL.test(email) || email.length > 200) errors.email = "invalid";
  if (message.length < 10 || message.length > 5000) errors.message = "invalid";
  if (Object.keys(errors).length)
    return Response.json({ error: "validation", errors }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return Response.json({ error: "not_configured" }, { status: 503 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Portfolio <onboarding@resend.dev>",
      to: [profile.email],
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\n${name} <${email}>`,
    }),
  });

  if (!res.ok) return Response.json({ error: "send_failed" }, { status: 502 });
  return Response.json({ ok: true });
}
