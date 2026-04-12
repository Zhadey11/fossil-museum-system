import type { Metadata } from "next";

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
            Pantalla solo visual; la autenticación la implementará el equipo.
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
            aria-label="Formulario de acceso (no funcional)"
          >
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="login-email" className="text-sm text-[var(--bonedim)]">
                Correo
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="off"
                placeholder="tu@correo.com"
                className="rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/50"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
                disabled
              />
            </div>
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="login-pass" className="text-sm text-[var(--bonedim)]">
                Contraseña
              </label>
              <input
                id="login-pass"
                name="password"
                type="password"
                placeholder="••••••••"
                className="rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/50"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
                disabled
              />
            </div>
            <button
              type="button"
              className="btn-fill mt-2 w-full opacity-50"
              disabled
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
