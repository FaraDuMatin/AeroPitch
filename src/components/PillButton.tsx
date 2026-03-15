import Link from "next/link";
import { ReactNode } from "react";

type PillButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  icon?: ReactNode;
};

export default function PillButton({
  href,
  children,
  variant = "primary",
  icon,
}: PillButtonProps) {
  const baseClass =
    "aether-pill inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-semibold tracking-[0.03em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  const variantClass =
    variant === "primary"
      ? "border border-[#7ff4ff] bg-[#00e5ff] text-[#03131a] shadow-[0_0_28px_rgba(0,229,255,0.44)] hover:bg-[#33ecff] hover:shadow-[0_0_36px_rgba(0,229,255,0.62)]"
      : "border border-white/25 bg-white/0 text-white hover:border-white/45 hover:bg-white/6";

  return (
    <Link href={href} className={`${baseClass} ${variantClass}`}>
      <span>{children}</span>
      {icon ? <span aria-hidden>{icon}</span> : null}
    </Link>
  );
}