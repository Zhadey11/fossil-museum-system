"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  MAP_FOSSIL_POINTS,
  type MapFossilPoint,
  paisesEnMapa,
  provinciasPorPais,
} from "@/data/mapFossils";
import "leaflet/dist/leaflet.css";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type MapaFosilesProps = {
  /** Si vienen de la API; si no, se usan datos demo en `mapFossils`. */
  points?: MapFossilPoint[];
};

export default function MapaFosiles({ points }: MapaFosilesProps) {
  const basePoints = points ?? MAP_FOSSIL_POINTS;
  const fromApi = Boolean(points && points.length > 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [pais, setPais] = useState<string>("todas");
  const [provincia, setProvincia] = useState<string>("todas");

  const listaPaises = useMemo(() => paisesEnMapa(basePoints), [basePoints]);
  const listaProvincias = useMemo(
    () => provinciasPorPais(basePoints, pais === "todas" ? null : pais),
    [pais, basePoints],
  );

  const puntosFiltrados = useMemo(() => {
    let pts = basePoints;
    if (pais !== "todas") pts = pts.filter((p) => p.pais === pais);
    if (provincia !== "todas") pts = pts.filter((p) => p.provincia === provincia);
    return pts;
  }, [pais, provincia, basePoints]);

  useEffect(() => {
    setProvincia("todas");
  }, [pais]);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      map = L.map(containerRef.current).setView([10.5, -85.2], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerRef.current = group;
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      layerRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !layerRef.current) return;

    void (async () => {
      const L = await import("leaflet");
      const map = mapRef.current!;
      const layer = layerRef.current!;
      layer.clearLayers();
      const whitePin = L.divIcon({
        className: "map-pin-white",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -10],
      });

      puntosFiltrados.forEach((p) => {
        const m = L.marker([p.latitud, p.longitud], { icon: whitePin });
        m.bindPopup(
          `<div class="map-popup-inner"><strong>${escapeHtml(p.nombre)}</strong><p>${escapeHtml(p.resumen)}</p><a class="map-popup-link" href="/fosil/${p.id}">Leer más →</a></div>`,
          { maxWidth: 280 },
        );
        m.addTo(layer);
      });

      if (puntosFiltrados.length === 0) return;
      if (puntosFiltrados.length === 1) {
        map.setView(
          [puntosFiltrados[0].latitud, puntosFiltrados[0].longitud],
          9,
        );
        return;
      }
      const b = L.latLngBounds(
        puntosFiltrados.map(
          (p) => [p.latitud, p.longitud] as [number, number],
        ),
      );
      map.fitBounds(b, { padding: [48, 48], maxZoom: 10 });
    })();
  }, [puntosFiltrados, mapReady]);

  return (
    <div className="mapa-fosiles">
      <div className="mapa-fosiles-toolbar">
        <label className="mapa-fosiles-field">
          <span>País</span>
          <select
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            className="mapa-fosiles-select"
          >
            <option value="todas">Todos los países</option>
            {listaPaises.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="mapa-fosiles-field">
          <span>Provincia / departamento</span>
          <select
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            className="mapa-fosiles-select"
            disabled={pais === "todas" || listaProvincias.length === 0}
          >
            <option value="todas">Todas en este país</option>
            {listaProvincias.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>
        </label>
        <p className="mapa-fosiles-count">
          {puntosFiltrados.length} hallazgo
          {puntosFiltrados.length === 1 ? "" : "s"} en vista
        </p>
      </div>
      <div ref={containerRef} className="mapa-fosiles-canvas" />
      <p className="mapa-fosiles-note">
        {fromApi
          ? "Pines desde la API (fósiles publicados con coordenadas). País/provincia simplificados hasta enlazar jerarquía cantón → provincia."
          : "Demo con datos estáticos. Con el backend activo se cargan coordenadas desde la API."}
      </p>
      <p className="mapa-fosiles-3d">
        <strong>Sobre mapa 3D:</strong> un globo 3D (Cesium / Three.js) es posible
        después; primero conviene cerrar flujo 2D + backend.{" "}
        <Link href="/catalogo" className="catalog-clear-filter">
          Ir al catálogo
        </Link>
      </p>
    </div>
  );
}
