import type { Service } from "./types";

// Working assumption from the brief: four services. Edit freely; the Home track and
// the Services page both read from this list.
export const services: Service[] = [
  {
    id: "development",
    number: "01",
    title: "Development",
    summary: "Websites, web apps, portals and native apps, built to load fast and stay easy to run.",
    tags: ["Websites", "Web apps & portals", "CMS & e-commerce", "iOS & Android"],
    description:
      "We build marketing sites, customer portals, internal tools and mobile apps. Every project ships with tests, documentation and a handover your team can actually use.",
    deliverables: [
      "Custom websites",
      "Web applications and portals",
      "CMS builds and e-commerce",
      "iOS and Android apps",
      "APIs and integrations",
      "Hosting, monitoring and support",
    ],
    tools: ["Next.js", "React", "TypeScript", "Node.js", "React Native", "Swift", "Kotlin", "PostgreSQL", "Shopify", "Sanity"],
    // Client image
    images: [
      {
        src: "/images/services/development-1.webp",
        srcSmall: "/images/services/development-1-800.webp",
        alt: "A terminal window showing a website project checked out from git and its development server running",
        width: 1400,
        height: 875,
      },
      {
        src: "/images/services/development-2.webp",
        srcSmall: "/images/services/development-2-800.webp",
        alt: "A code editor with an Express API route open and the development server running in the terminal",
        width: 1400,
        height: 875,
      },
    ],
    relatedProject: "freight-portal",
  },
  {
    id: "brand-identity",
    number: "02",
    title: "Brand Identity",
    summary: "Positioning, naming and identity systems that say who you are before anyone reads a word.",
    tags: ["Positioning", "Research", "Naming", "Logo & identity"],
    description:
      "We start with research and positioning, then design the name, mark and system around it: type, colour, voice and the rules that keep it consistent as you grow.",
    deliverables: [
      "Brand research and audits",
      "Positioning and messaging",
      "Naming",
      "Logo and identity systems",
      "Brand guidelines",
    ],
    tools: ["Figma", "Illustrator", "InDesign", "Workshops", "Customer interviews"],
    relatedProject: "restaurant-brand",
  },
  {
    id: "design",
    number: "03",
    title: "Design",
    summary: "Interfaces people understand on first use, plus marketing and print that hold together.",
    tags: ["UI/UX", "Design systems", "Marketing design", "Print"],
    description:
      "We design product interfaces, prototype them, and test them with real users before anything is built. The same team handles the campaign, pitch deck and printed piece.",
    deliverables: [
      "User research and testing",
      "UX flows and wireframes",
      "UI design and prototypes",
      "Design systems",
      "Marketing and campaign design",
      "Print and packaging",
    ],
    tools: ["Figma", "FigJam", "Protopie", "Photoshop", "Illustrator", "InDesign"],
    // Client images
    images: [
      {
        src: "/images/services/design-1.webp",
        srcSmall: "/images/services/design-1-800.webp",
        alt: "An ornate fountain pen and a digital stylus meeting in a burst of orange geometric shards",
        width: 1376,
        height: 768,
      },
      {
        src: "/images/services/design-2.webp",
        srcSmall: "/images/services/design-2-800.webp",
        alt: "Orange and white hand-drawn swirls breaking apart into geometric fragments",
        width: 1400,
        height: 764,
      },
    ],
    relatedProject: "patient-app",
  },
  // Client copy
  {
    id: "it-hardware",
    number: "04",
    title: "IT Hardware Sales",
    summary:
      "We provide high-quality IT hardware from leading global brands, delivering reliable technology solutions for businesses of all sizes.",
    tags: ["Enterprise IT Hardware", "Genuine Technology Products", "Business IT Infrastructure"],
    description:
      "We provide high-quality IT hardware from leading global brands, delivering reliable technology solutions for businesses of all sizes.",
    deliverables: ["Enterprise IT hardware", "Genuine technology products", "Business IT infrastructure"],
    // To add: brands / product categories carried (shown as "Tools & stack"), and a related project.
    tools: [],
  },
];
