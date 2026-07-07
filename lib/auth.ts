import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Devuelve el profile del usuario autenticado, o null si no hay sesión.
 * Para uso en server components.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data ?? null;
}

/**
 * Exige sesión. Redirige a /auth/login?next=<path> si no hay usuario.
 * Todo el equipo de Stay Fresh (admin y staff) tiene acceso completo al
 * panel para el MVP — no hay niveles de permiso finos, es un equipo chico.
 */
export async function requireAuth(redirectTo: string): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/auth/login?next=${encodeURIComponent(redirectTo)}`);
  }
  return profile;
}

/**
 * Exige rol admin. Redirige a / si no es admin (usuario logueado pero
 * sin permisos suficientes), o a login si no hay sesión.
 * Reservado para operaciones sensibles futuras (ej. gestión de cuentas
 * de staff) — hoy no se usa en ninguna ruta del MVP.
 */
export async function requireAdmin(redirectTo: string): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/auth/login?next=${encodeURIComponent(redirectTo)}`);
  }
  if (profile.role !== "admin") {
    redirect("/");
  }
  return profile;
}
