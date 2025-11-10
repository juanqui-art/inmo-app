# Estado Actual del Sistema de Cache - InmoApp

**Última actualización:** Noviembre 9, 2025

---

## ❌ Estado: SIN IMPLEMENTACIÓN

**InmoApp actualmente NO tiene un sistema de cache implementado en producción.**

Todo lo que ves en `docs/caching/` son:
- ✅ Documentación educativa y de referencia
- ✅ Planes y estrategias futuras
- ✅ Guías para implementación posterior
- ❌ NO código funcionando actualmente

---

## 📅 Historia Completa del Intento de Cache

### **Fase 1: Upgrade a Next.js 16** (Oct 22, 2025)
```
Commit: a8dc880
Upgrade Next.js from v15 → v16.0.0
```

### **Fase 2: Implementación Cache Components** (Oct 23, 2025 - 17:36)
```
Commit: 67d17ee
"feat(cache): implement Cache Components for map properties queries"

Cambios:
- ✅ Crea /apps/web/lib/cache/properties-cache.ts (210 líneas)
- ✅ Implementa getCachedPropertiesByBounds()
- ✅ Usa cacheTag() + updateTag()
- ✅ Integra con Server Actions

Duración: ~3 minutos de desarrollo
```

### **Fase 3: Habilitar Flag Experimental** (Oct 23, 2025 - 17:39)
```
Commit: ee4cd16
"config: enable Cache Components experimental feature in Next.js 16"

Cambios:
- ✅ Agrega a next.config.ts:
  experimental: {
    cacheComponents: true,
  }

Duración: Inmediato (apenas 3 minutos después de implementar)
```

### **Fase 4: DESHABILITAR (ROLLBACK)** (Oct 23, 2025 - 17:44)
```
Commit: c9126bc
"fix: disable experimental Cache Components due to Next.js 16.0.0 limitations"

🚨 SOLO 5 MINUTOS DESPUÉS DE HABILITAR

Cambios:
- ❌ Comenta/elimina experimental.cacheComponents
- ❌ Elimina cacheTag() de properties-cache.ts
- ❌ Reemplaza updateTag() con revalidatePath()
- ✅ Mantiene React.cache() (compatible)

RAZÓN:
  Cache Components requiere que TODO esté cacheado
  including cookies() en getCurrentUser()
  Esto rompe rutas autenticadas
```

**Commit message oficial:**
```
fix: disable experimental Cache Components due to Next.js 16.0.0 limitations

ISSUE: cacheTag() + updateTag() require all data access to be cached
       (including cookies() in getCurrentUser). This breaks routes that
       need uncached data access.

SOLUTION: We implement caching at the function level instead using
          React.cache() without cacheTag/updateTag. This provides:
          ✅ Request deduplication (same benefits)
          ❌ Manual invalidation via revalidateTag() (workaround: full page revalidation)

STATUS: Next.js team is improving this for next releases
WHEN TO RE-ENABLE: Next.js 16.1+ (expected improvement in experimental API)
```

### **Fase 5: ELIMINACIÓN COMPLETA** (Nov 4, 2025 - 14:01)
```
Commit: 3f68bf5
"refactor(map): simplify map implementation from clean base"

Cambios:
- 🗑️ ELIMINA /apps/web/lib/cache/ completamente
- 🗑️ ELIMINA /apps/web/lib/cache/properties-cache.ts
- 🗑️ ELIMINA /apps/web/lib/cache/price-distribution-cache.ts
- Revert a implementación sin cache

RAZÓN:
  "Codebase became too complex...
   Starting from clean, understandable base"

Duración desde disable hasta eliminación: 12 días
```

---

## 🔴 El Problema Documentado Oficialmente

### **De la Documentación de Next.js 16:**

**`use cache` no puede usar runtime APIs:**

> This means `use cache` cannot be used with runtime data like `cookies` or `headers`.
>
> **Note:** If you need to cache content that depends on cookies, headers, or search params, use `'use cache: private'` instead.

### **Especificación de Runtime APIs:**

Runtime APIs que hacen una ruta **dinámica** (no staticizable):
- `cookies()`
- `headers()`
- `searchParams`
- `params` (sin generateStaticParams)

**Tu app usa `cookies()` en:**
```typescript
// apps/web/lib/auth.ts
export async function getCurrentUser() {
  const session = await auth()  // ← Internamente usa cookies()
  return session?.user
}
```

**Conflicto:**
```typescript
// Esto NO FUNCIONA en Next.js 16.0.0:
export async function getProperties() {
  'use cache'  // ← Activa Cache Components

  const user = await getCurrentUser()  // ← Error!
  // Error: Can't use cookies() inside 'use cache'

  return db.query(...)
}
```

---

## 🎯 Por Qué Se Deshabilitó

### **Opción 1: No deshabilitar (mantener implementación)**
```
❌ Cache Components habilitado
  └─ currentUser().cookies() rompe
  └─ Todas las rutas autenticadas fallan
  └─ App broken
```

### **Opción 2: Deshabilitar (elegida)** ✅
```
✅ Cache Components deshabilitado
  └─ React.cache() funciona (sin cookies)
  └─ Deduplicación request-level disponible
  └─ App funciona, performance subóptima
```

