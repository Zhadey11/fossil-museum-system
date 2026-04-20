import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
};

export default function ContactoPage() {
  return (
    <div className="sw-page" style={{ background: "var(--ink)", padding: "7.5rem 1rem 3rem" }}>
      <div className="contact-layout" style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <div className="rounded-sm border p-8" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <header className="mb-8">
            <span className="sec-eyebrow">Museo</span>
            <h1 className="sec-h">Contáctanos</h1>
            <div className="sec-rule" />
          </header>
          <ContactForm />
        </div>
        <aside className="rounded-sm border p-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="sec-h" style={{ fontSize: "2rem" }}>Información del museo</h2>
          <p className="sec-body">Escribinos por consultas académicas, visitas guiadas y alianzas institucionales.</p>
          <div className="sec-rule" />
          <p className="sec-body"><strong>Correo institucional:</strong><br />info@stonewake.org</p>
          <p className="sec-body"><strong>Horario:</strong><br />Martes a domingo · 9:00 a 18:00</p>
          <p className="sec-body"><strong>Redes:</strong><br />Instagram: @stonewakemuseum<br />Facebook: Stonewake Museum</p>
          <p className="sec-body"><strong>Teléfono:</strong><br />(506) 2450-1100</p>
        </aside>
      </div>
    </div>
  );
}
