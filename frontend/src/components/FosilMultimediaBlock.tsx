"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  deleteMultimedia,
  fetchMultimediaFosil,
  multimediaAbsUrl,
  uploadMultimediaFosil,
  type MultimediaRow,
} from "@/lib/api";

const SUBTIPOS: { value: string; label: string }[] = [
  { value: "general", label: "General" },
  { value: "portada", label: "Portada" },
  { value: "antes", label: "Antes" },
  { value: "despues", label: "Después" },
  { value: "analisis", label: "Análisis" },
  { value: "reconstruccion", label: "Reconstrucción" },
  { value: "escaneo", label: "Escaneo" },
];

const ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/x-matroska";

type Props = {
  fosilId: number;
  /** En pendientes de admin: enfatiza revisar material antes de publicar */
  modoRevision?: boolean;
};

export function FosilMultimediaBlock({ fosilId, modoRevision = false }: Props) {
  const [items, setItems] = useState<MultimediaRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [subtipo, setSubtipo] = useState("general");
  const [descripcion, setDescripcion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setErr(null);
    return fetchMultimediaFosil(fosilId)
      .then(setItems)
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"));
  }, [fosilId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    setErr(null);
    try {
      await uploadMultimediaFosil(fosilId, files, {
        subtipo,
        descripcion: descripcion.trim() || undefined,
      });
      setDescripcion("");
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(id: number) {
    setDeletingId(id);
    setErr(null);
    try {
      await deleteMultimedia(id);
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  if (items === null && !err) {
    return (
      <p className="text-sm opacity-80" style={{ marginTop: "0.5rem" }}>
        Cargando multimedia…
      </p>
    );
  }

  const tipoNorm = (t: string | undefined) => String(t || "").toLowerCase().trim();
  const urlLooksImage = (u: string | undefined) =>
    /\.(webp|jpe?g|png|gif|avif)(\?|$)/i.test(String(u || ""));
  const urlLooksVideo = (u: string | undefined) =>
    /\.(mp4|webm|mov|mkv)(\?|$)/i.test(String(u || ""));
  const visibles =
    items?.filter((m) => {
      const t = tipoNorm(m.tipo);
      if (t === "imagen" || t === "video") return true;
      if (!t && (urlLooksImage(m.url) || urlLooksVideo(m.url))) return true;
      return false;
    }) ?? [];

  return (
    <div
      className="panel-mm-block text-left"
      style={{ marginTop: "0.75rem", maxWidth: "560px" }}
    >
      {err ? (
        <p className="text-sm" style={{ color: "salmon", marginBottom: "0.5rem" }}>
          {err}
        </p>
      ) : null}

      {modoRevision ? (
        <p className="mb-2 text-sm" style={{ color: "var(--bone)", lineHeight: 1.45 }}>
          <strong>Material del hallazgo:</strong> revisá estas fotos o videos antes de publicar o
          rechazar. Si no ves nada, el explorador pudo dar de alta el registro sin imagen o falló la
          subida (pedile que vuelva a cargar desde su panel o subí vos un archivo abajo).
        </p>
      ) : null}

      {visibles.length > 0 ? (
        <ul
          className="mb-3 grid list-none gap-3 sm:grid-cols-2"
          style={{ padding: 0 }}
        >
          {visibles.map((m) => (
            <li
              key={m.id}
              className="overflow-hidden rounded-sm border"
              style={{ borderColor: "var(--border)" }}
            >
              {tipoNorm(m.tipo) === "video" ? (
                <video
                  src={multimediaAbsUrl(m.url)}
                  className="h-40 w-full bg-black object-contain"
                  controls
                  preload="metadata"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={multimediaAbsUrl(m.url)}
                  alt={m.descripcion || m.nombre_archivo || ""}
                  className="h-36 w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-2 text-xs text-[var(--bonedim)]">
                <div className="text-[var(--bone)]">
                  {tipoNorm(m.tipo) === "video" ? "Video" : "Imagen"} · {m.subtipo}
                  {m.nombre_archivo ? ` · ${m.nombre_archivo}` : ""}
                </div>
                <button
                  type="button"
                  className="mt-1 text-salmon underline"
                  style={{ color: "salmon" }}
                  disabled={deletingId === m.id}
                  onClick={() => setConfirmDeleteId(m.id)}
                >
                  {deletingId === m.id ? "…" : "Eliminar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {items && visibles.length === 0 && !err ? (
        <p
          className="mb-3 text-sm"
          style={{ color: modoRevision ? "var(--amberhot)" : "var(--bonedim)" }}
        >
          {modoRevision
            ? "Sin archivos en el servidor para este hallazgo. No podés validar la foto hasta que exista al menos una imagen o video (explorador o vos con “Añadir archivos”)."
            : "Aún no hay fotos ni videos."}
        </p>
      ) : null}

      <div
        className="flex flex-col gap-3 rounded-sm border p-3"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
        }}
      >
        <p className="text-sm text-[var(--bonedim)]">
          Añadir archivos (imágenes o video MP4/WebM/MOV; máx. 25 MB por archivo en esta pantalla).
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-[var(--bonedim)]">
            Tipo de toma
            <select
              value={subtipo}
              onChange={(e) => setSubtipo(e.target.value)}
              className="rounded-sm border px-2 py-2 text-[var(--bone)]"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              {SUBTIPOS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--bonedim)] sm:col-span-2">
            Descripción (opcional)
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. vista lateral o toma en campo"
              className="rounded-sm border px-2 py-2 text-[var(--bone)]"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            />
          </label>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          disabled={uploading}
          onChange={onPickFile}
        />
        <button
          type="button"
          className="btn-fill text-sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Subiendo…" : "Elegir fotos o videos"}
        </button>
      </div>
      <ConfirmDialog
        open={confirmDeleteId != null}
        title="Eliminar archivo"
        message="¿Eliminar este archivo del registro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        busy={deletingId != null}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId != null) {
            onDelete(confirmDeleteId).finally(() => setConfirmDeleteId(null));
          }
        }}
      />
    </div>
  );
}
