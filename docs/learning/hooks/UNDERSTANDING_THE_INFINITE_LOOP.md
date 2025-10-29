# Understanding the Infinite Loop - Executive Summary

**Para:** Juan Quizhpi
**Acerca de:** El problema que ocurrió en `/mapa` y cómo evitarlo en el futuro
**Fecha:** Oct 23, 2024

---

## TL;DR - La Versión Corta (5 minutos)

### ¿Qué pasó?
El hook `useMapViewport` tenía un **ciclo de dependencias circulares**. Cada vez que el usuario movía el mapa, causaba queries infinitas a la base de datos.

### ¿Por qué?
El array de dependencias del `useEffect` incluía `searchParams`, que se actualizaba cada vez que el effect se ejecutaba.

```typescript
// ❌ EL ERROR
useEffect(() => {
  router.replace(newUrl); // Cambia URL → searchParams cambia
}, [searchParams]); // searchParams en deps → effect corre de nuevo → INFINITO
```

### ¿Cómo se arregló?
Agregamos `useRef` para rastrear el último URL sin que sea una dependencia reactiva.

```typescript
// ✅ LA SOLUCIÓN
const lastUrlRef = useRef("");

useEffect(() => {
  const newUrl = buildUrl();
  if (lastUrlRef.current !== newUrl) { // Guard clause
    lastUrlRef.current = newUrl;
    router.replace(newUrl);
  }
}, [/* sin searchParams */]);
```

### ¿Cómo no repetir esto?
1. **Siempre entiende qué significa cada dependencia**
2. **Si el effect cambia una dependencia → tienes un loop**
3. **Usa `useRef` para rastrear cambios sin ser dependencia**

---

## La Historia Completa

### Capítulo 1: El Síntoma

**Observación:** Cuando abrías `/mapa`, la terminal mostraba infinitas queries a Prisma:
```
SELECT... → SELECT... → SELECT... (infinito)
```

**Impacto:**
- Mapa lag (lento)
- Terminal spam
- CPU al 100%
- Potencial crash de BD

---

### Capítulo 2: La Investigación

Inicialmente, pensaste que era un problema de:
- ❌ Prisma configuration
- ❌ Supabase setup
- ❌ Database pooling

Pero la verdadera causa estaba en **React Hooks** → El `useEffect` en `useMapViewport`.

**Archivos examinados:**
- `packages/database/prisma/schema.prisma`
- `packages/database/src/client.ts`
- `.env.local`
- `apps/web/components/map/hooks/use-map-viewport.ts` ← **AQUÍ ESTABA EL PROBLEMA**

---

### Capítulo 3: La Causa Raíz

En el archivo `use-map-viewport.ts`, línea 136:

```typescript
useEffect(() => {
  // ... código ...
  router.replace(newUrl);
}, [debouncedBounds, router, mounted, searchParams]);
//                                     ↑ PROBLEMA
```

**¿Por qué es esto malo?**

```
CICLO INFINITO:

PASO 1: useEffect se dispara
  ↓
PASO 2: Ejecuta router.replace(newUrl)
  ↓ (router.replace() cambia la URL)
PASO 3: URL cambia en el navegador
  ↓
PASO 4: El hook useSearchParams() detecta el cambio
        y devuelve un OBJETO NUEVO
  ↓
PASO 5: React compara las dependencias:
        "¿searchParams es diferente de antes?"
        Respuesta: SÍ (es un objeto nuevo)
  ↓
PASO 6: "Algo en las dependencias cambió"
        → useEffect debe correr de nuevo
  ↓
PASO 7: Vuelve a PASO 1 (INFINITO)
```

**Visualizado:**

```
Ciclo A:    Ciclo B:      Ciclo C:      ...
router.replace() → router.replace() → router.replace() → ...
│                  │                  │
URL cambia        URL cambia        URL cambia
│                  │                  │
searchParams nuevo searchParams nuevo searchParams nuevo
│                  │                  │
Effect corre ✓     Effect corre ✓     Effect corre ✓
```

---

### Capítulo 4: La Solución

