import { PanelChrome } from "@/components/PanelChrome";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PanelChrome>{children}</PanelChrome>;
}
