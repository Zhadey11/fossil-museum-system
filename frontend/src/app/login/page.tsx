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
            Accedé con tu correo institucional y contraseña para gestionar
            registros, revisión científica y administración del museo digital.
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
