"use client";

import { useState } from "react";
import { postContacto } from "@/lib/api";

export function ContactForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      await postContacto({ nombre, email, asunto, mensaje });
      setStatus("ok");
      setMessage("Mensaje enviado. Gracias.");
      setNombre("");
      setEmail("");
      setAsunto("");
      setMensaje("");
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "No se pudo enviar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-5"
      aria-label="Formulario de contacto"
      onSubmit={onSubmit}
    >
      {status !== "idle" ? (
        <p
          className="rounded-sm border px-3 py-2 text-sm"
          style={{
            borderColor: "var(--border)",
            background:
              status === "ok"
                ? "rgba(60,120,80,.15)"
                : "rgba(180,60,60,.12)",
            color: "var(--bone)",
          }}
          role="status"
        >
          {message}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="text-sm text-[var(--bonedim)]">
          Nombre
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          className="rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/50"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="text-sm text-[var(--bonedim)]">
          Correo
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          className="rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/50"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-subject" className="text-sm text-[var(--bonedim)]">
          Asunto
        </label>
        <input
          id="contact-subject"
          name="asunto"
          type="text"
          required
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Asunto breve"
          className="rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/50"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
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
          required
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Escribe aquí…"
          className="resize-none rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/50"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        />
      </div>
      <button type="submit" className="btn-out" disabled={loading}>
        {loading ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
