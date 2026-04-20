export default function LoadingCatalogo() {
  return (
    <div className="sw-page" style={{ background: "var(--surface)" }}>
      <section className="catalog-hero-modern">
        <span className="sec-eyebrow">Cargando colección…</span>
        <h1 className="sec-h">Colección de Fósiles</h1>
        <div
          style={{
            width: "min(52rem, 96%)",
            height: 52,
            borderRadius: 10,
            margin: "1rem auto 0",
            background: "rgba(255,255,255,0.08)",
          }}
        />
      </section>
      <section className="catalog-cards-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              minHeight: 290,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
            }}
          />
        ))}
      </section>
    </div>
  );
}
