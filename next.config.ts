import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shown in the footer's "Last updated" stamp: the moment this build was made.
  env: { NEXT_PUBLIC_BUILD_DATE: new Date().toISOString() },
};

export default nextConfig;
