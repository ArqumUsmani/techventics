import Link from "next/link";

type NavLinkProps = {
  href: string;
  label: string;
  active: boolean;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

/**
 * Header link. Desktop: uppercase, `padding: 0 1rem`, 2px ember underline that grows
 * 0 → 35px on hover/focus and stays at 35px on the current page.
 */
export function NavLink({ href, label, active, variant = "desktop", onNavigate }: NavLinkProps) {
  if (variant === "mobile") {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`group relative inline-flex flex-col items-center py-3 font-mono text-[19px] uppercase tracking-[0.08em] transition-colors duration-400 ease-out-cubic ${
          active ? "text-bone" : "text-bone/75 hover:text-bone"
        }`}
      >
        {label}
        <span
          aria-hidden
          className={`mt-1 h-[2px] bg-ember transition-[width] duration-400 ease-out-expo ${
            active ? "w-[35px]" : "w-0 group-hover:w-[35px] group-focus-visible:w-[35px]"
          }`}
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group relative inline-flex items-center px-4 py-2 label transition-colors duration-400 ease-out-cubic ${
        active ? "text-bone" : "text-bone/75 hover:text-bone"
      }`}
    >
      {label}
      <span
        aria-hidden
        className={`absolute bottom-0 left-4 h-[2px] bg-ember transition-[width] duration-400 ease-out-expo ${
          active ? "w-[35px]" : "w-0 group-hover:w-[35px] group-focus-visible:w-[35px]"
        }`}
      />
    </Link>
  );
}
