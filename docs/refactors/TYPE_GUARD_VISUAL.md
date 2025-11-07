# 🎯 Type Guard Visual Explanation

## El Problema: Tipo Ambiguo

```javascript
// En tiempo de ejecución (runtime)
filters.transactionType = ["SALE"]           // ← Array

// En tiempo de compilación (TypeScript)
filters.transactionType: T[] | T | undefined // ← Ambiguo ❌

// Cuando haces:
const current = filters.transactionType || []
                                     ↓
                      ¿Cuál es el tipo?

// TypeScript piensa:
// Caso 1: Si filters.transactionType es ["SALE"] (array)
//         → current = ["SALE"]
//         → current es T[]
//         → .includes() existe ✅

// Caso 2: Si filters.transactionType es "SALE" (single)
//         → current = "SALE"
//         → current es T
//         → .includes() NO existe ❌

// Caso 3: Si filters.transactionType es undefined
//         → current = []
//         → current es never[]
//         → .includes() existe ✅

// TypeScript no puede asumir, crea un union type:
current: T[] | T | never[]
        ↓
        ❌ UNION TYPE PROBLEM
        ❌ .includes() could not exist
```

---

## La Solución: Type Guard

### Paso a Paso

```typescript
// PASO 1: Verificar si es array
if (Array.isArray(filters.transactionType)) {
  // Dentro de este if:
  // TypeScript SABE que es array
  // Type narrowed a T[]
  return filters.transactionType;
}

// PASO 2: Si no es array, pero existe
if (filters.transactionType) {
  // TypeScript SABE que es T (single value)
  // Wrappear en array
  return [filters.transactionType];
}

// PASO 3: Si es undefined
// Retornar array vacío
return [];

// RESULTADO FINAL:
// Todas las rutas devuelven un array
// current siempre es T[]
// ✅ .includes() y .filter() funcionan
```

---

## Comparación: ANTES vs DESPUÉS

### ANTES (Con Error)

```typescript
const toggleTransactionType = useCallback(
  (type: TransactionType) => {
    // Intento directo (FALLA)
    const current = filters.transactionType || [];
    //                ^^^^^^^^ Type: T[] | T | undefined

    // ❌ ERROR DE TYPSCRIPT
    const updated = current.includes(type)
    //              ^^^^^^^^
    //              "Property 'includes' does not exist on type
    //               'SALE' | 'RENT' | never[]"
    //                       ↑
    //                  Tipos literales individuales
    //                  No son arrays, por eso no tienen .includes()

    ? current.filter((t) => t !== type)
    //        ^^^^^^
    //        ❌ ERROR: filter tampoco existe
    : [...current, type];
  },
  [filters.transactionType, updateFilters]
);
```

### DESPUÉS (Funciona)

```typescript
const toggleTransactionType = useCallback(
  (type: string) => {
    // Type guard: forzar que current sea array
    const current = Array.isArray(filters.transactionType)
      ? filters.transactionType           // ← Type: T[]
      : filters.transactionType           // ← Type: T | undefined
        ? [filters.transactionType]       // ← Wrappear a [T]
        : [];                             // ← Usar empty []

    // current type: T[] (narrowed por el ternary)

    // ✅ FUNCIONA
    const updated = current.includes(type as any)
    //              ^^^^^^^^
    //              Ahora TypeScript SABE que es array

    ? current.filter((t) => t !== type)
    //        ^^^^^^
    //        ✅ Funciona también
    : [...current, type as any];
  },
  [filters.transactionType, updateFilters]
);
```

---

## Visual: Cómo TypeScript Interpreta el Type Guard

### Entrada

```
filters.transactionType: T[] | T | undefined
```

### Procesamiento

```
┌─────────────────────────────────────────────┐
│  const current = Array.isArray(...)         │
│    ? ... (true branch)                      │
│    : ... (false branch)                     │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│  TRUE BRANCH:                               │
│  Array.isArray() retorna true               │
│  → filters.transactionType es array         │
│  → Type narrowed a T[]                      │
│  → Retorna T[]                              │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│  FALSE BRANCH:                              │
│  Array.isArray() retorna false              │
│  → filters.transactionType es NOT array     │
│  → Remaining type: T | undefined            │
│  → Ternary anidado:                         │
│    ┌─────────────────────────────────────┐  │
│    │ if (filters.transactionType)        │  │
│    │   // Type narrowed a T              │  │
│    │   → [T]                             │  │
│    │ else                                │  │
│    │   // Type narrowed a undefined      │  │
│    │   → []                              │  │
│    └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│  RESULTADO UNION:                           │
│  T[] (from TRUE) | T[] (from inner) | []   │
│       ↓
│  Se simplifica a: T[]                       │
│                                             │
│  ✅ current es definitivamente un array     │
│  ✅ .includes() existe                      │
│  ✅ .filter() existe                        │
└─────────────────────────────────────────────┘
```

