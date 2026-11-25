import { NextResponse } from "next/server";
import { contactSchema, fieldErrors } from "@/lib/contactSchema";
import { sendEnquiry } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_MS = 2500; // faster than this is almost certainly a bot
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

// Best-effort rate limit per IP. Serverless instances don't share memory, so this
// only slows down bursts; the honeypot and timing check do most of the work.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  }

  const { website, startedAt, ...enquiry } = parsed.data;

  // Spam: pretend success so bots learn nothing.
  if (website || (startedAt && Date.now() - startedAt < MIN_FILL_MS)) {
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }

  try {
    await sendEnquiry(enquiry);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, error: "We couldn't send your message just now. Please email us directly." },
      { status: 502 },
    );
  }
}
