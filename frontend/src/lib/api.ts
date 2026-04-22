const DEFAULT_API = "http://localhost:4000";

export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_API
  );
}

/**
 * Misma idea que `next.config` (rewrites): en Node/SSR, `localhost` a veces resuelve solo a IPv6
 * y el fetch falla aunque Express escuche en 0.0.0.0:4000 (Windows / algunos entornos).
 * En el navegador no se usa: ahí el fetch va por `/__api/...` al mismo host.
 */
function getApiBaseUrlForServer(): string {
  const raw = getApiBaseUrl().replace(/\/$/, "");
  try {
    const u = new URL(raw);
    if (u.hostname === "localhost") {
      u.hostname = "127.0.0.1";
    }
    return u.toString().replace(/\/$/, "");
  } catch {
    return raw;
  }
}

function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `/__api${normalized}`;
  }
  return `${getApiBaseUrlForServer()}${normalized}`;
}

export type ApiFosilRow = {
  id: number;
  /** Campo sensible: solo debe venir en endpoints autenticados (admin/investigador). */
  codigo_unico?: string;
  nombre: string;
  nombre_comun?: string | null;
  nombre_cientifico?: string | null;
  cantera_sitio?: string | null;
  explorador_publico?: string | null;
  categoria_codigo?: string | null;
  categoria_nombre?: string | null;
  era_nombre?: string | null;
  periodo_nombre?: string | null;
  explorador_nombre?: string | null;
  explorador_apellido?: string | null;
  descripcion_general: string;
  contexto_geologico?: string | null;
  categoria_id?: number;
  periodo_id?: number;
  era_id?: number;
  /** Campos sensibles: solo deben venir en endpoints autenticados (admin/investigador). */
  latitud?: number | string | null;
  longitud?: number | string | null;
  slug?: string | null;
  estado?: string;
  fecha_hallazgo?: string | null;
  total_count?: number;
  /** Primera imagen del registro MULTIMEDIA (solo lectura; rutas /images/... o /videos/...). */
  portada_url?: string | null;
  pais?: string | null;
  ubicacion?: string | null;
  descripcion_ubicacion?: string | null;
};

export type PublicMapPointRow = {
  id: number;
  slug?: string | null;
  nombre: string;
  latitud: number | string;
  longitud: number | string;
  /** true cuando el backend no envía el GPS real (solo mapa público). */
  ubicacion_mapa_aproximada?: boolean;
  categoria_codigo?: string | null;
  portada_url?: string | null;
  canton_nombre?: string | null;
  provincia_nombre?: string | null;
  pais_nombre?: string | null;
};

export async function fetchMapaPublicoPoints(): Promise<{
  ok: boolean;
  data: PublicMapPointRow[];
  error?: string;
}> {
  try {
    const res = await fetch(apiUrl("/api/fosiles/publico/mapa"), {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
      return { ok: false, data: [], error: res.statusText };
    }
    const data = await res.json().catch(() => []);
    return { ok: true, data: Array.isArray(data) ? data : [] };
  } catch (e) {
    return {
      ok: false,
      data: [],
      error: e instanceof Error ? e.message : "fetch failed",
    };
  }
}

export async function fetchFosilesPublic(params?: {
  periodo_id?: number;
  era_id?: number;
  categoria_id?: number;
  q?: string;
  ubicacion?: string;
  page?: number;
  page_size?: number;
}): Promise<{
  ok: boolean;
  data: ApiFosilRow[];
  error?: string;
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}> {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.max(1, params?.page_size ?? 24);
  const sp = new URLSearchParams();
  if (params?.periodo_id != null) sp.set("periodo_id", String(params.periodo_id));
  if (params?.era_id != null) sp.set("era_id", String(params.era_id));
  if (params?.categoria_id != null) sp.set("categoria_id", String(params.categoria_id));
  if (params?.q) sp.set("q", params.q);
  if (params?.ubicacion) sp.set("ubicacion", params.ubicacion);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.page_size) sp.set("page_size", String(params.page_size));
  const url = apiUrl(`/api/fosiles${sp.toString() ? `?${sp.toString()}` : ""}`);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
      return {
        ok: false,
        data: [],
        error: res.statusText,
        page,
        page_size: pageSize,
        total: 0,
        has_next: false,
      };
    }
    const data = await res.json();
    const rows = Array.isArray(data) ? data : [];
    const totalRaw = rows[0]?.total_count;
    const total = Number.isFinite(Number(totalRaw)) ? Number(totalRaw) : rows.length;
    return {
      ok: true,
      data: rows,
      page,
      page_size: pageSize,
      total,
      has_next: page * pageSize < total,
    };
  } catch (e) {
    return {
      ok: false,
      data: [],
      error: e instanceof Error ? e.message : "fetch failed",
      page,
      page_size: pageSize,
      total: 0,
      has_next: false,
    };
  }
}

