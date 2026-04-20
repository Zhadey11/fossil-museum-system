/* eslint-disable no-console */
const BASE_URL = (process.env.VERIFY_API_BASE_URL || "http://localhost:4000").replace(
  /\/$/,
  "",
);

const ADMIN_EMAIL = process.env.VERIFY_CONTRACTS_EMAIL || "";
const ADMIN_PASSWORD = process.env.VERIFY_CONTRACTS_PASSWORD || "";

function isObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function typeMatches(value, expected) {
  if (expected === "array") return Array.isArray(value);
  if (expected === "null") return value === null;
  if (expected === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === expected;
}

function validateShape(obj, shape, path = "") {
  const errors = [];
  if (!isObject(obj)) {
    return [`${path || "root"}: expected object`];
  }

  for (const [key, expected] of Object.entries(shape)) {
    const currentPath = path ? `${path}.${key}` : key;
    const isOptional = key.endsWith("?");
    const realKey = isOptional ? key.slice(0, -1) : key;
    const value = obj[realKey];

    if (value === undefined) {
      if (!isOptional) errors.push(`${currentPath}: missing required key`);
      continue;
    }

    if (Array.isArray(expected)) {
      const ok = expected.some((t) => typeMatches(value, t));
      if (!ok) {
        errors.push(`${currentPath}: expected one of [${expected.join(", ")}], got ${typeof value}`);
      }
      continue;
    }

    if (isObject(expected)) {
      errors.push(...validateShape(value, expected, currentPath));
      continue;
    }

    if (!typeMatches(value, expected)) {
      errors.push(`${currentPath}: expected ${expected}, got ${typeof value}`);
    }
  }
  return errors;
}

async function api(path, init = {}) {
  const res = await fetch(`${BASE_URL}${path}`, init);
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { res, json, text };
}

async function loginIfConfigured() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return null;
  const { res, json } = await api("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok || !json?.token) {
    throw new Error(`Login admin failed (${res.status}). Check VERIFY_CONTRACTS_EMAIL/PASSWORD.`);
  }
  return json.token;
}

function pass(name) {
  console.log(`PASS  ${name}`);
}
function fail(name, why) {
  console.log(`FAIL  ${name} -> ${why}`);
}
function skip(name, why) {
  console.log(`SKIP  ${name} -> ${why}`);
}

async function run() {
  const failures = [];
  let token = null;

  try {
    token = await loginIfConfigured();
  } catch (e) {
    failures.push(`admin login: ${e.message}`);
  }

  const checks = [
    {
      name: "health endpoint",
      path: "/api/health",
      expectStatus: 200,
      validate: (json) => {
        const errs = validateShape(json, { status: "string" });
        return errs;
      },
    },
    {
      name: "public fossils list",
      path: "/api/fosiles?page=1&page_size=3",
      expectStatus: 200,
      validate: (json) => {
        if (!Array.isArray(json)) return ["root: expected array"];
        if (json.length === 0) return [];
        return validateShape(json[0], {
          id: "number",
          nombre: "string",
          descripcion_general: "string",
          "categoria_nombre?": ["string", "null"],
          "era_nombre?": ["string", "null"],
          "periodo_nombre?": ["string", "null"],
          "portada_url?": ["string", "null"],
          "total_count?": "number",
        });
      },
    },
    {
      name: "public multimedia catalog",
      path: "/api/multimedia/publico/catalogo?page=1&page_size=3",
      expectStatus: 200,
      validate: (json) => {
        if (!Array.isArray(json)) return ["root: expected array"];
        if (json.length === 0) return [];
        return validateShape(json[0], {
          multimedia_id: "number",
          imagen_url: "string",
          id: "number",
          nombre: "string",
          "categoria_nombre?": ["string", "null"],
          "era_nombre?": ["string", "null"],
          "periodo_nombre?": ["string", "null"],
          "total_count?": "number",
        });
      },
    },
    {
      name: "contact form endpoint (public)",
      path: "/api/contacto",
      method: "POST",
      body: {
        nombre: "Contract Check",
        email: "contract.check@example.com",
        asunto: "Verificacion contrato",
        mensaje: "Mensaje de verificacion automatica de contrato API.",
      },
      expectStatus: 200,
      validate: (json) => {
        if (!isObject(json)) return ["root: expected object"];
        return [];
      },
    },
    {
      name: "admin pending fossils endpoint",
      path: "/api/admin/fosiles/pendientes",
      auth: true,
      expectStatus: 200,
      validate: (json) => {
        if (!Array.isArray(json)) return ["root: expected array"];
        if (json.length === 0) return [];
        return validateShape(json[0], {
          id: "number",
          nombre: "string",
          estado: "string",
          created_at: "string",
        });
      },
    },
    {
      name: "admin users endpoint",
      path: "/api/usuarios",
      auth: true,
      expectStatus: 200,
      validate: (json) => {
        if (!Array.isArray(json)) return ["root: expected array"];
        if (json.length === 0) return [];
        return validateShape(json[0], {
          id: "number",
          nombre: "string",
          apellido: "string",
          email: "string",
          activo: ["boolean", "number"],
        });
      },
    },
  ];

  for (const c of checks) {
    if (c.auth && !token) {
      skip(c.name, "missing admin credentials in env");
      continue;
    }

    const headers = {};
    if (c.auth && token) headers.Authorization = `Bearer ${token}`;
    if (c.body) headers["Content-Type"] = "application/json";

    const { res, json, text } = await api(c.path, {
      method: c.method || "GET",
      headers,
      body: c.body ? JSON.stringify(c.body) : undefined,
    });

    if (res.status !== c.expectStatus) {
      const why = `status ${res.status}, expected ${c.expectStatus}, body=${text.slice(0, 160)}`;
      fail(c.name, why);
      failures.push(`${c.name}: ${why}`);
      continue;
    }

    const errors = c.validate ? c.validate(json) : [];
    if (errors.length > 0) {
      fail(c.name, errors.join(" | "));
      failures.push(`${c.name}: ${errors.join(" | ")}`);
      continue;
    }

    pass(c.name);
  }

  if (failures.length > 0) {
    console.log("\nContract verification: FAILED");
    for (const f of failures) console.log(`- ${f}`);
    process.exit(1);
  }

  console.log("\nContract verification: OK");
}

run().catch((e) => {
  console.error("Contract verification crashed:", e.message);
  process.exit(1);
});
