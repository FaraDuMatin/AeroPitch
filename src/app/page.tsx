import NavPill from "@/components/NavPill";
import NeuralBackdrop from "@/components/NeuralBackdrop";
import PillButton from "@/components/PillButton";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      <NeuralBackdrop />
      <NavPill active="menu" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-32 text-center sm:px-10">
        <p className="mb-6 font-mono text-xl uppercase tracking-[0.25em] text-[#f4ecec]">
          Autonomous Cleanup Fleet Orchestration
        </p>

        {/* <h1 className="max-w-4xl text-[clamp(2.8rem,7vw,4.55rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-white">
          Autonomous Cleanup Fleet Orchestration
        </h1> */}

        <div className="mt-11 flex flex-col gap-4 sm:flex-row">
          <PillButton href="/simulation">Enter Simulation</PillButton>
        </div>

        {/* <section
          id="mission"
          className="aether-panel mt-14 w-full max-w-4xl rounded-3xl p-6 text-left sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <article>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#a1a1a1]">
                Assign
              </p>
              <h2 className="mt-2 text-xl text-white">Zone Ownership</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#a1a1a1]">
                Drones receive dedicated sectors before entering the field to
                maximize sweep efficiency.
              </p>
            </article>
            <article>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#a1a1a1]">
                Sort
              </p>
              <h2 className="mt-2 text-xl text-white">Waste Classification</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#a1a1a1]">
                Vision and labels separate trash streams and route collection to
                recycling, compost, and metal piles.
              </p>
            </article>
            <article>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#a1a1a1]">
                Protect
              </p>
              <h2 className="mt-2 text-xl text-white">Priority Radius</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#a1a1a1]">
                Inside a conflict radius, low-priority drones hold position while
                higher-priority units pass on a higher layer.
              </p>
            </article>
          </div>
        </section> */}
      </main>
    </div>
  );
}
