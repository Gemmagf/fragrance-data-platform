import type { NextConfig } from "next";

// GitHub Pages serves a project site under /<repo-name>. The deploy workflow sets
// NEXT_BASE_PATH=/fragrance-data-platform; local builds leave it empty and serve from /.
const basePath = process.env.NEXT_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  // Static export: the dashboard is a build of simulated data, deployable to any static host.
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