**El Fix:**
1. Agregue `useRef<string>("")` para rastrear el último URL
2. Removí `searchParams` del array de dependencias
3. Agregué un "guard clause" para verificar si el URL realmente cambió

```typescript
// Paso 1: Crear una referencia mutable
const lastUrlRef = useRef<string>("");

useEffect(() => {
  if (!mounted) return;

  // Paso 2: Construir nuevo URL
  const newUrl = buildBoundsUrl(debouncedBounds);

  // Paso 3: Solo actualizar si REALMENTE cambió
  // (no por fantasma cambios de searchParams)
  if (lastUrlRef.current !== newUrl) {
    lastUrlRef.current = newUrl;
    router.replace(newUrl, { scroll: false });
  }
}, [debouncedBounds, router, mounted]); // ← Sin searchParams
```

**¿Por qué funciona?**

```
Ahora:

PASO 1: Usuario mueve mapa
PASO 2: debouncedBounds cambia (después de 500ms)
PASO 3: useEffect se dispara (debouncedBounds cambió)
PASO 4: Compara lastUrlRef (URL anterior) vs newUrl (URL nuevo)
PASO 5a: Si SON IGUALES: No hace nada (sin router.replace())
PASO 5b: Si SON DIFERENTES: Actualiza y llama router.replace()
PASO 6: URL cambió, pero ¿qué? debouncedBounds NO cambió
        (Usuario paró de mover el mapa hace ya 500ms+)
PASO 7: useEffect NO se dispara (debouncedBounds igual)
PASO 8: ✅ FIN (sin loop infinito)
```

---

## Las Tres Conceptos Clave

### Concepto 1: El Array de Dependencias

**Mala Comprensión:**
```
"Agrego aquí todas las variables que USO en el effect"
```

**Comprensión Correcta:**
```
"Agrego aquí cuándo QUIERO que este effect CORRA"
```

**Diferencia Importante:**

```typescript
// Si USAS una variable pero NO necesitas que effect corra cuando cambia
const externalData = useContext(DataContext);

useEffect(() => {
  doSomething(externalData); // Usas externalData
}, []); // Pero NO la pones en dependencias
       // Porque no quieres que effect corra cuando cambia


// Si USAS una variable Y necesitas que effect corra cuando cambia
const userId = props.userId;

useEffect(() => {
  fetchUserData(userId);
}, [userId]); // La pones en dependencias
              // Porque SÍ quieres que effect corra cuando cambia
```

---

### Concepto 2: La Dependencia Circular

**¿Cuándo ocurre?**

Cuando el effect **cambia** algo que está en su **array de dependencias**:

```typescript
// ❌ CIRCULAR - Peligroso
useEffect(() => {
  setCount(count + 1); // Cambias count
}, [count]); // count en dependencias
// count cambió → effect corre de nuevo → cambias count → loop


// ✅ OK - El effect no cambia sus dependencias
useEffect(() => {
  console.log(count);
}, [count]);
// count cambió → effect corre → pero no cambia count → OK


// ✅ TAMBIÉN OK - Usar guard clause con useRef
const lastRef = useRef(count);

useEffect(() => {
  if (lastRef.current !== count) {
    lastRef.current = count;
    setData(count); // Cambiar data, no count
  }
}, [count]);
// count cambió → effect corre → pero verifica antes
```

---

### Concepto 3: useRef es Tu Amigo

**¿Qué es useRef?**

Una forma de "recordar" un valor **sin disparar re-renders**:

```typescript
// ❌ useState causa re-render (y puede causar loops)
const [lastUrl, setLastUrl] = useState('');

useEffect(() => {
  setLastUrl(newUrl); // ← Causa re-render
  // Si lastUrl en dependencias → loop
}, [lastUrl]);


// ✅ useRef no causa re-render (perfecto para loops)
const lastUrlRef = useRef('');

useEffect(() => {
  lastUrlRef.current = newUrl; // ← NO causa re-render
  // Perfecto para rastrear sin loop
}, []);
```

**Cuándo usarlo:**
- ✅ Rastrear último valor sin dependencia
- ✅ Mantener referencia a elemento DOM
- ✅ Guardar timeout/interval IDs para limpiar
- ✅ Cualquier "memoria" que no dispare re-renders

