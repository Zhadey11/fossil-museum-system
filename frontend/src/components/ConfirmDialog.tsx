"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  askNote?: boolean;
  noteLabel?: string;
  notePlaceholder?: string;
  onConfirm: (note?: string) => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  busy = false,
  askNote = false,
  noteLabel = "Nota",
  notePlaceholder = "Opcional",
  onConfirm,
  onCancel,
}: Props) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) setNote("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,7,5,.78)",
        display: "grid",
        placeItems: "center",
        zIndex: 1200,
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-sm border p-4"
        style={{
          width: "min(560px, 94vw)",
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <h3 className="sec-h" style={{ fontSize: "1.1rem" }}>
          {title}
        </h3>
        <p className="sec-body" style={{ marginTop: "0.6rem" }}>
          {message}
        </p>
        {askNote ? (
          <label className="mt-3 flex flex-col gap-1 text-sm text-[var(--bonedim)]">
            {noteLabel}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={notePlaceholder}
              rows={3}
              className="rounded-sm border px-3 py-2 text-[var(--bone)]"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            />
          </label>
        ) : null}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-out" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn-fill"
            onClick={() => onConfirm(askNote ? note : undefined)}
            disabled={busy}
          >
            {busy ? "Procesando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
