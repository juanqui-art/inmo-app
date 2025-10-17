# Implementación de Página /mapa con Search Integrado

> Documento de planificación multi-sesión para implementar una página de exploración basada en mapa interactivo con búsqueda integrada.

**Fecha creación:** 2025-10-16
**Estado:** Planificación
**Objetivo:** Crear `/mapa` como prototipo de home enfocado en exploración geográfica

---

## Contexto

### Decisión Estratégica
Evaluando 3 opciones de header/home para InmoApp:

1. **Search-First** (actual) - Hero con barra de búsqueda prominente
2. **Exploración/Mapa** (esta implementación) - Mapa interactivo como protagonista
3. **Exclusividad/Carrusel** - Carrusel de imágenes inmersivo

### Estrategia Híbrida de Maps
- **MapBox GL** para página principal `/mapa` (interactividad, clustering, personalización)
- **Google Maps** para páginas individuales `/propiedades/[id]` (familiaridad, Street View)

### Objetivo de esta Página
Crear una experiencia de exploración visual donde:
- El mapa es el elemento principal (80-90% del viewport)
- Search integrado permite filtrar sin abandonar la vista de mapa
- Los usuarios descubren propiedades explorando geográficamente

---

## Stack Técnico

### Dependencias a Instalar
```bash
bun add react-map-gl mapbox-gl
bun add -D @types/mapbox-gl
```

### Variables de Entorno
Ya configurado en `.env.example`:
```env
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your-mapbox-token"
```

### Compatibilidad
- Next.js 15 (App Router)
- React 19
- Server Components + Client Components
- Dark mode (next-themes)

---

## Arquitectura de Componentes

### Server Component (Data Fetching)
```
apps/web/app/(public)/mapa/page.tsx
```
- Fetch propiedades con coordenadas válidas
- Serialización de Decimal fields
- Metadata SEO
- Parallel data fetching

### Client Components (Interactividad)

#### 1. MapView (Componente principal)
```
apps/web/components/map/map-view.tsx
```
**Responsabilidades:**
- Renderizar mapa MapBox GL
- Gestionar estado de viewport (center, zoom, pitch)
- Cambiar estilo según dark/light mode
- Coordinar marcadores y popups

**Props:**
```typescript
interface MapViewProps {
  properties: SerializedProperty[]
  initialCenter?: [number, number]
  initialZoom?: number
}
```

#### 2. PropertyMarker (Marcadores)
```
apps/web/components/map/property-marker.tsx
```
**Responsabilidades:**
- Renderizar marcador custom por propiedad
- Mostrar precio en el marcador
- Estados: default, hover, selected
- Click handler para abrir popup

**Diseño:**
- Marker con precio (glassmorphism)
- Color según transactionType (SALE: azul, RENT: verde)
- Clustering para múltiples propiedades cercanas

#### 3. PropertyPopup (Información)
```
apps/web/components/map/property-popup.tsx
```
**Responsabilidades:**
- Card compacto con info de propiedad
- Imagen principal
- Precio, ubicación, features
- Botón "Ver detalles" → `/propiedades/[id]`

**Diseño:**
- Width: 300px
- PropertyCard adaptado (versión compacta)
- Close button

#### 4. MapSearchBar (Búsqueda Integrada)
```
apps/web/components/map/map-search-bar.tsx
```
**Responsabilidades:**
- Input de búsqueda (ciudad, barrio, dirección)
- Filtros rápidos (tipo, precio, habitaciones)
- Sugerencias con autocomplete
- Aplicar filtros sin recargar página

**Diseño:**
- Floating sobre el mapa (top-left o top-center)
- Glassmorphism backdrop
- Expandible/colapsable en mobile

#### 5. MapControls (Navegación)
```
apps/web/components/map/map-controls.tsx
```
**Responsabilidades:**
- Zoom in/out buttons
- Reset to initial view
- Toggle 3D buildings (pitch)
- Geolocation (centrar en ubicación del usuario)

**Diseño:**
- Floating bottom-right
- Vertical stack de botones
- Iconos de lucide-react

