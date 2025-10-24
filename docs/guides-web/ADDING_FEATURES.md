# Guía: Agregando una Nueva Feature

Paso a paso para implementar una feature completa en InmoApp.

---

## 📋 Overview

Implementar una feature en InmoApp involucra estos pasos:

```
1. Planificar      ← Entender qué vas a hacer
2. Diseñar         ← Cómo encaja en la arquitectura
3. Backend         ← Database, Server Actions, Validations
4. Frontend        ← Components, Hooks, UI
5. Testing         ← Manual testing
6. Documentación   ← Actualizar docs
7. Commit          ← Git commit con descripción
```

**Tiempo estimado:** 2-4 horas para feature pequeña

---

## 1️⃣ Planificación

### Responde estas preguntas:

**¿Qué es la feature?**
```
Ejemplo: "Agregar búsqueda de propiedades por texto"
```

**¿Quién la necesita?**
```
Ejemplo: "Usuarios que quieren encontrar propiedades sin scroll"
```

**¿Cómo funciona?**
```
Ejemplo: "Input de búsqueda → filtra properties por título"
```

**¿Afecta a qué componentes?**
```
Ejemplo: "MapView, MapContainer, MapFilters (a crear)"
```

**¿Hay dependencias?**
```
Ejemplo: "Requiere backend filtering (ya existe)"
```

### Crear un ticket

Documenta en un comment o issue:
```markdown
## Búsqueda de Propiedades

### Descripción
Agregar campo de búsqueda que filtre properties por texto.

### Criterios de Aceptación
- [ ] Campo de búsqueda visible en navbar
- [ ] Filtra properties mientras escribes
- [ ] Debounce de 300ms para no spamear requests
- [ ] Clear button para limpiar búsqueda

### Mockups
[Adjuntar screenshot]

### Tareas
- [ ] Backend: Agregar text search a repositorio
- [ ] Frontend: Crear SearchInput component
- [ ] Integración: Conectar input con backend
- [ ] Testing: Verificar que funciona
```

---

## 2️⃣ Diseño Arquitectónico

### Entender la arquitectura actual

Revisa [Architecture.md](../ARCHITECTURE.md):
- ¿Es Server Component o Client Component?
- ¿Necesito Server Action?
- ¿Necesito cambios en la base de datos?

### Data Flow para Search

```
SearchInput (Client)
  ↓ onChange
[Debounce 300ms]
  ↓
router.push('/mapa?search=...')
  ↓
MapPage (Server Component)
  ↓
searchParams.search
  ↓
getCachedPropertiesBySearch(search)
  ↓
Prisma.property.findMany({ where: { title: { contains: search } } })
  ↓
MapView re-renderiza con nuevas properties
```

### Dibujar el componente tree

```
MapPage (Server)
  ├── Fetch properties filtered by search
  └── <MapView> (Client)
       ├── <SearchInput />  ← NUEVO
       └── <MapContainer>
```

---

## 3️⃣ Backend

### 3.1 Database (si es necesario)

**Pregunta:** ¿Necesito nuevos campos o tablas?

Para búsqueda de propiedades por texto:
```prisma
// ❌ NO necesario: Property ya tiene 'title' y 'description'
model Property {
  id          String
  title       String  ← YA EXISTE
  description String  ← YA EXISTE
}
```

Si necesitas:
```prisma
// Editar: packages/database/prisma/schema.prisma
model Property {
  id       String
  title    String
  +fullText String? // Para búsqueda full-text (opcional)
}
```

Luego:
```bash
bunx prisma migration dev --name "add-full-text-search"
```

### 3.2 Repository (Server Query)

**Ubicación:** `packages/database/repositories/`

```typescript
// repositories/property.ts
import { db } from '@/prisma'

export async function getPropertiesBySearch({
  search,
  minLatitude,
  maxLatitude,
  minLongitude,
  maxLongitude,
}) {
  return await db.property.findMany({
    where: {
      AND: [
        // Búsqueda por texto
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
        // Bounds (spatial filter)
        {
          latitude: { gte: minLatitude, lte: maxLatitude },
          longitude: { gte: minLongitude, lte: maxLongitude },
        },
      ],
    },
    take: 1000, // Limit
  });
}

// Usar React.cache() para deduplicación
export const getCachedPropertiesBySearch = React.cache(getPropertiesBySearch);
```

### 3.3 Validaciones (Zod)

**Ubicación:** `app/lib/validations/`

```typescript
// search.ts
import { z } from 'zod'

export const searchParamsSchema = z.object({
  search: z.string().max(100).optional(),
  ne_lat: z.coerce.number().optional(),
  ne_lng: z.coerce.number().optional(),
  sw_lat: z.coerce.number().optional(),
  sw_lng: z.coerce.number().optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
```

