import { itemsGaleriaInstalaciones } from "@/data/instalacionesGaleria";
import { GaleriaClient } from "@/components/GaleriaClient";
import { fetchCatalogoPublicoImagenes, multimediaAbsUrl } from "@/lib/api";

export default async function GaleriaPage() {
  const items = itemsGaleriaInstalaciones();
  const fossilsRes = await fetchCatalogoPublicoImagenes({ page: 1, page_size: 32 });
  const fossils = fossilsRes.ok
    ? (() => {
        const byFossil = new Map<number, { id: number; nombre: string; imageSrc: string; categoria: string }>();
        for (const r of fossilsRes.data) {
          const id = Number(r.id);
          if (!Number.isFinite(id) || byFossil.has(id)) continue;
          byFossil.set(id, {
            id,
            nombre: r.nombre,
            imageSrc: multimediaAbsUrl(r.imagen_url),
            categoria: r.categoria_codigo || r.categoria_nombre || "Fósil",
          });
        }
        return [...byFossil.values()];
      })()
    : [];
  return <GaleriaClient items={items} fossils={fossils} />;
}
