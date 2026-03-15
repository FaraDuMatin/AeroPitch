"use client";

import { getZoneRect } from "@/lib/simulation/coordinates";
import ZoneCell from "@/components/simulation/zones/ZoneCell";
import { OperationField, ZoneDefinition } from "@/types/simulation";

type ZoneGridProps = {
  zones: ZoneDefinition[];
  field: OperationField;
};

export default function ZoneGrid({ zones, field }: ZoneGridProps) {
  return (
    <section className="absolute inset-0" aria-label="Six cleaning zones">
      {zones.map((zone) => (
        <ZoneCell key={zone.id} zone={zone} rect={getZoneRect(field, zone.id)} />
      ))}
    </section>
  );
}