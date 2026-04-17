"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/catalogo", label: "Colección" },
  { href: "/historia", label: "Historia" },
  { href: "/#timeline", label: "Tiempo profundo" },
  { href: "/#visit", label: "Visita" },
  { href: "/login", label: "Login" },
  { href: "/contacto", label: "Contacto" },
] as const;

function isNavLinkActive(
  href: string,
  pathname: string,
  locationHash: string,
): boolean {
  const hashIdx = href.indexOf("#");
  if (hashIdx !== -1) {
    const pathOnly = href.slice(0, hashIdx) || "/";
    const hashOnly = href.slice(hashIdx);
    return pathname === pathOnly && locationHash === hashOnly;
  }
  return pathname === href;
}

export function TopNav() {
  const pathname = usePathname();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    const readHash = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav id="nav" className={stuck ? "stuck" : undefined}>
      <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
        <span className="nav-logo-word">
          <b>Stone</b>Wake
        </span>
        <span className="nav-logo-tag">Museum</span>
      </Link>

      <ul className={`nav-links ${open ? "nav-links-open" : ""}`}>
        {links.map(({ href, label }) => {
          const active = isNavLinkActive(href, pathname, hash);
          return (
            <li key={href}>
              <Link
                href={href}
                className={active ? "active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link href="/contacto" className="nav-cta" onClick={() => setOpen(false)}>
        Información
      </Link>

      <button
        type="button"
        className="nav-burger"
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
}
