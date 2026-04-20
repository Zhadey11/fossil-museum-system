import { itemsGaleriaInstalaciones } from "@/data/instalacionesGaleria";
import { GaleriaClient } from "@/components/GaleriaClient";

export default function GaleriaPage() {
  const items = itemsGaleriaInstalaciones();
  return <GaleriaClient items={items} />;
}