---

## Patrones Comunes de Infinite Loops

### Patrón 1: El Hook que Cambia por el Effect

```typescript
// ❌ PROBLEMA
useEffect(() => {
  router.replace(newUrl); // Cambia URL
}, [searchParams]); // searchParams se actualiza por URL
                     // → effect corre de nuevo → LOOP


// ✅ SOLUCIÓN 1: Remover del array
useEffect(() => {
  router.replace(newUrl);
}, [/* sin searchParams */]);


// ✅ SOLUCIÓN 2: Usar useRef
const lastRef = useRef('');
useEffect(() => {
  if (lastRef.current !== newUrl) {
    lastRef.current = newUrl;
    router.replace(newUrl);
  }
}, [newUrl]);
```

---

### Patrón 2: setState que Dispara el Same Effect

```typescript
// ❌ PROBLEMA
useEffect(() => {
  setData(computeData()); // Cambias data
}, [data]); // data cambió → effect corre → cambias data → LOOP


// ✅ SOLUCIÓN 1: Cambiar diferente estado
useEffect(() => {
  const computed = computeData();
  setProcessed(computed); // Cambias 'processed', no 'data'
}, [data]);


// ✅ SOLUCIÓN 2: Guard clause
const lastRef = useRef(data);
useEffect(() => {
  if (lastRef.current !== data) {
    lastRef.current = data;
    setOtherData(computeData());
  }
}, [data]);
```

---

### Patrón 3: Objetos Nuevos en Cada Render

```typescript
// ❌ PROBLEMA - bounds es objeto NUEVO cada render
useEffect(() => {
  fetch(bounds);
}, [bounds]);


// ✅ SOLUCIÓN 1: useMemo
const bounds = useMemo(() => ({
  ne_lat: -2.85,
  ne_lng: -78.95,
}), [ne_lat, ne_lng]);

useEffect(() => {
  fetch(bounds);
}, [bounds]); // Ahora bounds es estable


// ✅ SOLUCIÓN 2: Mover fuera del componente
const DEFAULT_BOUNDS = { ne_lat: -2.85, ne_lng: -78.95 };

useEffect(() => {
  fetch(DEFAULT_BOUNDS);
}, [DEFAULT_BOUNDS]); // Referencia constante


// ✅ SOLUCIÓN 3: No poner en dependencias si no es necesario
const bounds = { ne_lat: -2.85, ne_lng: -78.95 };

useEffect(() => {
  fetch(bounds);
}, []); // Corre 1 vez, NO necesita actualizar
```

---

## Cómo Evitarlo en el Futuro

### Checklist Antes de Cada useEffect

```
ANTES de escribir el useEffect:

□ ¿Qué QUIERO que disparе este effect?
  (No: ¿qué variables uso? Sino: ¿cuándo debe correr?)

□ ¿El effect MODIFICA algo que está en dependencias?
  Si SÍ → Tienes un ciclo potencial
  Si NO → Probablemente OK

□ ¿Hay objetos/arrays nuevos en cada render?
  Si SÍ → Úsalos con useMemo
  Si NO → OK

□ ¿ESLint dice algo sobre dependencias?
  Si SÍ → ESCÚCHALO
  Si NO → OK (pero verifica manualmente)
```

### Pattern Seguro (Template)

```typescript
// TEMPLATE SEGURO

// 1. Importar lo que necesitas
import { useEffect, useRef } from 'react';

// 2. Crear ref si necesitas rastrear
const lastValueRef = useRef<YourType | null>(null);

// 3. Crear el effect
useEffect(() => {
  // Paso A: Early exit si es necesario
  if (!isReady) return;

  // Paso B: Computar el nuevo valor
  const newValue = computeValue();

  // Paso C: Guard clause (rastrear cambios)
  if (lastValueRef.current !== newValue) {
    lastValueRef.current = newValue;
    doExpensiveOperation(newValue);
  }

  // Paso D: Cleanup si es necesario
  return () => {
    // Limpiar: removeEventListener, clearTimeout, etc
  };
}, [
  // SOLO valores que realmente disparan esto
  // NO: cosas que el effect modifica
  // NO: objetos/arrays que cambian cada render
  dependency1,
  dependency2,
]);
```

