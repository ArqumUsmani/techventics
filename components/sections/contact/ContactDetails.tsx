import { LocalTime } from "@/components/ui/LocalTime";
import { contact } from "@/content/contact";
import { offices } from "@/content/offices";
import { site } from "@/content/site";

/** Right-hand column of the Contact page: company, head office, email and city cards. */
export function ContactDetails() {
  const { company, hq, note } = contact.details;
  return (
    <div className="space-y-12">
      <div>
        <p className="label text-ash">{hq.label}</p>
        <p className="mt-4 font-display text-h4 text-bone">{company}</p>
        <address className="mt-3 not-italic text-ash">
          {hq.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
      </div>

      <div>
        <p className="label text-ash">Email</p>
        <a
          href={`mailto:${site.email}`}
          className="mt-4 inline-block font-display text-h4 text-bone underline decoration-steel decoration-1 underline-offset-[0.25em] transition-colors duration-400 hover:decoration-ember"
        >
          {site.email}
        </a>
      </div>

      <div>
        <p className="label text-ash">{note}</p>
        <ul className="mt-4 border-t border-steel">
          {offices.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-4 border-b border-steel py-4">
              <span>
                <span className="block text-bone">{o.city}</span>
                <span className="label text-ash">
                  {o.country}
                  {o.isHeadquarters && <span className="ml-2 text-ember">HQ</span>}
                  {!o.address && <span className="ml-2">· address to come</span>}
                </span>
              </span>
              <LocalTime timeZone={o.timeZone} stacked className="shrink-0 text-right text-small text-bone" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
