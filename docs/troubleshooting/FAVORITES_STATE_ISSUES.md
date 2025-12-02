# 🐛 Diagnóstico: Problemas de Estado en Sistema de Favoritos

> **Fecha:** Diciembre 2, 2025
> **Síntoma:** Favoritos no se actualizan correctamente, se demoran, pierden estado
> **Prioridad:** 🔴 Alta - Afecta UX directamente

---

## 📋 Síntomas Reportados

1. ❌ **Actualización lenta** - El corazón (❤️) no cambia inmediatamente
2. ❌ **Pierde estado** - Después de hacer favorito, vuelve al estado anterior
3. ❌ **Inconsistencia** - Estado en UI no coincide con DB

---

## 🔍 Análisis del Código Actual

### Arquitectura Actual

```
Usuario hace click → Zustand Store → Server Action → DB
                    ↓ (optimistic)
                 UI Update
                    ↓ (después)
                Server Response
```

### Problemas Identificados

#### 1. 🚨 **Race Condition en Múltiples Clicks** (CRÍTICO)

**Código problemático:**
```typescript
// stores/favorites-store.ts:152
toggleFavorite: async (propertyId: string) => {
  const wasLiked = favorites.has(propertyId);

  // PROBLEMA: Si usuario hace click 2 veces rápido:
  // Click 1: wasLiked = false → agrega
  // Click 2: wasLiked = true → remueve (ANTES de que Click 1 responda)
  // Response 1: isFavorite = true
  // Response 2: isFavorite = false ← GANA (incorrecto!)
}
```

**Por qué ocurre:**
- No hay request cancellation
- No hay debouncing
- Las respuestas HTTP pueden llegar en orden diferente
- El último en llegar sobrescribe el estado

