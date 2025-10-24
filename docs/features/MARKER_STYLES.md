# Estilos de Marcadores del Mapa

> Guía completa de las variantes de marcadores de propiedades en el mapa interactivo

**Estado:** ✅ Implementado | **Última Actualización:** Octubre 24, 2025

---

## 📍 Visión General

El sistema de marcadores ofrece **3 variantes visuales** diseñadas para diferentes contextos:

| Variante | Uso | Densidad | Hover Effect |
|----------|-----|---------|--------------|
| **Dark** | Default, moderno | Normal-Alta | Scale + Glow |
| **Light** | Subtle, profesional | Normal-Alta | Border pulse |
| **Minimal** | Compacto, zoomado | Alta-Muy Alta | Scale + Shadow |

---

## 🎨 Variante Dark (Por Defecto)

**Filosofía:** Modern glassmorphism con Home icon integrado

### Características

- **Pin circular** con gradiente (azul/verde según tipo)
- **Ícono de casa** centrado en el pin
- **Badge elevado** con precio en glassmorphism oscuro
- **Triángulo pointer** que apunta hacia abajo
- **Sombra de suelo** realista
- **Hover effect:** Scale-up + glow intenso

### Colores

- **SALE:** `blue-400 → blue-600` (gradiente)
- **RENT:** `emerald-400 → emerald-600` (gradiente)

### Estructura Visual

```
     ┌──────────────┐
     │  $250K       │  ← Price Badge (glassmorphism dark)
     └──────────────┘
            ▼
        ┌─────────┐
        │  🏠    │  ← Pin (gradient + icon)
        └─────────┘
            ▼
        ▲     ▲     ← Pointer Triangle
        └─────┘
           ◉       ← Ground Shadow
```

### Código Ejemplo

```tsx
import { PropertyMarker } from "@/components/map";

export function MapComponent() {
  return (
    <PropertyMarker
      latitude={-2.9001}
      longitude={-79.0058}
      price={250000} // o string: "$250K"
      transactionType="SALE"
      variant="dark" // default, can be omitted
      onClick={() => console.log("clicked")}
    />
  );
}
```

### Ventajas

✅ **Moderno:** Glassmorphism trendy
✅ **Visible:** Se destaca en el mapa
✅ **Informativo:** Ícono comunica tipo de propiedad
✅ **Interactivo:** Feedback visual claro
✅ **Dark mode:** Optimizado para ambos temas

---

## 🎨 Variante Light

**Filosofía:** Subtle light theme con bordes de color

### Características

- **Badge redondeado** con borde de color
- **Pin pequeño** con ícono e icono redondeado
- **Borde de color** que indica tipo de transacción
- **Efecto hover:** Border pulse animado
- **Sombra suave** con blur
- **Works on any map style**

### Colores

- **SALE:** Border `blue-500`, fondo `blue-50` (light)
- **RENT:** Border `emerald-500`, fondo `emerald-50` (light)

### Estructura Visual

```
     ┌──────────────┐
     │ $250K │      │  ← Badge con border de color
     └──────────────┘
            ▼
        ┌─────────┐
        │  🏠    │  ← Pin redondeado con borde
        └─────────┘
            ▼
        ▲     ▲     ← Pointer Triangle
        └─────┘
           ◉       ← Ground Shadow
```

### Código Ejemplo

```tsx
import { PropertyMarker } from "@/components/map";

export function MapComponent() {
  return (
    <PropertyMarker
      latitude={-2.9001}
      longitude={-79.0058}
      price={250000}
      transactionType="RENT"
      variant="light" // ← Key difference
      onClick={() => console.log("clicked")}
    />
  );
}
```

### Ventajas

✅ **Sutil:** No abruma visualmente
✅ **Profesional:** Aesthetic minimalista
✅ **Accesible:** Alto contraste
✅ **Versátil:** Funciona en cualquier estilo de mapa
✅ **Clean:** Sin elementos excesivos

---

## 🎨 Variante Minimal

**Filosofía:** Compacto badge-only, perfecto para alta densidad

### Características

