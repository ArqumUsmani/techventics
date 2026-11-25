"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { contact } from "@/content/contact";
import { site } from "@/content/site";
import { contactSchema, fieldErrors, type ContactField } from "@/lib/contactSchema";

type Values = Record<ContactField, string>;
type Status = "idle" | "sending" | "success" | "error";

const ORDER: ContactField[] = ["name", "email", "company", "service", "budget", "message"];
const EMPTY: Values = { name: "", email: "", company: "", service: "", budget: "", message: "" };
const MAX_MESSAGE = 5000;

// Live (cPanel static hosting): public/contact.php. `next dev`: app/api/contact/route.dev.ts.
const ENDPOINT = process.env.NODE_ENV === "development" ? "/api/contact" : "/contact.php";

const inputClass =
  "w-full border-b border-steel bg-transparent py-3 text-body text-bone outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-ash focus:border-ember focus:shadow-[0_1px_0_0_#FC5400] focus-visible:outline-none aria-[invalid=true]:border-ember";

function validate(values: Values) {
  const result = contactSchema.safeParse({ ...values, website: "", startedAt: 0 });
  return result.success ? {} : fieldErrors(result.error);
}

export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [sentTo, setSentTo] = useState("");
  const startedAt = useRef(0);
  const form = useRef<HTMLFormElement>(null);
  const success = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const clientErrors = useMemo(() => validate(values), [values]);
  const errorFor = (f: ContactField) => (touched[f] ? (clientErrors[f] ?? serverErrors[f]) : serverErrors[f]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = e.target.name as ContactField;
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (serverErrors[name]) setServerErrors((s) => ({ ...s, [name]: undefined }));
  };
  const onBlur = (e: { target: { name: string } }) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(Object.fromEntries(ORDER.map((f) => [f, true])));
    const first = ORDER.find((f) => clientErrors[f]);
    if (first) {
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("sending");
    setServerMessage("");
    const website = (form.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website, startedAt: startedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSentTo(values.email);
        setStatus("success");
        setValues(EMPTY);
        setTouched({});
        requestAnimationFrame(() => success.current?.focus());
      } else if (res.status === 422 && data.errors) {
        setServerErrors(data.errors);
        setStatus("idle");
        const firstServer = ORDER.find((f) => data.errors[f]);
        if (firstServer) form.current?.querySelector<HTMLElement>(`[name="${firstServer}"]`)?.focus();
      } else {
        setServerMessage(data.error || "Something went wrong. Please try again or email us directly.");
        setStatus("error");
      }
    } catch {
      setServerMessage("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    const [before, after] = contact.form.success.body.split("{email}");
    return (
      <div ref={success} tabIndex={-1} role="status" className="border border-steel bg-graphite p-8 outline-none md:p-12">
        <p className="label text-ember">Message sent</p>
        <h2 className="mt-4 text-h3 text-bone">{contact.form.success.title}</h2>
        <p className="measure mt-4 text-ash">
          {before}
          <span className="text-bone">{sentTo}</span>
          {after}{" "}
          <a href={`mailto:${site.email}`} className="text-bone underline decoration-steel underline-offset-4 hover:decoration-ember">
            {site.email}
          </a>
          .
        </p>
        <Button variant="outline" className="mt-8" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form ref={form} noValidate onSubmit={onSubmit} aria-describedby="form-note" className="relative">
      <p id="form-note" className="label text-ash">
        All fields are required unless marked optional.
      </p>

      <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2">
        <Field id="name" label="Your name" error={errorFor("name")}>
          <input id="name" name="name" type="text" autoComplete="name" value={values.name} onChange={onChange} onBlur={onBlur} className={inputClass} {...a11y("name", errorFor("name"))} />
        </Field>
        <Field id="email" label="Email" error={errorFor("email")}>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={onChange} onBlur={onBlur} className={inputClass} {...a11y("email", errorFor("email"))} />
        </Field>
        <Field id="company" label="Company" optional error={errorFor("company")} className="md:col-span-2">
          <input id="company" name="company" type="text" autoComplete="organization" value={values.company} onChange={onChange} onBlur={onBlur} className={inputClass} {...a11y("company", errorFor("company"))} />
        </Field>
        <Field id="service" label="What do you need?" error={errorFor("service")}>
          <Select id="service" value={values.service} onChange={onChange} onBlur={onBlur} options={contact.form.serviceOptions} error={errorFor("service")} />
        </Field>
        <Field id="budget" label="Budget range" error={errorFor("budget")}>
          <Select id="budget" value={values.budget} onChange={onChange} onBlur={onBlur} options={contact.form.budgetOptions} error={errorFor("budget")} />
        </Field>
        <Field
          id="message"
          label="Tell us about the project"
          error={errorFor("message")}
          className="md:col-span-2"
          aside={
            <span className={`label tabular-nums ${values.message.length > MAX_MESSAGE ? "text-ember" : "text-ash"}`}>
              {values.message.length.toLocaleString()} / {MAX_MESSAGE.toLocaleString()}
            </span>
          }
        >
          <textarea
            id="message"
            name="message"
            rows={6}
            value={values.message}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="What are you making, where is it now, and when does it need to ship?"
            className={`${inputClass} resize-y`}
            {...a11y("message", errorFor("message"))}
          />
        </Field>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="mt-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Button type="submit" disabled={status === "sending"} className="h-14 px-9 disabled:opacity-60">
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>
        <div aria-live="polite" className="text-small text-ember">
          {status === "error" && (
            <>
              {serverMessage}{" "}
              <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                {site.email}
              </a>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

function a11y(id: string, error?: string) {
  return { "aria-invalid": error ? true : undefined, "aria-describedby": error ? `${id}-error` : undefined };
}

function Field({
  id,
  label,
  optional,
  error,
  className = "",
  aside,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  className?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="label text-ash">
          {label}
          {optional && <span className="ml-2 normal-case tracking-normal text-ash">(optional)</span>}
        </label>
        {aside}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-small text-ember">
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  id,
  value,
  options,
  error,
  onChange,
  onBlur,
}: {
  id: ContactField;
  value: string;
  options: string[];
  error?: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onBlur: (e: { target: { name: string } }) => void;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${inputClass} cursor-pointer appearance-none bg-ink pr-8 ${value ? "" : "text-ash"}`}
        {...a11y(id, error)}
      >
        <option value="" disabled>
          Choose one
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="text-bone">
            {o}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-ash">
        ↓
      </span>
    </div>
  );
}
