"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postLogin } from "@/lib/api";
import { AUTH_USER_KEY } from "@/lib/auth";
import { panelPathForRoles } from "@/lib/roles";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailTrim = email.trim();
  const passTrim = password.trim();
  const emailInvalid =
    emailTrim.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
  const passInvalid = passTrim.length > 0 && passTrim.length < 6;
  const canSubmit = !loading && !emailInvalid && !passInvalid && emailTrim.length > 0 && passTrim.length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await postLogin({
        email: email.trim(),
        password: password.trim(),
      });
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      router.refresh();
      router.push(panelPathForRoles(data.user.roles));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de acceso");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-5"
      aria-label="Iniciar sesión"
      onSubmit={onSubmit}
    >
      {error ? (
        <p
          className="rounded-sm border px-3 py-2 text-sm"
          style={{
            borderColor: "var(--border)",
            background: "rgba(180,60,60,.12)",
            color: "var(--bone)",
          }}
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2 text-left">
        <label htmlFor="login-email" className="text-sm text-[var(--bonedim)]">
          Correo
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/50"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        />
        {emailInvalid ? (
          <p className="text-xs text-[salmon]">Ingresá un correo válido.</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 text-left">
        <label htmlFor="login-pass" className="text-sm text-[var(--bonedim)]">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="login-pass"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-sm border py-2.5 pl-3 pr-11 text-[var(--bone)] placeholder:text-[var(--bonedim)]/50"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          />
          <button
            type="button"
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm text-[var(--bonedim)] transition-colors hover:bg-[var(--card2)] hover:text-[var(--bone)]"
            style={{ border: "1px solid transparent" }}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {passInvalid ? (
          <p className="text-xs text-[salmon]">La contraseña debe tener al menos 6 caracteres.</p>
        ) : null}
      </div>
      <button
        type="submit"
        className="btn-fill mt-2 w-full"
        disabled={!canSubmit}
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
