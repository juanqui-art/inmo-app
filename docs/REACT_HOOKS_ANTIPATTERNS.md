# React Hooks Anti-Patterns - Guía de Evitación

**Escrito:** Oct 23, 2024
**Tipo:** Practical Guide - Common Mistakes and How to Avoid Them
**Audiencia:** Frontend developers

---

## Introducción

Este documento cataloga los anti-patterns más comunes con React Hooks que pueden causar bugs sutiles, infinite loops, y problemas de rendimiento. Cada uno incluye ejemplos reales de tu codebase.

---

## Anti-Pattern 1: Dependencias Inestables (Objetos/Arrays)

### ❌ El Problema

```typescript
// ❌ MAL: Crear objeto en cada render
function MapComponent() {
  const bounds = {
    ne_lat: -2.85,
    ne_lng: -78.95,
    sw_lat: -2.95,
    sw_lng: -79.05,
  };

  useEffect(() => {
    fetchProperties(bounds);
  }, [bounds]); // bounds es NUEVO objeto en cada render
  // Effect corre en CADA render, incluso si valores son iguales
}
```

**¿Por qué es malo?**
```typescript
const bounds1 = { ne_lat: -2.85 }
const bounds2 = { ne_lat: -2.85 }
bounds1 === bounds2 // false (objetos diferentes)

// React compara por referencia, no por valor
// Entonces, aunque los valores sean iguales, el effect corre
```

### ✅ La Solución

```typescript
// OPCIÓN 1: useMemo para memoizar el objeto
function MapComponent() {
  const bounds = useMemo(() => ({
    ne_lat: -2.85,
    ne_lng: -78.95,
    sw_lat: -2.95,
    sw_lng: -79.05,
  }), [ne_lat, ne_lng, sw_lat, sw_lng]);
  // bounds ahora es estable, solo cambia si sus deps cambian

  useEffect(() => {
    fetchProperties(bounds);
  }, [bounds]); // Seguro ahora
}

// OPCIÓN 2: Extraer fuera del componente si es constante
const DEFAULT_BOUNDS = {
  ne_lat: -2.85,
  ne_lng: -78.95,
  sw_lat: -2.95,
  sw_lng: -79.05,
};

function MapComponent() {
  useEffect(() => {
    fetchProperties(DEFAULT_BOUNDS);
  }, [DEFAULT_BOUNDS]); // Referencia estable
}

// OPCIÓN 3: Destructurar y comparar valores individuales
function MapComponent({ neLat, neLng, swLat, swLng }) {
  useEffect(() => {
    fetchProperties({ neLat, neLng, swLat, swLng });
  }, [neLat, neLng, swLat, swLng]); // Valores primitivos, estables
}
```

---

## Anti-Pattern 2: Funciones en Dependencias

### ❌ El Problema

```typescript
// ❌ MAL: Función nueva en cada render
function MapComponent() {
  const handleZoom = () => {
    console.log('Zoomed');
  };

  useEffect(() => {
    mapElement?.addEventListener('zoom', handleZoom);
    return () => mapElement?.removeEventListener('zoom', handleZoom);
  }, [handleZoom]); // handleZoom es NUEVA función en cada render
  // Listener se agrega/quita en cada render
}
```

### ✅ La Solución

```typescript
// OPCIÓN 1: useCallback para memoizar función
function MapComponent() {
  const handleZoom = useCallback(() => {
    console.log('Zoomed');
  }, []); // Dependencias de handleZoom vacías = función estable

  useEffect(() => {
    mapElement?.addEventListener('zoom', handleZoom);
    return () => mapElement?.removeEventListener('zoom', handleZoom);
  }, [handleZoom]); // Ahora es estable
}

// OPCIÓN 2: Si no necesita dependencias internas
function MapComponent() {
  useEffect(() => {
    const handleZoom = () => {
      console.log('Zoomed');
    };

    mapElement?.addEventListener('zoom', handleZoom);
    return () => mapElement?.removeEventListener('zoom', handleZoom);
  }, []); // Función definida DENTRO del effect
}

// OPCIÓN 3: Definir fuera del componente si es posible
const handleZoom = () => {
  console.log('Zoomed');
};

function MapComponent() {
  useEffect(() => {
    mapElement?.addEventListener('zoom', handleZoom);
    return () => mapElement?.removeEventListener('zoom', handleZoom);
  }, [handleZoom]); // Referencia estable
}
```

