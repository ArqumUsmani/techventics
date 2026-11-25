import Link from "next/link";
import { Magnetic } from "@/components/motion/Magnetic";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline";

const base =
  "label inline-flex items-center justify-center gap-3 rounded-full px-7 h-13 transition-[background-color,color,border-color] duration-400 ease-out-cubic";

const variants: Record<Variant, string> = {
  // Ember with ink text (white on #FC5400 fails WCAG contrast).
  primary: "bg-ember text-ink hover:bg-flare active:bg-burnt",
  outline: "border border-steel text-bone hover:border-bone",
};

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  className?: string;
  /** Pull toward the pointer within ~80px (default on). */
  magnetic?: boolean;
  children: ReactNode;
};

export function ButtonLink({ variant = "primary", className = "", magnetic = true, children, ...props }: ButtonLinkProps) {
  const link = (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; magnetic?: boolean };

export function Button({ variant = "primary", className = "", type = "button", magnetic = true, ...props }: ButtonProps) {
  const button = <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
  return magnetic ? <Magnetic>{button}</Magnetic> : button;
}

/** Plain text link with an arrow, e.g. "See our work". */
export function TextLink({ className = "", children, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={`label group inline-flex items-center gap-2 text-bone transition-colors duration-400 hover:text-ember ${className}`}
      {...props}
    >
      <span className="border-b border-bone/40 pb-1 transition-colors duration-400 group-hover:border-ember">
        {children}
      </span>
      <span aria-hidden className="transition-transform duration-400 ease-out-expo group-hover:translate-y-0.5">
        ↓
      </span>
    </a>
  );
}
