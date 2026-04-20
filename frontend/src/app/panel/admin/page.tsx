"use client";

import { Fragment, useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FosilMultimediaBlock } from "@/components/FosilMultimediaBlock";
import { PanelGuard } from "@/components/PanelGuard";
import { EmptyState, ErrorState, LoadingState } from "@/components/UIStates";
import {
  fetchAdminContacto,
  deleteAdminUsuario,
  fetchAdminPendientes,
  fetchAdminSolicitudesInvestigacion,
  fetchAdminUsuarios,
  fetchAdminSuscriptores,
  fetchAdminSuscriptoresHistorial,
  patchAdminSuscriptorActivo,
  deleteAdminSuscriptor,
  fetchMisRegistros,
  fetchRolesCatalogo,
  patchAdminContactoLeido,
  deleteAdminContacto,
  patchAdminAprobar,
  patchAdminAprobarSolicitudInv,
  patchAdminRechazar,
  patchAdminRechazarSolicitudInv,
  postAdminCrearUsuario,
  patchAdminUsuarioActivo,
  fetchAdminPapelera,
  patchAdminRestaurarPapeleraUsuario,
  patchAdminRestaurarPapeleraFosil,
  patchAdminRestaurarPapeleraContacto,
  deleteAdminFosil,
  putActualizarFosil,
  putAdminActualizarUsuario,
} from "@/lib/api";
import type {
  AdminPendiente,
  AdminSolicitudInvRow,
  ApiFosilRow,
  UsuarioAdminRow,
  ContactoAdminRow,
  UsuarioRolRow,
  SuscriptorRow,
  SuscriptorHistorialRow,
  PapeleraAdminRow,
} from "@/lib/api";
import { NEED_ADMIN } from "@/lib/panelNeeds";

const cardStyle: CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--card)",
  borderRadius: "10px",
  padding: "1.25rem",
};

const PAGE_SIZE = 10;

function EstadoChip({ estado }: { estado?: string | null }) {
  const e = (estado || "").toLowerCase();
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.12rem 0.45rem",
    borderRadius: "999px",
    fontSize: "0.72rem",
    border: "1px solid var(--border)",
    textTransform: "capitalize",
  };
  if (e === "publicado") {
    style.color = "#8de3b0";
    style.background = "rgba(20,120,60,.22)";
  } else if (e === "pendiente") {
    style.color = "#ffdd95";
    style.background = "rgba(140,95,20,.28)";
  } else if (e === "en_revision") {
    style.color = "#a8d1ff";
    style.background = "rgba(26,74,138,.28)";
  } else if (e === "rechazado") {
    style.color = "#ffb0a8";
    style.background = "rgba(150,45,45,.25)";
  } else if (e === "activo") {
    style.color = "#8de3b0";
    style.background = "rgba(20,120,60,.22)";
  } else if (e === "inactivo") {
    style.color = "#c7c7c7";
    style.background = "rgba(90,90,90,.28)";
  } else {
    style.color = "var(--bonedim)";
    style.background = "rgba(255,255,255,.05)";
  }
  return <span style={style}>{estado || "sin estado"}</span>;
}

function Pager({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-2 flex items-center justify-end gap-2 text-sm">
      <button
        type="button"
        className="rounded-sm border px-2 py-1"
        style={{ borderColor: "var(--border)" }}
        onClick={onPrev}
        disabled={page <= 1}
      >
        Anterior
      </button>
      <span className="text-[var(--bonedim)]">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className="rounded-sm border px-2 py-1"
        style={{ borderColor: "var(--border)" }}
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Siguiente
      </button>
    </div>
  );
}

function formatInboxDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - dateOnly.getTime()) / 86400000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (diffDays === 0) return `Hoy ${hh}:${mm}`;
  if (diffDays === 1) return `Ayer ${hh}:${mm}`;
  return d.toLocaleDateString("es-CR", { day: "numeric", month: "short" });
}

function roleBadgeColor(role: string) {
  const r = role.toLowerCase();
  if (r.includes("administrador")) return "rgba(200,130,10,.22)";
  if (r.includes("investigador")) return "rgba(39,95,196,.26)";
  if (r.includes("explorador")) return "rgba(24,126,84,.26)";
  return "rgba(255,255,255,.08)";
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <article style={cardStyle}>
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--bonedim)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--bone)]">{value}</p>
    </article>
  );
}

