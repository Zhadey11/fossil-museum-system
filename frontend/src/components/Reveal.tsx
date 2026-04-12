"use client";

import { useEffect, useRef, useState } from "react";

type RevealVariant = "reveal" | "reveal-l" | "reveal-r";

export function Reveal({
  children,
  className = "",
  variant = "reveal",
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delayMs?: number;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            window.setTimeout(() => {
              setShow(true);
              io.unobserve(e.target);
            }, delayMs);
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delayMs]);

  return (
    <div
      ref={elRef}
      className={`${variant} ${show ? "show" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
