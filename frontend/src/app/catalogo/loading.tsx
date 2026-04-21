export default function CatalogoLoading() {
  return (
    <div className="sw-page catalog-page-modern" style={{ background: "var(--surface)" }}>
      <section className="catalog-hero-modern">
        <span className="sec-eyebrow">Colección pública</span>
        <h1 className="sec-h">Colección de Fósiles</h1>
        <p className="sec-body catalog-hero-sub">Cargando catálogo...</p>
      </section>

      <section className="catalog-cards-grid" aria-busy="true" aria-live="polite">
        {Array.from({ length: 8 }).map((_, i) => (
          <article
            key={i}
            className="catalog-fossil-card"
            style={{ opacity: 0.82, pointerEvents: "none" }}
          >
            <div
              className="catalog-thumb-wrap"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)",
                backgroundSize: "200% 100%",
                animation: "catalogSkeletonPulse 1.2s ease-in-out infinite",
              }}
            />
            <div style={{ padding: "0.8rem" }}>
              <div
                style={{
                  height: "0.95rem",
                  width: "78%",
                  borderRadius: 6,
                  marginBottom: "0.55rem",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)",
                  backgroundSize: "200% 100%",
                  animation: "catalogSkeletonPulse 1.2s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  height: "0.75rem",
                  width: "100%",
                  borderRadius: 6,
                  marginBottom: "0.4rem",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)",
                  backgroundSize: "200% 100%",
                  animation: "catalogSkeletonPulse 1.2s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  height: "0.75rem",
                  width: "85%",
                  borderRadius: 6,
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)",
                  backgroundSize: "200% 100%",
                  animation: "catalogSkeletonPulse 1.2s ease-in-out infinite",
                }}
              />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
