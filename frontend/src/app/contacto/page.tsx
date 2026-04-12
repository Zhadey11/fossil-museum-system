import type { Metadata } from "next";

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
            Bloque visual; el envío real lo conectará otro módulo.
          </p>
        </header>

        <div
          className="rounded-sm border p-8"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <form
            className="flex flex-col gap-5"
            aria-label="Formulario de contacto (no funcional)"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-name" className="text-sm text-[var(--bonedim)]">
                Nombre
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Tu nombre"
                className="rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/50"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-msg" className="text-sm text-[var(--bonedim)]">
                Mensaje
              </label>
              <textarea
                id="contact-msg"
                name="message"
                rows={4}
                placeholder="Escribe aquí…"
                className="resize-none rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/50"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
                disabled
              />
            </div>
            <button type="button" className="btn-out opacity-50" disabled>
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
