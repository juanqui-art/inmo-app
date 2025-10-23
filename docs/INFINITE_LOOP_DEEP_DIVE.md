# Infinite Loop en useEffect - Análisis Profundo

**Escrito:** Oct 23, 2024
**Tipo:** Technical Deep Dive - React Hooks Anti-Patterns
**Impacto:** Critical - Afecta rendimiento y experiencia del usuario

---

## 1. El Problema: ¿Qué Pasó Exactamente?

### Síntomas Observados
```
Terminal: "SELECT...", "SELECT...", "SELECT..." (infinito)
Mapa: Se carga pero con lag
DB: Queries nunca paran
```

### Causa Raíz
Un **ciclo de dependencias circulares** en `useEffect` causado por incluir `searchParams` en el array de dependencias.

---

## 2. Diagrama del Ciclo Infinito

```
┌─────────────────────────────────────────────────────────────┐
│                  CICLO INFINITO                              │
└─────────────────────────────────────────────────────────────┘

PASO 1: useEffect se dispara
┌─────────────────────────────────────────────────────────────┐
│ useEffect(() => {                                            │
│   const newUrl = buildBoundsUrl(debouncedBounds)            │
│   router.replace(newUrl) // ← CAMBIA LA URL                 │
│ }, [debouncedBounds, router, mounted, searchParams])        │
└─────────────────────────────────────────────────────────────┘
              ⬇️
PASO 2: URL cambió → searchParams hook se actualiza
┌─────────────────────────────────────────────────────────────┐
│ const searchParams = useSearchParams()                       │
│ // React detecta: "La URL cambió, searchParams es nuevo"    │
└─────────────────────────────────────────────────────────────┘
              ⬇️
PASO 3: searchParams en dependencias → useEffect se dispara
┌─────────────────────────────────────────────────────────────┐
│ "searchParams cambió? Sí → dependencia satisfecha"          │
│ "¡Corre el effect de nuevo!"                                │
└─────────────────────────────────────────────────────────────┘
              ⬇️
PASO 4: router.replace() se ejecuta OTRA VEZ
┌─────────────────────────────────────────────────────────────┐
│ // Hace lo mismo: cambia la URL                             │
│ router.replace(newUrl)                                       │
└─────────────────────────────────────────────────────────────┘
              ⬇️
              ⬅️ VUELVE A PASO 2 (INFINITO)
```

---

## 3. Entendiendo React Hooks - Conceptos Clave

### ¿Cómo Funciona useEffect?

```typescript
useEffect(() => {
  // Este código corre cuando:
  // 1. El componente monta por primera vez
  // 2. Alguna dependencia cambia

  // Cuando termina de ejecutarse, React:
  // - Compara el array de dependencias actual vs anterior
  // - Si cambió: Corre el effect
  // - Si igual: No corre
}, [dependency1, dependency2])
```

### El Array de Dependencias - Lo Crítico

```typescript
// ❌ MAL: Sin dependencias - corre infinitamente
useEffect(() => {
  router.replace(newUrl)
}) // <- Corre en CADA render

// ✅ BIEN: Con dependencias correctas
useEffect(() => {
  router.replace(newUrl)
}, [newUrl, router]) // <- Corre solo cuando newUrl o router cambian

// ❌ PELIGRO: Dependencia que se actualiza por el effect
useEffect(() => {
  router.replace(newUrl) // <- Cambia la URL
  setData(data)         // <- Cambia data
}, [newUrl, router, data, searchParams])
//  ↑ Si alguna de estas CAMBIÓ por el effect anterior,
//    vuelve a correr (CICLO INFINITO)
```

---

## 4. ¿Por Qué Pasó en useMapViewport?

### Código Original (Buggy)

```typescript
export function useMapViewport({
  initialViewport,
  initialCenter,
  initialZoom = DEFAULT_MAP_CONFIG.DEFAULT_ZOOM,
  mounted,
}: UseMapViewportProps): UseMapViewportReturn {
  const router = useRouter();
  const searchParams = useSearchParams(); // ← Hook que escucha URL

  const [viewState, setViewState] = useState<ViewState>({ /* ... */ });

  const debouncedViewport = useDebounce<MapViewport>({ /* ... */ }, 500);

  const debouncedBounds: MapBounds = viewportToBounds(debouncedViewport);

  useEffect(() => {
    if (!mounted) return;

    const newUrl = buildBoundsUrl(debouncedBounds);

    if (currentNeLat !== newNeLat || /* ... */) {
      router.replace(newUrl, { scroll: false });
    }
  }, [debouncedBounds, router, mounted, searchParams]);
  // ↑ PROBLEMA: searchParams aquí
}
```

