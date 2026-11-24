"use client";

/* Single place where GSAP plugins are registered. Import gsap from here, never from "gsap" directly. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.6 });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
