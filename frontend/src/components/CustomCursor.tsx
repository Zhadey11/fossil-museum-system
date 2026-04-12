"use client";

import { useEffect, useRef } from "react";
import { useRichMotion } from "@/hooks/useRichMotion";

export function CustomCursor() {
  const richMotion = useRichMotion();
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!richMotion) {
      document.body.classList.remove("sw-cursor-on");
      return;
    }
    document.body.classList.add("sw-cursor-on");
    return () => document.body.classList.remove("sw-cursor-on");
  }, [richMotion]);

  useEffect(() => {
    if (!richMotion) return;

    const cur = document.getElementById("sw-cur");
    const cur2 = document.getElementById("sw-cur2");
    if (!cur || !cur2) return;

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    document.addEventListener("mousemove", onMove);

    const loop = () => {
      cur.style.left = `${mx}px`;
      cur.style.top = `${my}px`;
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      cur2.style.left = `${rx}px`;
      cur2.style.top = `${ry}px`;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMove);
    };
  }, [richMotion]);

  if (!richMotion) return null;

  return (
    <>
      <div id="sw-cur" aria-hidden />
      <div id="sw-cur2" aria-hidden />
    </>
  );
}
