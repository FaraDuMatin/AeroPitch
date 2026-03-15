import NavPill from "@/components/NavPill";
import SimulationCanvas from "@/components/simulation/SimulationCanvas";
import {
  operationField,
  SHARED_BOARD_ID,
  simulationZones,
  trashCatalog,
  trashDropArea,
} from "@/lib/simulation/config";



export default function SimulationPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] px-4 pb-14 pt-28 sm:px-8">
      <NavPill active="simulation" />

      <main className="relative mx-auto grid w-full max-w-6xl gap-6">
        <SimulationCanvas
          zones={simulationZones}
          trashAssets={trashCatalog}
          trashArea={trashDropArea}
          field={operationField}
          boardId={SHARED_BOARD_ID}
        />
      </main>
    </div>
  );
}