#### 6. MapSidebar (Panel Lateral - Opcional)
```
apps/web/components/map/map-sidebar.tsx
```
**Responsabilidades:**
- Lista de propiedades visibles en viewport
- Scroll sincronizado con mapa
- Filtros avanzados expandidos

**Diseño:**
- Desktop: Panel lateral 30% width
- Mobile: Bottom sheet deslizable
- PropertyCard en modo lista

---

## Layout y Diseño

### Desktop (>1024px)
```
┌─────────────────────────────────────────┐
│ Header (transparent, floating)           │
├────────────┬────────────────────────────┤
│            │                             │
│  Sidebar   │         Map View            │
│  (30%)     │          (70%)              │
│            │                             │
│  - Search  │  - Markers                  │
│  - Filters │  - Popups                   │
│  - List    │  - Controls                 │
│            │                             │
└────────────┴────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────────────────────────────┐
│ Header (transparent)                     │
├─────────────────────────────────────────┤
│                                          │
│         Map View (100%)                  │
│                                          │
│         - Floating Search                │
│         - Markers                        │
│         - Controls                       │
│                                          │
├─────────────────────────────────────────┤
│ Bottom Sheet (deslizable)                │
│ - Swipe up para ver lista                │
│ - PropertyCards compactos                │
└─────────────────────────────────────────┘
```

---

## Funcionalidades

### Fase 1: MVP (Primera sesión) ✅ COMPLETADA
- [x] Investigación y planificación
- [x] Instalar dependencias MapBox
- [x] Crear page.tsx con data de prueba (mock)
- [x] MapView básico funcional
- [x] Configurar estilos light/dark
- [x] PropertyMarker con glassmorphism
- [x] Click en marker → console.log
- [x] Ajuste de altura para navbar (h-[calc(100vh-64px)])
- [x] 5 marcadores de prueba en Cuenca

### Fase 2: Interactividad (Segunda sesión) - PARCIALMENTE COMPLETADA
- [x] PropertyMarker funcional con precio
- [x] Color coding por tipo (SALE: azul, RENT: verde)
- [x] Hover states en markers
- [ ] PropertyPopup funcional
- [ ] MapSearchBar con input básico
- [ ] Filtros por tipo de transacción
- [ ] MapControls (geolocation, reset view)

### Fase 3: Search Avanzado (Tercera sesión)
- [ ] Autocomplete de ciudades
- [ ] Filtros de precio (range slider)
- [ ] Filtros de habitaciones/baños
- [ ] Búsqueda en tiempo real (debounced)
- [ ] Actualizar markers según filtros

### Fase 4: Optimizaciones (Cuarta sesión)
- [ ] Clustering de marcadores cercanos
- [ ] Lazy loading de PropertyCards en sidebar
- [ ] Bounds automático (fit all markers)
- [ ] Geolocation (centrar en usuario)
- [ ] Guardar filtros en URL (query params)

### Fase 5: Mobile & Polish (Quinta sesión)
- [ ] Bottom sheet deslizable (mobile)
- [ ] Gestos táctiles optimizados
- [ ] Loading states
- [ ] Error boundaries
- [ ] Animaciones con GSAP

---

## Estructura de Datos

### Repository Query
```typescript
// packages/database/src/repositories/properties.ts
async listWithCoordinates() {
  return db.property.findMany({
    where: {
      status: 'AVAILABLE',
      latitude: { not: null },
      longitude: { not: null },
    },
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1, // Solo primera imagen para performance
      },
      agent: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  })
}
```

### Type Definitions
```typescript
// apps/web/lib/types/map.ts
export interface MapViewport {
  latitude: number
  longitude: number
  zoom: number
  pitch?: number
  bearing?: number
}

export interface PropertyMarkerData {
  id: string
  latitude: number
  longitude: number
  price: number
  transactionType: TransactionType
  category: PropertyCategory
  title: string
  imageUrl?: string
}

export interface MapFilters {
  transactionType?: TransactionType[]
  category?: PropertyCategory[]
  priceMin?: number
  priceMax?: number
  bedrooms?: number
  bathrooms?: number
  search?: string
}
```

