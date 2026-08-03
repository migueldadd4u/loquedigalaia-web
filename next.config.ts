import type { NextConfig } from "next";

// Export estático: la web se sirve como HTML plano (F1). El pipeline vinext/Cloudflare
// de add4u-web se incorpora en F5; este config mantiene la misma restricción de base:
// nada que requiera servidor en runtime.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
