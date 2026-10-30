// `npm run build` for Cloudflare Pages: `next build`, then the next-on-pages adapter, which writes
// the deployable output to .vercel/output/static.
//
// Recursion guard: next-on-pages runs `vercel build`, and `vercel build` runs `npm run build`
// again. That inner run must stop after `next build`, otherwise it would start the adapter again
// forever. We mark the adapter run with RENO_ADAPTER_RUNNING (inherited by the nested build) and
// also honour VERCEL=1, which `vercel build` sets.
//
// Set SKIP_PAGES_ADAPTER=1 to run only `next build` (e.g. on Windows, where the adapter's
// `vercel build` step is unsupported).
import { spawnSync } from "node:child_process";

function run(command, env = {}) {
  const result = spawnSync(command, { stdio: "inherit", shell: true, env: { ...process.env, ...env } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx next build");

const insideAdapter = Boolean(process.env.RENO_ADAPTER_RUNNING || process.env.VERCEL);
const skip = process.env.SKIP_PAGES_ADAPTER === "1";

if (!insideAdapter && !skip) {
  run("npx @cloudflare/next-on-pages", { RENO_ADAPTER_RUNNING: "1" });
}
