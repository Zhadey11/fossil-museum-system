export default function FosilDetalleLoading() {
  return (
    <div className="sw-page fosil-ficha-page" style={{ background: "var(--ink)" }}>
      <article
        className="fosil-ficha-inner"
        style={{
          maxWidth: "40rem",
          margin: "0 auto",
          padding: "6rem clamp(1.25rem, 4vw, 2rem) 4rem",
        }}
      >
        <div
          className="rounded-sm border"
          style={{
            borderColor: "var(--border)",
            minHeight: "12rem",
            background:
              "linear-gradient(90deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.10) 50%, rgba(255,255,255,.04) 100%)",
          }}
        />
      </article>
    </div>
  );
}
