/**
 * API Route: GET /api/search/cities
 *
 * Autocomplete para búsqueda de ciudades en el hero search bar
 * Retorna ciudades que coinciden con la consulta
 *
 * Query Parameters:
 * - q: string (required, min 2 chars) - Término de búsqueda
 *
 * Response:
 * {
 *   success: boolean,
 *   data: Array<{
 *     name: string,
 *     state: string,
 *     slug: string,
 *     propertyCount: number
 *   }>,
 *   error?: string
 * }
 *
 * Examples:
 * GET /api/search/cities?q=cuen
 * GET /api/search/cities?q=azog
 */

import { propertyRepository } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    // Validar parámetro
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: q",
          data: [],
        },
        { status: 400 }
      );
    }

    if (query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Query must be at least 2 characters",
          data: [],
        },
        { status: 400 }
      );
    }

    // Obtener ciudades del repositorio
    const cities = await propertyRepository.getCitiesAutocomplete(query);

    // Retornar respuesta con cache headers
    return NextResponse.json(
      {
        success: true,
        data: cities,
      },
      {
        status: 200,
        headers: {
          // Cache por 5 minutos
          "Cache-Control": "public, max-age=300",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[API] Search cities error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        data: [],
      },
      { status: 500 }
    );
  }
}

/**
 * PERFORMANCE CONSIDERATIONS:
 *
 * 1. Caching (5 minutos):
 *    - Las búsquedas cambian poco frecuentemente
 *    - Los usuarios suelen buscar las mismas ciudades
 *    - Reduce carga de BD en picos de tráfico
 *
 * 2. Debouncing (frontend):
 *    - El componente debouncea por 300ms
 *    - Evita múltiples requests mientras el usuario escribe
 *    - Combinado con cache: respuesta rápida
 *
 * 3. Query optimization:
 *    - Índice en (city, state) en la tabla properties
 *    - Distinct en city minimiza resultados
 *    - Conteo rápido gracias al índice
 *
 * 4. Response size:
 *    - Típicamente 2-10 ciudades por búsqueda
 *    - Payload < 1KB incluso en peor caso
 *    - No comprime gzip por tamaño pequeño
 *
 * FUTURE IMPROVEMENTS:
 *
 * 1. Redis caching:
 *    - Cache en Redis por 1 hora
 *    - Evita queries a BD frecuentes
 *    - Escala mejor con múltiples servidores
 *
 * 2. Fuzzy matching:
 *    - Usar Levenshtein distance
 *    - Tolerar typos ("Cuecna" → "Cuenca")
 *    - Mejorar UX
 *
 * 3. Rate limiting:
 *    - Limitar a 10 requests por IP por minuto
 *    - Prevenir abuso/DDoS
 *    - Usar Vercel KV o similar
 *
 * 4. Analytics:
 *    - Trackear búsquedas sin resultados
 *    - Identificar ciudades "no encontradas"
 *    - Usar para mejorar data de ciudades
 */
