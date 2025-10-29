# Infinite Loop - Visual Guide

**Una guía visual para entender exactamente qué pasó**

---

## El Problema Visual

### Escena 1: Usuario Arrastra el Mapa

```
┌──────────────────────────────────────────────────────────┐
│                 USUARIO MUEVE MOUSE                      │
│                      (Drag Map)                           │
└──────────────────────────────────────────────────────────┘
                          ⬇️
```

### Escena 2: Estado Cambia

```
┌──────────────────────────────────────────────────────────┐
│            viewState: { lat: -2.9, lng: -79.0 }          │
│                                                           │
│  Después del debounce (500ms):                           │
│            debouncedViewport: { lat: -2.9, lng: -79.0 }  │
└──────────────────────────────────────────────────────────┘
                          ⬇️
```

### Escena 3: El useEffect Se Dispara

```
┌──────────────────────────────────────────────────────────┐
│ useEffect(() => {                                        │
│   const newUrl = buildBoundsUrl(debouncedBounds)        │
│   // newUrl = "/mapa?ne_lat=-2.85&ne_lng=-78.95..."     │
│                                                          │
│   router.replace(newUrl) ← AQUÍ ES EL PROBLEMA         │
│ }, [debouncedBounds, router, mounted, searchParams])   │
└──────────────────────────────────────────────────────────┘
                          ⬇️
```

---

## El Ciclo Infinito (Diagrama Detallado)

```
START: Usuario arrastra mapa a posición X
  ⬇️
┌─────────────────────────────────────────────────────┐
│ 1️⃣  viewState actualizado                          │
│    viewState = { lat: X, lng: Y }                   │
└─────────────────────────────────────────────────────┘
  ⬇️ (espera 500ms)
┌─────────────────────────────────────────────────────┐
│ 2️⃣  debouncedViewport actualizado                  │
│    Ahora el effect puede correr                      │
└─────────────────────────────────────────────────────┘
  ⬇️
┌─────────────────────────────────────────────────────┐
│ 3️⃣  useEffect detecta: "debouncedBounds cambió"   │
│    ✅ debouncedBounds ≠ antes                       │
│    Effect corre                                      │
└─────────────────────────────────────────────────────┘
  ⬇️
┌─────────────────────────────────────────────────────┐
│ 4️⃣  router.replace(newUrl) se ejecuta              │
│    URL en el navegador cambia:                       │
│    /mapa?ne_lat=-2.85&ne_lng=-78.95                 │
└─────────────────────────────────────────────────────┘
  ⬇️ ← AQUÍ EMPIEZA EL LOOP
┌─────────────────────────────────────────────────────┐
│ 5️⃣  URL cambió → useSearchParams() actualizado     │
│    searchParams ahora es un OBJETO NUEVO            │
│    (aunque los parámetros sean iguales)             │
│                                                      │
│    searchParams1 = { ne_lat: -2.85, ... }          │
│    searchParams2 = { ne_lat: -2.85, ... }          │
│    searchParams1 === searchParams2 → FALSE ❌      │
└─────────────────────────────────────────────────────┘
  ⬇️
┌─────────────────────────────────────────────────────┐
│ 6️⃣  React compara dependencias:                     │
│                                                      │
│    ✅ debouncedBounds: mismo objeto                │
│    ✅ router: misma función                         │
│    ✅ mounted: mismo valor                          │
│    ❌ searchParams: DIFERENTE objeto               │
│                                                      │
│    "Algo cambió en las dependencias"               │
│    → Effect debe correr de nuevo                    │
└─────────────────────────────────────────────────────┘
  ⬇️
┌─────────────────────────────────────────────────────┐
│ 7️⃣  Vuelve a PASO 3                                 │
│    router.replace() se ejecuta OTRA VEZ            │
│    URL no cambia (es igual)                          │
│    Pero searchParams SIGUE siendo nuevo             │
│    → Effect corre de nuevo                          │
└─────────────────────────────────────────────────────┘
  ⬇️ ↩️  (INFINITO - Vuelve a paso 3)
```

---

## Comparación: Antes vs Después (Visual)

### ANTES ❌ (Con Loop Infinito)

```
┌─────────────────────────────────────────────────────────────┐
│  Timeline: Usuario arrastra mapa a nueva posición           │
└─────────────────────────────────────────────────────────────┘

Time    Event                               Queries
────────────────────────────────────────────────────
0ms     User drags map
500ms   Debounce completes → Effect runs    Query 1 ✓
501ms   router.replace() → URL changes
502ms   searchParams updated → Effect runs  Query 2 ✓
503ms   router.replace() → URL changes
504ms   searchParams updated → Effect runs  Query 3 ✓
505ms   router.replace() → URL changes
506ms   searchParams updated → Effect runs  Query 4 ✓
...
∞       Loop continues infinitely           Query ∞ ❌

CPU:    100% (todas queries simultáneamente)
Memory: Growing
User:   🐢 Lag, freezing
DB:     💥 Crash
```

