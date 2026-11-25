import { z } from "zod";

/** Shared by the form (inline validation) and the API route (server validation). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100, "That name is too long."),
  email: z.email("Please enter a valid email address.").trim().max(200),
  company: z.string().trim().max(120, "That is too long.").optional().or(z.literal("")),
  service: z.string().trim().min(1, "Please choose a service."),
  budget: z.string().trim().min(1, "Please choose a budget range."),
  message: z
    .string()
    .trim()
    .min(20, "A little more detail helps: at least 20 characters.")
    .max(5000, "Please keep it under 5,000 characters."),
  // Spam traps: a hidden field humans never fill, and when the form was opened.
  website: z.string().optional(),
  startedAt: z.number().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = "name" | "email" | "company" | "service" | "budget" | "message";

/** Field → first error message, from a failed parse. */
export function fieldErrors(error: z.ZodError): Partial<Record<ContactField, string>> {
  const out: Partial<Record<ContactField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as ContactField;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
