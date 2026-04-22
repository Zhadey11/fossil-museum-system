import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Acceso al museo",
};

export default function AccesoPage() {
  return (
    <div
      className="sw-page flex min-h-screen flex-col items-center justify-center px-4 py-24"
      style={{ background: "var(--ink)" }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <header className="mb-8 text-center">
          <span className="sec-eyebrow">Museo digital</span>
          <h1 className="sec-h">Acceso</h1>
          <div className="sec-rule mx-auto" />
          <p className="sec-body mx-auto">
            Si recibiste correo y contraseña tras una solicitud aprobada, ingresalos aquí para entrar al
            sistema.
          </p>
        </header>

        <div
          className="rounded-sm border p-8"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
