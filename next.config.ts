import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exportación estática pura: la web se sirve como HTML + assets (PLAN.md §1).
  output: "export",
  // Cada ruta exporta <ruta>/index.html: URLs limpias y directorio /en/ simétrico.
  trailingSlash: true,
  images: {
    // Sin servidor de optimización en hosting estático.
    unoptimized: true,
  },
};

export default nextConfig;
