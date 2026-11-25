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
    relatedProject: "patient-app",
  },
  {
    id: "motion-video",
    number: "04",
    title: "Motion & Video",
    summary: "Explainers, brand animation and product motion that make complicated things look simple.",
    tags: ["Explainer videos", "Brand animation", "Product motion"],
    description:
      "From a 60-second explainer to the micro-interactions in your app, we script, design and animate motion that explains the product and fits the brand.",
    deliverables: [
      "Explainer and launch videos",
      "Brand animation and logo motion",
      "Product and UI motion",
      "Social and campaign cut-downs",
    ],
    tools: ["After Effects", "Cinema 4D", "Blender", "Premiere Pro", "Lottie", "Rive"],
    relatedProject: "explainer-film",
  },
];
