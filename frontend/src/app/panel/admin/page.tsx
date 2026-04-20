"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { FosilMultimediaBlock } from "@/components/FosilMultimediaBlock";
import { PanelGuard } from "@/components/PanelGuard";
import {
  fetchAdminContacto,
  deleteAdminUsuario,
  fetchAdminPendientes,
  fetchAdminSolicitudesInvestigacion,
  fetchAdminUsuarios,
  fetchMisRegistros,
  fetchRolesCatalogo,
  patchAdminAprobar,
  patchAdminAprobarSolicitudInv,
  patchAdminRechazar,
  patchAdminRechazarSolicitudInv,
  postAdminCrearUsuario,
  patchAdminUsuarioActivo,
  putAdminActualizarUsuario,
} from "@/lib/api";
import type {
  AdminPendiente,
  AdminSolicitudInvRow,
  ApiFosilRow,
  UsuarioAdminRow,
  ContactoAdminRow,
  UsuarioRolRow,
} from "@/lib/api";
import { NEED_ADMIN } from "@/lib/panelNeeds";

function AdminContent() {
  const [pend, setPend] = useState<AdminPendiente[] | null>(null);
  const [todos, setTodos] = useState<ApiFosilRow[] | null>(null);
  const [solInv, setSolInv] = useState<AdminSolicitudInvRow[] | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioAdminRow[] | null>(null);
  const [roles, setRoles] = useState<UsuarioRolRow[] | null>(null);
  const [contactos, setContactos] = useState<ContactoAdminRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [busySolId, setBusySolId] = useState<number | null>(null);
  const [busyUsuarioId, setBusyUsuarioId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    roles: [] as number[],
  });
  const [userSort, setUserSort] = useState<"newest" | "oldest" | "name">("newest");

  const refreshAll = useCallback(async () => {
    const [p, t, s, u, r, c] = await Promise.all([
      fetchAdminPendientes(),
      fetchMisRegistros(),
      fetchAdminSolicitudesInvestigacion().catch(() => [] as AdminSolicitudInvRow[]),
      fetchAdminUsuarios(),
      fetchRolesCatalogo(),
      fetchAdminContacto().catch(() => [] as ContactoAdminRow[]),
    ]);
    setPend(p);
    setTodos(t);
    setSolInv(s);
    setUsuarios(u);
    setRoles(r);
    setContactos(c);
  }, []);
  async function onCrearUsuario(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newUser.nombre || !newUser.apellido || !newUser.email || !newUser.password) {
      setErr("Completá nombre, apellido, email y contraseña");
      return;
    }
    if (newUser.roles.length === 0) {
      setErr("Seleccioná al menos un rol para el usuario");
      return;
    }
    setErr(null);
    try {
      await postAdminCrearUsuario(newUser);
      setNewUser({ nombre: "", apellido: "", email: "", password: "", roles: [] });
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al crear usuario");
    }
  }

  async function onToggleRolUsuario(user: UsuarioAdminRow, roleId: number) {
    const prev = (user.roles || []).map((r) => r.id);
    const next = prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId];
    if (next.length === 0) {
      setErr("Cada usuario debe conservar al menos un rol activo");
      return;
    }
    setBusyUsuarioId(user.id);
    setErr(null);
    try {
      await putAdminActualizarUsuario(user.id, {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono || "",
        pais: user.pais || "",
        profesion: user.profesion || "",
        centro_trabajo: user.centro_trabajo || "",
        roles: next,
      });
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al actualizar roles");
    } finally {
      setBusyUsuarioId(null);
    }
  }

  async function onEliminarUsuario(id: number) {
    if (!window.confirm("¿Eliminar usuario (soft delete)?")) return;
    setBusyUsuarioId(id);
    setErr(null);
    try {
      await deleteAdminUsuario(id);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al eliminar usuario");
    } finally {
      setBusyUsuarioId(null);
    }
  }

  async function onToggleActivoUsuario(user: UsuarioAdminRow) {
    setBusyUsuarioId(user.id);
    setErr(null);
    try {
      await patchAdminUsuarioActivo(user.id, !user.activo);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al actualizar estado del usuario");
    } finally {
      setBusyUsuarioId(null);
    }
  }


  useEffect(() => {
    refreshAll().catch((e) =>
      setErr(e instanceof Error ? e.message : "Error"),
    );
  }, [refreshAll]);

  async function onAprobar(id: number) {
    setErr(null);
    setBusyId(id);
    try {
      await patchAdminAprobar(id);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al aprobar");
    } finally {
      setBusyId(null);
    }
  }

  async function onAprobarSolicitudInv(id: number) {
    setErr(null);
    setBusySolId(id);
    try {
      await patchAdminAprobarSolicitudInv(id);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al aprobar solicitud");
    } finally {
      setBusySolId(null);
    }
  }

  async function onRechazarSolicitudInv(id: number) {
    const nota = window.prompt("Motivo del rechazo (opcional):") ?? "";
    setErr(null);
    setBusySolId(id);
    try {
      await patchAdminRechazarSolicitudInv(id, nota);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al rechazar solicitud");
    } finally {
      setBusySolId(null);
    }
  }

  async function onRechazar(id: number) {
    if (
      !window.confirm(
        "¿Rechazar este registro? Quedará marcado como rechazado.",
      )
    ) {
      return;
    }
    setErr(null);
    setBusyId(id);
    try {
      await patchAdminRechazar(id);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al rechazar");
    } finally {
      setBusyId(null);
    }
  }

  if (err) {
    return (
      <p className="sec-body" style={{ color: "salmon" }}>
        {err}
      </p>
    );
  }

  if (
    pend === null ||
    todos === null ||
    solInv === null ||
    usuarios === null ||
    roles === null ||
    contactos === null
  ) {
    return <p className="sec-body">Cargando panel de administración…</p>;
  }

  const usuariosOrdenados = [...usuarios].sort((a, b) => {
    if (userSort === "name") {
      const an = `${a.nombre} ${a.apellido}`.toLowerCase();
      const bn = `${b.nombre} ${b.apellido}`.toLowerCase();
      return an.localeCompare(bn, "es");
    }
    if (userSort === "oldest") return a.id - b.id;
    return b.id - a.id;
  });

  return (
    <>
      <header style={{ marginBottom: "1.5rem" }}>
        <span className="sec-eyebrow">Administración</span>
        <h1 className="sec-h" style={{ marginTop: "0.5rem" }}>
          Revisión y catálogo
        </h1>
        <div className="sec-rule" />
        <p className="sec-body" style={{ marginTop: "1rem" }}>
          Solicitudes de investigadores, pendientes de hallazgos y catálogo
          completo.
        </p>
      </header>

      <h2 className="sec-h" style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
        Solicitudes de acceso (investigación)
      </h2>
      {solInv.length === 0 ? (
        <p className="sec-body" style={{ marginBottom: "2rem" }}>
          No hay solicitudes pendientes de investigadores.
        </p>
      ) : (
        <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
          <table className="panel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Investigador</th>
                <th>Asunto</th>
                <th>Fósiles</th>
                <th>Alta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solInv.map((s) => (
                <Fragment key={s.id}>
                  <tr>
                    <td>{s.id}</td>
                    <td>
                      {s.inv_nombre} {s.inv_apellido}
                      <br />
                      <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>
                        {s.inv_email}
                      </span>
                    </td>
                    <td>{s.asunto}</td>
                    <td>
                      {(s.fosiles ?? [])
                        .map((f) => `#${f.id}`)
                        .join(", ")}
                    </td>
                    <td>
                      {typeof s.created_at === "string"
                        ? s.created_at
                        : String(s.created_at)}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-sm border px-2 py-1 text-sm text-[var(--bone)]"
                          style={{ borderColor: "var(--border)" }}
                          disabled={busySolId === s.id}
                          onClick={() => onAprobarSolicitudInv(s.id)}
                        >
                          {busySolId === s.id ? "…" : "Aprobar acceso"}
                        </button>
                        <button
                          type="button"
                          className="rounded-sm border px-2 py-1 text-sm"
                          style={{
                            borderColor: "var(--border)",
                            color: "salmon",
                          }}
                          disabled={busySolId === s.id}
                          onClick={() => onRechazarSolicitudInv(s.id)}
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        paddingTop: "0.25rem",
                        paddingBottom: "1rem",
                        borderTop: "none",
                        fontSize: "0.88rem",
                        opacity: 0.92,
                      }}
                    >
                      <strong>Objetivo:</strong> {s.mensaje}
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="sec-h" style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
        Pendientes (hallazgos de exploradores)
      </h2>
      {pend.length === 0 ? (
        <p className="sec-body" style={{ marginBottom: "2rem" }}>
          No hay fósiles en estado pendiente.
        </p>
      ) : (
        <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
          <table className="panel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Alta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pend.map((r) => (
                <Fragment key={r.id}>
                  <tr>
                    <td>{r.id}</td>
                    <td>{r.nombre}</td>
                    <td>{r.estado}</td>
                    <td>
                      {typeof r.created_at === "string"
                        ? r.created_at
                        : String(r.created_at)}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-sm border px-2 py-1 text-sm text-[var(--bone)]"
                          style={{ borderColor: "var(--border)" }}
                          disabled={busyId === r.id}
                          onClick={() => onAprobar(r.id)}
                        >
                          {busyId === r.id ? "…" : "Aprobar"}
                        </button>
                        <button
                          type="button"
                          className="rounded-sm border px-2 py-1 text-sm"
                          style={{
                            borderColor: "var(--border)",
                            color: "salmon",
                          }}
                          disabled={busyId === r.id}
                          onClick={() => onRechazar(r.id)}
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={5}
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

      <h2 className="sec-h" style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
        Todos los registros ({todos.length})
      </h2>
      {todos.length === 0 ? (
        <p className="sec-body">Sin registros.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="panel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {todos.slice(0, 50).map((r) => (
                <Fragment key={r.id}>
                  <tr>
                    <td>{r.id}</td>
                    <td>{r.nombre}</td>
                    <td>{r.estado}</td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
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
          {todos.length > 50 ? (
            <p className="sec-body" style={{ marginTop: "0.75rem", opacity: 0.85 }}>
              Mostrando 50 de {todos.length}.
            </p>
          ) : null}
        </div>
      )}

      <h2 className="sec-h" style={{ fontSize: "1.25rem", margin: "2rem 0 0.75rem" }}>
        Gestión de usuarios y roles
      </h2>
      <form
        onSubmit={onCrearUsuario}
        className="rounded-sm border p-3"
        style={{ borderColor: "var(--border)", marginBottom: "1rem" }}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            placeholder="Nombre"
            value={newUser.nombre}
            onChange={(e) => setNewUser((s) => ({ ...s, nombre: e.target.value }))}
            className="rounded-sm border px-2 py-1"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          />
          <input
            placeholder="Apellido"
            value={newUser.apellido}
            onChange={(e) => setNewUser((s) => ({ ...s, apellido: e.target.value }))}
            className="rounded-sm border px-2 py-1"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          />
          <input
            placeholder="Correo"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))}
            className="rounded-sm border px-2 py-1"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
            className="rounded-sm border px-2 py-1"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          />
        </div>
        <p className="sec-body" style={{ margin: "0.5rem 0" }}>
          Roles:
        </p>
        <div className="flex flex-wrap gap-3">
          {roles.map((r) => (
            <label key={r.id} className="text-sm">
              <input
                type="checkbox"
                checked={newUser.roles.includes(r.id)}
                onChange={(e) =>
                  setNewUser((s) => ({
                    ...s,
                    roles: e.target.checked
                      ? [...s.roles, r.id]
                      : s.roles.filter((x) => x !== r.id),
                  }))
                }
              />{" "}
              {r.nombre}
            </label>
          ))}
        </div>
        <button type="submit" className="btn-fill" style={{ marginTop: "0.75rem" }}>
          Crear usuario
        </button>
      </form>

      {usuarios.length === 0 ? (
        <p className="sec-body">No hay usuarios.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={{ marginBottom: "0.6rem" }}>
            <label className="text-sm text-[var(--bonedim)]">
              Orden:
              <select
                value={userSort}
                onChange={(e) => setUserSort(e.target.value as "newest" | "oldest" | "name")}
                className="ml-2 rounded-sm border px-2 py-1 text-sm"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <option value="newest">Nuevos primero</option>
                <option value="oldest">Orden por ID (asc)</option>
                <option value="name">Nombre (A-Z)</option>
              </select>
            </label>
          </div>
          <table className="panel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Activo</th>
                <th>Roles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosOrdenados.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    {u.nombre} {u.apellido}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.activo ? "Sí" : "No"}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((r) => (
                        <label key={`${u.id}-${r.id}`} className="text-xs">
                          <input
                            type="checkbox"
                            disabled={busyUsuarioId === u.id}
                            checked={(u.roles || []).some((x) => x.id === r.id)}
                            onChange={() => onToggleRolUsuario(u, r.id)}
                          />{" "}
                          {r.nombre}
                        </label>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="rounded-sm border px-2 py-1 text-sm"
                      style={{ borderColor: "var(--border)" }}
                      disabled={busyUsuarioId === u.id}
                      onClick={() => onToggleActivoUsuario(u)}
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      className="rounded-sm border px-2 py-1 text-sm"
                      style={{ borderColor: "var(--border)", color: "salmon" }}
                      disabled={busyUsuarioId === u.id}
                      onClick={() => onEliminarUsuario(u.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="sec-h" style={{ fontSize: "1.25rem", margin: "2rem 0 0.75rem" }}>
        Mensajes de contacto ({contactos.length})
      </h2>
      {contactos.length === 0 ? (
        <p className="sec-body">Aún no hay mensajes en contacto.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="panel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Asunto</th>
                <th>Mensaje</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {contactos.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.nombre}</td>
                  <td>{m.email}</td>
                  <td>{m.asunto}</td>
                  <td style={{ maxWidth: "24rem", whiteSpace: "pre-wrap" }}>{m.mensaje}</td>
                  <td>{String(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminPanelPage() {
  return (
    <PanelGuard need={NEED_ADMIN}>
      <AdminContent />
    </PanelGuard>
  );
}
