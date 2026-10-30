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

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div className="absolute inset-0">
        <FloorPlanScene quantities={quantities} />
      </div>

      <CostTicker
        estimate={estimate}
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
