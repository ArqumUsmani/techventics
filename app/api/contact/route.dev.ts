import { NextResponse } from "next/server";
import { contactSchema, fieldErrors } from "@/lib/contactSchema";

/*
 * DEV ONLY (`next dev`): local stand-in for public/contact.php, which handles the form on
 * the live cPanel site. Same validation and spam checks; logs the enquiry instead of
 * emailing it. Not part of the production export.
 */
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
  if (website || (startedAt && Date.now() - startedAt < 2500)) return NextResponse.json({ ok: true });
  console.info("[contact:dev] Would email this enquiry (contact.php sends it on the live site):\n", enquiry);
  return NextResponse.json({ ok: true });
}
