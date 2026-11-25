"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { site } from "@/content/site";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

/** Pages without a [data-hero] section switch to the sticky bar after this many px. */
const DEFAULT_THRESHOLD = 320;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Scroll position after which the sticky bar shows: the bottom of the page's hero. */
function stickyThreshold() {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero) return DEFAULT_THRESHOLD;
  const rect = hero.getBoundingClientRect();
  return Math.max(DEFAULT_THRESHOLD, rect.bottom + window.scrollY - 64);
}

/**
 * Site header, matched to the reference:
 * - Sits at the top of the page over the hero (transparent) and scrolls away with it.
 * - Once the hero has scrolled past, it becomes a solid ink bar fixed to the top that
 *   slides down, with the logo shrinking 125px → 50px.
 * - ≤991px: hamburger opens a full-width ink dropdown under the bar, links centred at 19px.
 */
export function Header() {
  const pathname = usePathname();
  const [sticky, setSticky] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    let threshold = stickyThreshold();
    const onScroll = () => setSticky(window.scrollY > threshold);
    const onResize = () => {
      threshold = stickyThreshold();
      onScroll();
    };
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [pathname]);

  // Close the menu on Escape and when the viewport grows past the mobile breakpoint.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 62rem)");
    const onMq = () => {
      if (mq.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  const close = () => setOpen(false);
  const solid = sticky || open;

  return (
    <header
      data-sticky={sticky || undefined}
      className={`inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-400 ease-out-cubic ${
        sticky ? "fixed animate-header-in" : "absolute"
      } ${solid ? "border-steel/70 bg-ink" : "border-transparent bg-transparent"}`}
    >
      <div
        className={`container-x flex items-center justify-between transition-[height] duration-400 ease-out-expo ${
          sticky ? "h-header-compact" : "h-header"
        }`}
      >
        <Link
          href="/"
          onClick={close}
          aria-label={`${site.name} home`}
          className={`block shrink-0 transition-[width] duration-400 ease-out-expo ${sticky ? "w-[50px]" : "w-[125px]"}`}
        >
          <Logo compact={sticky} />
        </Link>

        <nav aria-label="Primary" className="hidden nav:block">
          <ul className="flex items-center">
            {site.nav.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href} label={item.label} active={isActive(pathname, item.href)} />
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="relative -mr-2 flex size-11 items-center justify-center nav:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden className="relative block h-3 w-6">
            <span
              className={`absolute left-0 h-[2px] w-6 bg-bone transition-transform duration-400 ease-out-expo ${
                open ? "top-[5px] rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 h-[2px] bg-bone transition-[transform,width] duration-400 ease-out-expo ${
                open ? "top-[5px] w-6 -rotate-45" : "top-[10px] w-4"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        id={menuId}
        inert={!open}
        className={`grid bg-ink transition-[grid-template-rows] duration-400 ease-out-expo nav:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <nav aria-label="Mobile" className="border-t border-steel/70 py-6">
            <ul className="flex flex-col items-center">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <NavLink
                    variant="mobile"
                    href={item.href}
                    label={item.label}
                    active={isActive(pathname, item.href)}
                    onNavigate={close}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
