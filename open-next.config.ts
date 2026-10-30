import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Defaults are enough for now: no ISR/data cache is used. Add an R2 incremental cache here if
// pages with `revalidate` are introduced.
export default defineCloudflareConfig();
