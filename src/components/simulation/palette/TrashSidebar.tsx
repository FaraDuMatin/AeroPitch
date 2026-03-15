"use client";

import TrashPaletteItem from "@/components/simulation/palette/TrashPaletteItem";
import { TrashAsset } from "@/types/simulation";

type TrashSidebarProps = {
  assets: TrashAsset[];
  onQuickSpawn: (assetId: string) => void;
};

export default function TrashSidebar({ assets, onQuickSpawn }: TrashSidebarProps) {
  return (
    <aside className="aether-panel h-fit rounded-2xl p-4" aria-label="Trash palette">
      <h2 className="text-base font-semibold tracking-tight text-white">Trash Palette</h2>
      <p className="mt-1 text-xs leading-relaxed text-[#a1a1a1]">
        Drag an item into a cleaning zone or click for random spawn.
      </p>

      <div className="mt-4 grid gap-2">
        {assets.map((asset) => (
          <TrashPaletteItem key={asset.id} asset={asset} onQuickSpawn={onQuickSpawn} />
        ))}
      </div>
    </aside>
  );
}