export async function fetchFosilPublicById(
  id: string,
): Promise<ApiFosilRow | null> {
  try {
    const res = await fetch(apiUrl(`/api/fosiles/${encodeURIComponent(id)}`), {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function postLogin(body: {
  email: string;
  password: string;
}): Promise<{ token: string; user: { id: number; email: string; roles: number[] } }> {
  const base = getApiBaseUrl();
  let res: Response;
  try {
    res = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch (e) {
    const msg =
      e instanceof TypeError
        ? `No se pudo conectar con el API. Verificá que el backend esté en marcha en el puerto 4000.`
        : e instanceof Error
          ? e.message
          : "Error de red";
    throw new Error(msg);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Error al iniciar sesión",
    );
  }
  return data;
}

export async function postLogout(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    /* cierre local aunque backend no responda */
  }
}

export async function postContacto(body: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  /** investigador | explorador | colaborador | general — para acuse y flujo admin */
  tipo_solicitud?: string;
}): Promise<unknown> {
  const res = await fetch(apiUrl("/api/contacto"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Error al enviar",
    );
  }
  return data;
}

export type SuscriptorRow = {
  id: number;
  correo: string;
  fecha_suscripcion: string;
  activo: boolean | number;
};

export type SuscriptorHistorialRow = {
  id: number;
  tipo: string;
  titulo: string;
  enviados: number;
  created_at: string;
};

export async function postSuscriptor(correo: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl("/api/suscriptores"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ correo }),
    });
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error("No se pudo conectar con el servidor para suscribirte.");
    }
    throw e;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo suscribir");
  }
}

export async function fetchAdminSuscriptores(): Promise<SuscriptorRow[]> {
  const res = await apiFetch("/api/suscriptores");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "No se pudieron cargar suscriptores");
  return Array.isArray(data) ? data : [];
}

export async function patchAdminSuscriptorActivo(id: number, activo: boolean): Promise<void> {
  const res = await apiFetch(`/api/suscriptores/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activo }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "No se pudo actualizar suscriptor");
}

export async function deleteAdminSuscriptor(id: number): Promise<void> {
  const res = await apiFetch(`/api/suscriptores/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "No se pudo eliminar suscriptor");
}

export async function fetchAdminSuscriptoresHistorial(): Promise<SuscriptorHistorialRow[]> {
  const res = await apiFetch("/api/suscriptores/historial");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "No se pudo cargar historial");
  return Array.isArray(data) ? data : [];
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = apiUrl(path);
  const headers = new Headers(init.headers);
  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: init.cache ?? "no-store",
  });
}

export async function fetchMisRegistros(): Promise<ApiFosilRow[]> {
  const res = await apiFetch("/api/fosiles/mis-registros");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "No se pudieron cargar los registros",
    );
  }
  return Array.isArray(data) ? data : [];
}

export async function fetchInvestigadorCatalogo(): Promise<ApiFosilRow[]> {
  const res = await apiFetch("/api/fosiles/investigador/catalogo");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Error al cargar el catálogo",
    );
  }
  return Array.isArray(data) ? data : [];
}

