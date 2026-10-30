"use client";

import Link from "next/link";
import {
  MODIFICATION_CATALOG,
  MODIFICATION_KINDS,
  REGIONS,
  type ModificationKind,
  type RegionId,
} from "@/lib/costEstimator";
import { formatQuantity } from "@/lib/format";
import { fromDisplayValue, toDisplayValue } from "@/lib/units";
import type { Quantities } from "./FloorPlanScene";

interface ModificationPanelProps {
  quantities: Quantities;
  regionId: RegionId;
  onQuantityChange: (kind: ModificationKind, quantity: number) => void;
  onRegionChange: (region: RegionId) => void;
  onReset: () => void;
  className?: string;
}

/**
 * Controls for simulating structural changes and choosing the pricing region.
 * Quantities are stored metric; sliders work in the region's display unit
 * (0.5 m steps for metric, 1 ft for imperial) and convert on the way in and out.
 */
export function ModificationPanel({
  quantities,
  regionId,
  onQuantityChange,
  onRegionChange,
  onReset,
  className = "",
}: ModificationPanelProps) {
  const region = REGIONS[regionId];
  const system = region.unitSystem;

  return (
    <aside className={`glass rounded-3xl p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm font-medium tracking-tight text-zinc-100">
          Reno<span className="text-sky-300">Estimate</span>
        </Link>
        <button type="button" onClick={onReset} className="text-xs text-zinc-500 transition hover:text-zinc-300">
          Start over
        </button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-zinc-400">
        Hva om…? Try an idea on. Nothing here is permanent.
      </p>

      <label className="mt-5 block">
        <span className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-500">
          Pricing region
          <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono normal-case tracking-normal text-zinc-400">
            {system === "metric" ? "Metric" : "Imperial"}
          </span>
        </span>
        <select
          value={regionId}
          onChange={(e) => onRegionChange(e.target.value as RegionId)}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-sky-300/50"
        >
          {Object.values(REGIONS).map((r) => (
            <option key={r.id} value={r.id}>
              {r.label} ({r.currency})
            </option>
          ))}
        </select>
      </label>

      <div className="mt-6 space-y-6">
        {MODIFICATION_KINDS.map((kind) => {
          const spec = MODIFICATION_CATALOG[kind];
          const value = quantities[kind];
          const step = spec.step[system];
          const max = Math.floor(toDisplayValue(spec.maxQuantity, spec.dimension, system) / step + 1e-9) * step;
          // Snap what the thumb shows to the slider grid; the stored metric value is untouched until moved.
          const shown = Math.round(toDisplayValue(value, spec.dimension, system) / step) * step;
          return (
            <div key={kind}>
              <div className="flex items-baseline justify-between">
                <label htmlFor={kind} className="text-sm font-medium text-zinc-200">
                  {spec.label}
                </label>
                <span className="font-mono text-xs text-sky-200">{formatQuantity(value, spec.dimension, region)}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{spec.description}</p>
              <input
                id={kind}
                type="range"
                min={0}
                max={max}
                step={step}
                value={shown}
                onChange={(e) =>
                  onQuantityChange(kind, fromDisplayValue(Number(e.target.value), spec.dimension, system))
                }
                className="mt-3 w-full"
              />
            </div>
          );
        })}
      </div>
    </aside>
  );
}