### El Ciclo Paso a Paso

```
1️⃣ Usuario arrastra el mapa
   ↓
2️⃣ handleMove corre → setViewState(nuevaPosición)
   ↓
3️⃣ viewState actualizado → debouncedViewport espera 500ms
   ↓
4️⃣ Después de 500ms: debouncedViewport actualizado
   ↓
5️⃣ useEffect detecta: "debouncedBounds cambió"
   ↓
6️⃣ Corre el effect:
     const newUrl = buildBoundsUrl(debouncedBounds)
     router.replace(newUrl) // ← URL CAMBIÓ
   ↓
7️⃣ URL cambió → useSearchParams() devuelve nuevo objeto
   ↓
8️⃣ React compara dependencias:
     - debouncedBounds: mismo ✅
     - router: mismo (función estable) ✅
     - mounted: mismo ✅
     - searchParams: DIFERENTE ❌ ← Era el anterior, ahora es nuevo
   ↓
9️⃣ useEffect corre OTRA VEZ
   ↓
🔟 Hace el mismo router.replace() aunque la URL sea igual
   ↓
1️⃣1️⃣ Vuelve a PASO 7️⃣ (INFINITO)
```

---

## 5. ¿Por Qué Es Tan Difícil de Detectar?

### 1. **No es Error Obvio**
```typescript
// No hay un error de TypeScript
// No hay un error en runtime visible
// Solo: queries infinitas en la terminal (fácil de ignorar)
```

### 2. **Parece Lógico**
```typescript
// "Quiero leer la URL" → useSearchParams()
// "Quiero sincronizar cambios de URL" → searchParams en dependencias
// ← Parece correcto pero es un trap
```

### 3. **Depende del Contexto**
```typescript
// En otros casos, incluir searchParams SÍ es correcto:

useEffect(() => {
  // Quiero ejecutar cuando la URL EXTERNA cambie
  // (e.g., usuario hace back/forward)
  const params = parseParams(searchParams)
  setFilters(params)
}, [searchParams]) // ← Aquí SÍ queremos esto
```

---

## 6. La Solución - Cómo Evitarlo

### Solución Implementada: useRef + Comparación de Strings

```typescript
// Paso 1: Crear una referencia mutable (no causa re-renders)
const lastUrlRef = useRef<string>("");

// Paso 2: En el effect, comparar strings vs dependencias
useEffect(() => {
  if (!mounted) return;

  // Construir la URL
  const newUrl = buildBoundsUrl(debouncedBounds);

  // Comparar: ¿Es DIFERENTE a la última que conocemos?
  if (lastUrlRef.current !== newUrl) {
    // Solo actualizar si realmente cambió
    lastUrlRef.current = newUrl;
    router.replace(newUrl, { scroll: false });
  }
}, [debouncedBounds, router, mounted]); // ← NO searchParams
```

### ¿Por Qué Funciona?

```
✅ ANTES (Buggy):
   router.replace() → URL cambió → searchParams cambió → effect corre de nuevo

❌ AHORA (Fixed):
   router.replace() → URL cambió → searchParams cambió → ¿Effect corre?

   Depende: ¿Cambió debouncedBounds?
   - SÍ cambió (primer pan): Corre effect
   - NO cambió (pan a mismo lugar): No corre, useRef previene la llamada

   Resultado: No hay ciclo infinito
```

---

## 7. Analiza el Flujo - Con el Fix

