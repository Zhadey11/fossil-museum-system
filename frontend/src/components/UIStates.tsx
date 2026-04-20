import type { ReactNode } from "react";

export function LoadingState({ text = "Cargando…" }: { text?: string }) {
  return <p className="sec-body">{text}</p>;
}

export function ErrorState({
  text,
  action,
}: {
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-sm border px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "rgba(180,60,60,.12)" }}>
      <p style={{ color: "var(--bone)" }}>{text}</p>
      {action}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="sec-body">{text}</p>;
}
