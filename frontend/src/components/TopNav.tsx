"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavAuth } from "@/components/NavAuth";

const links = [
  { href: "/catalogo", label: "Colección" },
  { href: "/galeria", label: "Galería" },
  { href: "/mapa", label: "Mapa" },
  { href: "/historia", label: "Historia" },
  { href: "/tiempo-profundo", label: "Tiempo profundo" },
  { href: "/visita", label: "Visita" },
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
  const forceStuck = pathname !== "/";

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <nav id="nav" className={stuck || forceStuck ? "stuck" : undefined}>
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

      <div className="nav-trailing">
        <NavAuth />
        <Link href="/contacto" className="nav-cta nav-cta-contact" onClick={() => setOpen(false)}>
          Contáctanos
        </Link>
      </div>

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
