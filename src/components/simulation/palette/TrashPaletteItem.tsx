"use client";

import Image from "next/image";
import { TrashAsset } from "@/types/simulation";

type TrashPaletteItemProps = {
  asset: TrashAsset;
  onQuickSpawn: (assetId: string) => void;
};

export default function TrashPaletteItem({ asset, onQuickSpawn }: TrashPaletteItemProps) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", asset.id);
        event.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() => onQuickSpawn(asset.id)}
      className="flex w-full items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-left transition hover:border-white/30 hover:bg-white/10"
    >
      <Image
        src={asset.spritePath}
        alt={asset.name}
        width={34}
        height={34}
        className="h-9 w-9 object-contain"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-white">{asset.name}</span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#a1a1a1]">
          {asset.type}
        </span>
      </span>
    </button>
  );
}