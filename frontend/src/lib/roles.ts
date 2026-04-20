/** Coincide con dbo.ROL.id en FosilesDB (04_datos_prueba.sql). */
export const ROL = {
  ADMIN: 1,
  INVESTIGADOR: 2,
  EXPLORADOR: 3,
  PUBLICO: 4,
} as const;

/** Primera pantalla del panel según prioridad: admin > investigador > explorador. */
export function panelPathForRoles(roles: number[]): string {
  if (roles.includes(ROL.ADMIN)) return "/panel/admin";
  if (roles.includes(ROL.INVESTIGADOR)) return "/panel/investigador";
  if (roles.includes(ROL.EXPLORADOR)) return "/panel/explorador";
  if (roles.includes(ROL.PUBLICO)) return "/catalogo";
  return "/catalogo";
}

export function hasAnyRole(userRoles: number[], needed: number[]): boolean {
  return needed.some((r) => userRoles.includes(r));
}

export type PanelLink = { href: string; label: string };

/** Pestañas del panel según roles del usuario (puede tener varios). */
export function panelLinksForRoles(roles: number[]): PanelLink[] {
  const links: PanelLink[] = [
    { href: "/", label: "Sitio público" },
    { href: "/catalogo", label: "Catálogo" },
  ];
  if (roles.includes(ROL.ADMIN)) {
    links.push({ href: "/panel/admin", label: "Administración" });
  }
  if (roles.includes(ROL.INVESTIGADOR)) {
    links.push({ href: "/panel/investigador", label: "Investigación" });
  }
  if (roles.includes(ROL.EXPLORADOR)) {
    links.push({ href: "/panel/explorador", label: "Mis registros" });
  }
  return links;
}

export function rolLabel(id: number): string {
  switch (id) {
    case ROL.ADMIN:
      return "Administrador";
    case ROL.INVESTIGADOR:
      return "Investigador";
    case ROL.EXPLORADOR:
      return "Explorador";
    case ROL.PUBLICO:
      return "Público";
    default:
      return `Rol ${id}`;
  }
}

const ROL_ORDER: number[] = [
  ROL.ADMIN,
  ROL.INVESTIGADOR,
  ROL.EXPLORADOR,
  ROL.PUBLICO,
];

/** Texto compacto para varios roles (p. ej. Explorador · Investigador). */
export function rolesDescripcionCorta(roles: number[]): string {
  const meaningful =
    roles.length > 1
      ? roles.filter((r) => r !== ROL.PUBLICO)
      : roles.slice();
  const sorted = [...meaningful].sort(
    (a, b) => ROL_ORDER.indexOf(a) - ROL_ORDER.indexOf(b),
  );
  return sorted.map(rolLabel).join(" · ");
}
