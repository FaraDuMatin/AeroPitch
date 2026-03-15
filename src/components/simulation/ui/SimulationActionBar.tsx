"use client";

type SimulationActionBarProps = {
  placementsCount: number;
  onStartSimulation: () => void;
  isSaving: boolean;
  statusMessage: string;
};

export default function SimulationActionBar({
  placementsCount,
  onStartSimulation,
  isSaving,
  statusMessage,
}: SimulationActionBarProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#a1a1a1]">
          <span className="font-semibold text-white">{placementsCount}</span> trash item(s) placed.
        </p>
        <button
          type="button"
          onClick={onStartSimulation}
          disabled={isSaving || placementsCount === 0}
          className="aether-pill inline-flex items-center justify-center bg-[#00e5ff] px-5 py-2 text-sm font-semibold text-[#03131a] transition hover:bg-[#33ecff] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSaving ? "Saving..." : "Start Simulation"}
        </button>
      </div>
      {statusMessage ? (
        <p className="mt-2 text-xs leading-relaxed text-[#c3d6df]">{statusMessage}</p>
      ) : null}
    </div>
  );
}