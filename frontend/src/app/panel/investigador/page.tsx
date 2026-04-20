"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { PanelGuard } from "@/components/PanelGuard";
import {
  fetchFosilesPublic,
  fetchInvestigadorCatalogo,
  fetchMisSolicitudesInvestigacion,
  postSolicitudInvestigacion,
  type ApiFosilRow,
  type SolicitudInvestigacionRow,
} from "@/lib/api";
import { NEED_INVESTIGADOR } from "@/lib/panelNeeds";

function InvestigadorContent() {
  const [rows, setRows] = useState<ApiFosilRow[] | null>(null);
  const [publicos, setPublicos] = useState<ApiFosilRow[] | null>(null);
  const [solicitudes, setSolicitudes] = useState<
    SolicitudInvestigacionRow[] | null
  >(null);
  const [err, setErr] = useState<string | null>(null);
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sending, setSending] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const refresh = useCallback(async () => {
    const cat = await fetchInvestigadorCatalogo();
    const pubRes = await fetchFosilesPublic();
    if (!pubRes.ok) throw new Error(pubRes.error || "Catálogo público");
    const sol = await fetchMisSolicitudesInvestigacion().catch(() => []);
    setRows(cat);
    setPublicos(pubRes.data);
    setSolicitudes(sol);
  }, []);

  useEffect(() => {
    refresh().catch((e) =>
      setErr(e instanceof Error ? e.message : "Error al cargar"),
    );
  }, [refresh]);

  function toggleId(id: number) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);
    setSending(true);
    try {
      const fosil_ids = [...selected];
      const res = await postSolicitudInvestigacion({
        fosil_ids,
        asunto: asunto.trim() || "Solicitud de acceso a datos",
        mensaje: mensaje.trim(),
      });
      setOkMsg(res.mensaje);
      setAsunto("");
      setMensaje("");
      setSelected(new Set());
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setSending(false);
    }
  }

  if (err && rows === null && solicitudes === null) {
    return (
      <p className="sec-body" style={{ color: "salmon" }}>
        {err}
      </p>
    );
  }

  if (rows === null || publicos === null || solicitudes === null) {
    return <p className="sec-body">Cargando panel de investigación…</p>;
  }

  const rowsFiltrados = rows.filter((r) => {
    const byName = filtroNombre
      ? r.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
      : true;
    const byEstado = filtroEstado ? r.estado === filtroEstado : true;
    return byName && byEstado;
  });

  return (
    <>
      <header style={{ marginBottom: "1.5rem" }}>
        <span className="sec-eyebrow">Investigación</span>
        <h1 className="sec-h" style={{ marginTop: "0.5rem" }}>
          Acceso a datos científicos
        </h1>
        <div className="sec-rule" />
        <p className="sec-body" style={{ marginTop: "1rem" }}>
          Elegí fósiles del <strong>catálogo público</strong> (por ID) y enviá
          tu solicitud. El administrador la revisa; si la aprueba, aquí solo
          verás esos registros con permiso para abrir el{" "}
          <strong>detalle científico</strong>. Además se guarda un mensaje en{" "}
          <strong>CONTACTO</strong> para el equipo (como registro tipo correo).
        </p>
      </header>

      {err ? (
        <p className="sec-body" style={{ color: "salmon", marginBottom: "1rem" }}>
          {err}
        </p>
      ) : null}
      {okMsg ? (
        <p className="sec-body" style={{ marginBottom: "1rem", color: "var(--amber)" }}>
          {okMsg}
        </p>
      ) : null}

      <h2 className="sec-h" style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
        Nueva solicitud
      </h2>
      <form
        onSubmit={onSubmit}
        className="sec-body"
        style={{ marginBottom: "2rem", maxWidth: "42rem" }}
      >
        <p style={{ marginBottom: "0.75rem", fontSize: "0.9rem", opacity: 0.9 }}>
          Catálogo público — marcá los fósiles que necesitás estudiar:
        </p>
        <div
          style={{
            maxHeight: "14rem",
            overflow: "auto",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "0.5rem 0.75rem",
            marginBottom: "1rem",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          {publicos.length === 0 ? (
            <span>No hay fósiles públicos.</span>
          ) : (
            publicos.map((p) => (
              <label
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  marginBottom: "0.35rem",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleId(p.id)}
                />
                <span>
                  <strong>#{p.id}</strong> {p.nombre}
                </span>
              </label>
            ))
          )}
        </div>
        <label className="block mb-2">
          <span className="text-sm text-[var(--bonedim)]">Asunto</span>
          <input
            className="mt-1 w-full rounded border bg-transparent px-2 py-1.5 text-[var(--bone)]"
            style={{ borderColor: "var(--border)" }}
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Ej. Análisis microestructural de muestras"
          />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-[var(--bonedim)]">
            Qué querés investigar (objetivo)
          </span>
          <textarea
            className="mt-1 w-full rounded border bg-transparent px-2 py-2 text-[var(--bone)]"
            style={{ borderColor: "var(--border)", minHeight: "6rem" }}
            required
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Describe el objetivo científico, metodología prevista o colaboración que buscás."
          />
        </label>
        <button
          type="submit"
          disabled={sending || selected.size === 0}
          className="rounded-sm border px-4 py-2 text-sm font-medium"
          style={{
            borderColor: "var(--amber)",
            color: "var(--ink)",
            background: "var(--amber)",
            opacity: sending || selected.size === 0 ? 0.6 : 1,
          }}
        >
          {sending ? "Enviando…" : "Enviar solicitud al administrador"}
        </button>
      </form>

      <h2 className="sec-h" style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
        Mis solicitudes
      </h2>
      {solicitudes.length === 0 ? (
        <p className="sec-body" style={{ marginBottom: "2rem" }}>
          Todavía no enviaste solicitudes.
        </p>
      ) : (
        <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
          <table className="panel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asunto</th>
                <th>Estado</th>
                <th>Fósiles</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.asunto}</td>
                  <td>{s.estado}</td>
                  <td>
                    {(s.fosiles ?? [])
                      .map((f) => `#${f.id}`)
                      .join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="sec-h" style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
        Tu catálogo autorizado ({rows.length})
      </h2>
      <div className="grid gap-2 sm:grid-cols-3" style={{ marginBottom: "0.75rem" }}>
        <input
          placeholder="Filtrar por nombre"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="rounded-sm border px-2 py-1.5 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-sm border px-2 py-1.5 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <option value="">Todos los estados</option>
          <option value="publicado">Publicado</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_revision">En revisión</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>
      {rowsFiltrados.length === 0 ? (
        <p className="sec-body">
          No tenés fósiles autorizados todavía. Enviá una solicitud y esperá la
          aprobación del administrador.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="panel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rowsFiltrados.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.nombre}</td>
                  <td>{r.estado}</td>
                  <td>
                    <Link
                      href={`/panel/investigador/fosil/${r.id}`}
                      className="catalog-clear-filter"
                    >
                      Detalle científico
                    </Link>
                    {" · "}
                    <Link href={`/fosil/${r.id}`} className="catalog-clear-filter">
                      Ficha pública
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function InvestigadorPanelPage() {
  return (
    <PanelGuard need={NEED_INVESTIGADOR}>
      <InvestigadorContent />
    </PanelGuard>
  );
}
