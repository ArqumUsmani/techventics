import { LocalTime } from "@/components/ui/LocalTime";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { about } from "@/content/about";
import { offices } from "@/content/offices";

// HQ card wide, the other two narrower: asymmetric rather than three equal cards.
const SPAN = ["lg:col-span-6", "lg:col-span-3", "lg:col-span-3"];

/** Office cards with live local time per city. */
export function Offices() {
  const { eyebrow, big, title } = about.offices;
  return (
    <section aria-labelledby="offices-title" className="relative overflow-x-clip py-24 md:py-32">
      <div className="container-x">
        <SectionHeader id="offices-title" index="05" eyebrow={eyebrow} big={big} title={title} />

        <ul className="mt-16 grid gap-6 md:mt-24 md:grid-cols-2 lg:grid-cols-12">
          {offices.map((office, i) => (
            <li
              key={office.id}
              className={`flex min-h-[22rem] flex-col justify-between border border-steel bg-graphite p-7 md:p-9 ${SPAN[i] ?? "lg:col-span-4"} ${
                i === 0 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="label text-ash">{office.country}</p>
                {office.isHeadquarters && <p className="label text-ember">Head office</p>}
              </div>

              <div className="mt-12">
                <h3 className={`text-bone ${i === 0 ? "text-h2" : "text-h3"}`}>{office.city}</h3>
                <LocalTime timeZone={office.timeZone} className="mt-4 block text-h4 text-bone" />
                <address className="mt-6 text-small not-italic text-ash">
                  {office.address ? (
                    office.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))
                  ) : (
                    <span className="label border border-dashed border-steel px-2 py-1">Address to be confirmed</span>
                  )}
                </address>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