- **Solo badge** sin pin
- **Borde de color** que indica tipo
- **Pointer triangle** simple
- **Mínimo footprint** visual
- **Rápido rendering** para muchos marcadores
- **Hover effect:** Scale + shadow

### Colores

- **SALE:** Border y color `blue-500`
- **RENT:** Border y color `emerald-500`

### Estructura Visual

```
     ┌──────────────┐
     │    $250K    │  ← Badge (borde de color)
     └──────────────┘
            ▼
        ▲     ▲     ← Pointer Triangle
        └─────┘
           ◉       ← Ground Shadow (pequeño)
```

### Código Ejemplo

```tsx
import { PropertyMarker } from "@/components/map";

export function MapComponent() {
  return (
    <PropertyMarker
      latitude={-2.9001}
      longitude={-79.0058}
      price={250000}
      transactionType="SALE"
      variant="minimal" // ← Key difference
      onClick={() => console.log("clicked")}
    />
  );
}
```

### Ventajas

✅ **Lightweight:** Menos DOM nodes
✅ **Compacto:** Para zoom muy alto
✅ **Rápido:** Better performance en clusters grandes
✅ **Simple:** Apenas información visual
✅ **Flexible:** Puede combinarse con clusters

---

## 🎯 Cuándo Usar Cada Variante

### Dark (Por Defecto)

**Usa cuando:**
- Quieres impact visual
- La mayoría de propiedades mostradas (< 50)
- Necesitas destacar propiedades de alto valor
- Quieres feedback visual máximo

**Evita cuando:**
- Muchas propiedades en pantalla (> 100 desclustered)
- La densidad visual es crítica
- Quieres aesthetic minimalista

### Light

**Usa cuando:**
- Necesitas look profesional
- Quieres subtle aesthetic
- Las propiedades están dispersas
- El mapa base es oscuro (dark style)

**Evita cuando:**
- Necesitas máxima visibility
- Trabajas con muchos marcadores
- El mapa base es light (mucho contraste)

### Minimal

**Usa cuando:**
- Muchas propiedades en pantalla
- Zoom muy alto (ver detalles de precio)
- Performance es crítica
- Quieres minimal visual clutter
- Combinado con clustering

**Evita cuando:**
- Pocos marcadores (< 10)
- Quieres comunicar más información
- Necesitas visual feedback máximo

---

## 🎨 Cluster Markers

Los marcadores de cluster también fueron mejorados:

### Características

- **Animated pulse ring** en hover
- **Scale-up effect** para feedback
- **Ground shadow** que se expande
- **Ring offset effect** para profundidad
- **Accessibility:** role="button" + aria-label

### Código Ejemplo

```tsx
import { ClusterMarker } from "@/components/map";

export function MapComponent() {
  return (
    <ClusterMarker
      latitude={-2.9001}
      longitude={-79.0058}
      pointCount={15} // Número de propiedades
      onClick={() => handleClusterClick()}
    />
  );
}
```

---

## 🎯 API Completo

### PropertyMarker Props

```typescript
interface PropertyMarkerProps {
  latitude: number;           // Latitud (requerido)
  longitude: number;          // Longitud (requerido)
  price: number | string;     // Precio: 250000 o "$250K"
  transactionType: TransactionType; // "SALE" o "RENT"
  onClick?: () => void;       // Click handler (opcional)
  isHighlighted?: boolean;    // Estado highlight (opcional)
  variant?: PropertyMarkerVariant; // "dark" | "light" | "minimal"
}

type PropertyMarkerVariant = "dark" | "light" | "minimal";
```

### ClusterMarker Props

```typescript
interface ClusterMarkerProps {
  latitude: number;           // Latitud (requerido)
  longitude: number;          // Longitud (requerido)
  pointCount: number;         // Cantidad de propiedades
  onClick?: () => void;       // Click handler (opcional)
}
```

---

## 💡 Mejores Prácticas

### 1. **Selecciona variante según contexto**

```tsx
// Para búsqueda detallada → Dark o Light
const variant = showDetails ? "dark" : "light";

// Para vista general → Minimal
const variant = zoom < 14 ? "minimal" : "dark";
```

### 2. **Usa tipos personalizados**