---

### DESPUÉS ✅ (Sin Loop)

```
┌─────────────────────────────────────────────────────────────┐
│  Timeline: Usuario arrastra mapa a nueva posición           │
└─────────────────────────────────────────────────────────────┘

Time    Event                               Queries
────────────────────────────────────────────────────
0ms     User drags map
500ms   Debounce completes → Effect runs    Query 1 ✓
501ms   Compara: lastUrlRef vs newUrl
        - lastUrlRef = ""
        - newUrl = "/mapa?ne_lat=..."
        - Diferentes → router.replace() ✓
502ms   URL cambia
503ms   searchParams actualizado ← Ignored
        (NO en dependencias anymore)
504ms   Effect NO corre (debouncedBounds igual) ✅
...
∞       Done! No más queries                Total: 1 ✓

CPU:    <5%
Memory: Stable
User:   ⚡ Fast, responsive
DB:     ✅ Normal load
```

---

## Las Tres Opciones de Solución (Visual)

### Opción 1: useRef (La que usamos)

```
┌─────────────────────────────────────────────────────────────┐
│  Rastrear el último valor sin ser dependencia reactiva      │
└─────────────────────────────────────────────────────────────┘

const lastUrlRef = useRef("");

useEffect(() => {
  const newUrl = buildUrl();

  // Comparar mutable ref (no causa re-renders)
  if (lastUrlRef.current !== newUrl) {
    lastUrlRef.current = newUrl;
    doExpensiveOperation();
  }
}, [minimales deps]);

VENTAJAS:
✅ Simple y directo
✅ No agrega dependencias
✅ Funciona bien para comparaciones

DESVENTAJAS:
❌ Necesita comparación manual
❌ Puede ser confuso si no se entiende useRef
```

---

### Opción 2: Separar en Dos Effects

```
┌─────────────────────────────────────────────────────────────┐
│  Responsabilidad clara: Lectura y escritura separadas       │
└─────────────────────────────────────────────────────────────┘

// Effect 1: Escribir cambios INTERNOS (componente → URL)
useEffect(() => {
  const newUrl = buildUrl();
  router.replace(newUrl);
}, [localState]);

// Effect 2: Leer cambios EXTERNOS (URL → componente)
useEffect(() => {
  const params = parseUrl(searchParams);
  setLocalState(params);
}, [searchParams]);

VENTAJAS:
✅ Responsabilidades claras
✅ Fácil de debuggear
✅ Pattern estándar de React

DESVENTAJAS:
❌ Más código
❌ Potencial lag entre URL y state
❌ Dos renders en lugar de uno
```

---

### Opción 3: useCallback + Transitions

```
┌─────────────────────────────────────────────────────────────┐
│  Batching automático para operaciones complejas             │
└─────────────────────────────────────────────────────────────┘

const [isPending, startTransition] = useTransition();

const syncUrl = useCallback((url: string) => {
  startTransition(() => {
    // Las actualizaciones aquí no disparan nuevos effects
    // hasta que termine la transición
    const params = parseUrl(url);
    setViewport(params);
  });
}, []);

useEffect(() => {
  syncUrl(newUrl);
}, [newUrl]);

VENTAJAS:
✅ Batching automático
✅ Mejor para operaciones complejas
✅ Optimal performance

DESVENTAJAS:
❌ Más complejo
❌ Requiere entender transitions
❌ Overkill para casos simples
```

---

## El Fix en Acción

### Paso por Paso

```
ANTES:
┌──────────────────────────────────────────────────────┐
│ useEffect(() => {                                    │
│   const newUrl = buildBoundsUrl(debouncedBounds)    │
│   router.replace(newUrl)                             │
│ }, [debouncedBounds, router, mounted, searchParams])│
└──────────────────────────────────────────────────────┘

Problema: searchParams cambia → effect corre de nuevo


DESPUÉS:
┌──────────────────────────────────────────────────────┐
│ const lastUrlRef = useRef<string>("");               │
│                                                       │
│ useEffect(() => {                                    │
│   if (!mounted) return;                              │
│                                                       │
│   const newUrl = buildBoundsUrl(debouncedBounds);   │
│                                                       │
│   // Guard: Solo si realmente cambió                │
│   if (lastUrlRef.current !== newUrl) {              │
│     lastUrlRef.current = newUrl;                     │
│     router.replace(newUrl, { scroll: false });       │
│   }                                                   │
│ }, [debouncedBounds, router, mounted]);             │
└──────────────────────────────────────────────────────┘

Solución: Sin searchParams, sin loop
```

