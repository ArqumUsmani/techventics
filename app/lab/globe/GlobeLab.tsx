"use client";

import { useCallback, useEffect, useState } from "react";
import { GlobeStage } from "@/components/three/GlobeStage";
import { offices } from "@/content/offices";

export function GlobeLab() {
  const [capture, setCapture] = useState(false);
  useEffect(() => setCapture(new URLSearchParams(window.location.search).get("capture") === "1"), []);
  const onStatus = useCallback((live: boolean) => {
    document.documentElement.dataset.globeLive = String(live);
  }, []);

  return (
    <section className={capture ? "fixed inset-0 z-[200] flex items-center justify-center bg-ink" : "container-x pb-24 pt-40"}>
      <GlobeStage
        offices={offices}
        hubId="karachi"
        tier={capture ? "high" : undefined}
        interactive={!capture}
        onStatus={onStatus}
        priority
        className={capture ? "h-screen" : "mx-auto max-w-[34rem]"}
      />
    </section>
  );
}
