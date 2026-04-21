"use client";

import { useEffect, useState } from "react";
import { fetchFosilesPublic, postContacto } from "@/lib/api";

const COUNTRY_OPTIONS = [
  "Costa Rica",
  "Guatemala",
  "Honduras",
  "Nicaragua",
  "Panamá",
  "El Salvador",
  "México",
  "Colombia",
  "Perú",
  "Chile",
  "Argentina",
  "Estados Unidos",
  "España",
  "Otro",
] as const;

export function ContactForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [motivo, setMotivo] = useState("Consulta general");
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [fossilOptions, setFossilOptions] = useState<Array<{ id: number; nombre: string }>>([]);
  const [loadingFossils, setLoadingFossils] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const investigatorFields = [
    "Institución / centro de trabajo",
    "Profesión",
    "Campo de investigación",
    "Código de verificación institucional",
    "País",
  ] as const;
  const explorerFields = [
    "Región donde opera",
    "Experiencia en campo",
    "Código de verificación",
  ] as const;
  const emailTrim = email.trim();
  const emailInvalid =
    emailTrim.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
  const msgShort = mensaje.trim().length > 0 && mensaje.trim().length < 12;
  const canSubmit =
    !loading &&
    nombre.trim().length >= 2 &&
    asunto.trim().length >= 3 &&
    mensaje.trim().length >= 12 &&
    !emailInvalid &&
    (motivo !== "Quiero ser investigador" ||
      (investigatorFields.every((k) => (extra[k] || "").trim().length > 0) &&
        selectedFossils.length > 0)) &&
    (motivo !== "Quiero ser explorador" ||
      explorerFields.every((k) => (extra[k] || "").trim().length > 0));

  useEffect(() => {
    if (motivo !== "Quiero ser investigador") return;
    let mounted = true;
    setLoadingFossils(true);
    (async () => {
      const all: Array<{ id: number; nombre: string }> = [];
      let page = 1;
      let hasNext = true;
      while (hasNext && page <= 20) {
        const res = await fetchFosilesPublic({ page, page_size: 100 });
        if (!res.ok) break;
        all.push(
          ...res.data.map((r) => ({
            id: Number(r.id),
            nombre: r.nombre,
          })),
        );
        hasNext = res.has_next;
        page += 1;
      }
      if (!mounted) return;
      const uniq = new Map<number, { id: number; nombre: string }>();
      for (const item of all) {
        if (!uniq.has(item.id)) uniq.set(item.id, item);
      }
      setFossilOptions([...uniq.values()]);
    })()
      .catch(() => {
        if (!mounted) return;
        setFossilOptions([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingFossils(false);
      });
    return () => {
      mounted = false;
    };
  }, [motivo]);

  function setExtraField(key: string, value: string) {
    setExtra((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFossilInterest(item: { id: number; nombre: string }) {
    const key = "Fósiles de interés";
    const current = (extra[key] || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
                  const token = `ID ${item.id} - ${item.nombre}`;
    const next = current.includes(token)
      ? current.filter((x) => x !== token)
      : [...current, token];
    setExtraField(key, next.join(", "));
  }

  const selectedFossils = (extra["Fósiles de interés"] || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const isMissingInvestigator = (key: (typeof investigatorFields)[number]) =>
    motivo === "Quiero ser investigador" &&
    attemptedSubmit &&
    (extra[key] || "").trim().length === 0;
  const isMissingExplorer = (key: (typeof explorerFields)[number]) =>
    motivo === "Quiero ser explorador" &&
    attemptedSubmit &&
    (extra[key] || "").trim().length === 0;
  const baseMissing = {
    nombre: attemptedSubmit && nombre.trim().length < 2,
    email: attemptedSubmit && (emailTrim.length === 0 || emailInvalid),
    asunto: attemptedSubmit && asunto.trim().length < 3,
    mensaje: attemptedSubmit && mensaje.trim().length < 12,
    fossils:
      motivo === "Quiero ser investigador" &&
      attemptedSubmit &&
      selectedFossils.length === 0,
  };
  const inputBorder = (missing = false) =>
    missing ? "1px solid salmon" : "1px solid var(--border)";
  const extraBorder = (missing = false) =>
    missing ? "1px solid salmon" : "1px solid rgba(200,146,42,.45)";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (motivo === "Quiero ser investigador") {
      const faltantes = investigatorFields.filter(
        (k) => (extra[k] || "").trim().length === 0,
      );
      if (selectedFossils.length === 0) faltantes.push("Fósiles de interés");
      if (faltantes.length > 0) {
        window.alert(
          `Completá todos los campos obligatorios para investigador:\n- ${faltantes.join("\n- ")}`,
        );
        return;
      }
    }
    if (motivo === "Quiero ser explorador") {
      const faltantes = explorerFields.filter(
        (k) => (extra[k] || "").trim().length === 0,
      );
      if (faltantes.length > 0) {
        window.alert(
          `Completá todos los campos obligatorios para explorador:\n- ${faltantes.join("\n- ")}`,
        );
        return;
      }
    }
    if (!canSubmit) {
      window.alert("Completá todos los campos obligatorios antes de enviar.");
      return;
    }
    setLoading(true);
    setStatus("idle");
    try {
      const extrasText = Object.entries(extra)
        .filter(([, v]) => v.trim())
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      const cuerpo = [mensaje.trim(), extrasText ? `\n\n---\n${extrasText}` : ""].join("");
      await postContacto({ nombre, email, asunto: `${motivo} - ${asunto}`, mensaje: cuerpo });
      setStatus("ok");
      setMessage("Mensaje enviado. Gracias.");
      setNombre("");
      setEmail("");
      setAsunto("");
      setMensaje("");
      setExtra({});
      setAttemptedSubmit(false);
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
      noValidate
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
        <label htmlFor="contact-motivo" className="text-sm text-[var(--bonedim)]">
          Motivo
        </label>
        <select
          id="contact-motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="rounded-sm border px-3 py-2.5 text-[var(--bone)]"
          style={{ background: "var(--surface)", borderColor: "rgba(200,146,42,.45)" }}
        >
          <option>Consulta general</option>
          <option>Quiero ser investigador</option>
          <option>Quiero ser explorador</option>
          <option>Propuesta de colaboración</option>
        </select>
      </div>
      {motivo === "Quiero ser investigador" ? (
        <div className="contact-extra-grid">
          {[
            "Institución / centro de trabajo",
            "Profesión",
            "Campo de investigación",
            "Código de verificación institucional",
          ].map((f) => (
            <input
              key={f}
              value={extra[f] || ""}
              onChange={(e) => setExtraField(f, e.target.value)}
              placeholder={`${f}${isMissingInvestigator(f as (typeof investigatorFields)[number]) ? " *" : ""}`}
              className="rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/60"
              style={{ background: "var(--surface)", border: extraBorder(isMissingInvestigator(f as (typeof investigatorFields)[number])) }}
            />
          ))}
          <select
            value={extra["País"] || ""}
            onChange={(e) => setExtraField("País", e.target.value)}
            className="rounded-sm border px-3 py-2.5 text-[var(--bone)]"
            style={{ background: "var(--surface)", border: extraBorder(isMissingInvestigator("País")) }}
          >
              <option value="">País{isMissingInvestigator("País") ? " *" : ""}</option>
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <div
            className="rounded-sm border px-3 py-2.5 text-[var(--bone)]"
            style={{
              background: "var(--surface)",
              border: extraBorder(attemptedSubmit && selectedFossils.length === 0),
              gridColumn: "1 / -1",
            }}
          >
            <p className="text-sm text-[var(--bonedim)]" style={{ marginBottom: "0.4rem" }}>
              Fósiles de interés {baseMissing.fossils ? <span style={{ color: "salmon" }}>*</span> : null}
            </p>
            {loadingFossils ? (
              <p className="text-sm text-[var(--bonedim)]">Cargando fósiles publicados…</p>
            ) : fossilOptions.length === 0 ? (
              <p className="text-sm text-[var(--bonedim)]">No hay fósiles publicados disponibles.</p>
            ) : (
              <div>
                <p className="text-xs text-[var(--bonedim)]" style={{ marginBottom: "0.35rem" }}>
                  {fossilOptions.length} fósiles publicados disponibles
                </p>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const [idText] = val.split("|");
                      const id = Number(idText);
                      const found = fossilOptions.find((x) => x.id === id);
                      if (found) toggleFossilInterest(found);
                      e.currentTarget.value = "";
                    }}
                    className="rounded-sm border px-3 py-2.5 text-[var(--bone)]"
                    style={{ background: "var(--surface)", borderColor: "rgba(200,146,42,.45)" }}
                  >
                    <option value="">Selecciona fósil de interés</option>
                    {fossilOptions.map((f) => (
                      <option key={f.id} value={`${f.id}|${f.nombre}`}>
                        {`ID ${f.id} - ${f.nombre}`}
                      </option>
                    ))}
                  </select>
                  {selectedFossils.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {selectedFossils.map((token) => (
                        <button
                          key={token}
                          type="button"
                          onClick={() => {
                            const next = selectedFossils.filter((x) => x !== token);
                            setExtraField("Fósiles de interés", next.join(", "));
                          }}
                          className="rounded-sm border px-2 py-1 text-xs"
                          style={{ borderColor: "var(--border)", color: "var(--bone)" }}
                          title="Quitar fósil"
                        >
                          {token} ×
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--bonedim)]">Aún no has seleccionado fósiles.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
      {motivo === "Quiero ser explorador" ? (
        <div className="contact-extra-grid">
          {["Región donde opera", "Experiencia en campo", "Código de verificación"].map((f) => (
            <input
              key={f}
              value={extra[f] || ""}
              onChange={(e) => setExtra((prev) => ({ ...prev, [f]: e.target.value }))}
              placeholder={`${f}${isMissingExplorer(f as (typeof explorerFields)[number]) ? " *" : ""}`}
              className="rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/60"
              style={{ background: "var(--surface)", border: extraBorder(isMissingExplorer(f as (typeof explorerFields)[number])) }}
            />
          ))}
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="text-sm text-[var(--bonedim)]">
          Nombre {baseMissing.nombre ? <span style={{ color: "salmon" }}>*</span> : null}
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
            border: inputBorder(baseMissing.nombre),
          }}
        />
        {emailInvalid ? (
          <p className="text-xs text-[salmon]">Ingresá un correo válido.</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="text-sm text-[var(--bonedim)]">
          Correo {baseMissing.email ? <span style={{ color: "salmon" }}>*</span> : null}
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
            border: inputBorder(baseMissing.email),
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-subject" className="text-sm text-[var(--bonedim)]">
          Asunto {baseMissing.asunto ? <span style={{ color: "salmon" }}>*</span> : null}
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
            border: inputBorder(baseMissing.asunto),
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-msg" className="text-sm text-[var(--bonedim)]">
          Mensaje {baseMissing.mensaje ? <span style={{ color: "salmon" }}>*</span> : null}
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
            border: inputBorder(baseMissing.mensaje),
          }}
        />
        {msgShort ? (
          <p className="text-xs text-[salmon]">El mensaje debe tener al menos 12 caracteres.</p>
        ) : null}
      </div>
      <button type="submit" className="btn-out" disabled={loading}>
        {loading ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
