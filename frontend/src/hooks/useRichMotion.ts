"use client";

import { useEffect, useState } from "react";

/**
 * Cursor custom, polvo animado, etc. solo con puntero fino (ratón/trackpad)
 * y sin "reducir movimiento" en el sistema.
 */
export function useRichMotion(): boolean {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");

    const sync = () => {
      setOk(!reduced.matches && fine.matches);
    };

    sync();
    reduced.addEventListener("change", sync);
    fine.addEventListener("change", sync);
    return () => {
      reduced.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
    };
  }, []);

  return ok;
}