---

## Comparación de Patrones

```
┌─────────────────────────────────────────────────────────────┐
│               El Array de Dependencias Explicado             │
└─────────────────────────────────────────────────────────────┘

❌ MALO:
useEffect(() => {
  // Haces: data = fetchData()
  setData(data);
}, [data])
// Problem: Cambias data en el effect, está en dependencias
//          → efecto corre de nuevo → cambias data → infinito


✅ BIEN:
useEffect(() => {
  const newData = fetchData();
  setData(newData);
}, [])
// OK: Effect corre 1 vez (no cambia sus propias dependencias)


✅ MEJOR:
const lastRef = useRef(null);

useEffect(() => {
  const newData = fetchData();

  if (lastRef.current !== newData) {
    lastRef.current = newData;
    setData(newData);
  }
}, [])
// Best: Incluso si fetchData cambia, manejo explícito
```

---

## Debugging Visual

### Cómo Detectar el Loop

```
OPCIÓN 1: Console Logging
┌───────────────────────────────────┐
│ useEffect(() => {                 │
│   console.count('🔄 EFFECT')      │
│ }, [deps])                        │
│                                   │
│ RESULTADO EN CONSOLE:             │
│ 🔄 EFFECT: 1                      │
│ 🔄 EFFECT: 2                      │
│ 🔄 EFFECT: 3                      │
│ ...                               │
│ 🔄 EFFECT: 523                    │ ← LOOP DETECTADO
└───────────────────────────────────┘


OPCIÓN 2: Performance Monitor
┌───────────────────────────────────┐
│ Chrome DevTools > Performance      │
│ Record > Action > Stop             │
│                                   │
│ GRÁFICO:                          │
│ CPU: ████████████████░░░░░░      │
│ Renders: ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌...   │
│         (cada 16ms = 60fps full)  │
│         ^ LOOP INFINITO VISIBLE   │
└───────────────────────────────────┘


OPCIÓN 3: React DevTools Profiler
┌───────────────────────────────────┐
│ DevTools > Profiler > Record      │
│ Action > Stop                     │
│                                   │
│ Visualiza:                        │
│ Component Tree:                   │
│   MapComponent                    │
│     ├─ Render 1  [0.5ms]         │
│     ├─ Render 2  [0.3ms]         │
│     ├─ Render 3  [0.4ms]         │
│     └─ ... (100+ renders)        │
│        ^ LOOP INFINITO VISIBLE   │
└───────────────────────────────────┘
```

---

## El Concepto Clave (Visualizado)

```
┌─────────────────────────────────────────────────────────────┐
│           ¿QUÉ SON REALMENTE LAS DEPENDENCIAS?             │
└─────────────────────────────────────────────────────────────┘

CONCEPTO EQUIVOCADO:
"Las dependencias son las variables que USO"

useEffect(() => {
  console.log(data); // ← Uso data
}, [data]) // ← Agrego data


CONCEPTO CORRECTO:
"Las dependencias son CUÁNDO quiero que corra"

useEffect(() => {
  console.log(data);
}, [data]) // ← "Corre cuando data REALMENTE CAMBIA"


COROLARIO IMPORTANTE:
Si el effect MODIFICA una dependencia
→ Tienes un ciclo:
  A cambió → effect corre → modifica A → A cambió → loop

SOLUCIÓN:
useRef<T> si necesitas rastrear cambios
O: Separar en múltiples effects
O: Remover del array si no es necesario
```

---

## Resumen en Una Página

```
PROBLEMA:
┌──────────────────────────────────────────┐
│ useEffect runs infinitely because:       │
│                                          │
│ 1. router.replace() changes URL          │
│ 2. URL change → searchParams new object  │
│ 3. searchParams in dependency array      │
│ 4. Effect runs again → back to 1         │
│ 5. INFINITE LOOP                         │
└──────────────────────────────────────────┘


SOLUCIÓN:
┌──────────────────────────────────────────┐
│ 1. Track last URL with useRef            │
│ 2. Only call router.replace() if changed │
│ 3. Remove searchParams from dependencies │
│ 4. Effect runs 1 time per unique bounds  │
│ 5. FIXED ✅                              │
└──────────────────────────────────────────┘


LA LECCIÓN:
┌──────────────────────────────────────────┐
│ Dependency array = "when should this run"│
│ NOT = "what variables do I use"          │
│                                          │
│ If effect changes a dependency           │
│ → You have a circular dependency         │
│ → You have an infinite loop              │
│                                          │
│ Fix: useRef, separate effects, or        │
│      remove from array                   │
└──────────────────────────────────────────┘
```

---

**Status:** ✅ Visual guide complete
**Best for:** Visual learners / presentations
**Última actualización:** Oct 23, 2024
