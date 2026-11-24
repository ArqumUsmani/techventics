"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { site } from "@/content/site";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

const SCROLL_THRESHOLD = 40;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Site header.
 * - Transparent over the hero; solid ink once the page scrolls (or the mobile menu opens).
 * - Logo box animates 125px → 50px wide in the compact state.
 * - ≤991px: hamburger opens a full-width ink dropdown under the bar, links centered at 19px.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const compact = scrolled;
  const solid = scrolled || open;
  const close = () => setOpen(false);

  return (
    <header
      data-solid={solid || undefined}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-400 ease-out-cubic ${
        solid ? "border-steel/70 bg-ink" : "border-transparent bg-transparent"
      }`}
    >
      <div
        className={`container-x flex items-center justify-between transition-[height] duration-400 ease-out-expo ${
          compact ? "h-header-compact" : "h-header"
        }`}
      >
        <Link
          href="/"
          onClick={close}
          aria-label={`${site.name} home`}
          className={`block shrink-0 transition-[width] duration-400 ease-out-expo ${
            compact ? "w-[50px]" : "w-[125px]"
          }`}
        >
          <Logo compact={compact} />
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
