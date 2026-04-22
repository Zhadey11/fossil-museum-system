export default function PanelLoading() {
  return (
    <div className="sw-page" style={{ background: "var(--surface)" }}>
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem clamp(1rem, 4vw, 2rem) 2rem" }}>
        <div
          style={{
            height: "18px",
            width: "160px",
            borderRadius: "999px",
            background: "rgba(255,255,255,.08)",
            marginBottom: "0.8rem",
          }}
        />
        <div
          style={{
            height: "40px",
            width: "min(460px, 86vw)",
            borderRadius: "10px",
            background: "rgba(255,255,255,.12)",
            marginBottom: "1rem",
          }}
        />
        <div
          style={{
            height: "2px",
            width: "120px",
            background: "color-mix(in srgb, var(--amber) 75%, transparent)",
            marginBottom: "1.2rem",
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                height: "92px",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                background: "var(--card)",
              }}
            />
          ))}
        </div>
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "var(--card)",
            padding: "1rem",
          }}
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                height: "46px",
                borderRadius: "8px",
                background: idx % 2 === 0 ? "rgba(255,255,255,.05)" : "transparent",
                marginBottom: idx === 7 ? 0 : "0.55rem",
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