function AdminContent() {
  const [activeSection, setActiveSection] = useState<
    "resumen" | "solicitudes" | "pendientes" | "catalogo" | "usuarios" | "papelera" | "contacto" | "suscriptores"
  >("resumen");
  const [pend, setPend] = useState<AdminPendiente[] | null>(null);
  const [todos, setTodos] = useState<ApiFosilRow[] | null>(null);
  const [solInv, setSolInv] = useState<AdminSolicitudInvRow[] | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioAdminRow[] | null>(null);
  const [papelera, setPapelera] = useState<PapeleraAdminRow | null>(null);
  const [roles, setRoles] = useState<UsuarioRolRow[] | null>(null);
  const [contactos, setContactos] = useState<ContactoAdminRow[] | null>(null);
  const [suscriptores, setSuscriptores] = useState<SuscriptorRow[] | null>(null);
  const [susHistorial, setSusHistorial] = useState<SuscriptorHistorialRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [busySolId, setBusySolId] = useState<number | null>(null);
  const [busyUsuarioId, setBusyUsuarioId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<
    | { type: "delete-user"; id: number }
    | { type: "delete-fosil"; id: number }
    | { type: "delete-contact-batch"; count: number }
    | { type: "delete-subscriber"; id: number }
    | { type: "reject-fosil"; id: number }
    | { type: "reject-sol"; id: number }
    | null
  >(null);
  const [newUser, setNewUser] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    roles: [] as number[],
  });
  const [editingFosil, setEditingFosil] = useState<{
    id: number;
    nombre: string;
    descripcion_general: string;
  } | null>(null);
  const [userSort, setUserSort] = useState<"newest" | "oldest" | "name">("newest");
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [pendSearch, setPendSearch] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogEstadoFilter, setCatalogEstadoFilter] = useState<
    "all" | "pendiente" | "en_revision" | "publicado" | "rechazado"
  >("all");
  const [catalogCategoriaFilter, setCatalogCategoriaFilter] = useState<"all" | "FOS" | "MIN" | "ROC" | "PAL">("all");
  const [usuariosSearch, setUsuariosSearch] = useState("");
  const [usuariosRolFilter, setUsuariosRolFilter] = useState<"all" | "administrador" | "investigador" | "explorador">("all");
  const [contactoSearch, setContactoSearch] = useState("");
  const [pendPage, setPendPage] = useState(1);
  const [catalogPage, setCatalogPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [contactPage, setContactPage] = useState(1);
  const [selectedContactoId, setSelectedContactoId] = useState<number | null>(null);
  const [selectedForDeleteIds, setSelectedForDeleteIds] = useState<number[]>([]);

  const refreshAll = useCallback(async () => {
    const [p, t, s, u, tr, r, c, subs, hist] = await Promise.all([
      fetchAdminPendientes(),
      fetchMisRegistros(),
      fetchAdminSolicitudesInvestigacion().catch(() => [] as AdminSolicitudInvRow[]),
      fetchAdminUsuarios(),
      fetchAdminPapelera(),
      fetchRolesCatalogo(),
      fetchAdminContacto().catch(() => [] as ContactoAdminRow[]),
      fetchAdminSuscriptores().catch(() => [] as SuscriptorRow[]),
      fetchAdminSuscriptoresHistorial().catch(() => [] as SuscriptorHistorialRow[]),
    ]);
    setPend(p);
    setTodos(t);
    setSolInv(s);
    setUsuarios(u);
    setPapelera(tr);
    setRoles(r);
    setContactos(c);
    setSuscriptores(subs);
    setSusHistorial(hist);
  }, []);
  async function onCrearUsuario(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newUser.nombre || !newUser.apellido || !newUser.email || !newUser.password) {
      setErr("Completá nombre, apellido, email y contraseña");
      return false;
    }
    if (newUser.roles.length === 0) {
      setErr("Seleccioná al menos un rol para el usuario");
      return false;
    }
    setErr(null);
    try {
      await postAdminCrearUsuario(newUser);
      setNewUser({ nombre: "", apellido: "", email: "", password: "", roles: [] });
      await refreshAll();
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al crear usuario");
      return false;
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

  async function onRestaurarUsuarioPapelera(id: number) {
    setBusyUsuarioId(id);
    setErr(null);
    try {
      await patchAdminRestaurarPapeleraUsuario(id);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al restaurar usuario");
    } finally {
      setBusyUsuarioId(null);
    }
  }

  async function onRestaurarFosilPapelera(id: number) {
    setBusyId(id);
    setErr(null);
    try {
      await patchAdminRestaurarPapeleraFosil(id);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al restaurar fósil");
    } finally {
      setBusyId(null);
    }
  }

  async function onRestaurarContactoPapelera(id: number) {
    setBusyId(id);
    setErr(null);
    try {
      await patchAdminRestaurarPapeleraContacto(id);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al restaurar mensaje");
    } finally {
      setBusyId(null);
    }
  }

  async function onEliminarFosil(id: number) {
    setBusyId(id);
    setErr(null);
    try {
      await deleteAdminFosil(id);
      setEditingFosil((curr) => (curr?.id === id ? null : curr));
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al eliminar fósil");
    } finally {
      setBusyId(null);
    }
  }


  useEffect(() => {
    refreshAll().catch((e) =>
      setErr(e instanceof Error ? e.message : "Error"),
    );
  }, [refreshAll]);

  useEffect(() => setPendPage(1), [pendSearch]);
  useEffect(() => setCatalogPage(1), [catalogSearch, catalogEstadoFilter, catalogCategoriaFilter]);
  useEffect(() => setUsersPage(1), [usuariosSearch, usuariosRolFilter, userSort]);
  useEffect(() => setContactPage(1), [contactoSearch]);
  useEffect(() => {
    if (!contactos || contactos.length === 0) {
      setSelectedContactoId(null);
      return;
    }
    if (selectedContactoId == null || !contactos.some((m) => m.id === selectedContactoId)) {
      setSelectedContactoId(contactos[0].id);
    }
  }, [contactos, selectedContactoId]);
  useEffect(() => setSelectedForDeleteIds([]), [contactoSearch, activeSection]);

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

  async function onRechazarSolicitudInv(id: number, nota = "") {
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

  async function onGuardarEdicionFosil(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingFosil) return;
    setErr(null);
    setBusyId(editingFosil.id);
    try {
      await putActualizarFosil(editingFosil.id, {
        nombre: editingFosil.nombre,
        descripcion_general: editingFosil.descripcion_general,
      });
      setEditingFosil(null);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al guardar cambios del catálogo");
    } finally {
      setBusyId(null);
    }
  }

  async function onAbrirContacto(m: ContactoAdminRow) {
    setSelectedContactoId(m.id);
    if (m.leido) return;
    try {
      await patchAdminContactoLeido(m.id, true);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo marcar como leído");
    }
  }

  async function onEliminarMensajesSeleccionados() {
    if (selectedForDeleteIds.length === 0) return;
    setErr(null);
    try {
      await Promise.all(selectedForDeleteIds.map((id) => deleteAdminContacto(id)));
      setSelectedForDeleteIds([]);
      setSelectedContactoId(null);
      await refreshAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudieron eliminar mensajes");
    }
  }

  if (err) {
    return <ErrorState text={err} />;
  }

  if (
    pend === null ||
    todos === null ||
    solInv === null ||
    usuarios === null ||
    papelera === null ||
    roles === null ||
    contactos === null
  ) {
    return <LoadingState text="Cargando panel de administración…" />;
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

  const usuariosActivos = usuarios.filter((u) => u.activo).length;
  const solicitudesPendientes = solInv.filter((s) => s.estado === "pendiente").length;
  const isRead = (m: ContactoAdminRow) => m.leido;
  const mensajesSinLeer = contactos.filter((c) => !isRead(c)).length;
  const totalPendientes = pend.length;
  const pendNorm = pendSearch.trim().toLowerCase();
  const catalogNorm = catalogSearch.trim().toLowerCase();
  const usersNorm = usuariosSearch.trim().toLowerCase();
  const contactNorm = contactoSearch.trim().toLowerCase();
  const pendFiltered = pend.filter((r) => {
    if (!pendNorm) return true;
    return (
      String(r.id).includes(pendNorm) ||
      (r.nombre || "").toLowerCase().includes(pendNorm) ||
      (r.estado || "").toLowerCase().includes(pendNorm)
    );
  });
  function categoriaBadge(row: ApiFosilRow) {
    return (
      row.categoria_codigo ||
      (row.categoria_id === 1
        ? "FOS"
        : row.categoria_id === 2
          ? "MIN"
          : row.categoria_id === 3
            ? "ROC"
            : row.categoria_id === 4
              ? "PAL"
              : "GEN")
    );
  }
  const todosFiltered = todos.filter((r) => {
    const estadoOk = catalogEstadoFilter === "all" || r.estado === catalogEstadoFilter;
    const cat = categoriaBadge(r);
    const categoriaOk = catalogCategoriaFilter === "all" || cat === catalogCategoriaFilter;
    if (!estadoOk || !categoriaOk) return false;
    if (!catalogNorm) return true;
    return (
      String(r.id).includes(catalogNorm) ||
      (r.nombre || "").toLowerCase().includes(catalogNorm) ||
      (r.codigo_unico || "").toLowerCase().includes(catalogNorm) ||
      (r.descripcion_general || "").toLowerCase().includes(catalogNorm)
    );
  });
  const usuariosFiltered = usuariosOrdenados.filter((u) => {
    const roleNames = (u.roles || []).map((r) => r.nombre.toLowerCase());
    const roleOk =
      usuariosRolFilter === "all" ||
      roleNames.some((name) => name.includes(usuariosRolFilter));
    if (!roleOk) return false;
    if (!usersNorm) return true;
    const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
    return (
      String(u.id).includes(usersNorm) ||
      fullName.includes(usersNorm) ||
      (u.email || "").toLowerCase().includes(usersNorm)
    );
  });
  const contactosFiltered = contactos.filter((m) => {
    if (!contactNorm) return true;
    return (
      String(m.id).includes(contactNorm) ||
      (m.nombre || "").toLowerCase().includes(contactNorm) ||
      (m.email || "").toLowerCase().includes(contactNorm) ||
      (m.asunto || "").toLowerCase().includes(contactNorm) ||
      (m.mensaje || "").toLowerCase().includes(contactNorm)
    );
  });
  const contactosVisible = contactosFiltered;
  const pendTotalPages = Math.max(1, Math.ceil(pendFiltered.length / PAGE_SIZE));
  const catalogTotalPages = Math.max(1, Math.ceil(todosFiltered.length / PAGE_SIZE));
  const usersTotalPages = Math.max(1, Math.ceil(usuariosFiltered.length / PAGE_SIZE));
  const contactTotalPages = Math.max(1, Math.ceil(contactosVisible.length / PAGE_SIZE));
  const pendPageRows = pendFiltered.slice((pendPage - 1) * PAGE_SIZE, pendPage * PAGE_SIZE);
  const catalogPageRows = todosFiltered.slice(
    (catalogPage - 1) * PAGE_SIZE,
    catalogPage * PAGE_SIZE,
  );
  const usersPageRows = usuariosFiltered.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE);
  const contactPageRows = contactosVisible.slice(
    (contactPage - 1) * PAGE_SIZE,
    contactPage * PAGE_SIZE,
  );
  const solicitudesPendientesRows = solInv.filter((s) => s.estado === "pendiente");
  const solicitudesHistorialRows = solInv.filter((s) => s.estado !== "pendiente");
  const selectedContacto =
    contactos.find((m) => m.id === selectedContactoId) || contactPageRows[0] || null;
  const readVisibleIds = contactosVisible.filter((m) => isRead(m)).map((m) => m.id);
  const selectedCount = selectedForDeleteIds.length;
  const usuariosPapeleraRows = papelera.usuarios || [];
  const fosilesPapeleraRows = papelera.fosiles || [];
  const contactoPapeleraRows = papelera.contacto || [];
  const menuItems: Array<{
    id: "resumen" | "solicitudes" | "pendientes" | "catalogo" | "usuarios" | "papelera" | "contacto" | "suscriptores";
    label: string;
  }> = [
    { id: "resumen", label: "Resumen" },
    { id: "solicitudes", label: "Solicitudes" },
    { id: "pendientes", label: "Pendientes" },
    { id: "catalogo", label: "Catálogo" },
    { id: "usuarios", label: "Usuarios" },
    { id: "papelera", label: "Papelera" },
    { id: "contacto", label: "Contacto" },
    { id: "suscriptores", label: "Suscriptores" },
  ];

  return (
    <>
      <header style={{ marginBottom: "1.25rem" }}>
        <span className="sec-eyebrow">Administración</span>
        <h1 className="sec-h" style={{ marginTop: "0.5rem" }}>
          Dashboard administrativo
        </h1>
        <div className="sec-rule" />
        <p className="sec-body" style={{ marginTop: "1rem" }}>
          Vista central para revisar solicitudes, aprobar hallazgos, administrar
          usuarios y monitorear mensajes de contacto.
        </p>
      </header>

      <section
        style={{
          ...cardStyle,
          marginBottom: "1.15rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.8rem",
          alignItems: "center",
          padding: "0.95rem 1rem",
        }}
      >
        {menuItems.map((item) => {
          const active = activeSection === item.id;
          const hasNotice =
            (item.id === "solicitudes" && solicitudesPendientesRows.length > 0) ||
            (item.id === "pendientes" && totalPendientes > 0) ||
            (item.id === "contacto" && mensajesSinLeer > 0);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className="rounded-sm border px-3 py-1.5 text-sm"
              style={{
                borderColor: active ? "var(--amber)" : "var(--border)",
                color: active ? "var(--amberhot)" : "var(--bone)",
                background: active ? "rgba(200,130,10,.12)" : "transparent",
                minHeight: "2.2rem",
                paddingInline: "0.95rem",
              }}
            >
              <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                {item.label}
                {hasNotice ? (
                  <span
                    style={{
                      position: "absolute",
                      top: "-0.45rem",
                      right: "-0.55rem",
                      width: "0.4rem",
                      height: "0.4rem",
                      borderRadius: "999px",
                      background: "var(--amberhot)",
                    }}
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </section>

      {activeSection === "resumen" ? (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(180px, 1fr))", gap: "0.75rem" }}>
            <StatCard label="Hallazgos pendientes" value={totalPendientes} />
            <StatCard label="Solicitudes investigación" value={solicitudesPendientes} />
            <StatCard label="Usuarios activos" value={usuariosActivos} />
            <StatCard label="Mensajes sin leer" value={mensajesSinLeer} />
          </div>
          <div style={{ ...cardStyle, margin: 0 }}>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--bonedim)]">Acciones rápidas</p>
            <div className="mt-3 grid gap-2">
              {[
                ["Ir a Solicitudes", "solicitudes"],
                ["Ir a Pendientes", "pendientes"],
                ["Ir a Catálogo", "catalogo"],
                ["Ir a Usuarios", "usuarios"],
              ].map(([label, section]) => (
                <button
                  key={section}
                  type="button"
                  className="rounded-sm border px-3 py-2 text-left text-sm"
                  style={{ borderColor: "var(--border)" }}
                  onClick={() =>
                    setActiveSection(
                      section as "solicitudes" | "pendientes" | "catalogo" | "usuarios",
                    )
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
            <h2 className="sec-h" style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>
              Actividad reciente
            </h2>
            <div style={{ overflowX: "auto" }}>
              <table className="panel-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Detalle</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...pend.slice(0, 3).map((p) => ({
                      tipo: "Hallazgo",
                      detalle: p.nombre,
                      fecha: String(p.created_at),
                      estado: p.estado,
                    })),
                    ...solInv.slice(0, 3).map((s) => ({
                      tipo: "Solicitud",
                      detalle: s.asunto,
                      fecha: String(s.created_at),
                      estado: s.estado,
                    })),
                  ]
                    .slice(0, 6)
                    .map((r, i) => (
                      <tr key={`${r.tipo}-${i}`}>
                        <td>{r.tipo}</td>
                        <td>{r.detalle}</td>
                        <td>{formatInboxDate(r.fecha)}</td>
                        <td>
                          <EstadoChip estado={r.estado} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "solicitudes" ? (
        <section style={{ ...cardStyle, marginBottom: "1.15rem" }}>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="sec-h" style={{ fontSize: "1.2rem" }}>
              Solicitudes de acceso (investigación)
            </h2>
            <p className="sec-body" style={{ marginTop: "0.25rem" }}>
              Gestión de solicitudes de investigadores para acceder al detalle científico.
            </p>
          </div>
        </div>
        {solicitudesPendientesRows.length === 0 ? (
          <EmptyState text="No hay solicitudes pendientes de investigadores." />
        ) : (
          <div className="grid gap-3">
            {solicitudesPendientesRows.map((s) => (
              <article key={s.id} className="rounded-sm border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-[var(--bone)]">
                      {s.inv_nombre} {s.inv_apellido}
                    </p>
                    <p className="text-xs text-[var(--bonedim)]">{s.inv_email}</p>
                  </div>
                  <EstadoChip estado={s.estado} />
                </div>
                <p className="text-sm text-[var(--bone)]">{s.asunto}</p>
                <p className="mt-1 text-xs text-[var(--bonedim)]">Institución: No registrada</p>
                <p className="mt-1 text-xs text-[var(--bonedim)]">
                  Fósiles solicitados: {(s.fosiles ?? []).map((f) => `#${f.id}`).join(", ") || "—"}
                </p>
                <p className="mt-2 text-sm text-[var(--bonedim)]">{s.mensaje}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-sm border px-3 py-1.5 text-sm"
                    style={{ borderColor: "rgba(30,140,70,.5)", color: "#9be3b8" }}
                    disabled={busySolId === s.id}
                    onClick={() => onAprobarSolicitudInv(s.id)}
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    className="rounded-sm border px-3 py-1.5 text-sm"
                    style={{ borderColor: "rgba(170,70,70,.5)", color: "#ffb0a8" }}
                    disabled={busySolId === s.id}
                    onClick={() => setDialog({ type: "reject-sol", id: s.id })}
                  >
                    Rechazar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        <h3 className="sec-h" style={{ fontSize: "1.05rem", margin: "1.2rem 0 0.6rem" }}>
          Historial
        </h3>
        {solicitudesHistorialRows.length === 0 ? (
          <EmptyState text="Sin solicitudes procesadas todavía." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="panel-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Investigador</th>
                  <th>Asunto</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesHistorialRows.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.inv_nombre} {s.inv_apellido}</td>
                    <td>{s.asunto}</td>
                    <td>{formatInboxDate(String(s.created_at))}</td>
                    <td><EstadoChip estado={s.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      ) : null}

      {activeSection === "pendientes" ? (
        <section style={{ ...cardStyle, marginBottom: "1.15rem" }}>
        <h2 className="sec-h" style={{ fontSize: "1.2rem" }}>
          Pendientes (hallazgos de exploradores)
        </h2>
        <div className="mb-3">
          <input
            value={pendSearch}
            onChange={(e) => setPendSearch(e.target.value)}
            placeholder="Buscar por ID, nombre o estado"
            className="w-full rounded-sm border px-3 py-2"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          />
        </div>
        {pendFiltered.length === 0 ? (
          <EmptyState text="No hay fósiles en estado pendiente." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="panel-table">
              <thead>
                <tr>
                  <th>Fósil</th>
                  <th>Explorador</th>
                  <th>Ubicación</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendPageRows.map((r) => (
                  <Fragment key={r.id}>
                    <tr>
                      <td>
                        <p className="text-sm text-[var(--bone)]">{r.nombre}</p>
                        <p className="text-xs text-[var(--bonedim)]">#{r.id}</p>
                      </td>
                      <td>
                        {
                          (() => {
                            const full = todos.find((t) => t.id === r.id);
                            return full?.explorador_nombre
                              ? `${full.explorador_nombre} ${full.explorador_apellido || ""}`.trim()
                              : `Explorador #${((full as unknown as { explorador_id?: number })?.explorador_id) || "—"}`;
                          })()
                        }
                      </td>
                      <td>{(todos.find((t) => t.id === r.id)?.descripcion_ubicacion as string) || "—"}</td>
                      <td>{formatInboxDate(typeof r.created_at === "string" ? r.created_at : String(r.created_at))}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-sm border px-2 py-1 text-sm"
                            style={{ borderColor: "rgba(30,140,70,.5)", color: "#9be3b8" }}
                            disabled={busyId === r.id}
                            onClick={() => onAprobar(r.id)}
                          >
                            {busyId === r.id ? "…" : "Publicar"}
                          </button>
                          <button
                            type="button"
                            className="rounded-sm border px-2 py-1 text-sm"
                            style={{ borderColor: "rgba(170,70,70,.5)", color: "#ffb0a8" }}
                            disabled={busyId === r.id}
                            onClick={() => setDialog({ type: "reject-fosil", id: r.id })}
                          >
                            Rechazar
                          </button>
                          <button
                            type="button"
                            className="rounded-sm border px-2 py-1 text-sm"
                            style={{ borderColor: "var(--border)", color: "var(--bone)" }}
                            onClick={() => setActiveSection("catalogo")}
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={5}
                        style={{ paddingTop: "0.25rem", paddingBottom: "1rem", borderTop: "none" }}
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
        <Pager
          page={pendPage}
          totalPages={pendTotalPages}
          onPrev={() => setPendPage((p) => Math.max(1, p - 1))}
          onNext={() => setPendPage((p) => Math.min(pendTotalPages, p + 1))}
        />
      </section>
      ) : null}

      {activeSection === "catalogo" ? (
        <section style={{ ...cardStyle, marginBottom: "1.15rem" }}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="sec-h" style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}>
              Catálogo ({todosFiltered.length})
            </h2>
            <p className="sec-body">Gestioná registros y editá en la misma vista.</p>
          </div>
          <Link href="/panel/explorador" className="btn-fill">+ Nuevo Fósil</Link>
        </div>
        <div
          className="mb-3 grid gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
        >
          <input
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
            placeholder="Buscar por ID, nombre, código o descripción"
            className="rounded-sm border px-3 py-2"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          />
          <select
            value={catalogEstadoFilter}
            onChange={(e) =>
              setCatalogEstadoFilter(
                e.target.value as "all" | "pendiente" | "en_revision" | "publicado" | "rechazado",
              )
            }
            className="rounded-sm border px-3 py-2"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_revision">En revisión</option>
            <option value="publicado">Publicado</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <select
            value={catalogCategoriaFilter}
            onChange={(e) => setCatalogCategoriaFilter(e.target.value as "all" | "FOS" | "MIN" | "ROC" | "PAL")}
            className="rounded-sm border px-3 py-2"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <option value="all">Todas las categorías</option>
            <option value="FOS">FOS</option>
            <option value="MIN">MIN</option>
            <option value="ROC">ROC</option>
            <option value="PAL">PAL</option>
          </select>
        </div>
        {editingFosil ? (
          <form
            onSubmit={onGuardarEdicionFosil}
            className="mb-3 rounded-sm border p-3"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <p className="mb-2 text-sm text-[var(--bonedim)]">
              Editando registro #{editingFosil.id}
            </p>
            <div className="grid gap-2">
              <input
                value={editingFosil.nombre}
                onChange={(e) =>
                  setEditingFosil((s) => (s ? { ...s, nombre: e.target.value } : s))
                }
                className="rounded-sm border px-2 py-1"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
                placeholder="Nombre del registro"
              />
              <textarea
                value={editingFosil.descripcion_general}
                onChange={(e) =>
                  setEditingFosil((s) =>
                    s ? { ...s, descripcion_general: e.target.value } : s,
                  )
                }
                className="rounded-sm border px-2 py-1"
                style={{ borderColor: "var(--border)", background: "var(--card)", minHeight: "96px" }}
                placeholder="Descripción general"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-sm border px-3 py-1.5 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--bone)" }}
                disabled={busyId === editingFosil.id}
              >
                {busyId === editingFosil.id ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                className="rounded-sm border px-3 py-1.5 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--bonedim)" }}
                onClick={() => setEditingFosil(null)}
                disabled={busyId === editingFosil.id}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : null}
        {todosFiltered.length === 0 ? (
          <p className="sec-body">Sin registros.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="panel-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código único</th>
                  <th>Categoría</th>
                  <th>Era</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {catalogPageRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nombre}</td>
                    <td>{r.codigo_unico || `#${r.id}`}</td>
                    <td>
                      <span className="rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: "var(--border)" }}>
                        {categoriaBadge(r)}
                      </span>
                    </td>
                    <td>{r.era_nombre || "—"}</td>
                    <td><EstadoChip estado={r.estado} /></td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-sm border px-2 py-1 text-xs text-[var(--bone)]"
                          style={{ borderColor: "var(--border)" }}
                          onClick={() =>
                            setEditingFosil({
                              id: Number(r.id),
                              nombre: r.nombre || "",
                              descripcion_general: r.descripcion_general || "",
                            })
                          }
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-sm border px-2 py-1 text-xs"
                          style={{ borderColor: "rgba(170,70,70,.5)", color: "#ffb0a8" }}
                          disabled={busyId === r.id}
                          onClick={() => setDialog({ type: "delete-fosil", id: Number(r.id) })}
                        >
                          Eliminar
                        </button>
                        <details>
                          <summary className="cursor-pointer text-xs text-[var(--bonedim)]">Media</summary>
                          <FosilMultimediaBlock fosilId={r.id} />
                        </details>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager
          page={catalogPage}
          totalPages={catalogTotalPages}
          onPrev={() => setCatalogPage((p) => Math.max(1, p - 1))}
          onNext={() => setCatalogPage((p) => Math.min(catalogTotalPages, p + 1))}
        />
      </section>
      ) : null}

      {activeSection === "usuarios" ? (
        <section style={{ ...cardStyle, marginBottom: "1.15rem" }}>
        <h2 className="sec-h" style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>
          Gestión de usuarios y roles
        </h2>
        <p className="sec-body" style={{ marginBottom: "0.8rem" }}>
          Creación de usuarios, activación/desactivación y asignación de roles.
        </p>
        <div className="mb-3">
          <div className="grid gap-2" style={{ gridTemplateColumns: "2fr 1fr" }}>
            <input
              value={usuariosSearch}
              onChange={(e) => setUsuariosSearch(e.target.value)}
              placeholder="Buscar usuario por ID, nombre o correo"
              className="w-full rounded-sm border px-3 py-2"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            />
            <select
              value={usuariosRolFilter}
              onChange={(e) =>
                setUsuariosRolFilter(
                  e.target.value as "all" | "administrador" | "investigador" | "explorador",
                )
              }
              className="rounded-sm border px-3 py-2"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <option value="all">Todos los roles</option>
              <option value="administrador">Administrador</option>
              <option value="investigador">Investigador</option>
              <option value="explorador">Explorador</option>
            </select>
          </div>
        </div>
        <div className="mb-3 flex justify-end">
          <button type="button" className="btn-fill" onClick={() => setCreateUserOpen(true)}>
            + Crear usuario
          </button>
        </div>

        {usuariosFiltered.length === 0 ? (
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
                  <th>Usuario</th>
                  <th>Roles</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usersPageRows.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs"
                          style={{ borderColor: "var(--border)" }}
                        >
                          {(u.nombre?.[0] || "U").toUpperCase()}
                          {(u.apellido?.[0] || "").toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm text-[var(--bone)]">
                            {u.nombre} {u.apellido}
                          </p>
                          <p className="text-xs text-[var(--bonedim)]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {roles.map((r) => (
                          <label key={`${u.id}-${r.id}`} className="text-xs">
                            <input
                              type="checkbox"
                              disabled={busyUsuarioId === u.id}
                              checked={(u.roles || []).some((x) => x.id === r.id)}
                              onChange={() => onToggleRolUsuario(u, r.id)}
                            />
                            <span
                              className="ml-1 rounded-full border px-2 py-0.5"
                              style={{ borderColor: "var(--border)", background: roleBadgeColor(r.nombre) }}
                            >
                              {r.nombre}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td><EstadoChip estado={u.activo ? "Activo" : "Inactivo"} /></td>
                    <td>{`ID ${u.id}`}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
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
                          onClick={() => setDialog({ type: "delete-user", id: u.id })}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager
          page={usersPage}
          totalPages={usersTotalPages}
          onPrev={() => setUsersPage((p) => Math.max(1, p - 1))}
          onNext={() => setUsersPage((p) => Math.min(usersTotalPages, p + 1))}
        />
      </section>
      ) : null}

      {activeSection === "papelera" ? (
        <section style={{ ...cardStyle, marginBottom: "1.15rem" }}>
          <h2 className="sec-h" style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>
            Papelera unificada
          </h2>
          <p className="sec-body" style={{ marginBottom: "0.8rem" }}>
            Aquí ves todo lo eliminado: usuarios, fósiles y mensajes de contacto.
          </p>
          {usuariosPapeleraRows.length === 0 &&
          fosilesPapeleraRows.length === 0 &&
          contactoPapeleraRows.length === 0 ? (
            <EmptyState text="La papelera está vacía." />
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ overflowX: "auto" }}>
                <h3 className="sec-h" style={{ fontSize: "1rem", marginBottom: "0.4rem" }}>
                  Usuarios eliminados ({usuariosPapeleraRows.length})
                </h3>
                <table className="panel-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Correo</th>
                      <th>Eliminado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosPapeleraRows.map((u) => (
                      <tr key={`usr-${u.id}`}>
                        <td>{u.nombre} {u.apellido || ""}</td>
                        <td>{u.email || "—"}</td>
                        <td>{u.deleted_at ? formatInboxDate(u.deleted_at) : "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="rounded-sm border px-2 py-1 text-sm"
                            style={{ borderColor: "var(--border)" }}
                            disabled={busyUsuarioId === u.id}
                            onClick={() => onRestaurarUsuarioPapelera(u.id)}
                          >
                            Restaurar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ overflowX: "auto" }}>
                <h3 className="sec-h" style={{ fontSize: "1rem", marginBottom: "0.4rem" }}>
                  Fósiles eliminados ({fosilesPapeleraRows.length})
                </h3>
                <table className="panel-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Estado</th>
                      <th>Eliminado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fosilesPapeleraRows.map((f) => (
                      <tr key={`fos-${f.id}`}>
                        <td>{f.id}</td>
                        <td>{f.nombre || "—"}</td>
                        <td>{f.estado || "—"}</td>
                        <td>{f.deleted_at ? formatInboxDate(f.deleted_at) : "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="rounded-sm border px-2 py-1 text-sm"
                            style={{ borderColor: "var(--border)" }}
                            disabled={busyId === f.id}
                            onClick={() => onRestaurarFosilPapelera(f.id)}
                          >
                            Restaurar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ overflowX: "auto" }}>
                <h3 className="sec-h" style={{ fontSize: "1rem", marginBottom: "0.4rem" }}>
                  Mensajes eliminados ({contactoPapeleraRows.length})
                </h3>
                <table className="panel-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Asunto</th>
                      <th>Eliminado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactoPapeleraRows.map((m) => (
                      <tr key={`msg-${m.id}`}>
                        <td>{m.id}</td>
                        <td>{m.nombre || "—"}</td>
                        <td>{m.email || "—"}</td>
                        <td>{m.asunto || "—"}</td>
                        <td>{m.deleted_at ? formatInboxDate(m.deleted_at) : "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="rounded-sm border px-2 py-1 text-sm"
                            style={{ borderColor: "var(--border)" }}
                            disabled={busyId === m.id}
                            onClick={() => onRestaurarContactoPapelera(m.id)}
                          >
                            Restaurar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      ) : null}

      {activeSection === "contacto" ? (
        <section style={cardStyle}>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="sec-h" style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}>
              Mensajes de contacto ({contactosVisible.length})
            </h2>
            <p className="sec-body">Bandeja de entrada administrativa.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-sm border px-3 py-1.5 text-sm"
              style={{ borderColor: "var(--border)" }}
              onClick={() => setSelectedForDeleteIds(readVisibleIds)}
              disabled={readVisibleIds.length === 0}
            >
              Seleccionar leídos
            </button>
            <button
              type="button"
              className="rounded-sm border px-3 py-1.5 text-sm"
              style={{ borderColor: "rgba(170,70,70,.5)", color: "#ffb0a8" }}
              onClick={() => setDialog({ type: "delete-contact-batch", count: selectedCount })}
              disabled={selectedForDeleteIds.length === 0}
            >
              Borrar seleccionados ({selectedCount})
            </button>
          </div>
        </div>
        <div className="mb-3">
          <input
            value={contactoSearch}
            onChange={(e) => setContactoSearch(e.target.value)}
            placeholder="Buscar por nombre, correo, asunto o mensaje"
            className="w-full rounded-sm border px-3 py-2"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          />
        </div>
        {contactosVisible.length === 0 ? (
          <p className="sec-body">Aún no hay mensajes en contacto.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(260px, 340px) 1fr",
              gap: "0.9rem",
            }}
          >
            <aside className="rounded-sm border" style={{ borderColor: "var(--border)", maxHeight: "560px", overflow: "auto" }}>
              {contactPageRows.map((m) => {
                const read = isRead(m);
                const isSolicitud = /solicitud/i.test(m.asunto || "");
                const checked = selectedForDeleteIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className="w-full border-b px-3 py-2"
                    style={{
                      borderColor: "var(--border)",
                      background: selectedContacto?.id === m.id ? "rgba(200,130,10,.09)" : "transparent",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-sm text-[var(--bone)]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setSelectedForDeleteIds((prev) =>
                              e.target.checked
                                ? [...prev, m.id]
                                : prev.filter((id) => id !== m.id),
                            )
                          }
                        />
                        <span>
                          {!read ? <span style={{ color: "var(--amberhot)" }}>● </span> : null}
                          {m.nombre}
                        </span>
                      </label>
                      <span className="text-xs text-[var(--bonedim)]">{formatInboxDate(String(m.created_at))}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAbrirContacto(m)}
                      className="mt-1 w-full text-left"
                    >
                      <p className="truncate text-xs text-[var(--bonedim)]">{m.asunto}</p>
                      <p className="truncate text-xs text-[var(--bonedim)]">{m.mensaje}</p>
                    </button>
                    {isSolicitud ? (
                      <span className="mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: "var(--amber)", color: "var(--amberhot)" }}>
                        Solicitud
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </aside>
            <article className="rounded-sm border p-4" style={{ borderColor: "var(--border)", minHeight: "360px" }}>
              {selectedContacto ? (
                <>
                  <p className="text-sm text-[var(--bone)]">{selectedContacto.nombre}</p>
                  <p className="text-xs text-[var(--bonedim)]">{selectedContacto.email}</p>
                  <h3 className="mt-3 text-lg text-[var(--bone)]">{selectedContacto.asunto}</h3>
                  <p className="mt-1 text-xs text-[var(--bonedim)]">{formatInboxDate(String(selectedContacto.created_at))}</p>
                  <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--bonedim)]">{selectedContacto.mensaje}</p>
                  {/solicitud/i.test(selectedContacto.asunto || "") ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-sm border px-3 py-1.5 text-sm"
                        style={{ borderColor: "rgba(30,140,70,.5)", color: "#9be3b8" }}
                        onClick={() => setActiveSection("solicitudes")}
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        className="rounded-sm border px-3 py-1.5 text-sm"
                        style={{ borderColor: "rgba(170,70,70,.5)", color: "#ffb0a8" }}
                        onClick={() => setActiveSection("solicitudes")}
                      >
                        Rechazar
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="sec-body">Seleccioná un mensaje para ver el detalle.</p>
              )}
            </article>
          </div>
        )}
        <Pager
          page={contactPage}
          totalPages={contactTotalPages}
          onPrev={() => setContactPage((p) => Math.max(1, p - 1))}
          onNext={() => setContactPage((p) => Math.min(contactTotalPages, p + 1))}
        />
      </section>
      ) : null}
      {activeSection === "suscriptores" ? (
      <section style={cardStyle}>
        <header className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="sec-h" style={{ fontSize: "1.6rem" }}>Suscriptores</h2>
            <p className="sec-body">Gestión de boletín y notificaciones de publicación.</p>
          </div>
        </header>
        <table className="panel-table">
          <thead>
            <tr>
              <th>Correo</th>
              <th>Fecha de suscripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(suscriptores || []).map((s) => (
              <tr key={s.id}>
                <td>{s.correo}</td>
                <td>{new Date(s.fecha_suscripcion).toLocaleDateString("es-CR")}</td>
                <td><EstadoChip estado={Number(s.activo) ? "activo" : "inactivo"} /></td>
                <td className="panel-actions">
                  <button type="button" className="panel-btn" onClick={async () => { await patchAdminSuscriptorActivo(s.id, !Number(s.activo)); await refreshAll(); }}>
                    {Number(s.activo) ? "Desactivar" : "Reactivar"}
                  </button>
                  <button type="button" className="panel-btn" onClick={() => setDialog({ type: "delete-subscriber", id: s.id })}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 rounded-sm border p-3" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-sm uppercase tracking-[0.08em] text-[var(--bonedim)]">Historial de notificaciones enviadas</h3>
          <ul className="mt-2 space-y-2 text-sm text-[var(--bonedim)]">
            {(susHistorial || []).slice(0, 10).map((h) => (
              <li key={h.id}>{h.titulo} · {new Date(h.created_at).toLocaleString("es-CR")} · {h.enviados} correos</li>
            ))}
          </ul>
        </div>
      </section>
      ) : null}
      {createUserOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[190] grid place-items-center p-4"
          style={{ background: "rgba(0,0,0,.55)" }}
        >
          <form
            onSubmit={async (e) => {
              const ok = await onCrearUsuario(e);
              if (ok) setCreateUserOpen(false);
            }}
            className="w-full max-w-xl rounded-sm border p-4"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <h3 className="sec-h" style={{ fontSize: "1.2rem", marginBottom: "0.6rem" }}>
              Crear usuario
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                placeholder="Nombre"
                value={newUser.nombre}
                onChange={(e) => setNewUser((s) => ({ ...s, nombre: e.target.value }))}
                className="rounded-sm border px-2 py-1.5"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              />
              <input
                placeholder="Apellido"
                value={newUser.apellido}
                onChange={(e) => setNewUser((s) => ({ ...s, apellido: e.target.value }))}
                className="rounded-sm border px-2 py-1.5"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              />
              <input
                placeholder="Correo"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))}
                className="rounded-sm border px-2 py-1.5 sm:col-span-2"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              />
              <input
                placeholder="Contraseña"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
                className="rounded-sm border px-2 py-1.5 sm:col-span-2"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              />
            </div>
            <p className="sec-body" style={{ margin: "0.8rem 0 0.45rem" }}>Roles</p>
            <div className="flex flex-wrap gap-3">
              {roles.map((r) => (
                <label key={r.id} className="text-sm">
                  <input
                    type="checkbox"
                    checked={newUser.roles.includes(r.id)}
                    onChange={(e) =>
                      setNewUser((s) => ({
                        ...s,
                        roles: e.target.checked ? [...s.roles, r.id] : s.roles.filter((x) => x !== r.id),
                      }))
                    }
                  />{" "}
                  {r.nombre}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-sm border px-3 py-1.5 text-sm"
                style={{ borderColor: "var(--border)" }}
                onClick={() => setCreateUserOpen(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-fill">
                Crear usuario
              </button>
            </div>
          </form>
        </div>
      ) : null}
      <ConfirmDialog
        open={dialog != null}
        title={
          dialog?.type === "delete-user"
            ? "Eliminar usuario"
            : dialog?.type === "delete-fosil"
              ? "Eliminar fósil"
            : dialog?.type === "delete-contact-batch"
              ? "Eliminar mensajes seleccionados"
              : dialog?.type === "delete-subscriber"
                ? "Eliminar suscriptor"
            : dialog?.type === "reject-sol"
              ? "Rechazar solicitud"
              : "Rechazar registro"
        }
        message={
          dialog?.type === "delete-user"
            ? "¿Eliminar usuario (soft delete)?"
            : dialog?.type === "delete-fosil"
              ? "¿Eliminar este fósil del catálogo? Quedará en papelera para restaurarlo luego."
            : dialog?.type === "delete-contact-batch"
              ? `¿Eliminar ${dialog.count} mensaje(s) seleccionados?`
              : dialog?.type === "delete-subscriber"
                ? "¿Eliminar suscriptor?"
            : dialog?.type === "reject-sol"
              ? "Podés añadir una nota para el investigador."
              : "¿Rechazar este registro? Quedará marcado como rechazado."
        }
        confirmLabel={
          dialog?.type === "reject-sol" || dialog?.type === "reject-fosil"
            ? "Confirmar rechazo"
            : "Eliminar"
        }
        askNote={dialog?.type === "reject-sol"}
        noteLabel="Motivo del rechazo"
        notePlaceholder="Opcional"
        busy={busyUsuarioId != null || busySolId != null || busyId != null}
        onCancel={() => setDialog(null)}
        onConfirm={(note) => {
          if (!dialog) return;
          if (dialog.type === "delete-user") {
            onEliminarUsuario(dialog.id).finally(() => setDialog(null));
            return;
          }
          if (dialog.type === "delete-fosil") {
            onEliminarFosil(dialog.id).finally(() => setDialog(null));
            return;
          }
          if (dialog.type === "delete-contact-batch") {
            onEliminarMensajesSeleccionados().finally(() => setDialog(null));
            return;
          }
          if (dialog.type === "delete-subscriber") {
            (async () => {
              await deleteAdminSuscriptor(dialog.id);
              await refreshAll();
            })()
              .catch((e) => setErr(e instanceof Error ? e.message : "No se pudo eliminar suscriptor"))
              .finally(() => setDialog(null));
            return;
          }
          if (dialog.type === "reject-sol") {
            onRechazarSolicitudInv(dialog.id, note || "").finally(() => setDialog(null));
            return;
          }
          onRechazar(dialog.id).finally(() => setDialog(null));
        }}
      />
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
