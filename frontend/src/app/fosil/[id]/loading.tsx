export default function LoadingFichaFosil() {
  return (
    <div className="sw-page" style={{ background: "var(--ink)" }}>
      <article
        style={{
          maxWidth: "76rem",
          margin: "0 auto",
          padding: "6rem clamp(1.25rem, 4vw, 2rem) 4rem",
          display: "grid",
          gap: "1.1rem",
        }}
      >
        <div style={{ width: 190, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem" }}>
          <div style={{ height: 340, borderRadius: 10, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ height: 340, borderRadius: 10, background: "rgba(255,255,255,0.08)" }} />
        </div>
        <div style={{ height: 220, borderRadius: 10, background: "rgba(255,255,255,0.08)" }} />
      </article>
    </div>
  );
}
