// Home page copy. Section order and components live in app/page.tsx.

export const home = {
  intro: {
    eyebrow: "Techventics",
    headline: ["We engineer", "what’s next."],
    /** Word in the headline shown in ember. */
    accent: "next.",
    subline: "Web, mobile, brand and motion, from Karachi, London and New York.",
    primaryCta: { label: "Start a project", href: "/contact" },
    secondaryCta: { label: "See our work", href: "#work" },
  },
  manifesto: {
    eyebrow: "Manifesto",
    // Words wrapped in *asterisks* light up in ember instead of bone.
    text: "We design and build digital products that move businesses *forward,* from the first sketch to launch day and every release after it.",
  },
  services: {
    eyebrow: "What we do",
    big: "Services",
    title: "Four disciplines, one team.",
  },
  work: {
    eyebrow: "Selected work",
    big: "Work",
    title: "Recent projects.",
  },
  numbers: {
    eyebrow: "In numbers",
  },
  process: {
    eyebrow: "How we work",
    big: "Process",
    title: "Four steps, no surprises.",
  },
  presence: {
    eyebrow: "Global presence",
    big: "Global",
    title: "Three offices, one schedule.",
    body: "Karachi, London and New York cover most of the working day between them, so someone on the team is usually awake when you need an answer.",
  },
  closing: {
    eyebrow: "Start a project",
    headline: ["Let’s build", "something."],
    body: "Tell us what you are making, where it is now and when it needs to ship. We will come back with questions and a plan.",
    cta: { label: "Start a project", href: "/contact" },
  },
};