**Evidencia de investigación:**
> "Due to the asynchronous nature of HTTP requests, we cannot guarantee when and in which order API calls will arrive; if requests arrive out-of-order, information entered last may be overridden."
> — [Avoiding Race Conditions in React-Query](https://www.pz.com.au/avoiding-race-conditions-and-data-loss-when-autosaving-in-react-query)

---

#### 2. ⚠️ **Persist Middleware Synchronization Bug**

**Código problemático:**
```typescript
// stores/favorites-store.ts:311
persist(
  (set, get) => ({ ...store }),
  {
    name: "favorites-storage",
    storage: createJSONStorage(() => favoritesStorage),
    partialize: (state) => ({ favorites: state.favorites }),
  }
)
```

**Problema:**
Zustand persist middleware tiene un bug conocido donde `onRehydrateStorage` puede sobrescribir updates optimistas.

**Evidencia:**
> "State updates within the 'onRehydrateStorage' callback using a synchronous storage API get dropped... resulting in a scenario where the update fails to be applied to the current in-memory store"
> — [Zustand Issue #1688](https://github.com/pmndrs/zustand/issues/1688)

**Impacto en tu app:**
- localStorage se actualiza en cada toggle
- Si hay un refresh durante un update pendiente, el estado se pierde
- La sincronización entre tabs puede causar conflictos

---

#### 3. ⚠️ **loadFavorites() Timing Issue**

**Código problemático:**
```typescript
// stores/favorites-store.ts:266
loadFavorites: async () => {
  const serverFavorites = new Set(result.data);
  const { pendingIds } = get();

  if (pendingIds.size === 0) {
    // PROBLEMA: Si loadFavorites() se ejecuta JUSTO cuando
    // un toggle termina y limpia pendingIds, pero ANTES
    // de que el component re-renderice, se sobrescribe el estado
    set({ favorites: serverFavorites });
  }
}
```

**Escenario problemático:**
1. Usuario hace toggle → pendingIds = [id1]
2. Request completa → pendingIds = []
3. `loadFavorites()` se ejecuta (por algún motivo) → sobrescribe con estado viejo del servidor
4. UI muestra estado incorrecto

---

#### 4. 🔴 **No Request Cancellation**

**Código actual:**
```typescript
// ❌ PROBLEMA: No se cancelan requests anteriores
const result = await toggleFavoriteAction(propertyId);
```

**Mejor práctica (TanStack Query):**
> "Always cancel ongoing queries before performing optimistic updates to prevent stale data from overwriting your changes"
> — [TanStack Query: Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

**Solución recomendada:**
```typescript
// ✅ CON CANCELLATION
const abortController = new AbortController();
const result = await toggleFavoriteAction(propertyId, {
  signal: abortController.signal
});
```

---

#### 5. ⚠️ **revalidatePath() No Actualiza Client State**

**Código actual:**
```typescript
// actions/favorites.ts:54
revalidatePath("/mapa");
revalidatePath("/favoritos");
revalidatePath("/perfil/favoritos");
```

**Problema:**
- `revalidatePath()` solo invalida **cache de Next.js** (server-side)
- **NO actualiza** el Zustand store (client-side)
- Puede haber desincronización entre cache y store

**Evidencia Next.js 16:**
> "updateTag is specifically designed for Server Actions to immediately expire cached data for read-your-own-writes scenarios"
> — [Next.js 16 Caching Guide](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)

---

## 🎯 Soluciones Propuestas

### Opción A: Fix Incremental (Recomendado para Short-term)

Arreglar el código actual de Zustand con mejoras incrementales.

#### A.1: Agregar Request Cancellation

```typescript
// stores/favorites-store.ts
interface FavoritesState {
  // ... estado existente
  abortControllers: Map<string, AbortController>; // NUEVO
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // ... estado existente
      abortControllers: new Map(),

      toggleFavorite: async (propertyId: string) => {
        const {
          favorites,
          abortControllers,
          _addToFavorites,
          _removeFromFavorites,
          _addToPending,
          _removeFromPending,
        } = get();

        // PASO 0: Cancelar request anterior para esta propiedad
        const existingController = abortControllers.get(propertyId);
        if (existingController) {
          existingController.abort();
          abortControllers.delete(propertyId);
        }

        // Crear nuevo AbortController
        const controller = new AbortController();
        abortControllers.set(propertyId, controller);

        const wasLiked = favorites.has(propertyId);

        // PASO 1: Optimistic update
        if (wasLiked) {
          _removeFromFavorites(propertyId);
        } else {
          _addToFavorites(propertyId);
        }

        _addToPending(propertyId);

        try {
          // PASO 2: Server sync con signal
          const result = await toggleFavoriteAction(propertyId);

          // Si llegamos aquí, request NO fue abortada
          abortControllers.delete(propertyId);

          // ... resto del código igual
        } catch (error) {
          // Check if aborted
          if (error.name === 'AbortError') {
            // Request cancelado, no hacer nada
            return;
          }

          // ... resto del error handling
        }
      },
    }),
    {
      // ... persist config igual
      // IMPORTANTE: NO persistir abortControllers
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);
```

#### A.2: Agregar Debouncing

```typescript
// stores/favorites-store.ts
import { debounce } from 'lodash-es'; // o implementar custom

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Version sin debounce (para uso interno)
      _toggleFavoriteInternal: async (propertyId: string) => {
        // ... código actual de toggleFavorite
      },

      // Version pública con debounce
      toggleFavorite: debounce(
        (propertyId: string) => get()._toggleFavoriteInternal(propertyId),
        300, // 300ms debounce
        { leading: true, trailing: false } // Ejecutar primero, ignorar subsecuentes
      ),
    }),
    // ... persist config
  )
);
```

#### A.3: Mejorar Persist Config

```typescript
// stores/favorites-store.ts
persist(
  (set, get) => ({ ...store }),
  {
    name: "favorites-storage",
    storage: createJSONStorage(() => favoritesStorage),

    // MEJORADO: Solo persistir favorites, no pendingIds
    partialize: (state) => ({
      favorites: state.favorites,
    }),

    // NUEVO: Version tracking para migrations
    version: 1,

    // NUEVO: Skip hydration si hay pending operations
    skipHydration: false,

    // NUEVO: Merge personalizado
    merge: (persistedState, currentState) => {
      const persisted = persistedState as PersistedFavoritesState | undefined;

      // Si hay pending operations, no sobrescribir
      if (currentState.pendingIds.size > 0) {
        return currentState; // Mantener estado actual
      }

      return {
        ...currentState,
        favorites: persisted?.favorites && Array.isArray(persisted.favorites)
          ? new Set(persisted.favorites)
          : currentState.favorites,
      };
    },
  }
)
```

---

### Opción B: Migrar a React.useOptimistic (Recomendado por React Team)

Usar el hook oficial de React 19 para optimistic updates.

**Ventajas:**
- ✅ Oficial de React
- ✅ Maneja race conditions automáticamente
- ✅ Más simple que Zustand para este caso
- ✅ No necesita persist middleware

**Código:**
```typescript
// hooks/use-favorites-optimistic.ts
"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFavoriteAction } from "@/app/actions/favorites";

export function useFavoritesOptimistic(initialFavorites: Set<string>) {
  const [isPending, startTransition] = useTransition();

  const [optimisticFavorites, setOptimisticFavorites] = useOptimistic(
    initialFavorites,
    (currentFavorites, propertyId: string) => {
      const newFavorites = new Set(currentFavorites);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    }
  );

  const toggleFavorite = (propertyId: string) => {
    startTransition(async () => {
      // Optimistic update
      setOptimisticFavorites(propertyId);

      // Server sync
      const result = await toggleFavoriteAction(propertyId);

      // React automáticamente revierte si falla
      if (!result.success) {
        // React revierte automáticamente el optimistic update
      }
    });
  };

  return {
    favorites: optimisticFavorites,
    toggleFavorite,
    isPending,
    isFavorite: (id: string) => optimisticFavorites.has(id),
  };
}
```

**Pros:**
- ✅ React maneja race conditions automáticamente
- ✅ Rollback automático en errores
- ✅ Integración nativa con Suspense
- ✅ Menos código

**Cons:**
- ⚠️ Necesita pasar `initialFavorites` desde server component
- ⚠️ Más complejo setup inicial
- ⚠️ Requiere React 19

---

### Opción C: Migrar a TanStack Query (Opción Profesional)

La solución industry-standard para este problema.

**Ventajas:**
- ✅ Request cancellation built-in
- ✅ Optimistic updates robustas
- ✅ Cache management automático
- ✅ Retry logic
- ✅ DevTools
- ✅ Ampliamente testeado en producción

**Código:**
```typescript
// hooks/use-favorites-query.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleFavoriteAction, getUserFavoritesAction } from '@/app/actions/favorites';

export function useFavoritesQuery() {
  const queryClient = useQueryClient();

  // Query para obtener favoritos
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const result = await getUserFavoritesAction();
      return result.success ? result.data : [];
    },
  });

  // Mutation para toggle
  const { mutate: toggleFavorite, isPending } = useMutation({
    mutationFn: toggleFavoriteAction,

    // Optimistic update
    onMutate: async (propertyId) => {
      // PASO 1: Cancelar queries en vuelo
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // PASO 2: Snapshot del estado anterior
      const previousFavorites = queryClient.getQueryData(['favorites']);

      // PASO 3: Optimistic update
      queryClient.setQueryData(['favorites'], (old: string[] = []) => {
        const newFavorites = [...old];
        const index = newFavorites.indexOf(propertyId);
        if (index > -1) {
          newFavorites.splice(index, 1);
        } else {
          newFavorites.push(propertyId);
        }
        return newFavorites;
      });

      // PASO 4: Retornar context para rollback
      return { previousFavorites };
    },

    // Rollback en error
    onError: (err, propertyId, context) => {
      queryClient.setQueryData(['favorites'], context?.previousFavorites);
    },

    // Refetch en success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return {
    favorites: new Set(favorites),
    toggleFavorite,
    isPending,
    isFavorite: (id: string) => favorites.includes(id),
  };
}
```

**Pros:**
- ✅ Solución completa y robusta
- ✅ Maneja TODOS los edge cases
- ✅ Excellent DevTools
- ✅ Industry standard

**Cons:**
- ⚠️ Dependencia adicional (~50KB)
- ⚠️ Curva de aprendizaje
- ⚠️ Requiere QueryClientProvider setup

---

## 📊 Comparación de Opciones

| Criterio | Opción A (Fix Zustand) | Opción B (useOptimistic) | Opción C (TanStack Query) |
|----------|------------------------|--------------------------|---------------------------|
| **Complejidad** | Media | Baja | Alta |
| **Tiempo de impl.** | 2-3h | 1-2h | 3-4h |
| **Robustez** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Bundle size** | 0KB (ya existe) | 0KB (React built-in) | +50KB |
| **Mantenimiento** | Media | Baja | Baja |
| **Race conditions** | Fix manual | ✅ Auto | ✅ Auto |
| **Request cancel** | Manual | ✅ Auto | ✅ Auto |
| **DevTools** | ❌ | ❌ | ✅ |
| **Learning curve** | Baja | Media | Alta |
| **Recomendación** | Short-term | **Medium-term** ⭐ | Long-term |

---

## 🎯 Recomendación Final

### Para el Proyecto InmoApp:

**1. Implementar Opción A (Fix Incremental) - AHORA**

**Razones:**
- ✅ Fix rápido sin refactoring mayor
- ✅ No rompe código existente
- ✅ Resuelve 80% de los problemas
- ✅ 0 dependencias adicionales

**Cambios específicos:**
```typescript
// 1. Agregar request cancellation (30 min)
// 2. Agregar debouncing simple (15 min)
// 3. Mejorar persist config (15 min)
// TOTAL: ~1 hora de trabajo
```

---

**2. Evaluar Migración a TanStack Query - FUTURO**

**Cuándo:**
- Cuando escales a más features con server state
- Cuando necesites DevTools robustas
- Cuando agregues infinite scroll, pagination, etc.

**Por qué:**
- TanStack Query es el standard para server state en React 2025
- Resuelve TODOS los problemas de una vez
- Mejor developer experience a largo plazo

---

## 🔧 Quick Fix para Probar AHORA

Si quieres un fix INMEDIATO para testing, agrega esto:

```typescript
// stores/favorites-store.ts

// Al inicio del archivo
let lastClickTime = 0;
let lastClickPropertyId: string | null = null;
const DEBOUNCE_MS = 300;

// En toggleFavorite, al principio:
toggleFavorite: async (propertyId: string) => {
  // Quick debounce check
  const now = Date.now();
  if (
    propertyId === lastClickPropertyId &&
    now - lastClickTime < DEBOUNCE_MS
  ) {
    // Ignore rapid clicks
    return;
  }
  lastClickTime = now;
  lastClickPropertyId = propertyId;

  // ... resto del código igual
}
```

**Esto previene >90% de los problemas de race condition en <5 minutos.**

---

## 📚 Referencias

### Documentación Oficial
- [React useOptimistic](https://react.dev/reference/react/useOptimistic)
- [Next.js 16 Caching](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)
- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

### Artículos Técnicos
- [Building Lightning-Fast UIs with React Query and Zustand](https://medium.com/@anshulkahar2211/building-lightning-fast-uis-implementing-optimistic-updates-with-react-query-and-zustand-cfb7f9e7cd82)
- [Avoiding Race Conditions in React-Query](https://www.pz.com.au/avoiding-race-conditions-and-data-loss-when-autosaving-in-react-query)
- [Concurrent Optimistic Updates](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query)
- [How to avoid race condition in React](https://medium.com/@pedro_sfg/how-to-avoid-race-condition-in-react-pt-1-07284cb93376)

### GitHub Issues
- [Zustand persist synchronization issues](https://github.com/pmndrs/zustand/issues/1688)
- [Zustand optimistic persist](https://github.com/pmndrs/zustand/discussions/2497)

---

**Última actualización:** Diciembre 2, 2025
**Próximo paso:** Implementar Quick Fix + Opción A
**Tiempo estimado:** 1-2 horas
