import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** 本仓库目录（避免与上级目录如 GitHub/package-lock.json 冲突时 Turbopack 误判根目录） */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.wormforce.net",
        pathname: "/battuta/community-media/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "wormforce.net" }],
        destination: "https://www.wormforce.net/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