### **Opción 3: Esperar Next.js 16.1+ (futura)**
```
⏳ Esperar a que Next.js arregle el bug
  └─ Cache Components se estabiliza
  └─ `use cache: private` se perfecciona
  └─ Compatible con cookies
  └─ Pero requiere refactoring importante
```

**La opción 2 fue la más rápida y pragmática.**

---

## 📊 Documentación Creada (Durante el Intento)

Aunque el código fue eliminado, la documentación fue preservada (~2,000 líneas):

| Archivo | Líneas | Status | Propósito |
|---------|--------|--------|-----------|
| `CACHE_COMPONENTS_GUIDE.md` | 495 | Referencia | Cómo usar `use cache` |
| `CACHE_STRATEGY.md` | 419 | Referencia | Estrategia general |
| `CACHE_IMPLEMENTATION_SUMMARY.md` | 365 | Referencia | Plan de implementación |
| `CACHE_IMPLEMENTATION_REVISED.md` | 280 | Referencia | Fallback con React.cache() |
| `CACHE_QUICK_START.md` | 100+ | Referencia | Quick start guide |

**Status:** Todos marcados como "documentación educativa, no código implementado"

---

## ✅ Qué Está Disponible HOY

### **1. React.cache() (Estable)**
```typescript
import { cache } from 'react'

export const getCachedProperties = cache(async (bounds) => {
  return propertyRepository.list({ bounds })
})

// Resultado:
// - Deduplicación en el mismo request
// - Compatible con cookies() / auth
// - No experimental
```

**Beneficios:**
- ✅ 1 request = máx 1 query a BD
- ✅ Request Memoization automático
- ✅ Compatible con autenticación
- ❌ Dura solo 1 request (~100ms)

### **2. ISR Basic (Estable)**
```typescript
// apps/web/app/(public)/page.tsx
export const revalidate = 300  // 5 minutos
```

**Implementado:**
- ✅ Homepage cachea cada 5 minutos
- ✅ Funciona

**No implementado:**
- ❌ Property detail pages sin ISR
- ❌ Mapa sin cache

### **3. revalidatePath() (Estable)**
```typescript
// apps/web/app/actions/properties.ts
await createPropertyAction(...)
revalidatePath("/mapa")  // ✅ Implementado
```

**Funcionalidad:**
- ✅ Invalida cache después de mutations
- ✅ Todas las Server Actions usan esto
- ✅ Funciona correctamente

---

## 🚀 Próximos Pasos Recomendados

### **Corto Plazo (Próximas semanas)**

**Opción A: Implementar React.cache() Básico**
- Tiempo: 1-2 horas
- Impacto: 36% más rápido en mapa
- Riesgo: Bajo
- Compatibilidad: 100% (con auth actual)

**Pasos:**
1. Crear `apps/web/lib/cache/properties-cache.ts`
2. Wrappear `propertyRepository.list()` con `cache()`
3. Usar en `/mapa/page.tsx`
4. Test y validar

### **Mediano Plazo (Próximos meses)**

**Opción B: Esperar Next.js 16.1+**
- Monitor releases de Next.js
- Cuando arreglen `use cache` + `cookies()`
- Migrar de `React.cache()` a `use cache: private`
- Agregar `cacheTag()` para invalidación más fina

### **Largo Plazo (Cuando esté listo)**

**Opción C: Refactorizar Auth Pattern**
- Separar autenticación de caché
- Usar `use cache: private` para contenido user-specific
- Implementar Cache Components completamente
- Fine-grained revalidation con tags

---

## 📚 Dónde Leer Más

### **Para entender el estado actual:**
- 📄 Este archivo (CACHE_STATUS.md)
- 📄 `CACHE_IMPLEMENTATION_REVISED.md` - explica el disable

### **Para entender Next.js 16 cache:**
- 📄 `NEXT_16_CACHE_DEEP_DIVE.md` - TODO lo que necesitas saber
- 📄 Documentación oficial: https://nextjs.org/docs/app/guides/caching

### **Para entender Cache Components:**
- 📄 `CACHE_COMPONENTS_GUIDE.md` - qué es y cómo funciona
- ⚠️ Nota: No implementado en InmoApp

### **Para estrategia general:**
- 📄 `CACHE_STRATEGY.md` - plan arquitectónico

---

## 🎯 TL;DR

| Pregunta | Respuesta |
|----------|-----------|
| **¿Tiene cache implementado?** | ❌ NO |
| **¿Cuándo se implementó?** | Oct 23, 2025 (por 5 minutos) |
| **¿Por qué no?** | Incompatible con `cookies()` (autenticación) |
| **¿Se puede implementar?** | ✅ SÍ, con `React.cache()` ahora |
| **¿Cuándo se eliminó?** | Nov 4, 2025 (simplificación codebase) |
| **¿Hay documentación?** | ✅ SÍ, ~2000 líneas de guías y referencias |
| **¿Está documentada la decisión?** | ✅ SÍ, en comentario de `next.config.ts` |

---

## 📝 Última Nota

Esta documentación refleja la **realidad actual** (Nov 2025) del proyecto InmoApp respecto a cache.

El intento de implementar Cache Components fue:
- ✅ Educativo (aprendimos mucho)
- ✅ Documentado (referencias para el futuro)
- ❌ No viable HOY (incompatibilidad con auth)
- ⏳ Viable en futuro (cuando Next.js lo arregle)

**Status:** Ready para re-implementar cuando sea apropiado.
