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

export function formatDateEs(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("es-MX", {
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