---

## Anti-Pattern 3: El Patrón de Fuga de Dependencias (Dependency Leak)

### ❌ El Problema

```typescript
// ❌ MAL: router.replace() dispara useEffect infinitamente
function useMapViewport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewState, setViewState] = useState({ /* ... */ });
  const debouncedBounds = useDebounce(/* ... */, 500);

  useEffect(() => {
    const newUrl = buildBoundsUrl(debouncedBounds);
    router.replace(newUrl); // ← Cambia la URL
  }, [debouncedBounds, router, searchParams]);
  // ↑ searchParams aquí causa que effect corra infinitamente
  //   porque router.replace() → URL cambia → searchParams nuevo
}
```

**La Cadena de Causa:**
```
router.replace() → URL cambió → useSearchParams() → objeto nuevo
→ searchParams en dependencias → effect corre de nuevo → router.replace()
→ ... (INFINITO)
```

### ✅ La Solución

```typescript
// OPCIÓN 1: useRef + Comparación (Lo que hicimos)
function useMapViewport() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Mantener para reactivity
  const debouncedBounds = useDebounce(/* ... */, 500);
  const lastUrlRef = useRef<string>("");

  useEffect(() => {
    if (!mounted) return;

    const newUrl = buildBoundsUrl(debouncedBounds);

    // Guard: Solo si realmente cambió
    if (lastUrlRef.current !== newUrl) {
      lastUrlRef.current = newUrl;
      router.replace(newUrl);
    }
  }, [debouncedBounds, router, mounted]); // ← NO searchParams
}

// OPCIÓN 2: Separar en dos effects
function useMapViewport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewState, setViewState] = useState({ /* ... */ });
  const debouncedBounds = useDebounce(/* ... */, 500);

  // Effect 1: Escribir cambios internos a URL
  useEffect(() => {
    const newUrl = buildBoundsUrl(debouncedBounds);
    router.replace(newUrl);
  }, [debouncedBounds, router]);

  // Effect 2: Leer cambios externos de URL (separado)
  useEffect(() => {
    // Si URL cambió externamente, actualizar state
    const params = parseBoundsParams(searchParams);
    // ... actualizar viewport
  }, [searchParams]);
  // Dos responsabilidades, dos effects
}
```

---

## Anti-Pattern 4: Dependencias Faltantes (ESLint Warnings)

### ❌ El Problema

```typescript
// ❌ MAL: ESLint va a gritar
function MapComponent() {
  const [count, setCount] = useState(0);
  const title = usePageTitle(); // Hook que devuelve string

  useEffect(() => {
    console.log(`Count: ${count}`);
    // Usas count pero NO está en dependencias
    // Si count cambia, effect no corre (pero debería)
  }, []); // ← ESLint: "React Hook useEffect has a missing dependency: 'count'"
}
```

### ✅ La Solución

```typescript
// OPCIÓN 1: Agregar la dependencia
function MapComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(`Count: ${count}`);
  }, [count]); // ✅ Ahora está completo
}

// OPCIÓN 2: Si es primitivo y no lo necesitas realmente
function MapComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // No usar count directamente
    console.log('Effect ran');
  }, []); // ✅ Sincero: no depende de nada
}

// OPCIÓN 3: Si es un objeto/array, memoizarlo
function MapComponent() {
  const [filters, setFilters] = useState({ /* ... */ });

  const memoizedFilters = useMemo(() => filters, [filters]);

  useEffect(() => {
    applyFilters(memoizedFilters);
  }, [memoizedFilters]); // ✅ Memoizado, ESLint feliz
}
```

