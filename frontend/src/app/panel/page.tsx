"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getStoredUser } from "@/lib/auth";
import { panelPathForRoles } from "@/lib/roles";

export default function PanelIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    router.replace(panelPathForRoles(u.roles));
  }, [router]);

  return (
    <p className="sec-body" style={{ padding: "2rem" }}>
      Abriendo tu panel…
    </p>
  );
}