---

## 4️⃣ Frontend

### 4.1 Crear Component

**Ubicación:** `components/map/`

```typescript
// search-input.tsx
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface SearchInputProps {
  initialValue?: string
}

export function SearchInput({ initialValue = '' }: SearchInputProps) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)

  // Debounce búsqueda
  const debouncedSearch = useDebounce(value, 300)

  useEffect(() => {
    // Obtener bounds actuales de URL
    const params = new URLSearchParams(window.location.search)

    // Actualizar búsqueda
    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }

    router.push(`/mapa?${params.toString()}`)
  }, [debouncedSearch, router])

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar propiedades..."
        className="flex-1 px-3 py-2 rounded border border-border bg-background"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="px-3 py-2 text-sm font-medium"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}
```

### 4.2 Integrar en MapPage

**Ubicación:** `app/(public)/mapa/page.tsx`

```typescript
export default async function MapPage(props: MapPageProps) {
  const searchParams = await props.searchParams

  // ✅ Parsear búsqueda
  const search = searchParams.search as string | undefined
  const bounds = parseBoundsParams(searchParams, defaultViewport)

  // ✅ Fetch con búsqueda
  const properties = await getCachedPropertiesBySearch({
    search,
    minLatitude: bounds.sw_lat,
    maxLatitude: bounds.ne_lat,
    minLongitude: bounds.sw_lng,
    maxLongitude: bounds.ne_lng,
  })

  const viewport = boundsToViewport(bounds)

  return (
    <MapView
      properties={properties}
      initialViewport={viewport}
      initialSearch={search}  // ← PASAR aquí
    />
  )
}
```

### 4.3 Integrar en MapView

**Ubicación:** `components/map/map-view.tsx`

```typescript
'use client'

interface MapViewProps {
  properties: MapProperty[]
  initialViewport: Viewport
  initialSearch?: string  // ← NUEVO
}

export function MapView({
  properties,
  initialViewport,
  initialSearch,
}: MapViewProps) {
  return (
    <>
      <SearchInput initialValue={initialSearch} />  {/* ← NUEVO */}
      <MapContainer {...} />
    </>
  )
}
```

---

## 5️⃣ Testing Manual

### Checklist

- [ ] Component renderiza sin errores
- [ ] Typing en SearchInput actualiza valor
- [ ] 300ms debounce funciona (espera antes de buscar)
- [ ] URL cambia cuando escribes
- [ ] Properties se filtran correctamente
- [ ] Clear button funciona
- [ ] Funciona con bounds también (búsqueda + location)
- [ ] Dark mode se ve bien
- [ ] Mobile responsive
- [ ] Performance es bueno

### Testing Steps

```
1. Abre DevTools → Console (para ver errores)
2. Abre /mapa
3. Escribe "casa" en SearchInput
4. Espera 300ms
5. Verifica que:
   - URL cambió a /mapa?search=casa
   - Properties se filtraron
   - No hay errores en console
6. Escribe más: "casa grande"
7. Verifica que se re-filtra
8. Click "Limpiar"
9. Verifica que search se borra
```

---

## 6️⃣ Documentación

### Actualizar docs

1. **Actualizar [MAP.md](../features/MAP.md)**
```markdown
### 6. Property Search
✅ **Status:** Completado

Búsqueda de properties por texto:
- Debounce 300ms
- Filtra por title y description
- Combina con location filtering
```

2. **Crear decision record si es necesario**
```
docs/decisions/SEARCH_IMPLEMENTATION.md
- Por qué usamos debounce
- Por qué server-side filtering
```

3. **Actualizar README.md**
```
docs/README.md
- Agregar link en Features → Search
```

---

## 7️⃣ Git Commit

### Estructura de commit

```bash
git add .
git commit -m "feat(map): add property search with text filtering

- Add SearchInput component with 300ms debounce
- Implement server-side text search in getCachedPropertiesBySearch
- Add search params validation with Zod
- Integrate search with map bounds filtering
- Mobile responsive implementation

Fixes: #123 (si hay ticket relacionado)"
```

### Conventional Commits

```
feat(scope):    Nueva feature
fix(scope):     Fix de bug
refactor(scope): Cambios de código sin funcionalidad nueva
docs(scope):    Solo cambios de documentación
test(scope):    Solo tests
chore(scope):   Dependencies, build setup
```

---

## 📋 Template Rápido

Para no olvidar nada:

