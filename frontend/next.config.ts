import type { NextConfig } from "next";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Carpeta `frontend/` (este archivo), no el monorepo padre con otro package-lock.json */
const configDir = path.dirname(fileURLToPath(import.meta.url));

const defaultApi = "http://localhost:4000";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || defaultApi).replace(/\/$/, "");
}

function apiBaseForServerProxy(): string {
  const raw = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || defaultApi).replace(
    /\/$/,
    "",
  );
  try {
    const u = new URL(raw);
    if (u.hostname === "localhost") {
      u.hostname = "127.0.0.1";
      return u.toString().replace(/\/$/, "");
    }
  } catch {
    /* ignore */
  }
  return raw;
}

/** Orígenes extra que pueden pedir `/_next/*` en dev (p. ej. http://192.168.x.x:3000 desde el móvil). */
function allowedDevOrigins(): string[] {
  const raw = process.env.NEXT_ALLOWED_DEV_ORIGINS;
  const fromEnv = (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const defaults = new Set<string>([
    "localhost",
    "127.0.0.1",
  ]);
  try {
    const nets = os.networkInterfaces();
    for (const list of Object.values(nets)) {
      for (const addr of list || []) {
        if (addr.family === "IPv4" && !addr.internal) {
          defaults.add(addr.address);
        }
      }
    }
  } catch {
    /* ignore and keep defaults */
  }
  for (const origin of fromEnv) {
    try {
      defaults.add(new URL(origin).hostname);
    } catch {
      defaults.add(origin);
    }
  }
  return [...defaults];
}

function imageRemotePatterns(): NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> {
  const base = apiBase();
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
  allowedDevOrigins: allowedDevOrigins(),
  images: {
    remotePatterns: imageRemotePatterns(),
  },
  async rewrites() {
    const base = apiBaseForServerProxy();
    return [
      {
        source: "/__api/:path*",
        destination: `${base}/:path*`,
      },
    ];
  },
};

export default nextConfig;
