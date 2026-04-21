"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  fetchCatalogosFosilForm,
  postCrearFosil,
  uploadMultimediaFosil,
  type FosilFormCatalogos,
} from "@/lib/api";
import { enqueueFosil } from "@/lib/offline/exploradorQueue";

const inputClass =
  "w-full rounded-sm border px-3 py-2.5 text-[var(--bone)] placeholder:text-[var(--bonedim)]/50";
const inputStyle = {
  background: "var(--surface)",
  borderColor: "var(--border)",
} as const;

type Props = { onCreated: () => void; onQueueUpdated?: () => void };

export function ExploradorNuevoFosil({ onCreated, onQueueUpdated }: Props) {
  const [cats, setCats] = useState<FosilFormCatalogos | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [cantonId, setCantonId] = useState(0);
  const [categoriaId, setCategoriaId] = useState(0);
  const [eraId, setEraId] = useState(0);
  const [periodoId, setPeriodoId] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [altitud, setAltitud] = useState("");
  const [descripcionUbicacion, setDescripcionUbicacion] = useState("");
  const [fechaHallazgo, setFechaHallazgo] = useState("");
  const [noAplica, setNoAplica] = useState({
    latitud: false,
    longitud: false,
    altitud: false,
    descripcion: false,
    fecha: false,
  });
  const [submitTried, setSubmitTried] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const nombreTrim = nombre.trim();
  const nombreShort = nombreTrim.length > 0 && nombreTrim.length < 4;
  const latMissing = !noAplica.latitud && latitud.trim().length === 0;
  const lngMissing = !noAplica.longitud && longitud.trim().length === 0;
  const altMissing = !noAplica.altitud && altitud.trim().length === 0;
  const descMissing = !noAplica.descripcion && descripcionUbicacion.trim().length === 0;
  const fechaMissing = !noAplica.fecha && fechaHallazgo.trim().length === 0;
  const fechaInvalid =
    !noAplica.fecha &&
    fechaHallazgo.trim().length > 0 &&
    toIsoDateFromDigits(fechaHallazgo) == null;
  const latInvalid = !noAplica.latitud && latitud.trim().length > 0 && parseNum(latitud) == null;
  const lngInvalid = !noAplica.longitud && longitud.trim().length > 0 && parseNum(longitud) == null;
  const altInvalid = !noAplica.altitud && altitud.trim().length > 0 && parseNum(altitud) == null;
  const formLiveInvalid =
    nombreShort ||
    latMissing ||
    lngMissing ||
    altMissing ||
    descMissing ||
    fechaMissing ||
    fechaInvalid ||
    latInvalid ||
    lngInvalid ||
    altInvalid;
  const nombreMissing = nombreTrim.length === 0;
  const cantonMissing = !cantonId;
  const categoriaMissing = !categoriaId;
  const eraMissing = !eraId;
  const periodoMissing = !periodoId;
  const hasMissingRequired =
    nombreMissing ||
    cantonMissing ||
    categoriaMissing ||
    eraMissing ||
    periodoMissing ||
    latMissing ||
    lngMissing ||
    altMissing ||
    descMissing ||
    fechaMissing;

  useEffect(() => {
    fetchCatalogosFosilForm()
      .then((c) => {
        setCats(c);
        const p0 = c.periodos[0];
        const e0 =
          c.eras.find((er) =>
            c.periodos.some((p) => p.era_id === er.id),
          )?.id ?? p0?.era_id ?? c.eras[0]?.id ?? 0;
        setEraId(e0);
        const pMatch =
          c.periodos.find((p) => p.era_id === e0) ?? p0;
        setPeriodoId(pMatch?.id ?? 0);
        setCategoriaId(c.categorias[0]?.id ?? 0);
        setCantonId(c.cantones[0]?.id ?? 0);
      })
      .catch((e) =>
        setLoadErr(e instanceof Error ? e.message : "Error al cargar datos"),
      );
  }, []);

  useEffect(() => {
    if (!foto) {
      setFotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(foto);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  function onEraChange(nextEra: number) {
    setEraId(nextEra);
    if (!cats) return;
    const p = cats.periodos.find((x) => x.era_id === nextEra);
    setPeriodoId(p?.id ?? 0);
  }

  function parseNum(value: string): number | null {
    const v = value.trim();
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function toIsoDateFromDigits(value: string): string | null {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return null;
    const y = Number(digits.slice(0, 4));
    const m = Number(digits.slice(4, 6));
    const d = Number(digits.slice(6, 8));
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
    if (m < 1 || m > 12) return null;
    if (d < 1 || d > 31) return null;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }

  function queueOffline(payload: {
    nombre: string;
    canton_id: number;
    categoria_id: number;
    era_id: number;
    periodo_id: number;
    latitud?: number | null;
    longitud?: number | null;
    altitud_msnm?: number | null;
    descripcion_ubicacion?: string;
    fecha_hallazgo?: string;
  }) {
    enqueueFosil(payload);
    onQueueUpdated?.();
    setOkMsg(
      "Sin conexión: el hallazgo quedó guardado localmente y se sincronizará al recuperar internet.",
    );
  }

  function toggleNoAplicaField(
    field: "latitud" | "longitud" | "altitud" | "descripcion" | "fecha",
  ) {
    setNoAplica((prev) => {
      const next = !prev[field];
      if (next) {
        if (field === "latitud") setLatitud("");
        if (field === "longitud") setLongitud("");
        if (field === "altitud") setAltitud("");
        if (field === "descripcion") setDescripcionUbicacion("");
        if (field === "fecha") setFechaHallazgo("");
      }
      return { ...prev, [field]: next };
    });
  }

  function getCurrentPositionAsync(
    options: PositionOptions,
  ): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation!.getCurrentPosition(resolve, reject, options);
    });
  }

  function geoErrorMessage(
    err: GeolocationPositionError | Error,
    extraHint?: string,
  ): string {
    if ("code" in err && typeof err.code === "number") {
      switch (err.code) {
        case 1:
          return `Permiso denegado: permití la ubicación para este sitio en la configuración del navegador, o ingresá coordenadas a mano.${extraHint ? ` ${extraHint}` : ""}`;
        case 2:
          return `Ubicación no disponible (GPS apagado o señal débil). Probá al aire libre o usá coordenadas manuales.${extraHint ? ` ${extraHint}` : ""}`;
        case 3:
          return `Tiempo agotado al pedir ubicación. Probá de nuevo o usá coordenadas manuales.${extraHint ? ` ${extraHint}` : ""}`;
        default:
          break;
      }
    }
    const m = err instanceof Error ? err.message : "";
    const base = m ? `No se pudo obtener GPS: ${m}` : "No se pudo obtener la ubicación.";
    return extraHint ? `${base} ${extraHint}` : base;
  }

  async function onUsarGPS() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setFormErr("Tu navegador no soporta geolocalización.");
      return;
    }
    const insecureHint =
      typeof window !== "undefined" && !window.isSecureContext
        ? "El navegador suele bloquear GPS en contexto no seguro. Abrí el sitio en https o en http://localhost (no por IP de red)."
        : "";
    setGeoBusy(true);
    setFormErr(null);
    const apply = (pos: GeolocationPosition) => {
      setNoAplica((prev) => ({
        ...prev,
        latitud: false,
        longitud: false,
        altitud: false,
      }));
      setLatitud(pos.coords.latitude.toFixed(7));
      setLongitud(pos.coords.longitude.toFixed(7));
      if (pos.coords.altitude != null && Number.isFinite(pos.coords.altitude)) {
        setAltitud(String(pos.coords.altitude));
      }
    };
    try {
      try {
        if ("permissions" in navigator && navigator.permissions?.query) {
          const status = await navigator.permissions.query({
            name: "geolocation",
          } as PermissionDescriptor);
          if (status.state === "denied") {
            setFormErr(
              `Tu navegador tiene bloqueado el permiso de ubicación para este sitio.${insecureHint ? ` ${insecureHint}` : ""}`,
            );
            return;
          }
        }
      } catch {
        // En algunos navegadores esta API no está disponible.
      }
      const pos = await getCurrentPositionAsync({
        enableHighAccuracy: false,
        timeout: 22000,
        maximumAge: 120000,
      });
      apply(pos);
    } catch (e1) {
      const c1 =
        e1 && typeof e1 === "object" && "code" in e1
          ? (e1 as GeolocationPositionError).code
          : 0;
      if (c1 === 2 || c1 === 3) {
        try {
          const pos = await getCurrentPositionAsync({
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0,
          });
          apply(pos);
        } catch (e2) {
          setFormErr(geoErrorMessage(e2 as GeolocationPositionError, insecureHint));
        }
      } else {
        setFormErr(geoErrorMessage(e1 as GeolocationPositionError, insecureHint));
      }
    } finally {
      setGeoBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitTried(true);
    setFormErr(null);
    setOkMsg(null);
    if (!nombre.trim()) {
      setFormErr("Indicá un nombre para el hallazgo.");
      return;
    }
    if (nombre.trim().length < 4) {
      setFormErr("El nombre debe tener al menos 4 caracteres.");
      return;
    }
    if (latMissing || lngMissing || altMissing || descMissing || fechaMissing) {
      const msg = "Por favor completá los datos faltantes o marcá \"No aplica\" donde corresponda.";
      setFormErr(msg);
      if (typeof window !== "undefined") window.alert(msg);
      return;
    }
    if (latInvalid || lngInvalid || altInvalid) {
      const msg = "Latitud, longitud y altitud deben ser números válidos o marcarse como \"No aplica\".";
      setFormErr(msg);
      if (typeof window !== "undefined") window.alert(msg);
      return;
    }
    if (fechaInvalid) {
      const msg = "La fecha de hallazgo debe tener 8 números en formato AAAAMMDD.";
      setFormErr(msg);
      if (typeof window !== "undefined") window.alert(msg);
      return;
    }
    if (!cantonId || !categoriaId || !eraId || !periodoId) {
      const msg = "Por favor completá los datos faltantes.";
      setFormErr(msg);
      if (typeof window !== "undefined") window.alert(msg);
      return;
    }
    setSaving(true);
    const payload = {
      nombre: nombre.trim(),
      canton_id: cantonId,
      categoria_id: categoriaId,
      era_id: eraId,
      periodo_id: periodoId,
      latitud: noAplica.latitud ? null : parseNum(latitud),
      longitud: noAplica.longitud ? null : parseNum(longitud),
      altitud_msnm: noAplica.altitud ? null : parseNum(altitud),
      descripcion_ubicacion: noAplica.descripcion ? "No aplica" : descripcionUbicacion.trim(),
      fecha_hallazgo: noAplica.fecha ? undefined : toIsoDateFromDigits(fechaHallazgo) || undefined,
    };
    try {
      const res = await postCrearFosil(payload);
      const fosilId = res.data.id;
      let fotoOk = "";
      if (foto) {
        try {
          await uploadMultimediaFosil(fosilId, foto, {
            subtipo: "portada",
          });
          fotoOk = " Foto guardada en el servidor y registrada en multimedia.";
        } catch (upErr) {
          fotoOk = ` Registro creado, pero la imagen no se pudo subir: ${upErr instanceof Error ? upErr.message : "error"}. Podés intentar de nuevo desde la lista.`;
        }
      }
      setOkMsg(
        `${res.mensaje} (id ${fosilId}). Estado: pendiente de revisión.${fotoOk}`,
      );
      setNombre("");
      setFoto(null);
      setLatitud("");
      setLongitud("");
      setAltitud("");
      setDescripcionUbicacion("");
      setFechaHallazgo("");
      setNoAplica({
        latitud: false,
        longitud: false,
        altitud: false,
        descripcion: false,
        fecha: false,
      });
      setSubmitTried(false);
      onCreated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      const offlineLikely =
        !navigator.onLine ||
        /fetch|network|failed|conectar|conexión/i.test(msg);
      if (offlineLikely) {
        queueOffline(payload);
      } else {
        setFormErr(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loadErr) {
    return (
      <p className="sec-body" style={{ color: "salmon", marginBottom: "1.5rem" }}>
        {loadErr}
      </p>
    );
  }

  if (!cats) {
    return (
      <p className="sec-body" style={{ marginBottom: "1.5rem" }}>
        Cargando catálogos para el formulario…
      </p>
    );
  }

  const periodosEra = cats.periodos.filter((p) => p.era_id === eraId);

  return (
    <section
      className="rounded-sm border p-6"
      style={{
        marginBottom: "2rem",
        background: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <h2 className="sec-h" style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>
        Registrar nuevo hallazgo
      </h2>
      <p className="sec-body" style={{ marginBottom: "1rem", opacity: 0.9 }}>
        Completá los datos del hallazgo y envialo para revisión administrativa.
      </p>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {formErr ? (
          <p
            className="rounded-sm border px-3 py-2 text-sm"
            style={{
              borderColor: "var(--border)",
              background: "rgba(180,60,60,.12)",
              color: "var(--bone)",
            }}
            role="alert"
          >
            {formErr}
          </p>
        ) : null}
        {okMsg ? (
          <p
            className="rounded-sm border px-3 py-2 text-sm"
            style={{
              borderColor: "var(--border)",
              background: "rgba(60,120,80,.15)",
              color: "var(--bone)",
            }}
          >
            {okMsg}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 text-left">
          <label htmlFor="nf-nombre" className="text-sm text-[var(--bonedim)]">
            Nombre del hallazgo
            {submitTried && nombreMissing ? <span style={{ color: "salmon" }}> *</span> : null}
          </label>
          <input
            id="nf-nombre"
            name="nombre"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Molusco en caliza"
            className={inputClass}
            style={submitTried && (nombreMissing || nombreShort) ? { ...inputStyle, borderColor: "salmon" } : inputStyle}
          />
          {nombreShort ? (
            <p className="text-xs text-[salmon]">Usá al menos 4 caracteres para identificar el hallazgo.</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 text-left">
            <label htmlFor="nf-canton" className="text-sm text-[var(--bonedim)]">
              Cantón
              {submitTried && cantonMissing ? <span style={{ color: "salmon" }}> *</span> : null}
            </label>
            <select
              id="nf-canton"
              className={inputClass}
              style={submitTried && cantonMissing ? { ...inputStyle, borderColor: "salmon" } : inputStyle}
              value={cantonId}
              onChange={(e) => setCantonId(Number(e.target.value))}
            >
              {cats.cantones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.codigo})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 text-left">
            <label
              htmlFor="nf-categoria"
              className="text-sm text-[var(--bonedim)]"
            >
              Categoría
              {submitTried && categoriaMissing ? <span style={{ color: "salmon" }}> *</span> : null}
            </label>
            <select
              id="nf-categoria"
              className={inputClass}
              style={submitTried && categoriaMissing ? { ...inputStyle, borderColor: "salmon" } : inputStyle}
              value={categoriaId}
              onChange={(e) => setCategoriaId(Number(e.target.value))}
            >
              {cats.categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="rounded-sm border p-3"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <p className="text-sm text-[var(--bonedim)]" style={{ marginBottom: "0.5rem" }}>
            Ubicación del hallazgo (GPS o manual)
          </p>
          <p className="text-xs text-[var(--bonedim)]/80" style={{ marginBottom: "0.5rem" }}>
            Si el GPS no responde, comprobá permisos de ubicación y que la página esté en
            localhost o https (en http por IP de red muchos navegadores lo bloquean).
          </p>
          <div className="flex flex-wrap gap-2" style={{ marginBottom: "0.6rem" }}>
            <button
              type="button"
              onClick={onUsarGPS}
              className="btn-out text-sm"
              disabled={geoBusy}
            >
              {geoBusy ? "Tomando GPS…" : "Usar mi GPS"}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--bonedim)]">Latitud</span>
                {submitTried && latMissing ? <span style={{ color: "salmon" }}> *</span> : null}
                <button type="button" className="text-xs underline" onClick={() => toggleNoAplicaField("latitud")}>
                  {noAplica.latitud ? "Quitar No aplica" : "No aplica"}
                </button>
              </div>
              <input
                placeholder="Latitud"
                value={latitud}
                onChange={(e) => setLatitud(e.target.value)}
                className={inputClass}
                style={submitTried && (latMissing || latInvalid) ? { ...inputStyle, borderColor: "salmon" } : inputStyle}
                disabled={noAplica.latitud}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--bonedim)]">Longitud</span>
                {submitTried && lngMissing ? <span style={{ color: "salmon" }}> *</span> : null}
                <button type="button" className="text-xs underline" onClick={() => toggleNoAplicaField("longitud")}>
                  {noAplica.longitud ? "Quitar No aplica" : "No aplica"}
                </button>
              </div>
              <input
                placeholder="Longitud"
                value={longitud}
                onChange={(e) => setLongitud(e.target.value)}
                className={inputClass}
                style={submitTried && (lngMissing || lngInvalid) ? { ...inputStyle, borderColor: "salmon" } : inputStyle}
                disabled={noAplica.longitud}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--bonedim)]">Altitud msnm</span>
                {submitTried && altMissing ? <span style={{ color: "salmon" }}> *</span> : null}
                <button type="button" className="text-xs underline" onClick={() => toggleNoAplicaField("altitud")}>
                  {noAplica.altitud ? "Quitar No aplica" : "No aplica"}
                </button>
              </div>
              <input
                placeholder="Altitud msnm"
                value={altitud}
                onChange={(e) => setAltitud(e.target.value)}
                className={inputClass}
                style={submitTried && (altMissing || altInvalid) ? { ...inputStyle, borderColor: "salmon" } : inputStyle}
                disabled={noAplica.altitud}
              />
            </div>
          </div>
          {latInvalid || lngInvalid || altInvalid ? (
            <p className="text-xs text-[salmon]" style={{ marginTop: "0.5rem" }}>
              Latitud, longitud y altitud deben ser números válidos o marcarse como &quot;No aplica&quot;.
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2" style={{ marginTop: "0.75rem" }}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--bonedim)]">Descripción ubicación (manual)</span>
                {submitTried && descMissing ? <span style={{ color: "salmon" }}> *</span> : null}
                <button type="button" className="text-xs underline" onClick={() => toggleNoAplicaField("descripcion")}>
                  {noAplica.descripcion ? "Quitar No aplica" : "No aplica"}
                </button>
              </div>
              <input
                placeholder="Descripción ubicación (manual)"
                value={descripcionUbicacion}
                onChange={(e) => setDescripcionUbicacion(e.target.value)}
                className={inputClass}
                style={submitTried && descMissing ? { ...inputStyle, borderColor: "salmon" } : inputStyle}
                disabled={noAplica.descripcion}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--bonedim)]">Fecha de hallazgo (AAAAMMDD)</span>
                {submitTried && fechaMissing ? <span style={{ color: "salmon" }}> *</span> : null}
                <button type="button" className="text-xs underline" onClick={() => toggleNoAplicaField("fecha")}>
                  {noAplica.fecha ? "Quitar No aplica" : "No aplica"}
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={fechaHallazgo}
                onChange={(e) => setFechaHallazgo(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="AAAAMMDD"
                className={inputClass}
                style={submitTried && (fechaMissing || fechaInvalid) ? { ...inputStyle, borderColor: "salmon" } : inputStyle}
                disabled={noAplica.fecha}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-left">
          <label htmlFor="nf-foto" className="text-sm text-[var(--bonedim)]">
            Foto del hallazgo (opcional)
          </label>
          <input
            id="nf-foto"
            name="foto"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className={`${inputClass} text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-[var(--amber)] file:px-3 file:py-1.5 file:text-[var(--ink)]`}
            style={inputStyle}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFoto(f);
            }}
          />
          <p className="text-xs text-[var(--bonedim)]" style={{ opacity: 0.85 }}>
            JPEG, PNG, GIF o WebP. Se optimiza a WebP en el servidor.
          </p>
          {fotoPreview ? (
            <div
              className="mt-1 overflow-hidden rounded-sm border"
              style={{
                borderColor: "var(--border)",
                maxWidth: "280px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fotoPreview}
                alt="Vista previa"
                className="h-auto w-full object-cover"
                style={{ maxHeight: "160px" }}
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 text-left">
            <label htmlFor="nf-era" className="text-sm text-[var(--bonedim)]">
              Era geológica
              {submitTried && eraMissing ? <span style={{ color: "salmon" }}> *</span> : null}
            </label>
            <select
              id="nf-era"
              className={inputClass}
              style={submitTried && eraMissing ? { ...inputStyle, borderColor: "salmon" } : inputStyle}
              value={eraId}
              onChange={(e) => onEraChange(Number(e.target.value))}
            >
              {cats.eras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 text-left">
            <label
              htmlFor="nf-periodo"
              className="text-sm text-[var(--bonedim)]"
            >
              Periodo (debe corresponder a la era)
              {submitTried && periodoMissing ? <span style={{ color: "salmon" }}> *</span> : null}
            </label>
            <select
              id="nf-periodo"
              className={inputClass}
              style={submitTried && periodoMissing ? { ...inputStyle, borderColor: "salmon" } : inputStyle}
              value={periodoId}
              onChange={(e) => setPeriodoId(Number(e.target.value))}
            >
              {periodosEra.length === 0 ? (
                <option value={0}>Sin periodos para esta era</option>
              ) : (
                periodosEra.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="btn-fill mt-1 w-full sm:w-auto"
          disabled={saving}
        >
          {saving ? "Guardando…" : "Enviar registro"}
        </button>
        {submitTried && hasMissingRequired ? (
          <p className="text-xs" style={{ color: "salmon" }}>
            * Campos obligatorios faltantes
          </p>
        ) : null}
      </form>
    </section>
  );
}