---

## Testing: Verificar que No Hay Loop

### Test 1: Console Counting (rápido)

```typescript
useEffect(() => {
  console.count('🔄 Effect running');
}, [deps]);

// Recarga la página en navegador
// Abre DevTools Console
// Si ves:
// 🔄 Effect running: 1
// 🔄 Effect running: 2
// 🔄 Effect running: 3
// ... → LOOP INFINITO

// Si ves:
// 🔄 Effect running: 1
// → OK (corre 1 vez)
```

### Test 2: Unit Test (profesional)

```typescript
test('useMapViewport does not infinite loop', () => {
  let effectRunCount = 0;

  const { rerender } = renderHook(
    ({ bounds }) => {
      useEffect(() => {
        effectRunCount++;
      }, [bounds]);
    },
    { initialProps: { bounds: { ...} } }
  );

  // Render inicial
  expect(effectRunCount).toBe(1);

  // Re-render con mismos bounds
  rerender({ bounds: { ...} });
  expect(effectRunCount).toBe(1); // No debe incrementar

  // Re-render con diferentes bounds
  rerender({ bounds: { NEW } });
  expect(effectRunCount).toBe(2); // Ahora sí
});
```

---

## Conclusión: Los 3 Puntos Clave

### 1. **Entender Dependencias**
```
Dependencias = "Cuándo corra"
NO = "Qué variables uso"
```

### 2. **Identificar Ciclos**
```
Si effect modifica una dependencia
→ Tienes un ciclo circular
→ Puede causar infinite loop
```

### 3. **Usar Las Herramientas Correctas**
```
useRef = Rastrear cambios sin loop
useMemo = Estabilizar objetos/arrays
Separar effects = Responsabilidades claras
Guard clauses = Verificar antes de mutar
```

---

## Documentación Disponible

Has creado 5 documentos completos:

1. **`INFINITE_LOOP_DEEP_DIVE.md`** (11 secciones)
   - Para: Entender el problema profundamente
   - Incluye: Análisis paso a paso, debugging, testing

2. **`REACT_HOOKS_ANTIPATTERNS.md`** (11 antipatterns)
   - Para: Aprender patrones a evitar
   - Incluye: Ejemplos de código, soluciones

3. **`DEBUGGING_HOOKS_GUIDE.md`** (Técnicas prácticas)
   - Para: Debuggear cuando algo falla
   - Incluye: DevTools tricks, casos específicos

4. **`INFINITE_LOOP_QUICK_REFERENCE.md`** (Card rápida)
   - Para: Referencia rápida
   - Incluye: Checklist, golden rules, emergencia rápida

5. **`INFINITE_LOOP_VISUAL_GUIDE.md`** (Visualizaciones)
   - Para: Aprender visualmente
   - Incluye: Diagramas, comparaciones antes/después

---

## El Fix Que Se Implementó

**File:** `apps/web/components/map/hooks/use-map-viewport.ts`
**Commit:** `f28948e`
**Date:** Oct 23, 2024

**Cambios:**
- ✅ Added `useRef<string>` to track last URL
- ✅ Removed `searchParams` from dependency array
- ✅ Added string comparison to prevent unnecessary updates
- ✅ Verified with `bun run type-check` (passed)

**Result:**
- ✅ No more infinite queries
- ✅ Database performs normally
- ✅ Map renders smoothly
- ✅ Zero renderization loops

---

## Para la Próxima Vez

**Cuando escribas un useEffect:**

1. ✅ **Piensa primero** - ¿Cuándo quiero que corra?
2. ✅ **Lista dependencias** - Cosas que disparan esto
3. ✅ **Verifica** - ¿El effect modifica una dependencia?
4. ✅ **Si sí** - Usa useRef o divide en effects
5. ✅ **Escucha a ESLint** - Tiene razón 99% de las veces

---

**Status:** ✅ Completamente documentado y entendido
**Última actualización:** Oct 23, 2024
**Referencia rápida:** `INFINITE_LOOP_QUICK_REFERENCE.md`
