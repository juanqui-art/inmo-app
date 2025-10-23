# Debugging React Hooks - Guía Práctica

**Escrito:** Oct 23, 2024
**Tipo:** Debugging & Troubleshooting Guide
**Para:** Cuando todo falla y necesitas arreglarlo

---

## Quick Reference: Infinite Loop Detectors

### Detector 1: Console Log Counter (30 segundos)

```typescript
// Agregar temporalmente en tu componente
useEffect(() => {
  console.count('🔄 Effect running');
}, [dependencies]);

// En DevTools Console, recarga y busca:
// Si ves 100+ en < 1 segundo → INFINITE LOOP
// Si ves 1-5 → Normal
```

**Resultado en Terminal:**
```
🔄 Effect running: 1
🔄 Effect running: 2
🔄 Effect running: 3
... (hasta 200+) ← PROBLEMA
```

---

### Detector 2: Performance Monitor (30 segundos)

```typescript
// Chrome DevTools:
// 1. Abre Performance tab
// 2. Click Record
// 3. Haz la acción que causa loop
// 4. Click Stop
// 5. Busca: ¿Render se repite cada 16ms?

// Indicadores:
// - Renders cada 16ms (60fps full) = Loop infinito
// - 1-2 renders = Normal
```

---

### Detector 3: React DevTools Profiler (1 minuto)

```typescript
// Chrome DevTools → React tab → Profiler
// 1. Click "Record" (red dot)
// 2. Trigger action
// 3. Click to stop

// Analiza:
// - ¿Qué componentes re-renderean?
// - ¿Cuántas veces?
// - ¿Qué causó el re-render?

// Busca patrones de "Render 1 → Render 2 → Render 3"
// sin parar (loop infinito)
```

---

## Deep Dive: Caso Real - useMapViewport

### Paso 1: Identificar el Loop

```typescript
// En useMapViewport, agregar logging:

useEffect(() => {
  console.log('Effect running', {
    debouncedBounds,
    searchParams: searchParams?.toString(),
    timestamp: new Date().toISOString(),
  });

  const newUrl = buildBoundsUrl(debouncedBounds);
  router.replace(newUrl);
}, [debouncedBounds, router, mounted, searchParams]);
```

**Output de Console:**
```
Effect running {debouncedBounds: {...}, searchParams: "ne_lat=...", timestamp: "2024-10-23T10:00:00.000Z"}
Effect running {debouncedBounds: {...}, searchParams: "ne_lat=...", timestamp: "2024-10-23T10:00:00.001Z"}
Effect running {debouncedBounds: {...}, searchParams: "ne_lat=...", timestamp: "2024-10-23T10:00:00.002Z"}
... (millones de veces)
```

**¿Qué nos dice?**
- Timestamps son prácticamente idénticos
- Bounds NO cambiaron (debería estar en 1 log)
- searchParams SÍ cambió (¿por qué? Porque router.replace() lo cambió)

---

### Paso 2: Aislar la Causa

```typescript
// Agregar logging más específico para saber qué cambió

const [prevDeps, setPrevDeps] = useState({
  bounds: debouncedBounds,
  params: searchParams?.toString(),
});

useEffect(() => {
  const changedDeps = {
    boundsChanged: prevDeps.bounds !== debouncedBounds,
    paramsChanged: prevDeps.params !== searchParams?.toString(),
  };

  console.log('Dependencies changed:', changedDeps);

  // Actualizar tracking
  setPrevDeps({
    bounds: debouncedBounds,
    params: searchParams?.toString(),
  });

  const newUrl = buildBoundsUrl(debouncedBounds);
  router.replace(newUrl);
}, [debouncedBounds, router, mounted, searchParams]);
```

**Output:**
```
Dependencies changed: {boundsChanged: false, paramsChanged: true}
Dependencies changed: {boundsChanged: false, paramsChanged: true}
Dependencies changed: {boundsChanged: false, paramsChanged: true}
... (infinito, pero bounds nunca cambia)
```

**Conclusión:** searchParams cambia pero bounds no → effect corre sin razón

---

### Paso 3: Verificar Qué Causó searchParams

