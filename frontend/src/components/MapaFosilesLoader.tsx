"use client";

import dynamic from "next/dynamic";
import type { MapFossilPoint } from "@/data/mapFossils";

const MapaFosiles = dynamic(() => import("./MapaFosiles"), {
  ssr: false,
  loading: () => (
    <div className="mapa-fosiles-loading">Cargando mapa…</div>
  ),
});

type Props = {
  points?: MapFossilPoint[];
};

export function MapaFosilesLoader({ points }: Props) {
  return <MapaFosiles points={points} />;
}