```
1️⃣ Usuario arrastra el mapa a nueva posición
   ↓
2️⃣ handleMove → setViewState(posiciónNueva)
   ↓
3️⃣ viewState actualizado, espera 500ms para debounce
   ↓
4️⃣ debouncedViewport finalmente actualizado
   ↓
5️⃣ useEffect detecta: "debouncedBounds cambió"
   ↓
6️⃣ Corre el effect:
     const newUrl = buildBoundsUrl(debouncedBounds)
     // lastUrlRef.current = ""
     // newUrl = "/mapa?ne_lat=-2.85&..."
     if ("" !== "/mapa?ne_lat=-2.85&...") {
       lastUrlRef.current = "/mapa?ne_lat=-2.85&..."
       router.replace(newUrl) ✅ ACTUALIZA URL
     }
   ↓
7️⃣ URL cambió → useSearchParams() devuelve nuevo objeto
   ↓
8️⃣ React compara dependencias:
     - debouncedBounds: mismo ✅
     - router: mismo ✅
     - mounted: mismo ✅
     (searchParams NO está en dependencias, ignorado)
   ↓
9️⃣ ❌ useEffect NO corre porque NO cambió nada en las dependencias
   ↓
🔟 Usuario arrastra a otro lugar
    ↓
1️⃣1️⃣ debouncedBounds REALMENTE cambió → useEffect corre
    ↓
1️⃣2️⃣ Compara:
       lastUrlRef.current = "/mapa?ne_lat=-2.85&..." (del paso anterior)
       newUrl = "/mapa?ne_lat=-2.83&..." (nueva posición)
       Son DIFERENTES → router.replace(newUrl)
    ↓
1️⃣3️⃣ URL actualizada, fin. Ciclo continúa pero NO es infinito.
```

---

## 8. Las Tres Formas de Evitar Infinite Loops

### Opción 1: useRef (Lo que hicimos)
```typescript
// ✅ Usar para: Rastrear el último valor sin dependencia reactiva
const lastValueRef = useRef<T>(initialValue);

useEffect(() => {
  const newValue = computeValue();
  if (lastValueRef.current !== newValue) {
    lastValueRef.current = newValue;
    doSomething(newValue);
  }
}, [/* sin valores que cambien por el effect */]);
```

**Ventajas:**
- Simple y directo
- No necesita dependencias
- Fácil de entender

**Desventajas:**
- Necesita comparación manual

---

### Opción 2: Separar Effects
```typescript
// ✅ Usar para: Lectura y escritura de estado separadas

// Effect 1: Lee cambios EXTERNOS (URL)
useEffect(() => {
  const params = parseSearchParams(searchParams);
  setLocalState(params);
}, [searchParams]);

// Effect 2: Escribe cambios INTERNOS (UI)
useEffect(() => {
  const newUrl = buildUrl(localState);
  if (lastUrlRef.current !== newUrl) {
    lastUrlRef.current = newUrl;
    router.replace(newUrl);
  }
}, [localState, router]);
```

**Ventajas:**
- Responsabilidades claras
- Fácil de debuggear
- Pattern React estándar

**Desventajas:**
- Más código
- Potencial sync lag entre URL y state

---

### Opción 3: Usar useTransition / useCallback
```typescript
// ✅ Usar para: Operaciones asincrónicas que pueden causar loops

const [isPending, startTransition] = useTransition();

const syncUrlToState = useCallback((url: string) => {
  startTransition(() => {
    // Las actualizaciones aquí no disparan effects nuevos
    // hasta que la transición termine
    const params = parseUrl(url);
    setViewport(params);
  });
}, []);

useEffect(() => {
  syncUrlToState(newUrl);
}, [newUrl]);
```

**Ventajas:**
- Batching automático
- Mejor rendimiento
- Para operaciones complejas

**Desventajas:**
- Más complejo
- Requiere entiender transitions

---

## 9. Checklist: Cómo Evitar Infinite Loops

### Antes de usar useEffect:

- [ ] ¿Qué es el resultado del effect? (side effect, estado, query)
- [ ] ¿Qué valores lo deben disparar? (dependencias)
- [ ] ¿El effect actualiza alguna dependencia? (PELIGRO)
- [ ] ¿Hay valores que cambien en CADA render? (evitar en deps)

### Red flags comunes:

```typescript
❌ PELIGRO 1: Objeto nuevo en cada render
useEffect(() => {
  // ...
}, [{ value: 1 }]) // DIFERENTE en cada render

❌ PELIGRO 2: Array nuevo en cada render
useEffect(() => {
  // ...
}, [[1, 2, 3]]) // DIFERENTE en cada render

❌ PELIGRO 3: Función nueva en cada render
useEffect(() => {
  const handleClick = () => { /* ... */ }
  // ...
}, [handleClick]) // DIFERENTE en cada render

❌ PELIGRO 4: Hook que se actualiza por el effect
useEffect(() => {
  updateValue() // ← Cambia algo
}, [actualValue]) // ← Que estaba en dependencias
```

