"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/auth";
import { panelLinksForRoles, rolesDescripcionCorta } from "@/lib/roles";

export function PanelSubnav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const user = getStoredUser();
  if (!user) return null;

  const links = panelLinksForRoles(user.roles);
  const rolesLine = rolesDescripcionCorta(user.roles);

  return (
    <nav
      className="panel-subnav"
      aria-label="Áreas del sistema"
    >
      <p className="panel-subnav-roles" title="Roles asignados">
        {rolesLine}
      </p>
      {links.map(({ href, label }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={`${href}-${label}`}
            href={href}
            className={active ? "panel-subnav-link active" : "panel-subnav-link"}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