export type AdminPendiente = {
  id: number;
  nombre: string;
  estado: string;
  created_at: string;
};

export async function fetchAdminPendientes(): Promise<AdminPendiente[]> {
  const res = await apiFetch("/api/admin/fosiles/pendientes");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Error al cargar pendientes",
    );
  }
  return Array.isArray(data) ? data : [];
}

export type FosilFormCatalogos = {
  categorias: { id: number; codigo: string; nombre: string }[];
  eras: { id: number; nombre: string }[];
  periodos: { id: number; era_id: number; nombre: string }[];
  cantones: { id: number; codigo: string; nombre: string }[];
};

export async function fetchCatalogosFosilForm(): Promise<FosilFormCatalogos> {
  const res = await apiFetch("/api/catalogos/fosil-form");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "No se pudieron cargar los catálogos",
    );
  }
  return data as FosilFormCatalogos;
}

export async function postCrearFosil(body: {
  nombre: string;
  canton_id: number;
  categoria_id: number;
  era_id: number;
  periodo_id: number;
  latitud?: number | null;
  longitud?: number | null;
  altitud_msnm?: number | null;
  descripcion_ubicacion?: string;
  fecha_hallazgo?: string;
  descripcion_general?: string;
  nombre_comun?: string;
  nombre_cientifico?: string;
  contexto_geologico?: string;
  descripcion_detallada?: string;
  reino?: string;
  filo?: string;
  clase?: string;
  orden?: string;
  familia?: string;
  genero?: string;
  especie?: string;
}): Promise<{ mensaje: string; data: { id: number } }> {
  const res = await apiFetch("/api/fosiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "No se pudo registrar el hallazgo",
    );
  }
  return data as { mensaje: string; data: { id: number } };
}

/** Actualización parcial (admin o explorador sobre sus registros en revisión). */
export async function putActualizarFosil(
  id: number | string,
  body: Record<string, unknown>,
): Promise<{ mensaje: string; id: string }> {
  const res = await apiFetch(`/api/fosiles/${encodeURIComponent(String(id))}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "No se pudo actualizar el registro",
    );
  }
  return data as { mensaje: string; id: string };
}

export async function deleteAdminFosil(id: number | string): Promise<void> {
  const res = await apiFetch(`/api/fosiles/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "No se pudo eliminar el fósil",
    );
  }
}

/** Detalle científico completo (roles administrador e investigador). */
export async function fetchFosilDetalleCompleto(
  id: number | string,
): Promise<Record<string, unknown>> {
  const res = await apiFetch(
    `/api/fosiles/${encodeURIComponent(String(id))}/detalle`,
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "No se pudo cargar el detalle",
    );
  }
  return data as Record<string, unknown>;
}

export async function patchAdminAprobar(id: number): Promise<void> {
  const res = await apiFetch(`/api/admin/fosiles/${id}/aprobar`, {
    method: "PATCH",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Error al aprobar",
    );
  }
}

export async function patchAdminRechazar(id: number): Promise<void> {
  const res = await apiFetch(`/api/admin/fosiles/${id}/rechazar`, {
    method: "PATCH",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Error al rechazar",
    );
  }
}

export type SolicitudInvestigacionRow = {
  id: number;
  asunto: string;
  estado: string;
  created_at: string;
  revisado_at?: string | null;
  nota_admin?: string | null;
  fosiles?: { id: number; nombre: string }[];
};

export type AdminSolicitudInvRow = {
  id: number;
  asunto: string;
  mensaje: string;
  estado: string;
  created_at: string;
  inv_nombre: string;
  inv_apellido: string;
  inv_email: string;
  fosiles: { id: number; nombre: string }[];
};

export type UsuarioRolRow = { id: number; nombre: string };

export type UsuarioAdminRow = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol_id: number;
  activo: boolean;
  telefono?: string | null;
  pais?: string | null;
  profesion?: string | null;
  centro_trabajo?: string | null;
  deleted_at?: string | null;
  roles?: UsuarioRolRow[];
};