---

## Anti-Pattern 5: No Limpiar Side Effects

### ❌ El Problema

```typescript
// ❌ MAL: Event listeners se acumulan
function MapComponent() {
  useEffect(() => {
    const handleMove = () => {
      console.log('Map moved');
    };

    // Agregar listener
    window.addEventListener('mousemove', handleMove);
    // Pero nunca lo quitamos
  }, []); // ← Memory leak: se agrega cada render
}
```

**¿Por qué es malo?**
- Listeners se acumulan
- Memoria crece
- Handlers múltiples se ejecutan

### ✅ La Solución

```typescript
// BIEN: Retornar cleanup function
function MapComponent() {
  useEffect(() => {
    const handleMove = () => {
      console.log('Map moved');
    };

    window.addEventListener('mousemove', handleMove);

    // Cleanup function: corre cuando componente desmonta
    // o antes de que effect corra de nuevo
    return () => {
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);
}
```

---

## Anti-Pattern 6: Actualizar Mismo Estado que Dispara Effect

### ❌ El Problema

```typescript
// ❌ MAL: Fetch en loop
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Fetch basado en query
    fetchResults(query).then(data => {
      setResults(data); // ← Actualiza estado
    });
  }, [query, results]); // ← results en dependencias
  // Cuando setResults corre, results cambia → effect corre de nuevo
  // Si cada fetch cambia results, infinite loop
}
```

### ✅ La Solución

```typescript
// OPCIÓN 1: Solo poner la dependencia de INPUT
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults(query).then(data => {
      setResults(data);
    });
  }, [query]); // ✅ Solo query, no results
}

// OPCIÓN 2: Usar useCallback para memoizar dependencies
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleFetch = useCallback(() => {
    fetchResults(query).then(data => {
      setResults(data);
    });
  }, [query]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);
}

// OPCIÓN 3: Usar useReducer para estado relacionado
function SearchComponent() {
  const [state, dispatch] = useReducer((s, a) => {
    if (a.type === 'SET_QUERY') return { ...s, query: a.query };
    if (a.type === 'SET_RESULTS') return { ...s, results: a.results };
    return s;
  }, { query: '', results: [] });

  useEffect(() => {
    fetchResults(state.query).then(data => {
      dispatch({ type: 'SET_RESULTS', results: data });
    });
  }, [state.query]); // ✅ Solo depende de query
}
```

---

## Anti-Pattern 7: Ignorar ESLint Warnings

### ❌ El Problema

```typescript
// ❌ MAL: Desactivar ESLint sin pensar
function MapComponent() {
  const data = useExternalData();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    console.log(data);
  }, []); // ← Ignoraste la advertencia de ESLint
  // Si data cambia, este effect no corre
  // Bug creado para "hacer que funcione"
}
```

### ✅ La Solución

```typescript
// SIEMPRE: Entender antes de deshabilitar
function MapComponent() {
  const data = useExternalData();

  useEffect(() => {
    console.log(data);
  }, [data]); // ← Arreglaste el problema, no lo ignoraste

  // Si realmente NO necesitas data:
  useEffect(() => {
    // No usar data aquí
    console.log('Effect running');
  }, []); // ← Sincero: no depende de data
}
```

---

## Anti-Pattern 8: Condiciones Dinámicas en Dependencias

### ❌ El Problema

```typescript
// ❌ MAL: Lógica complicada en dependencias
function MapComponent({ shouldFetch, filters }) {
  useEffect(() => {
    if (shouldFetch) {
      fetch(filters);
    }
  }, [shouldFetch && filters]); // ❌ Esto no funciona como esperabas
  // shouldFetch && filters se evalúa a true o false
  // No es lo mismo que [shouldFetch, filters]
}
```

