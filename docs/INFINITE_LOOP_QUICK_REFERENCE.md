# Infinite Loop - Quick Reference Card

**Imprime esto o guárdalo en favoritos**

---

## 🔴 Síntomas Inmediatos

```
Terminal:  "SELECT...", "SELECT...", "SELECT..." (sin parar)
Browser:   Lag, freezing, slow performance
DevTools:  Renders cada 16ms (60fps full)
Memory:    Crece constantemente
```

---

## 🔍 3 Diagnosticos Rápidos (pick uno)

### Opción 1: Console Logging (30 seg)
```typescript
useEffect(() => {
  console.count('🔄 EFFECT RUNNING');
  // Si ves 100+ en < 1 segundo = LOOP
}, [deps]);
```

### Opción 2: Performance Monitor (30 seg)
```
Chrome DevTools > Performance > Record > (trigger action)
¿Ves renders cada 16ms? = LOOP
```

### Opción 3: React Profiler (1 min)
```
DevTools > Profiler > Record > (trigger action)
¿Componente re-renderiza sin parar? = LOOP
```

---

## 🚀 El 80% de los Casos

**La mayoría de infinite loops son por:**

```typescript
// ❌ COMÚN: Hook en dependencias que se actualiza por el effect
useEffect(() => {
  router.replace(newUrl); // ← router.replace() causa URL cambio
}, [searchParams]); // ← searchParams cambia por URL
// → searchParams en dependencias → effect corre de nuevo → LOOP

// ✅ FIX: Remover de dependencias
useEffect(() => {
  router.replace(newUrl);
}, [/* solo cosas que NO cambian por el effect */]);

// ✅ MEJOR: Usar useRef si necesitas comparar
const lastUrlRef = useRef('');
useEffect(() => {
  const newUrl = buildUrl();
  if (lastUrlRef.current !== newUrl) {
    lastUrlRef.current = newUrl;
    router.replace(newUrl);
  }
}, [/* deps que realmente importan */]);
```

---

## 📋 Checklist Rápido

### Paso 1: ¿Qué está en las dependencias?
```
✅ Listar todas las variables usadas en el effect
✅ ¿Hay hooks (useSearchParams, etc)?
✅ ¿Hay objetos/arrays/funciones nuevos cada render?
```

### Paso 2: ¿El effect actualiza sus propias dependencias?
```
❌ effect corre → router.replace() → URL cambia → searchParams cambia → effect corre
   = LOOP INFINITO

✅ effect corre → setState(valor) → componente re-renderiza → pero dep no en array
   = NORMAL
```

### Paso 3: Remover/Fijar
```
❌ useEffect(() => {...}, [searchParams, data])
   Si effect cambia data o URL → LOOP

✅ useEffect(() => {...}, [onlyThingsNotChangedByEffect])
   Más seguro, menos loops
```

---

## 💊 Las 3 Curas Principales

### Cura 1: Quitar del Array (80% de casos)
```typescript
// ❌ ANTES
useEffect(() => {
  doSomething();
}, [dependencyThatChangedByEffect]);

// ✅ DESPUÉS
useEffect(() => {
  doSomething();
}, [/* solo lo que realmente necesita disparar esto */]);
```

### Cura 2: Usar useRef
```typescript
const lastRef = useRef('');

useEffect(() => {
  const newValue = compute();
  if (lastRef.current !== newValue) {
    lastRef.current = newValue;
    doExpensiveOp();
  }
}, [/* minimales */]);
```

### Cura 3: Separar en Dos Effects
```typescript
// Effect 1: Escribir cambios internos
useEffect(() => {
  updateUrl(state);
}, [state]);

// Effect 2: Leer cambios externos
useEffect(() => {
  readUrlParams();
}, [searchParams]);
```

---

## 🔑 Golden Rules

```
REGLA 1: Dependencias = "cuándo debe correr"
         NO = "qué variables uso"

REGLA 2: Si el effect cambia una dependencia
         → Usa useRef o divide en effects

REGLA 3: Cuando dudes, mete useRef
         Mejor seguro que sorry

REGLA 4: ESLint tiene razón
         Si grita, escúchalo
```

---

## 🧪 Testing Rápido

```typescript
test('No infinite loop', () => {
  let count = 0;
  const TestComponent = () => {
    useEffect(() => {
      count++; // Contar ejecuciones
    }, [deps]);
    return null;
  };

  render(<TestComponent />);
  expect(count).toBeLessThanOrEqual(2); // Mount + 1 = OK
  // Si ves 100+ = LOOP
});
```

---

## 🎯 Ejemplo Real: Tu Caso

**El Problema:**
```typescript
// ❌ ANTES (con loop)
useEffect(() => {
  const newUrl = buildBoundsUrl(debouncedBounds);
  router.replace(newUrl);
}, [debouncedBounds, router, mounted, searchParams]);
//                                         ↑ CULPRIT
// Porque router.replace() → URL change → searchParams objeto nuevo
```

**La Solución:**
```typescript
// ✅ DESPUÉS (sin loop)
const lastUrlRef = useRef<string>("");

useEffect(() => {
  if (!mounted) return;

  const newUrl = buildBoundsUrl(debouncedBounds);

  // Solo actualizar si realmente cambió
  if (lastUrlRef.current !== newUrl) {
    lastUrlRef.current = newUrl;
    router.replace(newUrl, { scroll: false });
  }
}, [debouncedBounds, router, mounted]);
// ↑ searchParams FUERA de dependencias = SIN LOOP
```

---

## 📚 Documentación Completa

Para más detalles, ver:
- `docs/INFINITE_LOOP_DEEP_DIVE.md` - Análisis profundo
- `docs/REACT_HOOKS_ANTIPATTERNS.md` - 11 antipatterns comunes
- `docs/DEBUGGING_HOOKS_GUIDE.md` - Técnicas de debugging

---

## 🚨 Emergencia Rápida

Si todo falla y tienes 5 minutos:

```typescript
// 1. Agregar logging
useEffect(() => {
  console.count('RUNNING');
}, [deps]);

// 2. Si ves 100+, remover items de dependencias uno por uno
useEffect(() => {
  // ...
}, [
  // item1, ← Comenta
  item2,
  item3,
]);

// 3. Si el loop desaparece, item1 era el culprit
// 4. Fijar con useRef o removiendo del array

// 5. Confirmar: ¿console.count ahora muestra 1-5? ✅
```

---

## 🎓 Entenderlo Mejor

```
Un infinite loop es:

1. useEffect(() => {
     doSomething() // ← Causa cambio A
   }, [A]) // ← A cambió, effect corre de nuevo

2. Pero A cambió PORQUE el effect se ejecutó

3. Entonces siempre corre

EJEMPLO CON NÚMEROS:
- Inicio: A = 1
- Effect corre → A cambia a 2
- A en dependencias → Effect corre de nuevo
- Effect corre → A cambia a 3
- A en dependencias → Effect corre de nuevo
- ... (infinito)

SOLUCIÓN: Rastrear si A REALMENTE cambió (o removir del array)
```

---

**Status:** ✅ Ready to use
**Última actualización:** Oct 23, 2024
**¿Atorado?** Lee DEBUGGING_HOOKS_GUIDE.md