---

## Analogía Real

### El Restaurante

Imagina que un restaurante recibe órdenes de comida:

```
Cliente → Mesero → Cocina → Platos
(filters.transactionType) → Cocina no sabe cuántos platos hay

❌ ANTES:
El cliente dice: "Traigo comida"
El mesero no sabe si es:
  - 1 plato (string "SALE")
  - Varios platos (string[] ["SALE", "RENT"])
  - Nada (undefined)
La cocina no sabe qué preparar → ERROR

✅ DESPUÉS:
El cliente dice: "Verifico si es un cartón (Array.isArray)"
  - Si es cartón (array), dentro hay múltiples platos
  - Si no es cartón, tomo 1 plato e lo meto en un cartón
  - Si no hay nada, uso cartón vacío
La cocina recibe SIEMPRE un cartón → FUNCIONA
```

---

## TypeScript Type Narrowing en Acción

### Ejemplo Visualizado

```typescript
// Función sencilla de type narrowing
function processValue(value: string | number | boolean) {
  // ENTRADA: ✓ string | number | boolean

  if (typeof value === "string") {
    // NARROWED: ✓ string
    console.log(value.toUpperCase());  // ✅ String method
  } else if (typeof value === "number") {
    // NARROWED: ✓ number
    console.log(value.toFixed(2));     // ✅ Number method
  } else {
    // NARROWED: ✓ boolean
    console.log(!value);               // ✅ Boolean operation
  }
}

// Aplicado a arrays:
function processArray(value: T[] | T | undefined) {
  // ENTRADA: ✓ T[] | T | undefined

  if (Array.isArray(value)) {
    // NARROWED: ✓ T[]
    return value.map(item => item);    // ✅ Array method
  } else if (value) {
    // NARROWED: ✓ T (porque undefined fue excluido)
    return [value];                    // ✅ Wrap in array
  } else {
    // NARROWED: ✓ undefined
    return [];                         // ✅ Empty array
  }
}
```

---

## Common TypeScript Type Guards

```typescript
// 1. Array check
Array.isArray(value)
// Narrows to: T[] (if true) or original type (if false)

// 2. Typeof check
typeof value === "string"
// Narrows to: string (if true) or remaining union types (if false)

// 3. Truthiness check
if (value) { }
// Narrows out: null, undefined, 0, "", false, NaN

// 4. Property check
if ("field" in object) { }
// Narrows to types that have the property

// 5. Custom type guard function
function isString(x: unknown): x is string {
  return typeof x === "string";
}
if (isString(value)) {
  // value is string here
}

// 6. Instanceof check
if (value instanceof Date) { }
// Narrows to: Date

// 7. Discriminated unions (enum-like)
if (obj.type === "A") {
  // obj has fields from TypeA
} else if (obj.type === "B") {
  // obj has fields from TypeB
}
```

---

## Por Qué Es Importante

### El Objetivo de TypeScript

TypeScript exists para:
1. **Detectar errores en tiempo de compilación** (antes de ejecutar)
2. **Proporcionar autocompletado** (intellisense)
3. **Documentar código** (tipos como documentación)

### El Type Guard Logra Todo Esto

```typescript
// ❌ SIN type guard
const current = filters.transactionType || [];
current.includes(...)  // ← TypeScript says NO (error!)
                       // ← No intellisense for .includes

// ✅ CON type guard
const current = Array.isArray(...) ? ... : ...
current.includes(...) // ← TypeScript says YES (ok!)
                      // ← Full intellisense for array methods
```

---

## Resumen

| Aspecto | ANTES | DESPUÉS |
|---------|-------|---------|
| **Tipo de current** | `T[] \| T \| never[]` | `T[]` |
| **¿.includes() existe?** | ❌ Maybe (ambiguo) | ✅ Yes (definitivo) |
| **¿.filter() existe?** | ❌ Maybe (ambiguo) | ✅ Yes (definitivo) |
| **Intellisense** | ❌ Partial (confuso) | ✅ Complete (claro) |
| **Error TypeScript** | ✅ Error claro | ❌ Sin error |
| **Runtime behavior** | ✅ Funciona igual | ✅ Funciona igual |
| **Type safety** | ❌ Low | ✅ High |

---

## Key Takeaway

**Type guards are how you tell TypeScript:**
> "Hey, I just checked that this value is definitely an array.
>  You can now use array methods on it. Trust me! 🤝"

Y TypeScript responde:
> "Ok, I trust you. Here's full intellisense for array methods.
>  And I'll catch errors if you use non-array methods." ✅
