import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Carpeta `frontend/` (este archivo), no el monorepo padre con otro package-lock.json */
const configDir = path.dirname(fileURLToPath(import.meta.url));

const defaultApi = "http://localhost:4000";

function imageRemotePatterns(): NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> {
  const base = (process.env.NEXT_PUBLIC_API_URL || defaultApi).replace(
    /\/$/,
    "",
  );
  const defaults = [
    {
      protocol: "http" as const,
      hostname: "localhost",
      port: "4000",
      pathname: "/images/**" as const,
    },
    {
      protocol: "http" as const,
      hostname: "127.0.0.1",
      port: "4000",
      pathname: "/images/**" as const,
    },
  ];
  try {
    const u = new URL(base);
    const protocol = u.protocol === "https:" ? ("https" as const) : ("http" as const);
    const fromEnv = {
      protocol,
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: "/images/**" as const,
    };
    const dup =
      fromEnv.hostname === "localhost" &&
      (fromEnv.port ?? "") === "4000" &&
      fromEnv.protocol === "http";
    return dup ? defaults : [fromEnv, ...defaults];
  } catch {
    return defaults;
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: configDir,
  },
  outputFileTracingRoot: configDir,
  images: {
    remotePatterns: imageRemotePatterns(),
  },
};

export default nextConfig;
