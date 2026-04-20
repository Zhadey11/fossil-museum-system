"use client";

import { PanelSubnav } from "@/components/PanelSubnav";

export function PanelChrome({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="sw-page panel-layout"
      style={{ background: "var(--ink)", minHeight: "100vh" }}
    >
      <PanelSubnav />
      <div className="panel-inner">{children}</div>
    </div>
  );
}
