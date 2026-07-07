export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 12 && digits.startsWith("52")) {
    const local = digits.slice(2);
    return `+52 ${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}`;
  }
  return phone;
}

export function pluralizeItems(count: number, category: string): string {
  const singular: Record<string, string> = {
    tenis: "par de tenis",
    botas: "par de botas",
    gorras: "gorra",
    bolsas: "bolsa",
  };
  const plural: Record<string, string> = {
    tenis: "pares de tenis",
    botas: "pares de botas",
    gorras: "gorras",
    bolsas: "bolsas",
  };
  const label = count === 1 ? singular[category] : plural[category];
  return `${count} ${label ?? category}`;
}

/**
 * Un string tipo "2026-07-20" (columna `date` de Postgres, sin hora) lo
 * interpreta el motor de JS como medianoche UTC — en cualquier timezone
 * detrás de UTC (CDMX incluido) eso se muestra como el día ANTERIOR.
 * Forzamos mediodía local agregando la hora antes de parsear.
 */
function toLocalDate(value: string | Date): Date {
  if (typeof value !== "string") return value;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
}

export function formatDateEs(value: string | Date): string {
  return toLocalDate(value).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatDateTimeEs(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
