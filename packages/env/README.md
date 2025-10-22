# @repo/env

Centralizado validación de variables de entorno para todo el monorepo InmoApp.

## Uso

```typescript
import { env, clientEnv, serverEnv } from '@repo/env'

// Acceso type-safe a variables
console.log(env.NEXT_PUBLIC_SUPABASE_URL)
console.log(env.DATABASE_URL) // Solo en servidor
```

## Variables disponibles

### Cliente (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_SUPABASE_URL` - URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima de Supabase
- `NEXT_PUBLIC_SITE_URL` - URL pública del sitio (default: http://localhost:3000)
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Token de Mapbox (opcional)

### Servidor
- `DATABASE_URL` - Conexión a la base de datos PostgreSQL
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio Supabase (opcional, solo servidor)
- `NODE_ENV` - Entorno (development | production | test)

## Agregar nuevas variables

1. Edita el esquema en `src/index.ts`
2. Agregale a `.env.example` en la raíz
3. Agrega valores a `.env.local` (no commitear)
4. Reinicia el dev server
