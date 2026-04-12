export type MockFossil = {
  id: string;
  name: string;
  category: string;
  image: string;
  /** Texto opcional para tarjetas destacadas (solo diseño). */
  description?: string;
};

export const mockFossils: MockFossil[] = [
  {
    id: "1",
    name: "Amonita spiralis",
    category: "Cefalópodos",
    image: "/catalogo-imagenes/amonita.svg",
    description:
      "Ejemplo de pieza destacada para la vitrina del catálogo visual.",
  },
  {
    id: "2",
    name: "Trilobita paradoxides",
    category: "Artrópodos",
    image: "/catalogo-imagenes/trilobite.svg",
  },
  {
    id: "3",
    name: "Diente de megalodonte",
    category: "Condrictios",
    image: "/catalogo-imagenes/megalodon.svg",
  },
  {
    id: "4",
    name: "Helecho carbonífero",
    category: "Plantas fósiles",
    image: "/catalogo-imagenes/helecho.svg",
  },
  {
    id: "5",
    name: "Cráneo de terópodo",
    category: "Dinosaurios",
    image: "/catalogo-imagenes/dinosaurio.svg",
  },
  {
    id: "6",
    name: "Arrecife de coral",
    category: "Cnidarios",
    image: "/catalogo-imagenes/corales.svg",
  },
];
