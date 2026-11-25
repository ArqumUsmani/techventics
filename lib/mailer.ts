import nodemailer from "nodemailer";
import { Resend } from "resend";
import type { ContactInput } from "./contactSchema";

/*
 * Sends a contact enquiry. Transport is chosen from environment variables:
 *   1. SMTP (e.g. the cPanel mailbox): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *   2. Resend: RESEND_API_KEY
 * If neither is set, development logs the message instead of sending; production fails.
 * Server-only: never import this from a client component.
 */

type Enquiry = Omit<ContactInput, "website" | "startedAt">;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function compose(e: Enquiry) {
  const subject = `New enquiry: ${e.name}${e.company ? ` (${e.company})` : ""} · ${e.service}`;
  const rows: [string, string][] = [
    ["Name", e.name],
    ["Email", e.email],
    ["Company", e.company || "—"],
    ["Service", e.service],
    ["Budget", e.budget],
  ];
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nMessage:\n${e.message}\n\n— Sent from the contact form on techventics.com`;
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#0B0B0B;max-width:600px">
      <h2 style="margin:0 0 16px;font-size:18px">New project enquiry</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows.map(([k, v]) => `<tr><td style="color:#666;padding-right:16px">${k}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`).join("")}
      </table>
      <p style="margin:20px 0 6px;color:#666">Message</p>
      <p style="white-space:pre-wrap;margin:0">${escapeHtml(e.message)}</p>
      <p style="margin-top:24px;color:#999;font-size:12px">Sent from the contact form on techventics.com. Reply to this email to answer ${escapeHtml(e.name)} directly.</p>
    </div>`;
  return { subject, text, html };
}

export type SendResult = { delivered: boolean; via: "smtp" | "resend" | "log" };

export async function sendEnquiry(enquiry: Enquiry): Promise<SendResult> {
  const to = process.env.CONTACT_TO_EMAIL || "Info@techventics.com";
  const { subject, text, html } = compose(enquiry);
  const replyTo = `${enquiry.name} <${enquiry.email}>`;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT || 465);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = SSL; 587 = STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    // cPanel servers usually require the From address to be the authenticated mailbox.
    const from = process.env.CONTACT_FROM_EMAIL || `Techventics Website <${process.env.SMTP_USER}>`;
    await transport.sendMail({ from, to, replyTo, subject, text, html });
    return { delivered: true, via: "smtp" };
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.CONTACT_FROM_EMAIL || "Techventics Website <onboarding@resend.dev>";
    const { error } = await resend.emails.send({ from, to, replyTo, subject, text, html });
    if (error) throw new Error(`Resend: ${error.message}`);
    return { delivered: true, via: "resend" };
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(`[contact] No mail transport configured. Would send to ${to}:\n${subject}\n${text}`);
    return { delivered: false, via: "log" };
  }

  throw new Error("No mail transport configured (set SMTP_* or RESEND_API_KEY).");
}
