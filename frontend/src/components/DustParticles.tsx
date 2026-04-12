"use client";

import { useEffect, useRef } from "react";
import { useRichMotion } from "@/hooks/useRichMotion";

export function DustParticles() {
  const richMotion = useRichMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dustEl = ref.current;
    if (!dustEl || !richMotion) {
      if (dustEl) dustEl.replaceChildren();
      return;
    }

    dustEl.replaceChildren();
    for (let i = 0; i < 28; i++) {
      const p = document.createElement("div");
      p.className = "dust-p";
      const size = Math.random() * 3 + 1;
      const dx = (Math.random() - 0.5) * 120;
      p.style.cssText = `
        width:${size}px;height:${size}px;
        left:${20 + Math.random() * 60}%;
        --dx:${dx}px;
        animation-duration:${8 + Math.random() * 14}s;
        animation-delay:${-Math.random() * 20}s;
        opacity:0;
      `;
      dustEl.appendChild(p);
    }
  }, [richMotion]);

  return <div className="dust" ref={ref} aria-hidden />;
}