export type PapeleraItem = {
  id: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  asunto?: string;
  estado?: string;
  deleted_at?: string | null;
};

export type PapeleraAdminRow = {
  usuarios: PapeleraItem[];
  fosiles: PapeleraItem[];
  contacto: PapeleraItem[];
};

export type ReferenciaEstudioRow = {
  id: number;
  titulo: string;
  url: string;
  tipo?: string;
  autores?: string | null;
  anio?: number | null;
};

export type EstudioFosilRow = {
  id: number;
  fosil_id: number;
  investigador_id: number;
  titulo: string;
  contexto_objetivo: string;
  tipo_analisis: string;
  resultados: string;
  composicion?: string | null;
  condiciones_hallazgo?: string | null;
  informacion_adicional?: string | null;
  documentacion_contacto?: string | null;
  publicado?: boolean;
  created_at?: string;
  investigador_nombre?: string;
  investigador_apellido?: string;
  investigador_email?: string;
  investigador_pais?: string | null;
  investigador_profesion?: string | null;
  referencias?: ReferenciaEstudioRow[];
};

export type ContactoAdminRow = {
  id: number;
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  leido: boolean;
  respondido: boolean;
  created_at: string;
  solicitud_tipo?: string | null;
  solicitud_estado?: string | null;
};

export async function patchAdminContactoAprobarSolicitud(
  id: number,
  body?: { password?: string; email?: string },
): Promise<{
  mensaje: string;
  correo_credenciales_enviado?: boolean;
  correo_error?: string;
}> {
  const res = await apiFetch(`/api/contacto/${id}/aprobar-solicitud`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo aprobar la solicitud");
  }
  return data as {
    mensaje: string;
    correo_credenciales_enviado?: boolean;
    correo_error?: string;
  };
}

export async function patchAdminContactoRechazarSolicitud(
  id: number,
  body?: { nota?: string },
): Promise<{ mensaje: string; correo_rechazo_enviado?: boolean; correo_error?: string }> {
  const res = await apiFetch(`/api/contacto/${id}/rechazar-solicitud`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo rechazar la solicitud");
  }
  return data as { mensaje: string; correo_rechazo_enviado?: boolean; correo_error?: string };
}

/** Solicitud de acceso a datos científicos (IDs del catálogo público + mensaje al admin). */
export async function postSolicitudInvestigacion(body: {
  fosil_ids: number[];
  asunto: string;
  mensaje: string;
}): Promise<{ id: number; mensaje: string }> {
  const res = await apiFetch("/api/investigacion/solicitudes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "No se pudo enviar la solicitud",
    );
  }
  return data as { id: number; mensaje: string };
}

export async function fetchMisSolicitudesInvestigacion(): Promise<
  SolicitudInvestigacionRow[]
> {
  const res = await apiFetch("/api/investigacion/mis-solicitudes");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Error al cargar solicitudes",
    );
  }
  return Array.isArray(data) ? data : [];
}

export async function fetchAdminSolicitudesInvestigacion(): Promise<
  AdminSolicitudInvRow[]
> {
  const res = await apiFetch("/api/admin/investigacion/solicitudes");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Error al cargar solicitudes de investigación",
    );
  }
  return Array.isArray(data) ? data : [];
}

export async function patchAdminAprobarSolicitudInv(id: number): Promise<void> {
  const res = await apiFetch(
    `/api/admin/investigacion/solicitudes/${id}/aprobar`,
    { method: "PATCH" },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Error al aprobar solicitud",
    );
  }
}

export async function patchAdminRechazarSolicitudInv(
  id: number,
  nota?: string,
): Promise<void> {
  const res = await apiFetch(
    `/api/admin/investigacion/solicitudes/${id}/rechazar`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nota: nota ?? "" }),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Error al rechazar solicitud",
    );
  }
}

export async function fetchAdminUsuarios(): Promise<UsuarioAdminRow[]> {
  const res = await apiFetch("/api/usuarios");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Error al cargar usuarios");
  }
  return Array.isArray(data) ? data : [];
}