### ✅ La Solución

```typescript
// BIEN: Listar todas las dependencias
function MapComponent({ shouldFetch, filters }) {
  useEffect(() => {
    if (shouldFetch) {
      fetch(filters);
    }
  }, [shouldFetch, filters]); // ✅ Claro y correcto
}

// O si solo depende de filters:
function MapComponent({ shouldFetch, filters }) {
  useEffect(() => {
    if (shouldFetch) {
      fetch(filters);
    }
  }, [filters]); // ✅ Si shouldFetch es constante

  // O más explícito:
  const memoizedDeps = useMemo(
    () => shouldFetch ? filters : null,
    [shouldFetch, filters]
  );

  useEffect(() => {
    if (memoizedDeps) {
      fetch(memoizedDeps);
    }
  }, [memoizedDeps]);
}
```

---

## Anti-Pattern 9: Modificar Props Directamente

### ❌ El Problema

```typescript
// ❌ MAL: Mutar prop
function MapComponent({ viewport }) {
  useEffect(() => {
    viewport.zoom = 15; // ← Mutando prop
    updateMap(viewport);
  }, [viewport]); // Effect cada vez que viewport cambia
}
```

### ✅ La Solución

```typescript
// BIEN: Copiar y mutar copia
function MapComponent({ viewport }) {
  useEffect(() => {
    const newViewport = { ...viewport, zoom: 15 };
    updateMap(newViewport);
  }, [viewport]); // Immutable, patrón correcto
}
```

---

## Anti-Pattern 10: Effects que Dependen de Otros Effects

### ❌ El Problema

```typescript
// ❌ MAL: Cadena de effects
function DataComponent() {
  const [input, setInput] = useState('');
  const [processed, setProcessed] = useState('');
  const [result, setResult] = useState('');

  // Effect 1
  useEffect(() => {
    setProcessed(input.toUpperCase());
  }, [input]);

  // Effect 2: Depende de resultado de Effect 1
  useEffect(() => {
    setResult(processed.trim());
  }, [processed]);

  // Effect 3: Depende de resultado de Effect 2
  useEffect(() => {
    saveToDatabase(result);
  }, [result]);
  // ← Tres renders en cadena, difícil debuggear
}
```

### ✅ La Solución

```typescript
// OPCIÓN 1: Consolidar en un effect
function DataComponent() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    // Todo el pipeline en un effect
    const processed = input.toUpperCase();
    const final = processed.trim();
    setResult(final);
    saveToDatabase(final);
  }, [input]);
}

// OPCIÓN 2: Usar useCallback para composición
function DataComponent() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const process = useCallback((value) => {
    return value.toUpperCase().trim();
  }, []);

  useEffect(() => {
    const final = process(input);
    setResult(final);
    saveToDatabase(final);
  }, [input, process]);
}

// OPCIÓN 3: Usar custom hook
function useDataPipeline(input) {
  const [result, setResult] = useState('');

  useEffect(() => {
    const processed = input.toUpperCase();
    const final = processed.trim();
    setResult(final);
    saveToDatabase(final);
  }, [input]);

  return result;
}

// En componente:
const result = useDataPipeline(input);
```

---

## Anti-Pattern 11: Olvidar que useEffect Corre Después de Render

### ❌ El Problema

```typescript
// ❌ MAL: Lógica que debería ser en render
function MapComponent() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    // Esto corre DESPUÉS de render inicial
    // Significa que usuario ve componente sin data primero
    fetchProperties().then(setProperties);
  }, []);

  return <Map properties={properties} />; // properties está vacío primero
}
```

### ✅ La Solución

Para data inicial, depende del contexto:

```typescript
// OPCIÓN 1: Server Component (fetch en server)
// app/map/page.tsx
async function MapPage() {
  const properties = await getPropertiesFromDB();
  return <Map properties={properties} />;
  // Data está listo, sin blank page
}

// OPCIÓN 2: useEffect está OK si es interacción
function MapComponent() {
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    // Esto está OK porque es en respuesta a interacción
    // No es data inicial
    if (zoom > 15) {
      loadDetailedData();
    }
  }, [zoom]);

  return <Map zoom={zoom} onZoomChange={setZoom} />;
}

// OPCIÓN 3: Loader mientras cargas
function MapComponent() {
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    fetchProperties().then(setProperties);
  }, []);

  if (properties === null) {
    return <LoadingSpinner />; // User ve loading, no blank
  }

  return <Map properties={properties} />;
}
```

---

## Checklist: Revisión de useEffect

Antes de commitar código con useEffect, revisa:

```typescript
useEffect(() => {
  // TODO: ¿Es este el mejor lugar para esta lógica?
  // TODO: ¿Realmente necesito un effect?
  // TODO: ¿Hay loops infinitos potenciales?

  doSomething();

  return () => {
    // TODO: ¿Necesito cleanup?
    // TODO: ¿Qué pasa si componente desmonta en medio?
  };
}, [
  // TODO: ¿Están TODAS las dependencias que uso arriba?
  // TODO: ¿Hay objetos/arrays nuevos en cada render?
  // TODO: ¿Hay funciones que podrían ser estables?
  // TODO: ¿Este array causa circular dependency?
]); // ← ESLint happy?
```

---

## Red Flags: Cuando Algo Está Mal

```typescript
// 🚩 "Mi effect corre más de lo esperado"
// Culpables comunes:
// - Dependencia inestable (objeto/array nuevo)
// - Effect que actualiza su propia dependencia
// - Missing dependency en array

// 🚩 "Tengo que usar /* eslint-disable */"
// Nunca hagas esto sin entender por qué
// El warning está ahí por una razón

// 🚩 "Memoria crece sin parar"
// Probablemente:
// - Event listeners sin cleanup
// - Subscriptions sin unsubscribe
// - setInterval sin clearInterval

// 🚩 "¿Por qué cambia el order de mis dependencias?"
// No importa el order, pero ESLint te lo arreglará
// Déjalo hacer

// 🚩 "Funciona en desarrollo pero no en producción"
// Probable: Effects que cambian en modo estricto
// En desarrollo, effects corren 2 veces (intentionally)
// para detectar bugs
```

---

## Testing: Cómo Verificar tu useEffect

```typescript
import { renderHook, act, waitFor } from '@testing-library/react'

test('useMapViewport updates URL on bounds change', () => {
  const { result, rerender } = renderHook(
    ({ bounds }) => useMapViewport(bounds),
    { initialProps: { bounds: DEFAULT_BOUNDS } }
  )

  // Effect debería correr
  expect(mockRouter.replace).toHaveBeenCalledTimes(1)

  // Cambiar bounds
  act(() => {
    rerender({ bounds: NEW_BOUNDS })
  })

  // Effect debería correr de nuevo, pero NO infinitamente
  expect(mockRouter.replace).toHaveBeenCalledTimes(2)

  // Cambiar a los mismos bounds de antes
  act(() => {
    rerender({ bounds: DEFAULT_BOUNDS })
  })

  // Debería usar cache, no llamar router.replace
  expect(mockRouter.replace).toHaveBeenCalledTimes(2) // Sin cambios
})
```

---

## Resumen: Reglas de Oro

1. **Lista TODAS las variables que usas en el effect**
2. **Agrega SOLO aquellas que debería disparar el effect**
3. **Si algo cambia por el effect, usa useRef o useMemo**
4. **Siempre limpia side effects (return cleanup function)**
5. **No ignores ESLint warnings sin entender**
6. **Cuando dudes, divide en múltiples effects**
7. **Usa Server Components para data inicial cuando puedas**

---

**Status:** ✅ Completo
**Referencia rápida:** Busca por "Anti-Pattern X" para tu problema específico
**Última actualización:** Oct 23, 2024
