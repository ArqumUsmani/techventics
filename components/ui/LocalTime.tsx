"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Live local time for an office (Intl.DateTimeFormat with the office's IANA zone).
 * Renders a neutral placeholder on the server, then ticks every second on the client.
 */
export function LocalTime({ timeZone, className = "", stacked = false }: { timeZone: string; className?: string; stacked?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const fmt = useMemo(
    () => ({
      time: new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }),
      day: new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short" }),
      offset: new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "shortOffset" }),
    }),
    [timeZone],
  );

  const [hh, mm] = now ? fmt.time.format(now).split(":") : ["--", "--"];
  const day = now ? fmt.day.format(now) : "";
  const offset = now ? (fmt.offset.formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "") : "";
  const blink = now ? now.getSeconds() % 2 === 0 : true;

  return (
    <span className={className}>
      <time dateTime={now?.toISOString()} className="font-mono tabular-nums">
        {hh}
        <span className={blink ? "opacity-100" : "opacity-30"}>:</span>
        {mm}
      </time>
      <span className={stacked ? "label mt-1 block text-ash" : "label ml-3 align-middle text-ash"}>
        {day} {offset}
      </span>
    </span>
  );
}
