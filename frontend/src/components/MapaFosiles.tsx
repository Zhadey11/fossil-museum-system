"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type MapFossilPoint, cantonesEnMapa } from "@/data/mapFossils";
import "leaflet/dist/leaflet.css";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type MapaFosilesProps = {
  points?: MapFossilPoint[];
};

function spreadOverlappingPoints(points: MapFossilPoint[]): Array<{
  point: MapFossilPoint;
  lat: number;
  lng: number;
}> {
  const groups = new Map<string, MapFossilPoint[]>();
  points.forEach((p) => {
    const key = `${p.latitud.toFixed(6)},${p.longitud.toFixed(6)}`;
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  });
  const out: Array<{ point: MapFossilPoint; lat: number; lng: number }> = [];
  groups.forEach((list) => {
    if (list.length === 1) {
      const p = list[0];
      out.push({ point: p, lat: p.latitud, lng: p.longitud });
      return;
    }
    const radius = 0.012; // ~1.3 km visual offset to unstack markers
    list.forEach((p, idx) => {
      const angle = (Math.PI * 2 * idx) / list.length;
      out.push({
        point: p,
        lat: p.latitud + radius * Math.sin(angle),
        lng: p.longitud + radius * Math.cos(angle),
      });
    });
  });
  return out;
}

export default function MapaFosiles({ points }: MapaFosilesProps) {
  const basePoints = points ?? [];

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [canton, setCanton] = useState<string>("todas");

  const listaCantones = useMemo(() => cantonesEnMapa(basePoints), [basePoints]);

  const puntosFiltrados = useMemo(() => {
    let pts = basePoints;
    if (canton !== "todas") {
      pts = pts.filter((p) => {
        const c = (p.canton || p.provincia || "").trim();
        return c === canton;
      });
    }
    return pts;
  }, [canton, basePoints]);
  const puntosEnMapa = useMemo(
    () => spreadOverlappingPoints(puntosFiltrados),
    [puntosFiltrados],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      map = L.map(containerRef.current).setView([9.7, -83.7], 8);
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
        className: "map-pin-gold",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -10],
      });

      puntosEnMapa.forEach(({ point: p, lat, lng }) => {
        const m = L.marker([lat, lng], { icon: whitePin });
        const loc = [p.canton, p.provincia].filter(Boolean).join(" · ");
        m.bindPopup(`<div class="map-popup-inner"><img class="map-popup-thumb" src="${escapeHtml((p as { thumb?: string }).thumb || "/images/FondoInicial.jpg")}" alt="${escapeHtml(p.nombre)}" /><strong>${escapeHtml(p.nombre)}</strong><span class="map-popup-badge">${escapeHtml((p as { categoria?: string }).categoria || "FOS")}</span>${loc ? `<p style="font-size:12px;opacity:.85">${escapeHtml(loc)}</p>` : ""}<p>${escapeHtml(p.resumen)}</p><a class="map-popup-link" href="/fosil/${p.id}">Ver ficha &gt;</a></div>`, { maxWidth: 280 });
        m.addTo(layer);
      });

      if (puntosFiltrados.length === 0) return;
      if (puntosEnMapa.length === 1) {
        map.setView(
          [puntosEnMapa[0].lat, puntosEnMapa[0].lng],
          9,
        );
        return;
      }
      const b = L.latLngBounds(
        puntosEnMapa.map(
          (p) => [p.lat, p.lng] as [number, number],
        ),
      );
      map.fitBounds(b, { padding: [48, 48], maxZoom: 10 });
    })();
  }, [puntosFiltrados.length, puntosEnMapa, mapReady]);

  return (
    <div className="mapa-fosiles">
      <div className="mapa-fosiles-toolbar">
        <label className="mapa-fosiles-field">
          <span>Cantón</span>
          <select
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            className="mapa-fosiles-select"
          >
            <option value="todas">Todos los cantones</option>
            {listaCantones.map((c) => (
              <option key={c} value={c}>
                {c}
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
      <p className="mapa-fosiles-note">Pins sincronizados desde registros publicados.</p>
    </div>
  );
}
