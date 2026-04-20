import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
};

export default function ContactoPage() {
  return (
    <div
      className="sw-page flex min-h-screen flex-col items-center px-4 py-24"
      style={{ background: "var(--ink)" }}
    >
      <div style={{ width: "100%", maxWidth: "520px" }}>
        <header className="mb-10 text-center">
          <span className="sec-eyebrow">Museo</span>
          <h1 className="sec-h">Contacto</h1>
          <div className="sec-rule mx-auto" />
          <p className="sec-body mx-auto">
            El mensaje se guarda en la base (tabla CONTACTO) y, si el backend
            tiene SMTP configurado, también se envía al correo institucional
            definido en <code className="catalog-code">CONTACTO_INSTITUCIONAL_EMAIL</code>.
          </p>
        </header>

        <div
          className="rounded-sm border p-8"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
