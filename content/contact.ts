import { services } from "./services";

export const contact = {
  hero: {
    eyebrow: "Contact",
    title: "Tell us what you’re building.",
    body: "A few details are enough to start. We read every message and reply with questions, not a sales pitch.",
  },
  form: {
    serviceOptions: [...services.map((s) => s.title), "Not sure yet"],
    // SAMPLE ranges: confirm currency and bands with the client.
    budgetOptions: ["Under $5k", "$5k – $15k", "$15k – $50k", "$50k +", "Not sure yet"],
    success: {
      title: "Thanks, we have your message.",
      body: "We will reply to {email} soon. If it is urgent, write to us directly at",
    },
  },
  details: {
    company: "Techventics",
    hq: {
      label: "Head office",
      lines: ["Suite # 508, 5th Floor", "Shayan Iconic Towers", "Shaheed e Millat Rd, Karachi"],
    },
    note: "Offices in the USA, UK and Pakistan.",
  },
  map: {
    query: "Shayan Iconic Towers, Shaheed e Millat Road, Karachi",
  },
};