```typescript
// Verificar: ¿router.replace() cambió la URL?

const previousUrlRef = useRef<string>('');

useEffect(() => {
  const newUrl = buildBoundsUrl(debouncedBounds);

  console.log('URL comparison:', {
    previous: previousUrlRef.current,
    new: newUrl,
    changed: previousUrlRef.current !== newUrl,
  });

  if (previousUrlRef.current !== newUrl) {
    previousUrlRef.current = newUrl;
    console.log('Calling router.replace()');
    router.replace(newUrl);
  } else {
    console.log('URL same, NOT calling router.replace()');
  }
}, [debouncedBounds, router, mounted, searchParams]);
```

**Output:**
```
URL comparison: {previous: '', new: '/mapa?ne_lat=...', changed: true}
Calling router.replace()
URL comparison: {previous: '/mapa?ne_lat=...', new: '/mapa?ne_lat=...', changed: false}
Calling router.replace()  ← ¡AÚN LLAMA AUNQUE NO CAMBIÓ!
```

**BINGO:** router.replace() se llama incluso cuando URL es igual

**¿Por qué?** Porque searchParams en dependencias hace que effect corra sin razón

---

### Paso 4: Confirmar la Causa

```typescript
// Experimento: Remover searchParams de dependencias

useEffect(() => {
  // ... mismo código

  if (previousUrlRef.current !== newUrl) {
    previousUrlRef.current = newUrl;
    router.replace(newUrl);
  }
}, [debouncedBounds, router, mounted]); // ← SIN searchParams

// Resultado en console:
// - Effect corre 1 vez en mount
// - Effect corre 1 vez por cada pan del mapa
// - NO más infinito
```

---

## Técnicas de Debugging Específicas

### Técnica 1: Stack Trace del Effect

```typescript
useEffect(() => {
  console.trace('Why did this effect run?');

  // En DevTools, click en "console.trace"
  // Ve el stack completo de qué causó que corra
}, [dependencies]);

// Output en DevTools:
// useEffect
// MapComponent
// MapContainer
// ... hasta react-dom

// Te muestra exactamente dónde fue disparado
```

---

### Técnica 2: Timing Profiler

```typescript
const effectStartTime = useRef<number>();

useEffect(() => {
  effectStartTime.current = performance.now();

  return () => {
    const duration = performance.now() - (effectStartTime.current || 0);
    console.log(`Effect duration: ${duration.toFixed(2)}ms`);

    // Si ves < 1ms y muchos logs: loop infinito
    // Si ves > 100ms: operación lenta
  };
}, [dependencies]);
```

---

### Técnica 3: Dependency Deep Inspection

```typescript
// Para objetos complejos, comparar profundo

function useDeepDependencyWatch(dependencies: any[], name: string) {
  const prevRef = useRef(dependencies);

  useEffect(() => {
    const changed = dependencies.map((dep, i) => ({
      index: i,
      sameReference: prevRef.current[i] === dep,
      sameValue: JSON.stringify(prevRef.current[i]) === JSON.stringify(dep),
      prev: prevRef.current[i],
      current: dep,
    }));

    console.log(`${name} dependencies:`, changed);
    prevRef.current = dependencies;
  }, [dependencies, name]);
}

// Uso:
useDeepDependencyWatch(
  [debouncedBounds, router, mounted, searchParams],
  'MapViewport'
);

// Output:
// MapViewport dependencies: [
//   { index: 0, sameReference: true, sameValue: true, ... },
//   { index: 1, sameReference: true, sameValue: true, ... },
//   { index: 2, sameReference: true, sameValue: true, ... },
//   { index: 3, sameReference: false, sameValue: ?, ... } ← ¡CULPRIT!
// ]
```

---

### Técnica 4: Memory Leak Detector

```typescript
// Detectar si estás creando listeners que no se limpian

const listenersCreated = useRef(0);

useEffect(() => {
  listenersCreated.current += 1;

  const handleEvent = () => console.log('Event');
  window.addEventListener('mousemove', handleEvent);

  // ¿Hay cleanup?
  return () => {
    window.removeEventListener('mousemove', handleEvent);
  };
}, [dependencies]);

// En otra parte:
useEffect(() => {
  console.log(`Listeners created so far: ${listenersCreated.current}`);

  const interval = setInterval(() => {
    console.log(`Current listeners: ${listenersCreated.current}`);
  }, 5000);

  return () => clearInterval(interval);
}, []);

// Si el número crece constantemente: memory leak
```

---

## Testing: Unit Tests para Hooks

### Test 1: Verificar que Effect No Es Infinito

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

