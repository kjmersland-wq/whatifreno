"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { detectRegion } from "@/lib/locale";
import { EMPTY_QUANTITIES, designToSearchParams } from "@/lib/design";
import {
  MODIFICATION_KINDS,
  estimateRenovation,
  type ModificationKind,
  type RegionId,
} from "@/lib/costEstimator";
import { formatQuantity } from "@/lib/format";
import { feetToMeters } from "@/lib/units";
import { CostTicker } from "@/components/CostTicker";
import { ModificationPanel } from "./ModificationPanel";
import { XRHitTestPlaceholder } from "./XRHitTestPlaceholder";
import type { Quantities } from "./FloorPlanScene";

// three.js needs the browser; keep it out of the server render.
const FloorPlanScene = dynamic(() => import("./FloorPlanScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-zinc-500">Preparing your space…</div>
  ),
});

/** Owns simulation state and lays out canvas + floating glass panels (mobile: stacked, desktop: flanking). */
export function WorkspaceShell() {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Quantities>(EMPTY_QUANTITIES);
  const [regionId, setRegionId] = useState<RegionId>("norway");
  const userPickedRegion = useRef(false);

  // Adapt units and currency to the visitor's locale, unless they have already chosen a region.
  useEffect(() => {
    if (userPickedRegion.current) return;
    setRegionId(
      detectRegion({
        locale: navigator.language,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    );
  }, []);

  const estimate = useMemo(
    () =>
      estimateRenovation(
        MODIFICATION_KINDS.map((kind) => ({ kind, quantity: quantities[kind] })),
        regionId,
      ),
    [quantities, regionId],
  );

  const setQuantity = useCallback(
    (kind: ModificationKind, quantity: number) => setQuantities((prev) => ({ ...prev, [kind]: quantity })),
    [],
  );

  /** Forwards the exact simulated design to /checkout via URL search parameters. */
  const exportTenderPack = useCallback(() => {
    router.push(`/checkout?${designToSearchParams({ region: regionId, quantities })}`);
  }, [router, regionId, quantities]);

  const { region } = estimate;
  const sceneLabels = useMemo(
    () => ({
      wall: formatQuantity(quantities["load-bearing-wall-removal"], "length", region),
      garage: formatQuantity(quantities["garage-addition"], "area", region),
    }),
    [quantities, region],
  );

  // A gentle starting point for first-time visitors: 3 m (or the nearest whole 10 ft) of wall.
  const exampleWall = region.unitSystem === "metric" ? 3 : feetToMeters(10);
  const emptyHint = (
    <>
      Try dragging the load-bearing wall to {formatQuantity(exampleWall, "length", region)} and watch
      the range appear.{" "}
      <button
        type="button"
        onClick={() => setQuantity("load-bearing-wall-removal", exampleWall)}
        className="text-sky-200 underline-offset-4 hover:underline"
      >
        Show me
      </button>
    </>
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0">
        <FloorPlanScene quantities={quantities} labels={sceneLabels} />
      </div>

      <p className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-xs text-zinc-500 md:block">
        Drag to rotate · scroll to zoom
      </p>

      <CostTicker
        estimate={estimate}
        emptyHint={emptyHint}
        className="absolute inset-x-3 top-3 md:inset-x-auto md:right-4 md:top-4 md:w-[22rem]"
      />

      <div className="absolute inset-x-3 bottom-3 flex max-h-[48dvh] flex-col gap-3 overflow-y-auto md:inset-x-auto md:bottom-4 md:left-4 md:top-4 md:max-h-none md:w-80">
        <ModificationPanel
          quantities={quantities}
          regionId={regionId}
          onQuantityChange={setQuantity}
          onRegionChange={(id) => {
            userPickedRegion.current = true;
            setRegionId(id);
          }}
          onReset={() => setQuantities(EMPTY_QUANTITIES)}
        />
        <button
          type="button"
          onClick={exportTenderPack}
          disabled={estimate.lines.length === 0}
          className="glass rounded-2xl px-4 py-3 text-sm text-zinc-200 transition enabled:hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
        >
          Export tender pack
        </button>
        <XRHitTestPlaceholder />
      </div>
    </div>
  );
}
