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
