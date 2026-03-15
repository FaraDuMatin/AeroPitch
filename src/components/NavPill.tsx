import Link from "next/link";

type NavPillProps = {
  active?: "menu" | "simulation";
};

export default function NavPill({ active = "menu" }: NavPillProps) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-5 z-40 flex justify-center px-4">
      <nav className="aether-panel aether-pill pointer-events-auto flex items-center gap-4 px-5 py-3 text-xl text-[#a1a1a1] shadow-[0_12px_30px_rgba(0,0,0,0.35)] sm:gap-6">
        <Link
          href="/"
          className={`transition-colors hover:text-white ${
            active === "menu" ? "text-white" : "text-[#a1a1a1]"
          }`}
        >
          Main Menu
        </Link>
        <Link
          href="/simulation"
          className={`transition-colors hover:text-white ${
            active === "simulation" ? "text-white" : "text-[#a1a1a1]"
          }`}
        >
          Simulation
        </Link>
      </nav>
    </header>
  );
}