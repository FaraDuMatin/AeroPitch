import { SimulationTelemetryPayload } from "@/types/simulation";

type TelemetryListener = (payload: SimulationTelemetryPayload) => void;

type TelemetryGlobal = {
  telemetryListeners?: Set<TelemetryListener>;
};

const globalTelemetry = globalThis as typeof globalThis & TelemetryGlobal;

const listeners = globalTelemetry.telemetryListeners ?? new Set<TelemetryListener>();
globalTelemetry.telemetryListeners = listeners;

export function publishTelemetry(payload: SimulationTelemetryPayload) {
  for (const listener of listeners) {
    listener(payload);
  }
}

export function subscribeTelemetry(listener: TelemetryListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