export async function fetchAdminUsuariosPapelera(): Promise<UsuarioAdminRow[]> {
  const res = await apiFetch("/api/usuarios/papelera");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Error al cargar papelera de usuarios");
  }
  return Array.isArray(data) ? data : [];
}

export async function fetchAdminPapelera(): Promise<PapeleraAdminRow> {
  const res = await apiFetch("/api/admin/papelera");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Error al cargar papelera");
  }
  return {
    usuarios: Array.isArray(data.usuarios) ? data.usuarios : [],
    fosiles: Array.isArray(data.fosiles) ? data.fosiles : [],
    contacto: Array.isArray(data.contacto) ? data.contacto : [],
  };
}

export async function fetchAdminContacto(): Promise<ContactoAdminRow[]> {
  const res = await apiFetch("/api/contacto");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Error al cargar mensajes de contacto",
    );
  }
  return Array.isArray(data) ? data : [];
}

export async function patchAdminContactoLeido(
  id: number,
  leido: boolean,
): Promise<void> {
  const res = await apiFetch(`/api/contacto/${id}/leido`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leido }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "No se pudo actualizar lectura del mensaje",
    );
  }
}

export async function deleteAdminContacto(id: number): Promise<void> {
  const res = await apiFetch(`/api/contacto/${id}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "No se pudo eliminar el mensaje",
    );
  }
}

export async function fetchRolesCatalogo(): Promise<UsuarioRolRow[]> {
  const res = await apiFetch("/api/usuarios/catalogo/roles");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Error al cargar roles");
  }
  return Array.isArray(data) ? data : [];
}

export async function postAdminCrearUsuario(body: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  pais?: string;
  profesion?: string;
  centro_trabajo?: string;
  roles: number[];
}): Promise<void> {
  const res = await apiFetch("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo crear usuario");
  }
}

export async function putAdminActualizarUsuario(
  id: number,
  body: Partial<{
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    pais: string;
    profesion: string;
    centro_trabajo: string;
    roles: number[];
  }>,
): Promise<void> {
  const res = await apiFetch(`/api/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo actualizar usuario");
  }
  if (body.roles && body.roles.length > 0) {
    const r = await apiFetch(`/api/usuarios/${id}/roles`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles: body.roles }),
    });
    const rj = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new Error(typeof rj.error === "string" ? rj.error : "No se pudieron actualizar roles");
    }
  }
}

export async function deleteAdminUsuario(id: number): Promise<void> {
  const res = await apiFetch(`/api/usuarios/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo eliminar usuario");
  }
}

export async function patchAdminUsuarioActivo(
  id: number,
  activo: boolean,
): Promise<void> {
  const res = await apiFetch(`/api/usuarios/${id}/activo`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activo }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "No se pudo actualizar el estado del usuario",
    );
  }
}

export async function patchAdminRestaurarUsuario(id: number): Promise<void> {
  const res = await apiFetch(`/api/usuarios/${id}/restaurar`, {
    method: "PATCH",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo restaurar usuario");
  }
}

export async function patchAdminRestaurarPapeleraUsuario(id: number): Promise<void> {
  const res = await apiFetch(`/api/admin/papelera/usuarios/${id}/restaurar`, {
    method: "PATCH",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo restaurar usuario");
  }
}

export async function patchAdminRestaurarPapeleraFosil(id: number): Promise<void> {
  const res = await apiFetch(`/api/admin/papelera/fosiles/${id}/restaurar`, {
    method: "PATCH",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo restaurar fósil");
  }
}

export async function patchAdminRestaurarPapeleraContacto(id: number): Promise<void> {
  const res = await apiFetch(`/api/admin/papelera/contacto/${id}/restaurar`, {
    method: "PATCH",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo restaurar mensaje");
  }
}

export async function fetchEstudiosPorFosil(
  fosilId: number | string,
): Promise<EstudioFosilRow[]> {
  const res = await apiFetch(`/api/estudios?fosil_id=${encodeURIComponent(String(fosilId))}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Error al cargar estudios");
  }
  return Array.isArray(data) ? data : [];
}

