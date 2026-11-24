import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, ButtonLink, TextLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

/* Dev-only design-token specimen. 404s in production; removed in step 7. */

export const metadata: Metadata = { title: "Lab", robots: { index: false, follow: false } };

const swatches = [
  { name: "ember", hex: "#FC5400", cls: "bg-ember", text: "text-ink" },
  { name: "flare", hex: "#FF7A1F", cls: "bg-flare", text: "text-ink" },
  { name: "burnt", hex: "#E04808", cls: "bg-burnt", text: "text-ink" },
  { name: "ink", hex: "#0B0B0B", cls: "bg-ink border border-steel", text: "text-bone" },
  { name: "graphite", hex: "#181818", cls: "bg-graphite", text: "text-bone" },
  { name: "steel", hex: "#303030", cls: "bg-steel", text: "text-bone" },
  { name: "bone", hex: "#F6F1EA", cls: "bg-bone", text: "text-ink" },
  { name: "ash", hex: "#8A8580", cls: "bg-ash", text: "text-ink" },
];

const scale = [
  { token: "text-hero", sample: "What's next.", cls: "font-display text-hero font-bold uppercase" },
  { token: "text-h1", sample: "We engineer products", cls: "font-display text-h1" },
  { token: "text-h2", sample: "From first sketch to launch day", cls: "font-display text-h2" },
  { token: "text-h3", sample: "Brand identity systems", cls: "font-display text-h3" },
  { token: "text-h4", sample: "Custom web apps and portals", cls: "font-display text-h4" },
  { token: "text-lead", sample: "Web, mobile, brand and motion, from Karachi, London and New York.", cls: "text-lead" },
  {
    token: "text-body",
    sample:
      "Body copy is Satoshi at 17 to 18px with a 1.6 line height. Lines stop at about 68 characters so paragraphs stay comfortable to read on wide screens.",
    cls: "text-body measure",
  },
  { token: "label", sample: "01 / Development · 240+ projects", cls: "label" },
];

export default function LabPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="container-x pb-32 pt-[calc(var(--spacing-header)+4rem)]">
      <Eyebrow index="00">Design tokens</Eyebrow>

      <h2 className="label mt-16 text-ash">Palette</h2>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {swatches.map((s) => (
          <li key={s.name} className={`flex aspect-[3/4] flex-col justify-end p-3 ${s.cls} ${s.text}`}>
            <span className="label">{s.name}</span>
            <span className="label opacity-70">{s.hex}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 h-3 bg-linear-to-r from-burnt via-ember to-flare" aria-hidden />

      <h2 className="label mt-20 text-ash">Type scale</h2>
      <div className="mt-6 divide-y divide-steel border-y border-steel">
        {scale.map((row) => (
          <div key={row.token} className="grid grid-cols-1 gap-4 py-8 md:grid-cols-[10rem_1fr]">
            <span className="label text-ash">{row.token}</span>
            <p className={`${row.cls} text-bone`}>{row.sample}</p>
          </div>
        ))}
      </div>

      <h2 className="label mt-20 text-ash">Weights</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <p className="font-display text-h3">
          <span className="font-medium">Clash 500</span> <span className="font-semibold">600</span>{" "}
          <span className="font-bold">700</span>
        </p>
        <p className="text-lead">
          <span className="font-normal">Satoshi 400</span> <span className="font-medium">500</span>{" "}
          <span className="font-bold">700</span>
        </p>
        <p className="font-mono text-lead">
          <span className="font-normal">Mono 400</span> <span className="font-medium">500</span>
        </p>
      </div>

      <h2 className="label mt-20 text-ash">Actions</h2>
      <div className="mt-6 flex flex-wrap items-center gap-8">
        <ButtonLink href="/contact">Start a project</ButtonLink>
        <Button variant="outline">Outline</Button>
        <TextLink href="#">See our work</TextLink>
      </div>
    </div>
  );
}
