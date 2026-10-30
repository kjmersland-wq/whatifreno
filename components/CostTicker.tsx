"use client";

import { useState, type ReactNode } from "react";
import type { EstimateResult } from "@/lib/costEstimator";
import { formatMoney, formatQuantity } from "@/lib/format";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface CostTickerProps {
  estimate: EstimateResult;
  /** Shown while nothing is simulated yet. */
  emptyHint?: ReactNode;
  className?: string;
}

/**
 * Floating budget dashboard. Shows the running Min/Max range with animated digits,
 * a labour/material split, and an expandable per-change breakdown.
 */
export function CostTicker({ estimate, emptyHint, className = "" }: CostTickerProps) {
  const [open, setOpen] = useState(false);
  const { region, total, labor, material, lines } = estimate;

  const min = useAnimatedNumber(total.min);
  const max = useAnimatedNumber(total.max);

  const isEmpty = lines.length === 0;
  const driverSum = labor.max + material.max;
  const laborShare = driverSum > 0 ? (labor.max / driverSum) * 100 : 50;

  return (
    <section
      aria-live="polite"
      aria-label="Running budget estimate"
      className={`glass rounded-3xl p-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
          Estimated range · {region.label}
        </h2>
        <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
          {region.currency}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <Figure label="From" value={isEmpty ? "—" : formatMoney(min, region)} />
        <Figure label="To" value={isEmpty ? "—" : formatMoney(max, region)} />
      </div>

      {isEmpty ? (
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          {emptyHint ?? "Hva om…? Try an idea on the left and watch the range appear."}
        </p>
      ) : (
        <>
          <div className="mt-4" aria-hidden>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="bg-sky-300 transition-all duration-500" style={{ width: `${laborShare}%` }} />
              <div className="bg-zinc-400 transition-all duration-500" style={{ width: `${100 - laborShare}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
              <span>
                <span className="mr-1 inline-block size-1.5 rounded-full bg-sky-300" />
                Labour
              </span>
              <span>
                <span className="mr-1 inline-block size-1.5 rounded-full bg-zinc-400" />
                Materials
              </span>
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
            An indicative budget range, not a quote.
            {lines.some((l) => l.kind === "load-bearing-wall-removal") &&
              " Removing a load-bearing wall always needs a structural engineer."}
          </p>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-4 text-xs text-sky-200/80 transition hover:text-sky-100"
          >
            {open ? "Hide breakdown" : `See what's inside (${lines.length})`}
          </button>

          {open && (
            <ul className="mt-3 space-y-2 border-t border-white/10 pt-3">
              {lines.map((line) => (
                <li key={line.kind} className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="text-zinc-300">
                    {line.label}
                    <span className="ml-1 text-zinc-500">· {formatQuantity(line.quantity, line.dimension, region)}</span>
                  </span>
                  <span className="font-mono text-zinc-400">
                    {formatMoney(line.total.min, region)}–{formatMoney(line.total.max, region)}
                  </span>
                </li>
              ))}
              <li className="pt-1 text-[11px] text-zinc-500">
                Includes a 5–18% allowance for the unexpected. Excludes VAT.
              </li>
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-zinc-500">{label}</div>
      <div className="font-mono text-xl font-medium tabular-nums tracking-tight text-zinc-50 sm:text-2xl">
        {value}
      </div>
    </div>
  );
}