export type PostEstudioBody = {
  fosil_id: number;
  titulo: string;
  contexto_objetivo: string;
  tipo_analisis: string;
  resultados: string;
  composicion?: string | null;
  condiciones_hallazgo?: string | null;
  informacion_adicional?: string | null;
  documentacion_contacto?: string | null;
  publicado?: boolean;
  /** Solo administradores: asignar otro investigador. */
  investigador_id?: number;
};

export type PatchEstudioBody = Partial<
  Pick<
    PostEstudioBody,
    | "titulo"
    | "contexto_objetivo"
    | "tipo_analisis"
    | "resultados"
    | "composicion"
    | "condiciones_hallazgo"
    | "informacion_adicional"
    | "documentacion_contacto"
    | "publicado"
    | "investigador_id"
  >
>;

export async function postEstudio(body: PostEstudioBody): Promise<{ id: number; fosil_id: number }> {
  const res = await apiFetch("/api/estudios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo registrar el estudio");
  }
  return data as { id: number; fosil_id: number };
}

export async function patchEstudio(
  id: number,
  body: PatchEstudioBody,
): Promise<{ id: number }> {
  const res = await apiFetch(`/api/estudios/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo actualizar el estudio");
  }
  return data as { id: number };
}

export async function deleteEstudio(
  id: number,
  body?: { motivo?: string },
): Promise<{ mensaje: string; id: number }> {
  const res = await apiFetch(`/api/estudios/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo archivar el estudio");
  }
  return data as { mensaje: string; id: number };
}

export type PostReferenciaBody = {
  titulo: string;
  url: string;
  tipo?: string;
  autores?: string;
  anio?: number | string;
};

export async function postReferenciaEstudio(
  estudioId: number,
  body: PostReferenciaBody,
): Promise<{ id: number }> {
  const res = await apiFetch(`/api/estudios/${estudioId}/referencias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo agregar la referencia");
  }
  return data as { id: number };
}

export async function deleteReferenciaEstudio(
  refId: number,
): Promise<{ mensaje: string; id: number }> {
  const res = await apiFetch(`/api/estudios/referencias/${refId}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "No se pudo eliminar la referencia");
  }
  return data as { mensaje: string; id: number };
}

/**
 * URL absoluta a archivos bajo /images, /videos, /uploads (servidos por Express en el API).
 * Usa `NEXT_PUBLIC_API_URL` (p. ej. `http://localhost:4000`). Desde otra máquina en la misma red,
 * `NEXT_PUBLIC_API_URL=http://<IP-de-tu-PC>:4000` en el frontend.
 */
export function multimediaAbsUrl(urlPath: string): string {
  if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
    return urlPath;
  }
  const base = getApiBaseUrl().replace(/\/$/, "");
  const p = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
  const encodedPath = encodeURI(p);
  return `${base}${encodedPath}`;
}

export type MultimediaRow = {
  id: number;
  url: string;
  tipo: string;
  subtipo?: string;
  nombre_archivo?: string;
  descripcion?: string | null;
  es_principal?: boolean;
  orden?: number;
};

export type CatalogoImagenRow = {
  multimedia_id: number;
  imagen_url: string;
  nombre_archivo?: string | null;
  subtipo?: string;
  imagen_descripcion?: string | null;
  id: number;
  nombre: string;
  nombre_comun?: string | null;
  nombre_cientifico?: string | null;
  codigo_unico?: string;
  descripcion_general?: string;
  categoria_id?: number;
  categoria_codigo?: string | null;
  categoria_nombre?: string | null;
  era_nombre?: string | null;
  periodo_nombre?: string | null;
  ubicacion?: string | null;
  explorador_publico?: string | null;
};

