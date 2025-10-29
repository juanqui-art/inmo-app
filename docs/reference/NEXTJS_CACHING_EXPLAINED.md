# Next.js 16 Caché - Guía Completa y Simplificada

> Documento educativo que explica cómo funciona el caché en Next.js 16 con ejemplos prácticos del proyecto InmoApp

## 📖 Tabla de Contenidos

1. [¿Qué es el Caché?](#qué-es-el-caché)
2. [El Concepto Clave](#el-concepto-clave)
3. [Los Tres Tipos de Caché](#los-tres-tipos-de-caché)
4. [Ejemplo: Tu Dashboard](#ejemplo-tu-dashboard)
5. [Limitaciones Importantes](#limitaciones-importantes)
6. [Cómo Aplicar en Tu Proyecto](#cómo-aplicar-en-tu-proyecto)

---

## ¿Qué es el Caché?

El caché es como guardar resultados en una "caja" para no tener que repetir el mismo trabajo:

```
┌─────────────────────────────────────────┐
│  PRIMERA VEZ (sin caché)                 │
├─────────────────────────────────────────┤
│  1. Ejecuta queries a la BD              │
│  2. Procesa datos                        │
│  3. Renderiza componente                 │
│  4. Devuelve resultado                   │
│  5. Guarda en CACHÉ ✓                    │
│  ⏱️  Tiempo: 500ms                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  PRÓXIMAS VECES (con caché)              │
├─────────────────────────────────────────┤
│  1. ¿Está en caché? SÍ ✓                │
│  2. Devuelve desde caché                 │
│  3. Sin queries a la BD                  │
│  ⏱️  Tiempo: 5ms                         │
└─────────────────────────────────────────┘
```

**Beneficio:** Reducir carga en BD, respuestas más rápidas

---

## El Concepto Clave

En Next.js 16, **el contexto de ejecución determina qué APIs de caché usar**, no el bundler:

```typescript
// Mismo bundle de servidor, DIFERENTES modelos de caché

// ✅ SERVER COMPONENT (parte del árbol React)
export default async function Page() {
  'use cache'           // ← Usa 'use cache'
  cacheLife('hours')
  return <div>...</div>
}

// ❌ ROUTE HANDLER (HTTP request handler)
export async function GET() {
  // 'use cache' NO funciona aquí
  // Usa revalidateTag() en su lugar
  return Response.json({})
}

// ❌ INSTRUMENTATION (server startup)
export async function register() {
  // 'use cache' NO funciona aquí
  // Usa global state en su lugar
}

// ❌ PROXY/MIDDLEWARE (request transformation)
export function proxy(request: NextRequest) {
  // 'use cache' NO funciona aquí
  // Usa Response headers en su lugar
}
```

**Por qué la diferencia?**

- **Server Components:** Parte del árbol React → prerenderable → `'use cache'` funciona
- **Route Handlers:** HTTP request handlers → request-time only → usa `revalidateTag()`
- **Instrumentation:** Server startup hooks → setup una sola vez → usa global state
- **Proxy/Middleware:** Request transformation layer → pre-routing → usa Response headers

---

## Los Tres Tipos de Caché

### 1️⃣ SIN CACHÉ (Default)

```typescript
export default async function DashboardPage() {
  // ❌ SIN 'use cache'
  const data = await db.property.findMany({
    where: { agentId: user.id }
  });

  return <div>{data}</div>;
}
```

**¿Cuándo se ejecuta?**
- Cada request que llega al servidor
- Usuario refresca → nueva query
- Otro usuario accede → nueva query
- Múltiples usuarios simultáneos → múltiples queries

**Consecuencia:** Mucha carga en la BD, respuestas lentas

---

### 2️⃣ CACHÉ PÚBLICO (`'use cache'`)

```typescript
export default async function DashboardPage() {
  'use cache'           // ← Agregar esta línea
  cacheLife('hours')    // ← Guardar por 1 hora

  const data = await db.property.findMany({
    where: { agentId: user.id }
  });

  return <div>{data}</div>;
}
```

**¿Cuándo se ejecuta?**
- Primera vez → ejecuta query, guarda en caché
- Próximas veces → desde caché (sin query)
- Después de 1 hora → vuelve a ejecutar

**Problema:** ¡No funciona para tu caso! Porque los datos son diferentes por usuario

```
Usuario Juan abre:  BD query → CACHÉ GLOBAL
Usuario Pedro abre: Recibe datos de JUAN (¡ERROR!)
```

**Cuándo usar:** Solo datos que NO dependen del usuario

---

### 3️⃣ CACHÉ PRIVADO (`'use cache: private'`)

```typescript
export default async function DashboardPage() {
  'use cache: private'  // ← CACHÉ POR USUARIO
  cacheLife('hours')

  const user = await requireRole(["AGENT", "ADMIN"]);

  const data = await db.property.findMany({
    where: { agentId: user.id }  // ← Datos específicos del usuario
  });

  return <div>{data}</div>;
}
```

**¿Cuándo se ejecuta?**
- Usuario Juan abre → query → CACHÉ (para Juan)
- Usuario Juan recarga → desde caché (sin query)
- Usuario Pedro abre → query → CACHÉ (para Pedro)
- Usuario Pedro recarga → desde caché (sin query)

**Beneficio:** Cada usuario tiene su caché separado ✅

---

## Ejemplo: Tu Dashboard

### Situación Actual

Tu `apps/web/app/dashboard/page.tsx`:

```typescript
export default async function DashboardPage() {
  const user = await requireRole(["AGENT", "ADMIN"]);

  // ❌ SIN CACHÉ - ejecuta cada request
  const [propertiesData, appointmentsData, viewsData] = await Promise.all([
    db.property.findMany({
      where: { agentId: user.id },
      select: { id: true, status: true },
    }),
    db.appointment.findMany({
      where: { property: { agentId: user.id } },
      select: { id: true, status: true, createdAt: true },
    }),
    db.propertyView.findMany({
      where: {
        property: { agentId: user.id },
        viewedAt: { gte: new Date(new Date().setDate(1)) }
      },
      select: { id: true },
    }),
  ]);

  // Calcular estadísticas...
  return <div>...</div>;
}
```

### Comparación de Rendimiento

**SIN CACHÉ (Actual):**
```
User Juan abre:       DB query ➜ 500ms
User Juan recarga:    DB query ➜ 500ms
User Juan recarga 2x: DB query ➜ 500ms
User Pedro abre:      DB query ➜ 500ms
─────────────────────────────────────
TOTAL: 4 queries a la BD (2000ms de espera)
```

**CON CACHÉ PRIVADO (Optimizado):**
```
User Juan abre:       DB query ➜ 500ms (caché por 1h)
User Juan recarga:    DESDE CACHÉ ➜ 5ms  ✅
User Juan recarga 2x: DESDE CACHÉ ➜ 5ms  ✅
User Pedro abre:      DB query ➜ 500ms (caché por 1h)
─────────────────────────────────────
TOTAL: 2 queries a la BD (1000ms de espera) - 50% mejora
```

---

## Limitaciones Importantes

### 1. Requisito: `experimental.cacheComponents: true`

Estas reglas **SOLO aplican cuando el caché está habilitado** en `next.config.ts`:

```typescript
// next.config.ts
export default {
  experimental: {
    cacheComponents: true,  // ← Necesario para 'use cache'
  },
}
```

**Sin esta opción:**
- Puedes usar `export const revalidate = 60`
- Puedes usar `export const dynamic = 'force-static'`
- Las reglas de caché son diferentes

### 2. `'use cache'` vs `'use cache: private'`

```typescript
// PÚBLICO - Compartido entre todos los usuarios
'use cache'
// ✅ Puedes acceder: params (si está en generateStaticParams)
// ❌ NO puedes acceder: cookies, headers, searchParams, user.id

// PRIVADO - Caché por usuario
'use cache: private'
// ✅ Puedes acceder: cookies, headers, searchParams, params, user.id
// 🔒 Cada usuario obtiene su propia versión en caché
```

### 3. `cacheLife()` - Cuánto tiempo guardar

```typescript
'use cache: private'
cacheLife('hours')        // 1 hora
cacheLife('minutes')      // 1 minuto
cacheLife('seconds')      // 1 segundo
cacheLife('days')         // 1 día
cacheLife('weeks')        // 1 semana
cacheLife('months')       // 1 mes
cacheLife('years')        // 1 año
cacheLife('infinite')     // Infinito (hasta manual revalidation)
```

**Para tu dashboard:**
- `cacheLife('minutes')` - Si stats cambian frecuentemente
- `cacheLife('hours')` - Si stats son relativamente estables
- `cacheLife('days')` - Si stats cambian muy lentamente

---

## Cómo Aplicar en Tu Proyecto

### Paso 1: Verificar que Caché está Habilitado

Revisa tu `apps/web/next.config.ts`:

```typescript
export default {
  // ... otras opciones
  experimental: {
    cacheComponents: true,  // ← ¿Está aquí?
  },
}
```

Si NO está, necesitas agregarlo y reiniciar el servidor.

### Paso 2: Aplicar a Dashboard (Ejemplo)

```typescript
// apps/web/app/dashboard/page.tsx

export default async function DashboardPage() {
  'use cache: private'      // ← AGREGAR
  cacheLife('hours')        // ← AGREGAR

  const user = await requireRole(["AGENT", "ADMIN"]);

  // Resto del código igual...
  const [propertiesData, appointmentsData, viewsData] = await Promise.all([
    // ...
  ]);

  return <div>...</div>;
}
```

### Paso 3: Validar que Funciona

1. Abre dashboard en navegador → primer load (con query)
2. Recarga página → debe ser más rápido (desde caché)
3. Abre en otro navegador (como otro usuario) → query nueva
4. Recarga en otro navegador → desde caché

### Paso 4: Invalidar Caché Manualmente (Opcional)

Cuando las estadísticas cambien, puedes forzar recalcular:

```typescript
// En una Server Action que modifique datos
import { revalidateTag } from 'next/cache'

export async function createProperty(data) {
  // ... crear propiedad en BD

  // Invalidar caché del dashboard
  revalidateTag('dashboard-stats')
}
```

Y en el dashboard:

```typescript
export default async function DashboardPage() {
  'use cache: private'
  cacheLife('hours')
  cacheTag('dashboard-stats')  // ← Agregar esta línea

  // ... resto del código
}
```

---

## Resumen Rápido

| Tipo | Sintaxis | Uso | Cuándo |
|------|----------|-----|--------|
| **Sin Caché** | (nada) | Datos que cambian constantemente | Edición de formularios en tiempo real |
| **Caché Público** | `'use cache'` + `cacheLife()` | Datos globales, iguales para todos | Listados públicos, precios |
| **Caché Privado** | `'use cache: private'` + `cacheLife()` | Datos del usuario, distintos por persona | Dashboard, mis propiedades |

---

## Casos de Uso en InmoApp

### ✅ Usa Caché Privado

- **Dashboard** - Estadísticas del agente
- **Mis Propiedades** - Listado personal de propiedades
- **Mis Favoritos** - Propiedades marcadas como favoritas
- **Mis Citas** - Citas del usuario

### ❌ No Uses Caché (o usa Público)

- **Home Page** - Propiedades destacadas (público)
- **Listado de Propiedades** - Búsqueda de propiedades (público)
- **Mapa** - Vista pública de propiedades
- **Formularios** - Crear/editar propiedades

---

## Recursos Adicionales

- **Next.js 16 Caching Docs:** https://nextjs.org/docs/app/building-your-application/caching
- **Partial Prerendering:** https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering
- **Server Components:** https://nextjs.org/docs/app/building-your-application/rendering/server-components

---

## Notas Importantes

⚠️ **Cache Components está en fase EXPERIMENTAL en Next.js 16**

- Está habilitado por defecto en Next.js 16 (versión estable)
- Los comportamientos pueden cambiar
- Monitorea actualizaciones oficiales

💡 **Tip:** Empieza con `cacheLife('hours')` o `cacheLife('minutes')` en development

Si algo se ve viejo en caché, puedes:
1. Reducir el `cacheLife()`
2. Usar `revalidateTag()` en Server Actions
3. Hard refresh en navegador (Cmd+Shift+R)

---

*Documento actualizado: Octubre 2025 - Next.js 16*
