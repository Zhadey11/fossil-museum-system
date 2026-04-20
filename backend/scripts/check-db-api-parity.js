const { pool, poolConnect } = require("../src/config/db");

async function scalar(sql) {
  const r = await pool.request().query(sql);
  return r.recordset?.[0]?.n ?? 0;
}

async function run() {
  await poolConnect;

  const db = {
    fosiles_total: await scalar(
      "SELECT COUNT(*) AS n FROM FOSIL WHERE deleted_at IS NULL",
    ),
    fosiles_publicados: await scalar(
      "SELECT COUNT(*) AS n FROM FOSIL WHERE deleted_at IS NULL AND estado = 'publicado'",
    ),
    imagenes_publicadas: await scalar(
      "SELECT COUNT(*) AS n FROM MULTIMEDIA m INNER JOIN FOSIL f ON f.id = m.fosil_id WHERE m.deleted_at IS NULL AND m.tipo = 'imagen' AND f.deleted_at IS NULL AND f.estado = 'publicado'",
    ),
    videos_publicados: await scalar(
      "SELECT COUNT(*) AS n FROM MULTIMEDIA m INNER JOIN FOSIL f ON f.id = m.fosil_id WHERE m.deleted_at IS NULL AND m.tipo = 'video' AND f.deleted_at IS NULL AND f.estado = 'publicado'",
    ),
    contacto_total: await scalar("SELECT COUNT(*) AS n FROM CONTACTO"),
    estudios_publicados: await scalar(
      "SELECT COUNT(*) AS n FROM ESTUDIO_CIENTIFICO WHERE publicado = 1",
    ),
  };

  const [fosilesPage, catalogoPage, homeHtml, galeriaHtml] = await Promise.all([
    fetch("http://localhost:4000/api/fosiles?page=1&page_size=100").then((r) =>
      r.json(),
    ),
    fetch(
      "http://localhost:4000/api/multimedia/publico/catalogo?page=1&page_size=100",
    ).then((r) => r.json()),
    fetch("http://localhost:3000/").then((r) => r.text()),
    fetch("http://localhost:3000/galeria").then((r) => r.text()),
  ]);

  const api = {
    fosiles_rows_page: Array.isArray(fosilesPage) ? fosilesPage.length : -1,
    fosiles_total_count:
      Array.isArray(fosilesPage) && fosilesPage[0]
        ? Number(fosilesPage[0].total_count || 0)
        : 0,
    catalogo_rows_page: Array.isArray(catalogoPage) ? catalogoPage.length : -1,
    catalogo_total_count:
      Array.isArray(catalogoPage) && catalogoPage[0]
        ? Number(catalogoPage[0].total_count || 0)
        : 0,
  };

  const frontendSignals = {
    home_has_catalogo_text:
      typeof homeHtml === "string" && homeHtml.includes("Catálogo"),
    galeria_has_instalaciones_text:
      typeof galeriaHtml === "string" &&
      (galeriaHtml.includes("Galería") || galeriaHtml.includes("instalaciones")),
  };

  const checks = [
    {
      name: "Publicados DB == total_count /api/fosiles",
      ok: db.fosiles_publicados === api.fosiles_total_count,
      db: db.fosiles_publicados,
      api: api.fosiles_total_count,
    },
    {
      name: "Imagenes publicadas DB == total_count /api/multimedia/publico/catalogo",
      ok: db.imagenes_publicadas === api.catalogo_total_count,
      db: db.imagenes_publicadas,
      api: api.catalogo_total_count,
    },
  ];

  console.log(
    JSON.stringify(
      {
        db,
        api,
        checks,
        frontendSignals,
        note: "La pagina /galeria usa imagenes de frontend/public/images/instalaciones (fuente filesystem frontend), no tabla MULTIMEDIA.",
      },
      null,
      2,
    ),
  );
}

run()
  .catch((err) => {
    console.error("check-db-api-parity error:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.close();
    } catch {
      // ignore
    }
  });
