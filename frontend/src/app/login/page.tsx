import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div
      className="sw-page flex min-h-screen flex-col items-center justify-center px-4 py-24"
      style={{ background: "var(--ink)" }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <header className="mb-8 text-center">
          <span className="sec-eyebrow">Acceso</span>
          <h1 className="sec-h">Iniciar sesión</h1>
          <div className="sec-rule mx-auto" />
          <p className="sec-body mx-auto">
            Tras cargar <code className="catalog-code">database/04_datos_prueba.sql</code>,
            ejemplo: <strong>admin@fosilesdb.net</strong> /{" "}
            <strong>Admin123!</strong> (misma clave para usuarios de prueba). El
            backend debe estar en <code className="catalog-code">localhost:4000</code>{" "}
            o en <code className="catalog-code">NEXT_PUBLIC_API_URL</code>.
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
