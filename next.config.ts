import type { NextConfig } from "next";

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// COMMENTED OUT: Cloudflare initialization causes wrangler login issues in dev mode
// This can be re-enabled when deploying or when logged into wrangler
// if (process.env.NODE_ENV !== "test") {
//
// }

const nextConfig: NextConfig = {
  reactStrictMode: false,
};

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

export default nextConfig;
