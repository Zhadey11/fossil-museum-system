"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/catalogo", label: "Colección" },
  { href: "/#about", label: "Historia" },
  { href: "/#timeline", label: "Tiempo profundo" },
  { href: "/#visit", label: "Visita" },
  { href: "/login", label: "Login" },
  { href: "/contacto", label: "Contacto" },
] as const;

export function TopNav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

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
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          </li>
        ))}
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
