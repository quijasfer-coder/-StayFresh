import type { Database } from "@/lib/database.types";

type ItemCategory = Database["public"]["Enums"]["item_category"];

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  tenis: "Sneakers",
  botas: "Botas",
  gorras: "Gorras",
  bolsas: "Bolsas",
};

export const CATEGORY_IMAGE: Record<ItemCategory, string> = {
  tenis: "/images/services/tenis.jpg",
  botas: "/images/services/botas.jpg",
  gorras: "/images/services/gorras.jpg",
  bolsas: "/images/services/bolsas.jpg",
};

export const CATEGORY_ORDER: ItemCategory[] = ["tenis", "botas", "gorras", "bolsas"];

export const CATEGORY_TAGLINE: Record<ItemCategory, string> = {
  tenis: "Limpieza profunda para que cada par luzca como nuevo.",
  botas: "Jabones especializados para materiales delicados.",
  gorras: "Cuidado que respeta forma, color y estructura.",
  bolsas: "Trato especializado para piel y materiales finos.",
};

export const CATEGORY_INCLUDES: Record<ItemCategory, string[]> = {
  tenis: [
    "Lavado exterior",
    "Lavado interior (plantillas)",
    "Lavado de agujetas",
    "Eliminación de arrugas superficiales",
    "Tratamiento de desoxidación para plásticos (quita lo amarillo)",
    "Aplicación de freshner (elimina malos olores)",
    "Aplicación de repelente",
  ],
  botas: [
    "Lavado exterior",
    "Lavado interior (plantillas)",
    "Lavado de agujetas",
    "Eliminación de arrugas superficiales",
    "Jabones especializados para gamuza, ante o nubuck",
    "Aplicación de freshner (elimina malos olores)",
    "Aplicación de repelente",
  ],
  gorras: [
    "Lavado sin deformar la estructura",
    "Eliminación de manchas de sudor",
    "Conservación de forma y color",
    "Eliminación de malos olores",
    "Aplicación de repelente",
  ],
  bolsas: [
    "Limpieza especializada",
    "Tratamiento para piel o material especial",
    "Cuidado de herrajes y acabados",
    "Eliminación de manchas difíciles",
    "Lavado de interior con vapor",
  ],
};
