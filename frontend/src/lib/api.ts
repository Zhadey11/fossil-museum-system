import { AUTH_TOKEN_KEY } from "./auth";

const DEFAULT_API = "http://localhost:4000";

export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_API
  );
}

export type ApiFosilRow = {
  id: number;
  nombre: string;
  descripcion_general: string;
  categoria_id?: number;
  periodo_id?: number;
  era_id?: number;
  latitud?: number | string | null;
  longitud?: number | string | null;
  slug?: string | null;
  estado?: string;
  /** Primera imagen del registro MULTIMEDIA (solo lectura; rutas /images/... o /videos/...). */
  portada_url?: string | null;
};

export async function fetchFosilesPublic(params?: {
  periodo_id?: number;
  era_id?: number;
  categoria_id?: number;
  q?: string;
  ubicacion?: string;
  page?: number;
  page_size?: number;
}): Promise<{ ok: boolean; data: ApiFosilRow[]; error?: string }> {
  const base = getApiBaseUrl();
  const u = new URL("/api/fosiles", base);
  if (params?.periodo_id != null) {
    u.searchParams.set("periodo_id", String(params.periodo_id));
  }
  if (params?.era_id != null) u.searchParams.set("era_id", String(params.era_id));
  if (params?.categoria_id != null) {
    u.searchParams.set("categoria_id", String(params.categoria_id));
  }
  if (params?.q) u.searchParams.set("q", params.q);
  if (params?.ubicacion) u.searchParams.set("ubicacion", params.ubicacion);
  if (params?.page) u.searchParams.set("page", String(params.page));
  if (params?.page_size) u.searchParams.set("page_size", String(params.page_size));
  try {
    const res = await fetch(u.toString(), {
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      return { ok: false, data: [], error: res.statusText };
    }
    const data = await res.json();
    return { ok: true, data: Array.isArray(data) ? data : [] };
  } catch (e) {
    return {
      ok: false,
      data: [],
      error: e instanceof Error ? e.message : "fetch failed",
    };
  }
}

export async function fetchFosilPublicById(
  id: string,
): Promise<ApiFosilRow | null> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/fosiles/${encodeURIComponent(id)}`, {
      next: { revalidate: 30 },
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
    res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    const msg =
      e instanceof TypeError
        ? `No se pudo conectar con el API (${base}). ¿Está el backend en marcha y NEXT_PUBLIC_API_URL correcto?`
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
}): Promise<unknown> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/contacto`, {
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

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(AUTH_TOKEN_KEY)
      : null;
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...init, headers });
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
  roles?: UsuarioRolRow[];
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
  investigador_nombre?: string;
  investigador_apellido?: string;
  investigador_email?: string;
  investigador_pais?: string | null;
  investigador_profesion?: string | null;
  referencias?: { id: number; titulo: string; url: string; tipo?: string }[];
};

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

/** URL absoluta para servir `/uploads/...` desde el API. */
export function multimediaAbsUrl(urlPath: string): string {
  if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
    return urlPath;
  }
  const base = getApiBaseUrl();
  const p = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
  return `${base}${p}`;
}

export type MultimediaRow = {
  id: number;
  url: string;
  tipo: string;
  subtipo?: string;
  nombre_archivo?: string;
  descripcion?: string | null;
  es_principal?: boolean;
};

/** Galería pública (solo fósiles publicados); sin token. */
export async function fetchMultimediaFosilPublic(
  fosilId: number | string,
): Promise<MultimediaRow[]> {
  const base = getApiBaseUrl();
  const res = await fetch(
    `${base}/api/multimedia/publico/fosil/${encodeURIComponent(String(fosilId))}`,
    { next: { revalidate: 30 } },
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
  return Array.isArray(data) ? data : [];
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
    formData.append("file", file);
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