### Cómo asegurar dependencias estables:

```typescript
// ❌ MAL
const dependencies = [state, derived, router]
// state y router pueden ser diferentes en cada render

// ✅ BIEN
const dependencies = useMemo(() => [state, router], [state, router])
// Memoizar para mantener referencia estable

// ✅ MEJOR
const dependencies = [someStableValue]
// Usar solo valores que no cambian

// ✅ MEJOR AÚN
// No incluir dependencias inestables
// Usar useRef o callbacks estables
```

---

## 10. Testing: Cómo Detectar Infinite Loops

### En Desarrollo:

```bash
# 1. Agregar logging
console.log('Effect corriendo', new Date().getTime())

# 2. Chequear la terminal:
# Si ves 100+ logs en < 1 segundo → Infinite loop

# 3. Usar React DevTools → Profiler
# Ve cuántas veces se renderiza el componente
```

### En el Navegador:

```javascript
// Agregar en el componente durante debug
useEffect(() => {
  const start = performance.now()
  console.time('render')
  return () => {
    const end = performance.now()
    if (end - start < 16) {
      console.warn('⚠️ Rapid re-render detected:', end - start, 'ms')
    }
  }
})
```

### En Tests:

```typescript
test('useMapViewport should not cause infinite loop', () => {
  const { rerender } = render(
    <TestComponent />
  )

  // Simular múltiples renders
  for (let i = 0; i < 10; i++) {
    rerender(<TestComponent />)
  }

  // Verificar que las queries no se disparan infinitamente
  expect(mockQuery).toHaveBeenCalledTimes(expectedCount)
  expect(mockRouter.replace).toHaveBeenCalledTimes(expectedCount)
})
```

---

## 11. Comparación: Antes vs Después

### ANTES (Buggy)
```typescript
useEffect(() => {
  if (!mounted) return;

  const newUrl = buildBoundsUrl(debouncedBounds);

  if (
    currentNeLat !== newNeLat ||
    currentNeLng !== newNeLng ||
    currentSwLat !== newSwLat ||
    currentSwLng !== newSwLng
  ) {
    router.replace(newUrl, { scroll: false });
  }
}, [debouncedBounds, router, mounted, searchParams]);
// ↑ searchParams causa infinite loop
```

**Problema:** Cada vez que router.replace() se ejecuta, URL cambia → searchParams cambia → effect se dispara de nuevo

**Impacto:**
- ❌ Queries infinitas a la BD
- ❌ CPU al 100%
- ❌ Experiencia de usuario lenta
- ❌ Costo de cloud infinito

---

### DESPUÉS (Fixed)
```typescript
const lastUrlRef = useRef<string>("");

useEffect(() => {
  if (!mounted) return;

  const newUrl = buildBoundsUrl(debouncedBounds);

  if (lastUrlRef.current !== newUrl) {
    lastUrlRef.current = newUrl;
    router.replace(newUrl, { scroll: false });
  }
}, [debouncedBounds, router, mounted]);
// ← NO searchParams, sin ciclo infinito
```

**Solución:** Rastrear el último URL sin ser dependencia reactiva

**Beneficio:**
- ✅ Queries únicas por bounds change
- ✅ CPU normal
- ✅ Experiencia rápida
- ✅ Costo optimizado

---

## 12. Lecciones Aprendidas

### 1. "Las dependencias parecen correctas pero NO lo son"

A menudo, al escribir un effect, piensas que necesitas agregar una dependencia porque la usas en el código. Pero si esa dependencia **cambia porque el effect se ejecutó**, estás en un ciclo.

### 2. "searchParams es un hook especial"

`useSearchParams()` siempre devuelve un objeto NUEVO cuando la URL cambia, incluso si los parámetros son iguales. No es memoizado por defecto.

```typescript
// El objeto es diferente en cada URL change
const params1 = useSearchParams() // Objeto A
const params2 = useSearchParams() // Objeto B (incluso si URL igual)
console.log(params1 === params2) // false
```

