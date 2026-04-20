"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";
import { ExploradorNuevoFosil } from "@/components/ExploradorNuevoFosil";
import { FosilMultimediaBlock } from "@/components/FosilMultimediaBlock";
import { PanelGuard } from "@/components/PanelGuard";
import { fetchMisRegistros } from "@/lib/api";
import type { ApiFosilRow } from "@/lib/api";
import { getPendingFosiles, syncPendingFosiles } from "@/lib/offline/exploradorQueue";
import { NEED_EXPLORADOR } from "@/lib/panelNeeds";

function ExploradorContent() {
  const [rows, setRows] = useState<ApiFosilRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pendingLocal, setPendingLocal] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const loadRows = useCallback(() => {
    setErr(null);
    return fetchMisRegistros()
      .then(setRows)
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"));
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const refreshPending = useCallback(() => {
    setPendingLocal(getPendingFosiles().length);
  }, []);

  useEffect(() => {
    refreshPending();
    const onOnline = async () => {
      setSyncing(true);
      try {
        await syncPendingFosiles();
        await loadRows();
      } finally {
        refreshPending();
        setSyncing(false);
      }
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [loadRows, refreshPending]);

  async function onSyncNow() {
    setSyncing(true);
    setErr(null);
    try {
      await syncPendingFosiles();
      await loadRows();
      refreshPending();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error sincronizando");
    } finally {
      setSyncing(false);
    }
  }

  if (err) {
    return (
      <p className="sec-body" style={{ color: "salmon" }}>
        {err}
      </p>
    );
  }

  if (rows === null) {
    return <p className="sec-body">Cargando tus registros desde la base…</p>;
  }

  return (
    <>
      <header style={{ marginBottom: "1.5rem" }}>
        <span className="sec-eyebrow">Explorador</span>
        <h1 className="sec-h" style={{ marginTop: "0.5rem" }}>
          Mis hallazgos
        </h1>
        <div className="sec-rule" />
        <p className="sec-body" style={{ marginTop: "1rem" }}>
          Listado desde <code className="catalog-code">FOSIL</code> con{" "}
          <code className="catalog-code">explorador_id</code> = tu usuario.
        </p>
        <p className="sec-body" style={{ marginTop: "0.5rem" }}>
          Pendientes offline: <strong>{pendingLocal}</strong>{" "}
          <button type="button" className="btn-out" onClick={onSyncNow} disabled={syncing}>
            {syncing ? "Sincronizando…" : "Sincronizar ahora"}
          </button>
        </p>
      </header>

      <ExploradorNuevoFosil onCreated={loadRows} onQueueUpdated={refreshPending} />

      {rows.length === 0 ? (
        <p className="sec-body">Aún no hay registros.</p>
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
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr>
                    <td>{r.id}</td>
                    <td>{r.nombre}</td>
                    <td>{r.estado}</td>
                    <td>
                      <Link
                        href={`/fosil/${r.id}`}
                        className="catalog-clear-filter"
                      >
                        Ver público
                      </Link>
                    </td>
                  </tr>
                  <tr className="panel-mm-row">
                    <td
                      colSpan={4}
                      style={{
                        paddingTop: "0.25rem",
                        paddingBottom: "1rem",
                        borderTop: "none",
                      }}
                    >
                      <details>
                        <summary className="cursor-pointer text-sm text-[var(--bonedim)]">
                          Fotos y videos
                        </summary>
                        <FosilMultimediaBlock fosilId={r.id} />
                      </details>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function ExploradorPanelPage() {
  return (
    <PanelGuard need={NEED_EXPLORADOR}>
      <ExploradorContent />
    </PanelGuard>
  );
}