```markdown
## Feature: [Nombre]

### Planning
- [ ] Definir qué, cómo, quién
- [ ] Dibujar data flow
- [ ] Identificar cambios necesarios

### Backend
- [ ] Cambios a schema.prisma (si necesario)
- [ ] Crear/modificar repository
- [ ] Agregar validaciones Zod

### Frontend
- [ ] Crear componentes necesarios
- [ ] Conectar con server
- [ ] Integrar en page.tsx

### Testing
- [ ] Testing manual completado
- [ ] Error checking (console limpia)
- [ ] Dark mode tested
- [ ] Mobile responsive

### Documentation
- [ ] Actualizar feature docs
- [ ] Agregar decision record si necesario
- [ ] Actualizar README

### Commit
- [ ] Staging de archivos
- [ ] Mensaje de commit descriptivo
- [ ] type-check pasado
```

---

## 🚨 Errores Comunes

### Error 1: "Component 'X' is not exported"
```
Causa: Olvidaste hacer export en el archivo
Solución: Agrega export antes del component
```

### Error 2: Server Action no funciona
```
Causa: Olvidaste 'use server' al inicio
Solución: Agrega 'use server' en la action
```

### Error 3: searchParams no actualiza
```
Causa: No usaste router.push/replace con nuevos params
Solución: Asegúrate que router.push() se ejecuta
```

### Error 4: Infinite loop en useEffect
```
Causa: router o variables en dependencias
Solución: Usa ref para trackear last state
```

### Error 5: Type errors después de cambios
```
Causa: TS no pasó type-check
Solución: bun run type-check y arregla errores
```

---

## 📚 Recursos

- **[Architecture](../ARCHITECTURE.md)** - Entender cómo funciona todo
- **[Database](../technical/DATABASE.md)** - Cómo agregar modelos
- **[Validations](../technical/HOOKS.md)** - Patterns de validación
- **[Common Tasks](./COMMON_TASKS.md)** - Tasks repetitivas

---

## 🎓 Ejemplo Completo: Agregar Filtro de Precio

### 1. Planning
```
Feature: Price range filter
User: Quiero ver solo propiedades entre $100k-$500k
Data flow: URL params (minPrice, maxPrice) → Server filter
```

### 2. Backend
```typescript
// repositories/property.ts
export async function getPropertiesByPriceRange({
  minPrice,
  maxPrice,
  ...bounds
}) {
  return await db.property.findMany({
    where: {
      AND: [
        { price: { gte: minPrice, lte: maxPrice } },
        // bounds...
      ],
    },
  });
}

// Exportar cached version
export const getCachedPropertiesByPriceRange = React.cache(getPropertiesByPriceRange);
```

### 3. Frontend
```typescript
// components/map/price-filter.tsx
'use client'

export function PriceFilter({ initialMin = 0, initialMax = 1000000 }) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  const debouncedMin = useDebounce(min, 300);
  const debouncedMax = useDebounce(max, 300);

  useEffect(() => {
    // Update URL with price params
    const params = new URLSearchParams(window.location.search);
    params.set('minPrice', debouncedMin.toString());
    params.set('maxPrice', debouncedMax.toString());
    router.push(`/mapa?${params.toString()}`);
  }, [debouncedMin, debouncedMax, router]);

  return (
    <div className="flex gap-4">
      <input
        type="number"
        value={min}
        onChange={(e) => setMin(Number(e.target.value))}
        placeholder="Min price"
      />
      <input
        type="number"
        value={max}
        onChange={(e) => setMax(Number(e.target.value))}
        placeholder="Max price"
      />
    </div>
  );
}
```

### 4. Integration
```typescript
// app/(public)/mapa/page.tsx
const { minPrice, maxPrice } = searchParams;
const properties = await getCachedPropertiesByPriceRange({
  minPrice: Number(minPrice) || 0,
  maxPrice: Number(maxPrice) || 1000000,
  ...bounds,
});
```

### 5. Testing
```
✅ Mover slider min → properties se filtran
✅ Mover slider max → properties se filtran
✅ Combo min+max → funciona
✅ URL tiene minPrice, maxPrice params
✅ Refresh → mantiene valores de URL
```

---

## 🎯 Resumen

Agregar feature en InmoApp es un proceso sistemático:

1. **Plan** bien antes de código
2. **Backend** primero (data es King)
3. **Frontend** después (consume el backend)
4. **Test** manualmente todo
5. **Document** para el futuro
6. **Commit** con descripción clara

**Pro tip:** Usa este template para TODA feature, no importa el tamaño.

---

**Última actualización:** 2025-10-24
**Mantenedor:** InmoApp Engineering Team
