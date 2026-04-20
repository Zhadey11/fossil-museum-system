export default function CatalogoLoading() {
  return (
    <div className="sw-page" style={{ background: "var(--surface)", padding: "2rem 4rem 6rem" }}>
      <div className="gallery-grid" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-sm border"
            style={{
              borderColor: "var(--border)",
              minHeight: "240px",
              background:
                "linear-gradient(90deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.10) 50%, rgba(255,255,255,.04) 100%)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