export async function fetchCatalogoPublicoImagenes(params?: {
  periodo_id?: number;
  era_id?: number;
  categoria_id?: number;
  subtipo?: string;
  q?: string;
  ubicacion?: string;
  page?: number;
  page_size?: number;
  include_total?: boolean;
}): Promise<{
  ok: boolean;
  data: CatalogoImagenRow[];
  error?: string;
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}> {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.max(1, params?.page_size ?? 24);
  const sp = new URLSearchParams();
  if (params?.periodo_id != null) sp.set("periodo_id", String(params.periodo_id));
  if (params?.era_id != null) sp.set("era_id", String(params.era_id));
  if (params?.categoria_id != null) sp.set("categoria_id", String(params.categoria_id));
  if (params?.subtipo) sp.set("subtipo", params.subtipo);
  if (params?.q) sp.set("q", params.q);
  if (params?.ubicacion) sp.set("ubicacion", params.ubicacion);
  sp.set("page", String(page));
  sp.set("page_size", String(pageSize));
  if (params?.include_total) sp.set("include_total", "1");
  const url = apiUrl(`/api/multimedia/publico/catalogo?${sp.toString()}`);
  try {
    const res = await fetch(url, { cache: "no-store", credentials: "include" });
    if (!res.ok) {
      return { ok: false, data: [], error: res.statusText, page, page_size: pageSize, total: 0, has_next: false };
    }
    const json = await res.json().catch(() => null);
    const rows = Array.isArray(json)
      ? json
      : Array.isArray((json as { items?: unknown[] } | null)?.items)
        ? ((json as { items: CatalogoImagenRow[] }).items)
        : [];
    const totalRaw = (json as { total?: unknown } | null)?.total;
    const hasNextRaw = (json as { has_next?: unknown } | null)?.has_next;
    const total = Number.isFinite(Number(totalRaw))
      ? Number(totalRaw)
      : page * pageSize + (rows.length > pageSize ? 1 : 0);
    const hasNext =
      typeof hasNextRaw === "boolean"
        ? hasNextRaw
        : rows.length >= pageSize && total > page * pageSize;
    return {
      ok: true,
      data: rows,
      page,
      page_size: pageSize,
      total,
      has_next: hasNext,
    };
  } catch (e) {
    return {
      ok: false,
      data: [],
      error: e instanceof Error ? e.message : "fetch failed",
      page,
      page_size: pageSize,
      total: 0,
      has_next: false,
    };
  }
}

/** Galería pública (solo fósiles publicados); sin token. */
export async function fetchMultimediaFosilPublic(
  fosilId: number | string,
): Promise<MultimediaRow[]> {
  const res = await fetch(
    apiUrl(`/api/multimedia/publico/fosil/${encodeURIComponent(String(fosilId))}`),
    { cache: "no-store", credentials: "include" },
  );
  if (!res.ok) {
    return [];
  }
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

export async function fetchMultimediaFosil(
  fosilId: number,
): Promise<MultimediaRow[]> {
  const res = await apiFetch(`/api/multimedia/fosil/${fosilId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "No se pudo cargar multimedia",
    );
  }
  if (Array.isArray(data)) return data;
  const wrapped = (data as { data?: unknown }).data;
  if (Array.isArray(wrapped)) return wrapped as MultimediaRow[];
  return [];
}

export async function uploadMultimediaFosil(
  fosilId: number,
  file: File | File[],
  opts?: { subtipo?: string; descripcion?: string },
): Promise<void> {
  const formData = new FormData();
  if (Array.isArray(file)) {
    for (const f of file) formData.append("files", f);
  } else {
    // Unificamos al campo "files" para evitar rechazos por nombre de campo inesperado.
    formData.append("files", file);
  }
  formData.append("fosil_id", String(fosilId));
  if (opts?.subtipo) formData.append("subtipo", opts.subtipo);
  if (opts?.descripcion) formData.append("descripcion", opts.descripcion);

  const res = await apiFetch("/api/multimedia/upload-fosil", {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Error al subir imagen",
    );
  }
}

export async function deleteMultimedia(id: number): Promise<void> {
  const res = await apiFetch(`/api/multimedia/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Error al eliminar",
    );
  }
}
