import type { Metadata } from "next";
import { MapaFosilesLoader } from "@/components/MapaFosilesLoader";

export const metadata: Metadata = { title: "Visita" };

const iconStyle = { width: 18, height: 18, color: "var(--amberhot)" } as const;

export default function VisitaPage() {
  return (
    <div className="sw-page" style={{ background: "var(--ink)", padding: "7rem 1rem 2rem" }}>
      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <span className="sec-eyebrow">Planifica tu visita</span>
        <h1 className="sec-h">Visita al museo</h1>
        <div className="sec-rule" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "1rem", marginTop: "1rem" }}>
          <article style={{ border: "1px solid rgba(200,146,42,.3)", padding: "1rem", borderRadius: 10 }}><p className="flex items-center gap-2"><svg viewBox="0 0 24 24" style={iconStyle}><circle cx="12" cy="12" r="9" stroke="currentColor" fill="none" /><path d="M12 7v6l4 2" stroke="currentColor" fill="none" /></svg>Horario</p><p className="sec-body">Martes a domingo · 9:00 a 18:00</p></article>
          <article style={{ border: "1px solid rgba(200,146,42,.3)", padding: "1rem", borderRadius: 10 }}><p className="flex items-center gap-2"><svg viewBox="0 0 24 24" style={iconStyle}><path d="M5 8h14v10H5z" stroke="currentColor" fill="none" /><path d="M8 8V6h8v2" stroke="currentColor" fill="none" /></svg>Entradas</p><p className="sec-body">General ¢3500 · Estudiantes ¢2000</p></article>
          <article style={{ border: "1px solid rgba(200,146,42,.3)", padding: "1rem", borderRadius: 10 }}><p className="flex items-center gap-2"><svg viewBox="0 0 24 24" style={iconStyle}><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" fill="none" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" fill="none" /></svg>Ubicación</p><p className="sec-body">Costa Rica · Parque del Patrimonio Natural</p></article>
          <article style={{ border: "1px solid rgba(200,146,42,.3)", padding: "1rem", borderRadius: 10 }}><p className="flex items-center gap-2"><svg viewBox="0 0 24 24" style={iconStyle}><path d="M7 4h10v16H7z" stroke="currentColor" fill="none" /><path d="M10 7h4" stroke="currentColor" /></svg>Contacto</p><p className="sec-body">info@stonewake.org · (506) 2450-1100</p></article>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <MapaFosilesLoader points={[{ id: "sw", slug: "sw", nombre: "Stonewake Museum", latitud: 9.7, longitud: -83.7, pais: "Costa Rica", provincia: "San José", resumen: "Museo", descripcion: "Museo", categoria: "VIS" }]} />
        </div>
      </section>
    </div>
  );
}