### 3. "router.replace() es asincrónico en su efecto"

Cuando llamas a router.replace(), Next.js actualiza la URL en el browser, lo que dispara los hooks que escuchan esa URL. No es instantáneo pero ocurre en el mismo ciclo de render.

### 4. "useRef es tu amigo para romper ciclos"

Si necesitas "recordar" un valor sin que cause re-renders o nuevas dependencias, useRef es la herramienta perfecta.

---

## 13. Patrones Anti-Infinite-Loop

### Patrón 1: El Guard (Evitar effect innecesario)
```typescript
const lastValueRef = useRef<string>("");

useEffect(() => {
  const newValue = compute();

  // Guard: Solo hacer algo si realmente cambió
  if (lastValueRef.current !== newValue) {
    lastValueRef.current = newValue;
    doExpensiveOperation(newValue);
  }
}, [/* minimal deps */]);
```

### Patrón 2: El Splitter (Separar lectura y escritura)
```typescript
// Leer cambios externos
useEffect(() => {
  const data = parseExternalSource();
  setInternalState(data);
}, [externalDependency]);

// Escribir cambios internos
useEffect(() => {
  const payload = buildPayload(internalState);
  saveExternally(payload);
}, [internalState]);
```

### Patrón 3: El Memoizer (Estabilizar dependencias)
```typescript
const stableValue = useMemo(() => {
  return computeExpensiveValue();
}, [dependency]);

useEffect(() => {
  // Usar stableValue evita que effect corra cada render
  doSomething(stableValue);
}, [stableValue]); // Memoizado, no cambia sin razón
```

### Patrón 4: El Filtrador (Ignorar cambios innecesarios)
```typescript
const lastStateRef = useRef(initialState);

useEffect(() => {
  const isActuallyDifferent = !isEqual(state, lastStateRef.current);

  if (isActuallyDifferent) {
    lastStateRef.current = state;
    triggerSideEffect();
  }
}, [state]);
```

---

## 14. Debugging Deep Dive

Si aún así tienes un infinite loop, aquí cómo debuggearlo:

### Paso 1: Verificar el Origin
```typescript
useEffect(() => {
  console.count('Effect running');
}, [/* deps */]); // ← Abre DevTools console, recarga, busca "Effect running"
```

### Paso 2: Mirar el Stack Trace
```typescript
useEffect(() => {
  console.trace('Why is this running?');
}, [/* deps */]);

// En DevTools, busca patrones como:
// useReducer → dispatch → setState → useEffect → dispatch (CICLO)
```

### Paso 3: Usar React DevTools Profiler
1. Abre DevTools
2. Profiler tab
3. Record
4. Haz la acción que causa el loop
5. Stop recording
6. Busca renders múltiples del mismo componente

### Paso 4: Aislar con React.memo
```typescript
// Si el componente se re-renderiza mucho:
const MapComponent = React.memo(({ viewport, onMove }) => {
  useEffect(() => {
    // Effect aquí
  }, [viewport]);

  return <Map onMove={onMove} />
});

// Wrappear evita re-renders innecesarios
```

---

## 15. Conclusión: Rules to Live By

### ✅ SIEMPRE:
1. Lista todas las variables que usas en el effect
2. Pregúntate: "¿Cuáles DEBEN disparar este effect?"
3. Agrega SOLO esas al array de dependencias
4. Si algo cambia por el effect, usa useRef o useMemo
5. Usa ESLint rule `exhaustive-deps` para ayuda

### ❌ NUNCA:
1. Crees dependencias en cada render (objetos, arrays, funciones anónimas)
2. Ignores ESLint warnings sobre dependencias
3. Desactives el linting para ignorar problemas
4. Pongas todo "just in case" en dependencias

### 🎯 RECUERDA:
```
El array de dependencias NO es "qué variables usas"
El array de dependencias ES "cuándo este código debe correr"
```

---

## Referencias

- [React useEffect Docs](https://react.dev/reference/react/useEffect)
- [ESLint react-hooks/exhaustive-deps](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks)
- [Understanding Dependencies in React](https://overreacted.io/a-complete-guide-to-useeffect/)

---

**Status:** ✅ Documentado y solucionado
**Última actualización:** Oct 23, 2024
**Próxima revisión:** Cuando Next.js 16.1+ esté disponible
