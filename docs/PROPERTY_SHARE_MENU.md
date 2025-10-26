# PropertyShareMenu - Componente de Compartir Propiedades

## Descripción

Componente reutilizable para compartir propiedades en redes sociales. Optimizado para el mercado latinoamericano con soporte para:

- ✅ **WhatsApp** (primario)
- ✅ **Facebook**
- ✅ **TikTok**
- ✅ **Instagram**
- ✅ **Email**
- ✅ **Copiar enlace**

## Ubicación

```
apps/web/components/shared/property-share-menu.tsx
```

## Uso Básico

```tsx
import { PropertyShareMenu } from "@/components/shared/property-share-menu";

export function MyComponent({ property }) {
  return (
    <PropertyShareMenu
      propertyId={property.id}
      propertyTitle={property.title}
      propertyPrice={property.price}
      buttonClassName="w-10 h-10"
    />
  );
}
```

## Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `propertyId` | `string` | ✅ Sí | ID de la propiedad |
| `propertyTitle` | `string` | ✅ Sí | Título de la propiedad |
| `propertyPrice` | `number \| string \| Decimal` | ❌ No | Precio de la propiedad |
| `customUrl` | `string` | ❌ No | URL personalizada para compartir (por defecto usa URL actual) |
| `onShare` | `(platform: string) => void` | ❌ No | Callback para tracking/analytics |
| `buttonClassName` | `string` | ❌ No | Clases Tailwind para personalizar tamaño (default: `w-10 h-10`) |

## Ejemplos de Uso

### 1. En MapCard (Tamaño Pequeño)

```tsx
<PropertyShareMenu
  propertyId={property.id}
  propertyTitle={property.title}
  propertyPrice={property.price}
  buttonClassName="w-8 h-8"
/>
```

### 2. En Property Details (Tamaño Grande)

```tsx
<PropertyShareMenu
  propertyId={property.id}
  propertyTitle={property.title}
  propertyPrice={property.price}
  customUrl={`/propiedades/${property.id}-${slug}`}
  onShare={(platform) => {
    // Track en analytics
    console.log(`Shared on ${platform}`);
  }}
  buttonClassName="w-12 h-12"
/>
```

### 3. Con URL Personalizada

```tsx
<PropertyShareMenu
  propertyId={property.id}
  propertyTitle={property.title}
  propertyPrice={property.price}
  customUrl="https://example.com/properties/123"
  buttonClassName="w-10 h-10"
/>
```

## Características

### 🔄 Portal Rendering
El menú se renderiza usando React Portal en `document.body` para evitar problemas de stacking context y overflow.

### 📍 Posicionamiento Inteligente
El menú se posiciona automáticamente relativo al botón usando `getBoundingClientRect()`.

### 🎨 Glassmorphism Design
Interfaz moderna con efecto glassmorphism y soporte para dark mode.

### ✨ Animaciones Suaves
Transiciones y efectos de hover para mejor UX.

### 📱 Mobile-Friendly
Funciona perfectamente en dispositivos móviles.

### ⌨️ Click Outside Detection
El menú se cierra automáticamente al hacer click fuera de él.

## Mensajes de Compartir

### WhatsApp
```
¡Mira esta propiedad! 🏠

[Título]
Precio: $[Precio]

[URL]
```

### Email
```
Asunto: Mira esta propiedad: [Título]

Cuerpo:
Encontré esta propiedad que te podría interesar:

[Título]
Precio: $[Precio]

[URL]
```

### Instagram & TikTok
Copia automáticamente el enlace y muestra instrucciones.

## Estilos

El componente utiliza clases Tailwind con soporte para dark mode:

- **Botón:** `bg-white/30 backdrop-blur-md border border-white/40`
- **Menú:** `bg-white dark:bg-oslo-gray-900`
- **Iconos de red:** Colores específicos para cada plataforma

## Customización

### Cambiar Tamaño del Botón

```tsx
// Pequeño (mapa)
buttonClassName="w-8 h-8"

// Mediano (default)
buttonClassName="w-10 h-10"

// Grande (detalles)
buttonClassName="w-12 h-12"

// Extra grande
buttonClassName="w-16 h-16"
```

### Agregar Analytics

```tsx
<PropertyShareMenu
  {...props}
  onShare={(platform) => {
    // Ejemplo con Mixpanel, Segment, etc.
    analytics.track('property_shared', {
      property_id: property.id,
      platform: platform,
      title: property.title
    });
  }}
/>
```

## Integración en Rutas

### Property Card Horizontal (Map)
✅ **Implementado** en `apps/web/components/map/property-card-horizontal.tsx`

### Property Details
Para integrar en la página de detalles:

```tsx
// pages/propiedades/[slug].tsx
import { PropertyShareMenu } from "@/components/shared/property-share-menu";

export default function PropertyDetailsPage({ property }) {
  return (
    <div className="space-y-4">
      {/* Otros componentes... */}

      <PropertyShareMenu
        propertyId={property.id}
        propertyTitle={property.title}
        propertyPrice={property.price}
        buttonClassName="w-12 h-12"
      />
    </div>
  );
}
```

### Property List
Para integrar en listados:

```tsx
// components/property-list-item.tsx
import { PropertyShareMenu } from "@/components/shared/property-share-menu";

export function PropertyListItem({ property }) {
  return (
    <div className="flex justify-between items-center">
      <div>{/* Información */}</div>
      <PropertyShareMenu
        propertyId={property.id}
        propertyTitle={property.title}
        propertyPrice={property.price}
        buttonClassName="w-10 h-10"
      />
    </div>
  );
}
```

## Notas de Desarrollo

1. **Client Component:** El componente requiere `"use client"` (interactividad)
2. **Portal:** Se renderiza en el body para evitar overflow
3. **Type-safe:** Tipos TypeScript completos incluidos
4. **Responsive:** Se adapta a diferentes tamaños de pantalla
5. **Accesible:** ARIA labels y keyboard navigation

## Compatibilidad

- ✅ Next.js 16+
- ✅ React 19+
- ✅ TypeScript 5+
- ✅ Tailwind CSS 4+

## Troubleshooting

### El menú no aparece al hacer click

Verifica que:
1. El componente está dentro de un cliente (`"use client"`)
2. No hay overflow:hidden en contenedores padres
3. El z-index no está siendo sobrescrito

### Los estilos no se aplican

Asegúrate de que Tailwind CSS está configurado correctamente y que las clases dinámicas están en el archivo de configuración.

### El Portal está causando problemas

El componente usa `createPortal` para evitar issues de stacking context. Si necesitas debuggear, verifica:
1. Los estilos de posición en `getBoundingClientRect()`
2. La detección de click-outside
3. El cleanup del useEffect

---

**Última actualización:** Octubre 2024
**Autor:** Claude Code
**Estado:** ✅ Producción
