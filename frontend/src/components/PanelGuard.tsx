"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/auth";
import { hasAnyRole, panelPathForRoles } from "@/lib/roles";

type Props = {
  /** Al menos uno de estos rol_id (dbo.ROL) debe estar en el usuario. */
  need: number[];
  children: React.ReactNode;
};

export function PanelGuard({ need, children }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ok" | "redirect">("loading");

  const needKey = need.join(",");

  useEffect(() => {
    const u = getStoredUser();

    if (!u) {
      router.replace("/login");
      setState("redirect");
      return;
    }

    if (!hasAnyRole(u.roles, need)) {
      router.replace(panelPathForRoles(u.roles));
      setState("redirect");
      return;
    }

    setState("ok");
  }, [needKey, need, router]);

  if (state === "loading" || state === "redirect") {
    return (
      <p className="sec-body" style={{ padding: "2rem" }}>
        {state === "loading" ? "Cargando…" : "Redirigiendo…"}
      </p>
    );
  }

  return <>{children}</>;
}
