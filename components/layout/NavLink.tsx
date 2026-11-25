import Link from "next/link";

type NavLinkProps = {
  href: string;
  label: string;
  active: boolean;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

/**
 * Header link, matched to the reference: uppercase, `padding: 0 1rem`, and a 2px ember
 * line that sits to the LEFT of the label, vertically centred. It grows 0 → 35px on
 * hover/focus and stays at 35px on the current page. Positioned absolutely so the
 * label never shifts.
 */
export function NavLink({ href, label, active, variant = "desktop", onNavigate }: NavLinkProps) {
  const line = `pointer-events-none absolute top-1/2 h-[2px] -translate-y-1/2 bg-ember transition-[width] duration-400 ease-out-expo ${
    active ? "w-[35px]" : "w-0 group-hover:w-[35px] group-focus-visible:w-[35px]"
  }`;

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`group relative inline-flex items-center px-4 py-3 font-mono text-[19px] uppercase tracking-[0.08em] transition-colors duration-400 ease-out-cubic ${
          active ? "text-bone" : "text-bone/75 hover:text-bone"
        }`}
      >
        <span className="relative">
          <span aria-hidden className={`${line} right-[calc(100%+10px)]`} />
          {label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group relative inline-flex items-center px-6 py-2 label transition-colors duration-400 ease-out-cubic ${
        active ? "text-bone" : "text-bone/75 hover:text-bone"
      }`}
    >
      <span className="relative">
        <span aria-hidden className={`${line} right-[calc(100%+8px)]`} />
        {label}
      </span>
    </Link>
  );
}
