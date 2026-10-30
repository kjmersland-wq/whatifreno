import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// `npm run build` runs the whole OpenNext build, so OpenNext must call the plain Next build
// under a different script name (`build:next`) instead of recursing into `build`.
// Defaults are enough otherwise: no ISR/data cache is used. Add an R2 incremental cache here
// if pages with `revalidate` are introduced.
export default {
  ...defineCloudflareConfig(),
  buildCommand: "npm run build:next",
};
