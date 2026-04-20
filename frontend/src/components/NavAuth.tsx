"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getStoredUser } from "@/lib/auth";
import { postLogout } from "@/lib/api";
import { panelPathForRoles } from "@/lib/roles";

export function NavAuth() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLogged(!!getStoredUser());
  }, [pathname]);

  async function logout() {
    await postLogout();
    clearAuth();
    setIsLogged(false);
    router.refresh();
    router.push("/");
  }

  if (!mounted) {
    return (
      <Link href="/login" className="nav-cta nav-cta-ghost">
        Acceso
      </Link>
    );
  }

  if (isLogged) {
    const user = getStoredUser();
    const panelHref = user ? panelPathForRoles(user.roles) : "/panel";

    return (
      <span className="nav-auth-cluster">
        <Link href={panelHref} className="nav-cta nav-cta-ghost">
          Mi panel
        </Link>
        <button
          type="button"
          className="nav-cta nav-cta-ghost"
          onClick={logout}
        >
          Salir
        </button>
      </span>
    );
  }

  return (
    <Link href="/login" className="nav-cta nav-cta-ghost">
      Acceso
    </Link>
  );
}
