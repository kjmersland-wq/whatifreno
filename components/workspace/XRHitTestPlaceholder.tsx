"use client";

import { useEffect, useState } from "react";

type XRSupport = "checking" | "supported" | "unsupported";

/** Minimal structural type so we don't depend on @types/webxr yet. */
interface XRNavigator {
  xr?: { isSessionSupported(mode: "immersive-ar"): Promise<boolean> };
}

/**
 * Seam for AR placement. Detects WebXR `immersive-ar` support today.
 *
 * Next steps (not implemented):
 *  1. Add `@react-three/xr`, wrap the scene in <XR> and call `store.enterAR()` from the button.
 *  2. Request the `hit-test` feature and render a reticle from the hit pose.
 *  3. Anchor the floor-plan group at the confirmed hit pose at 1:1 scale.
 */
export function XRHitTestPlaceholder({ className = "" }: { className?: string }) {
  const [support, setSupport] = useState<XRSupport>("checking");

  useEffect(() => {
    const xr = (navigator as Navigator & XRNavigator).xr;
    if (!xr) {
      setSupport("unsupported");
      return;
    }
    xr.isSessionSupported("immersive-ar")
      .then((ok) => setSupport(ok ? "supported" : "unsupported"))
      .catch(() => setSupport("unsupported"));
  }, []);

  const status =
    support === "checking"
      ? "Checking AR support…"
      : support === "supported"
        ? "AR ready on this device"
        : "AR not available on this device";

  return (
    <div className={`glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${className}`}>
      <div>
        <div className="text-sm text-zinc-200">See it in your room</div>
        <div className="text-[11px] text-zinc-500">{status}</div>
      </div>
      <button
        type="button"
        disabled
        title="WebXR hit-testing is coming soon"
        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-500"
      >
        Coming soon
      </button>
    </div>
  );
}