---

## Estilos de Mapa

### Light Mode
```typescript
const MAPBOX_STYLE_LIGHT = 'mapbox://styles/mapbox/light-v11'
// Alternativas:
// - 'mapbox://styles/mapbox/streets-v12'
// - Custom style desde Mapbox Studio
```

### Dark Mode
```typescript
const MAPBOX_STYLE_DARK = 'mapbox://styles/mapbox/dark-v11'
// Alternativas:
// - 'mapbox://styles/mapbox/navigation-night-v1'
// - Custom style con Oslo Gray palette
```

### Custom Marker Style
```css
.property-marker {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid var(--marker-color);
  border-radius: 20px;
  padding: 6px 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.2s;
}

.property-marker:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.property-marker.sale {
  --marker-color: #3b82f6; /* blue-500 */
}

.property-marker.rent {
  --marker-color: #10b981; /* green-500 */
}
```

---

## Consideraciones Técnicas

### Performance
1. **Clustering**: Agrupar marcadores cuando hay >50 propiedades cercanas
2. **Viewport Filtering**: Solo renderizar propiedades en bounds actuales
3. **Image Optimization**: Next.js Image para thumbnails
4. **Debouncing**: Search input con 300ms delay

### Accesibilidad
1. **Keyboard Navigation**: Tab entre marcadores, Enter para abrir popup
2. **Screen Readers**: Aria labels en controles
3. **Focus Visible**: Outline en elementos focuseados
4. **Reduced Motion**: Respetar prefers-reduced-motion

### SEO
1. **Server-Side Rendering**: Initial data desde servidor
2. **Metadata**: Title, description, OG image
3. **Structured Data**: Schema.org para propiedades
4. **Sitemap**: Incluir /mapa en sitemap.xml

### Error Handling
1. **MapBox Token Invalid**: Mostrar mensaje de error
2. **No Properties**: Empty state con CTA
3. **Geolocation Denied**: Fallback a coordenadas por defecto
4. **Network Error**: Retry button

---

## Configuración Inicial

### Centro del Mapa (Ecuador)
```typescript
const ECUADOR_CENTER: [number, number] = [-78.4678, -0.1807] // Quito
const AZUAY_CENTER: [number, number] = [-79.0058, -2.9001] // Cuenca
const DEFAULT_ZOOM = 12
```

### Bounds Sugeridos
```typescript
// Azuay y Cañar (según CLAUDE.md)
const BOUNDS = [
  [-79.5, -3.5], // Southwest
  [-78.5, -2.3], // Northeast
]
```

---

## Testing

### Unit Tests
```typescript
// PropertyMarker.test.tsx
describe('PropertyMarker', () => {
  it('renders price correctly', () => {})
  it('applies correct color based on transactionType', () => {})
  it('calls onClick handler', () => {})
})
```

### Integration Tests
```typescript
// MapView.test.tsx
describe('MapView', () => {
  it('renders all property markers', () => {})
  it('opens popup on marker click', () => {})
  it('filters properties by search', () => {})
})
```

### E2E Tests (Playwright)
```typescript
test('map interaction flow', async ({ page }) => {
  await page.goto('/mapa')
  await page.click('[data-testid="property-marker-1"]')
  await expect(page.locator('[data-testid="property-popup"]')).toBeVisible()
})
```

---

## Decisiones de Diseño

### ¿Por qué MapBox GL y no Google Maps?
✅ **MapBox:**
- Personalización ilimitada (estilos custom)
- Mejor performance (WebGL)
- Dark mode nativo
- Precio más económico
- 3D buildings
- Mejor para visualización de datos

❌ **Google Maps:**
- Menos personalización
- Costos más altos
- Mejor para direcciones/navegación
- Street View (útil para property detail)

### ¿Search en Sidebar o Floating?
**Decisión: Floating (desktop) + Top Bar (mobile)**

Razones:
- No bloquea vista del mapa
- Acceso inmediato sin scroll
- Patrón familiar (Airbnb, Zillow)
- Espacio para filtros expandibles

