// zod/mini: same validation as full zod at a fraction of the bundle size (this runs in the browser too).
import * as z from "zod/mini";

const text = (min: number, max: number, minMsg: string, maxMsg: string) =>
  z.string().check(z.trim(), z.minLength(min, minMsg), z.maxLength(max, maxMsg));

/** Shared by the form (inline validation) and the API route (server validation). */
export const contactSchema = z.object({
  name: text(2, 100, "Please enter your name.", "That name is too long."),
  email: z.string().check(z.trim(), z.maxLength(200, "That email is too long."), z.email("Please enter a valid email address.")),
  company: z.optional(z.string().check(z.trim(), z.maxLength(120, "That is too long."))),
  service: text(1, 120, "Please choose a service.", "Please choose a service."),
  budget: text(1, 120, "Please choose a budget range.", "Please choose a budget range."),
  message: text(20, 5000, "A little more detail helps: at least 20 characters.", "Please keep it under 5,000 characters."),
  // Spam traps: a hidden field humans never fill, and when the form was opened.
  website: z.optional(z.string()),
  startedAt: z.optional(z.number()),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = "name" | "email" | "company" | "service" | "budget" | "message";

/** Field → first error message, from a failed parse. */
export function fieldErrors(error: { issues: readonly { path: readonly PropertyKey[]; message: string }[] }) {
  const out: Partial<Record<ContactField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as ContactField;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