```tsx
// types/map.ts
export interface PropertyMarkerData {
  id: string;
  price: number;
  transactionType: TransactionType;
  markerVariant?: PropertyMarkerVariant; // Configurable
}

// Rendering
<PropertyMarker {...property} variant={property.markerVariant} />
```

### 3. **Combina con clusters**

```tsx
// Si está agrupado → usa ClusterMarker
// Si está desclustered → usa PropertyMarker (variant: "minimal")
```

### 4. **Optimiza para performance**

```tsx
// Para muchos marcadores, usa Minimal o incluye virtualization
{properties.map(p => (
  <PropertyMarker
    key={p.id}
    {...p}
    variant={properties.length > 100 ? "minimal" : "dark"}
  />
))}
```

---

## 🎬 Animaciones

Todas las variantes incluyen:

- **Hover scale:** Crece 1.1x al pasar mouse
- **Transition smooth:** 300ms duration
- **Shadow expansion:** Sombra crece en hover
- **Color transitions:** Cambios suaves de color

Las animaciones están optimizadas para performance usando Tailwind transitions.

---

## ♿ Accesibilidad

Todas las variantes incluyen:

- ✅ `role="button"` para keyboard users
- ✅ `tabIndex={0}` para acceso con Tab
- ✅ `aria-label` con información del marcador
- ✅ Contrast ratios WCAG AA/AAA
- ✅ Hover states accesibles

---

## 🌓 Dark Mode

Todas las variantes soportan:

- ✅ Light mode (fondo blanco)
- ✅ Dark mode (fondo oscuro)
- ✅ Oslo Gray palette consistency
- ✅ Automatic color adjustment

---

## 📦 Archivos Relevantes

```
apps/web/components/map/
├── property-marker.tsx           # Wrapper principal
├── cluster-marker.tsx            # Cluster markers mejorado
└── markers/
    ├── index.ts                  # Exports
    ├── property-marker.tsx       # Wrapper de variantes
    ├── property-marker-dark.tsx  # Variante dark
    ├── property-marker-light.tsx # Variante light
    └── property-marker-minimal.tsx # Variante minimal

apps/web/lib/types/
└── map.ts                        # PropertyMarkerVariant type
```

---

## 🚀 Ejemplos Avanzados

### Cambiar variante según zoom level

```tsx
const handleZoomChange = (zoom: number) => {
  const variant = zoom > 15 ? "dark" : zoom > 13 ? "light" : "minimal";
  setMarkerVariant(variant);
};

return (
  <PropertyMarker
    {...props}
    variant={markerVariant}
  />
);
```

### Variante según precio

```tsx
const getVariant = (price: number) => {
  if (price > 500000) return "dark";     // Luxury → Bold
  if (price > 200000) return "light";    // Mid-range → Professional
  return "minimal";                      // Budget → Compact
};

return (
  <PropertyMarker
    {...props}
    variant={getVariant(price)}
  />
);
```

### Con highlighting dinámico

```tsx
const [hoveredId, setHoveredId] = useState<string | null>(null);

return (
  <PropertyMarker
    {...props}
    isHighlighted={props.id === hoveredId}
    onMouseEnter={() => setHoveredId(props.id)}
    onMouseLeave={() => setHoveredId(null)}
  />
);
```

---

## 📝 Changelog

### v1.0.0 (Oct 24, 2025)

- ✨ Agregadas 3 variantes de PropertyMarker (dark, light, minimal)
- ✨ Mejorado ClusterMarker con animaciones y efectos
- ✨ Agregada documentación completa
- ✨ Type-safe variant selection
- ✨ Backward compatible con código existente

---

## 🔗 Referencias Relacionadas

- [`/docs/design/DARK_MODE.md`](../design/DARK_MODE.md) - Tema dark
- [`/docs/design/COLOR_PALETTE.md`](../design/COLOR_PALETTE.md) - Paleta Oslo Gray
- [`/docs/features/MAP.md`](./MAP.md) - Características del mapa
- [`/docs/troubleshooting/MAP_ISSUES.md`](../troubleshooting/MAP_ISSUES.md) - Troubleshooting

---

**Última Actualización:** Octubre 24, 2025
**Autor:** Development Team
**Estado:** ✅ Production Ready