### ¿Sidebar fijo o deslizable?
**Decisión: Fijo en desktop, deslizable en mobile**

Razones:
- Desktop: Espacio suficiente para ambos
- Mobile: Maximizar mapa, sheet para detalles
- Mejor UX según device

---

## Referencia de UX (Benchmarking)

### Airbnb Map View
- Search bar floating centrado
- Markers con precio
- Hover → preview card
- Click → open details
- Filtros en top bar

### Zillow Map View
- Sidebar izquierdo con lista
- Markers agrupados (clustering)
- Draw boundary para búsqueda
- Save search button

### Redfin Map View
- Bottom panel deslizable (mobile)
- 3D view toggle
- School ratings en mapa
- Commute time filter

**Nuestra Implementación:**
Combinar lo mejor de cada uno, simplificado para MVP.

---

## Roadmap

### v1.0 - MVP (Semana 1)
- Mapa básico con marcadores
- Popup con info
- Search simple
- Filtros básicos

### v1.1 - Enhanced (Semana 2)
- Sidebar con lista
- Clustering
- Autocomplete
- URL state

### v1.2 - Advanced (Semana 3)
- Draw boundaries
- Save searches
- Compare properties
- Share map view

### v2.0 - AI Features (Futuro)
- Recomendaciones por ML
- Price predictions en mapa
- Neighborhood insights
- Commute calculator

---

## Archivos a Crear/Modificar

### Nuevos Archivos
```
apps/web/
├── app/(public)/mapa/
│   └── page.tsx
├── components/map/
│   ├── map-view.tsx
│   ├── property-marker.tsx
│   ├── property-popup.tsx
│   ├── map-search-bar.tsx
│   ├── map-controls.tsx
│   └── map-sidebar.tsx (opcional)
└── lib/
    ├── types/map.ts
    └── utils/map-helpers.ts

packages/database/src/repositories/
└── properties.ts (modificar)
```

### Modificar
```
apps/web/package.json (dependencias)
.env.example (ya tiene MAPBOX_TOKEN)
apps/web/next.config.ts (transpilePackages si es necesario)
```

---

## Próximos Pasos

### Sesión 1 ✅ COMPLETADA (2025-10-16)
- [x] Aprobar plan
- [x] Crear este documento en `.claude/research-map-page.md`
- [x] Instalar dependencias (react-map-gl@8.1.0, mapbox-gl@3.15.0)
- [x] Crear estructura básica de archivos
- [x] MapView con mapa funcional
- [x] Ajustar import correcto (`react-map-gl/mapbox`)
- [x] Configurar token en env.ts
- [x] Ajustar altura del mapa para navbar

### Sesión 2 ✅ COMPLETADA (2025-10-16)
1. [x] Implementar PropertyMarker con glassmorphism
2. [x] Crear datos de prueba (5 propiedades en Cuenca)
3. [x] Renderizar marcadores en mapa
4. [x] Color coding y hover effects

### Sesión 3 (Próxima)
1. [ ] PropertyPopup al hacer click en marcador
2. [ ] MapSearchBar flotante
3. [ ] Filtros básicos (tipo de transacción, categoría)
4. [ ] MapControls (geolocation, reset view)

### Sesión 4 (Futura)
1. [ ] Conectar con base de datos real
2. [ ] Clustering de marcadores
3. [ ] Sidebar con lista de propiedades
4. [ ] Sincronización mapa ↔ lista

---

## Notas de Implementación

### Importante
- Este documento es la fuente única de verdad para la implementación de `/mapa`
- Actualizar checkboxes según progreso
- Agregar notas de decisiones técnicas durante implementación
- Documentar problemas encontrados y soluciones

### Convenciones
- Todos los componentes de mapa en `components/map/`
- Prefijo "Map" para componentes específicos de mapa
- Client components marcados con "use client"
- Server components sin directiva (por defecto)

### Referencias
- MapBox GL JS: https://docs.mapbox.com/mapbox-gl-js/
- react-map-gl: https://visgl.github.io/react-map-gl/
- Next.js 15: https://nextjs.org/docs
- Oslo Gray Palette: Ver theme config en proyecto