test('useMapViewport does not cause infinite effect loop', async () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  let effectRunCount = 0;

  const TestHook = () => {
    useEffect(() => {
      effectRunCount += 1;
    }, [/* deps */]);

    return null;
  };

  const { rerender } = render(<TestHook />);

  // Effect debería correr 1 vez (mount)
  expect(effectRunCount).toBe(1);

  // Rerender con mismas props
  rerender(<TestHook />);

  // Debería seguir siendo 1 (no debería haber corr o de nuevo)
  await waitFor(() => {
    expect(effectRunCount).toBe(1);
  });

  // Rerender con props diferentes
  rerender(<TestHook key="different" />);

  // Ahora sí debería ser 2
  await waitFor(() => {
    expect(effectRunCount).toBeLessThanOrEqual(2);
  });
});
```

---

### Test 2: Verificar Dependencias Correctas

```typescript
test('useMapViewport only runs effect when bounds change', () => {
  const mockRouter = { replace: jest.fn() };

  const { rerender } = renderHook(
    ({ bounds }) => {
      useMapViewport(bounds);
    },
    {
      initialProps: { bounds: DEFAULT_BOUNDS },
    }
  );

  mockRouter.replace.mockClear();

  // Mismo bounds
  rerender({ bounds: DEFAULT_BOUNDS });
  expect(mockRouter.replace).not.toHaveBeenCalled();

  // Bounds diferentes
  rerender({ bounds: NEW_BOUNDS });
  expect(mockRouter.replace).toHaveBeenCalledWith(
    expect.stringContaining('ne_lat')
  );
});
```

---

### Test 3: Verificar Cleanup

```typescript
test('useEffect cleanup is called', () => {
  const cleanup = jest.fn();

  const TestComponent = () => {
    useEffect(() => {
      // ... setup

      return cleanup;
    }, []);

    return null;
  };

  const { unmount } = render(<TestComponent />);

  expect(cleanup).not.toHaveBeenCalled();

  unmount();

  expect(cleanup).toHaveBeenCalledTimes(1);
});
```

---

## Debugging Checklist

Cuando algo está mal con hooks, revisa en orden:

### 1. Verificar Logs (5 minutos)

```typescript
✅ // Agregar console.log en effect
✅ // Buscar "infinito" en logs
✅ // Verificar timestamps (¿microsegundos entre logs?)
✅ // Contar cuántas veces corre
```

### 2. Verificar Dependencias (5 minutos)

```typescript
✅ // Listar todas variables usadas en effect
✅ // ¿Todas están en array de dependencias?
✅ // ESLint dice que falta algo?
✅ // ¿Hay objetos/arrays nuevos? (verificar con ===)
```

### 3. Buscar Ciclos (5 minutos)

```typescript
✅ // ¿El effect actualiza su propia dependencia?
✅ // Hacer cambio A → causa B → causa A de nuevo?
✅ // ¿router.replace() causa URL change? ¿Por qué?
```

### 4. Aislar con useRef (5 minutos)

```typescript
✅ // Usar useRef para rastrear último valor
✅ // Comparar referencias vs valores
✅ // Verificar si realmente cambió o es "fantasma"
```

### 5. Tests (10 minutos)

```typescript
✅ // Escribir test simple: ¿corre solo cuando debería?
✅ // Mock dependencias externas
✅ // Verificar número de llamadas vs esperado
```

---

## Common Gotchas y Sus Soluciones

### Gotcha 1: Cambios en Dependencias Durante Development

```typescript
// En Strict Mode (desarrollo), effects corren 2 veces:
// 1. Setup
// 2. Unmount y setup de nuevo (para detectar bugs)

// Esto te engañará pensando que hay un loop:
useEffect(() => {
  console.log('Setup');
  return () => console.log('Cleanup');
}, []);

// Output:
// Setup
// Cleanup
// Setup  ← Parece loop, pero NO lo es

// En producción solo ves:
// Setup
```

**Solución:** No preocuparte, es intencional. Verifica si corre > 2 veces.

---

### Gotcha 2: Objetos Nuevos en Cada Render

```typescript
// Esto hará creer que hay loop:
const bounds = { lat: 1, lng: 2 };

useEffect(() => {
  console.log('Effect running');
}, [bounds]);

// Output (cada render):
// Effect running
// Effect running  ← No es loop, pero se ve así

