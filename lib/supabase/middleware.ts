import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Refresca la sesión del usuario en cada request. Crítico para que
 * Server Components vean al usuario autenticado.
 *
 * Patrón estándar de Supabase: NO meter código entre createServerClient
 * y getUser — si lo haces, las cookies pueden quedar fuera de sync.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Sin credenciales de Supabase configuradas (ej. deploy antes de crear
  // el proyecto real), no truena el sitio entero — el middleware corre en
  // casi cada ruta, así que un error aquí tumba hasta las páginas públicas
  // que no necesitan sesión.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // No meter código aquí — ver doc de Supabase SSR
  await supabase.auth.getUser();

  return supabaseResponse;
}
