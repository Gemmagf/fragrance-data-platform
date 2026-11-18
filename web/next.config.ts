import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the dashboard is a build of simulated data, deployable to any static host.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