// Porque bounds es nuevo objeto cada render
// Aunque los valores sean iguales

// Solución: useMemo
const bounds = useMemo(() => ({ lat: 1, lng: 2 }), []);
```

---

### Gotcha 3: Async Operations

```typescript
// Esto se ve como loop pero es timing:
useEffect(() => {
  fetchData().then(data => {
    setData(data); // ← Causa re-render
  });
}, []);

// Flow:
// 1. Effect corre
// 2. fetch() inicia (async)
// 3. Component renderiza
// 4. fetch() completa
// 5. setData() ejecuta
// 6. Component re-renderiza
// (No es loop, solo operación async)

// PERO si haces:
useEffect(() => {
  fetchData().then(data => setData(data));
}, [data]); // ← data en dependencias
// Ahora SÍ es loop:
// 1. data cambió → effect corre
// 2. fetch y setData
// 3. data cambia → vuelve a paso 1
```

---

## Browser DevTools Tricks

### Trick 1: Breakpoints en Effects

```typescript
// En Chrome DevTools Sources tab:
// 1. Abre tu archivo
// 2. Clic en el número de línea del useEffect
// 3. Clic en "Logpoints" (punto azul)
// 4. Escribe: `{msg: 'Effect ran', deps: dependencies}`
// 5. Console log aparece sin pausar ejecución
```

---

### Trick 2: Conditional Breakpoints

```typescript
// Click derecho en breakpoint → Edit breakpoint:
// Expresión: `callCount > 5`
// La pausa solo si el efecto corre más de 5 veces
```

---

### Trick 3: Monitorear Cambios de Props

```typescript
// En Console, usar:
monitorEvents(element, 'all');

// Luego monitorear cambios en objeto JavaScript:
const obj = { value: 1 };
Object.observe(obj, (changes) => {
  console.log('Changes:', changes);
});
obj.value = 2; // ← Loggeado automáticamente
```

---

## Casos Específicos

### Caso 1: Loop en Router.replace()

```typescript
// Síntomas:
// - URL cambia infinitamente
// - Prisma queries infinitas
// - Componente re-monta constantemente

// Debuggging:
useEffect(() => {
  const newUrl = buildUrl();

  // Verificar: ¿Se llama cada vez?
  console.log('About to call router.replace()', newUrl);

  // Verificar: ¿La URL es la misma?
  if (previousUrlRef.current === newUrl) {
    console.log('URL is SAME, NOT calling router.replace()');
    return; // ← Saltar router.replace()
  }

  previousUrlRef.current = newUrl;
  router.replace(newUrl);
}, [/* minimales */]);
```

---

### Caso 2: Loop en useState

```typescript
// Síntomas:
// - setState se llama infinitamente
// - Infinite renders

// Debugging:
const [state, setState] = useState(initial);

useEffect(() => {
  // ¿setState se ejecuta siempre?
  setState(newValue);
}, [/* deps que causa update */]);

// Solución: Verificar si realmente cambió
const [state, setState] = useState(initial);
const previousRef = useRef(initial);

useEffect(() => {
  if (previousRef.current !== newValue) {
    previousRef.current = newValue;
    setState(newValue);
  }
}, [newValue]);
```

---

### Caso 3: Loop en Query/Fetch

```typescript
// Síntomas:
// - API calls infinitas
// - Network tab explota

// Debugging:
const [data, setData] = useState(null);

useEffect(() => {
  const abortController = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data', {
        signal: abortController.signal,
      });
      const json = await response.json();

      // ¿Siempre hace setData?
      console.log('About to setData', json);
      setData(json);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Fetch error:', e);
      }
    }
  };

  fetchData();

  // Cleanup: abortar si effect corre de nuevo
  return () => abortController.abort();
}, []);
```

---

## Final Checklist

Antes de considerar "fixed":

```typescript
// ✅ Console logs bajan de 100+ a < 5
// ✅ No hay ESLint warnings
// ✅ Funciona en desarrollo (sin strict mode) y producción
// ✅ Performance DevTools muestra renders normales
// ✅ Tests pasan
// ✅ No hay errores en DevTools
// ✅ Memory heap no crece sin límite
// ✅ Funciona en navegadores diferentes (Chrome, Firefox, Safari)
```

---

**Status:** ✅ Completo
**Última actualización:** Oct 23, 2024
**Próxima revisión:** Cuando encuentres otro hook extraño
