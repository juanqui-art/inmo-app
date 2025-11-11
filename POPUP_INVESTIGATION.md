# INVESTIGACIÓN: Sistema de Popup/Modal de Propiedades en el Mapa

## RESUMEN EJECUTIVO

El popup del mapa está implementado con una **arquitectura en cascada de múltiples capas**:

1. **Capa de Estado**: `map-view.tsx` - controla si popup está abierto/cerrado
2. **Capa de Renderizado**: `map-view.tsx` - renderiza el Popup de react-map-gl
3. **Capa de Contenido**: `property-card-horizontal.tsx` - contiene la lógica de interactividad

**BUG IDENTIFICADO**: El click en la imagen NO está protegido contra propagación de eventos, lo que puede afectar la experiencia del usuario.

---

## 1. COMPONENTE PRINCIPAL: MapView

**Archivo**: `/Users/juanquizhpi/Desktop/projects/inmo-app/apps/web/components/map/map-view.tsx`

### 1.1 Estado del Popup

```typescript
// Línea 56-59
const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
```

**Control**:
- `selectedProperty` = estado booleano que controla visibilidad del popup
- `null` = popup cerrado
- `MapProperty` object = popup abierto

### 1.2 Handler de Click en Markers

```typescript
// Línea 75-113
const handleClick = useCallback(
  (event: MapMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) return;

    // ¿Cluster o propiedad individual?
    if (feature.properties?.cluster) {
      // Zoom al cluster
      ...
    }
    // Propiedad individual - ABRE EL POPUP
    else if (feature.properties?.id) {
      const property = properties.find(
        (p) => p.id === (feature.properties!.id as string),
      );
      if (property) {
        setSelectedProperty(property);  // ← AQUÍ SE ABRE EL POPUP
      }
    }
  },
  [properties],
);
```

**Ubicación del evento**: Línea 76-113
**Disparador**: Click en marker en el mapa
**Acción**: Busca la propiedad en el array y la guarda en `selectedProperty`

### 1.3 Renderizado del Popup

```typescript
// Línea 264-304
{selectedProperty?.latitude && selectedProperty.longitude && (
  <Popup
    latitude={selectedProperty.latitude}
    longitude={selectedProperty.longitude}
    onClose={() => setSelectedProperty(null)}     // ← CIERRE POR EVENTO
    closeButton={true}
    closeOnClick={true}                           // ← CIERRE POR CLICK FUERA
    className="mapbox-popup-content"
    ...
  >
    <div className="relative">
      {/* Close button overlay */}
      <button
        type="button"
        onClick={() => setSelectedProperty(null)} // ← CIERRE POR BOTÓN X
        ...
      >
        ...
      </button>
      <PropertyCardHorizontal property={selectedProperty} />
    </div>
  </Popup>
)}
```

**Formas de cerrar el popup**:
1. **Línea 269**: `onClose` callback del Popup
2. **Línea 271**: `closeOnClick={true}` - click fuera del popup
3. **Línea 282**: Botón X manual

---

## 2. COMPONENTE DE CONTENIDO: PropertyCardHorizontal

**Archivo**: `/Users/juanquizhpi/Desktop/projects/inmo-app/apps/web/components/map/property-card-horizontal.tsx`

### 2.1 Estructura del Componente

```typescript
// Línea 127
<div className="relative w-full min-w-[333px] max-w-[399px] h-[270px] ...">
  {/* Imagen de fondo */}
  <div className="absolute inset-0">
    <Image
      src={imageUrl}
      alt={property.title}
      fill
      className="w-full h-full object-cover ..."
    />
    {/* Gradiente oscuro sobre imagen */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/65" />
  </div>

  {/* Contenido sobre imagen */}
  <div className="relative h-full px-2 py-3 flex flex-col justify-between">
    ...
  </div>
</div>
```

**Estructura visual**:
- **Capa 1** (atrás): Imagen de propiedad
- **Capa 2** (atrás): Gradiente oscuro (overlay)
- **Capa 3** (adelante): Contenido (badges, botones, texto)

### 2.2 Handler del Botón de Favorito (Corazón)

```typescript
// Línea 113-124
const handleFavoriteClick = (e: React.MouseEvent) => {
  e.stopPropagation();  // ← STOP PROPAGATION AQUÍ

  if (!isAuthenticated && onFavoriteClick) {
    onFavoriteClick(property.id);
    return;
  }

  toggleFavorite(property.id);
};
```

**Ubicación**: Línea 163-177 (elemento que llama el handler)

```typescript
<button
  onClick={handleFavoriteClick}  // ← HANDLER CON stopPropagation
  className="w-8 h-8 rounded-full bg-white/20 ..."
>
  <Heart ... />
</button>
```

**Protección**: ✅ SÍ tiene `e.stopPropagation()` - Click en corazón NO cierra popup

### 2.3 Handler del Botón "View Details" (CTA)

```typescript
// Línea 226-237
<Link href={`/propiedades/${property.id}-${generateSlug(property.title)}`}>
  <Button
    size="sm"
    className="... hover:scale-105 ..."
  >
    View Details
    <ChevronRight className="w-3 h-3 ..." />
  </Button>
</Link>
```

**Ubicación**: Línea 226-237
**Acción**: Navega a `/propiedades/[id-slug]` (no cierra popup, la navegación lo reemplaza)
**Protección**: ✅ SÍ - usa Link (no propaga evento)

### 2.4 PROBLEMA IDENTIFICADO: Click en la Imagen

**Ubicación**: Línea 129-142

```typescript
{/* Background Image with Overlay */}
{imageUrl ? (
  <div className="absolute inset-0">
    <Image
      src={imageUrl}
      alt={property.title}
      fill
      className="w-full h-full object-cover brightness-110 transition-transform duration-700 group-hover:scale-105"
      // ← NO HAY onClick HANDLER
    />
    {/* Gradient overlays for contrast */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/65" />
  </div>
) : (
  <PropertyImageFallback title={property.title} />
)}
```

**PROBLEMA**: 
- La imagen NO tiene protección contra propagación de eventos
- Si el usuario hace click en la imagen, el evento se propaga hacia arriba
- El Popup padre tiene `closeOnClick={true}` (línea 271 en map-view.tsx)
- **RESULTADO**: Click en imagen intenta cerrar el popup

---

## 3. FLUJO DE EVENTOS

### 3.1 Flujo Normal (Sin Bug)

```
usuario.click(marker en mapa)
  ↓
handleClick() en MapView [línea 76]
  ↓
setSelectedProperty(property)
  ↓
Popup renderizado [línea 264]
  ↓
PropertyCardHorizontal montado
```

### 3.2 Flujo de Cierre de Popup

#### Opción A: Click en botón X
```
usuario.click(button X)
  ↓
onClick={() => setSelectedProperty(null)} [línea 282]
  ↓
Popup desmontado
```

#### Opción B: Click fuera del popup
```
usuario.click(afuera del popup)
  ↓
closeOnClick={true} [línea 271]
  ↓
onClose={() => setSelectedProperty(null)} [línea 269]
  ↓
Popup desmontado
```

#### Opción C: Click en imagen (BUG POTENCIAL)
```
usuario.click(en la imagen)
  ↓
evento.propagates hacia arriba
  ↓
Popup recibe evento (closeOnClick=true)
  ↓
onClose() dispara [línea 269]
  ↓
setSelectedProperty(null)
  ↓
Popup desmontado ← COMPORTAMIENTO INESPERADO
```

---

## 4. DETALLES DEL ESTADO

### 4.1 Estado Booleano

| Variable | Tipo | Línea | Descripción |
|----------|------|-------|-------------|
| `selectedProperty` | `MapProperty \| null` | 57 | Controla si popup está abierto (null = cerrado, object = abierto) |
| `isMapLoaded` | `boolean` | 56 | Controla si el mapa terminó de cargar |

### 4.2 Estado en Popup Component

```typescript
// Línea 269
onClose={() => setSelectedProperty(null)}
```

**Cuando se dispara**:
- Click fuera del popup + `closeOnClick={true}`
- Llamada manual del botón X

---

## 5. HANDLERS Y PROPAGACIÓN DE EVENTOS

### 5.1 Mapa de Handlers

| Handler | Ubicación | stopPropagation | Efecto |
|---------|-----------|-----------------|--------|
| `handleClick` | map-view.tsx:76 | N/A (es el origen) | Abre popup |
| `handleFavoriteClick` | property-card-horizontal.tsx:113 | ✅ SÍ | Previene cierre al tocar corazón |
| Botón X (Close) | map-view.tsx:282 | N/A (usa onClick directo) | Cierra popup |
| Imagen | property-card-horizontal.tsx:129 | ❌ NO | ← PROBLEMA |
| Link "Ver Detalles" | property-card-horizontal.tsx:226 | N/A (usa Link) | Navega, no propaga |

### 5.2 Análisis de Propagación

**¿Dónde se propagan los eventos?**

```
PropertyCardHorizontal
  └─ div.relative (línea 127)
       ├─ Image (línea 131) ← AQUÍ NO HAY stopPropagation
       ├─ div.gradient-overlay (línea 138) ← AQUÍ NO HAY stopPropagation
       ├─ div.content (línea 145)
       │   ├─ button.favorite ← AQUÍ SÍ HAY stopPropagation (línea 114)
       │   └─ Link.view-details ← Link previene propagación automáticamente
       └─ [evento sube a Popup padre]
           └─ closeOnClick={true} [línea 271 en map-view.tsx]
```

---

## 6. COMPONENTES RELACIONADOS

### 6.1 PropertyPopup (Alternativa no usada)

**Archivo**: `/Users/juanquizhpi/Desktop/projects/inmo-app/apps/web/components/map/property-popup.tsx`

Este componente NO se usa en el flujo actual. MapView renderiza directamente.

```typescript
// Línea 116-120
<PropertyCardHorizontal
  property={property}
  onViewDetails={onViewDetails}
  onFavoriteClick={onUnauthenticatedFavoriteClick}
/>
```

### 6.2 PropertyPopupCompact (Versión móvil)

**Archivo**: `/Users/juanquizhpi/Desktop/projects/inmo-app/apps/web/components/map/property-popup-compact.tsx`

No se usa en el flujo actual de MapView, pero está disponible como variante.

---

## 7. LÍNEAS CLAVE DE CÓDIGO

| Línea | Archivo | Descripción |
|-------|---------|-------------|
| 57-59 | map-view.tsx | **Estado del popup** `[selectedProperty, setSelectedProperty]` |
| 76-113 | map-view.tsx | **Handler de click en markers** - ABRE popup |
| 181 | map-view.tsx | **interactiveLayerIds** - define qué capas son clickeables |
| 264-304 | map-view.tsx | **Renderizado del Popup** - CIERRA en 3 formas |
| 113-124 | property-card-horizontal.tsx | **Handler de favorito** - CON stopPropagation |
| 129-142 | property-card-horizontal.tsx | **Imagen de fondo** - SIN stopPropagation |
| 163-177 | property-card-horizontal.tsx | **Botón de favorito** - Renderizado |
| 226-237 | property-card-horizontal.tsx | **Link "Ver Detalles"** - Navegación |

---

## 8. RESUMEN DE HALLAZGOS

### ✅ FUNCIONANDO CORRECTAMENTE

1. **Apertua de popup**: Click en marker abre popup sin problemas
2. **Botón de favorito**: Tiene `stopPropagation()`, no cierra popup
3. **Cierre por botón X**: Funciona correctamente
4. **Cierre por click fuera**: Funciona correctamente (closeOnClick=true)
5. **Navegación a detalles**: Link funciona correctamente

### ⚠️ ÁREA PROBLEMÁTICA IDENTIFICADA

**Click en la imagen o gradiente overlay**:
- **Ubicación**: Línea 129-142 en `property-card-horizontal.tsx`
- **Problema**: Sin protección `stopPropagation()`
- **Efecto**: El evento se propaga al Popup padre
- **Resultado**: `closeOnClick={true}` en Popup puede cerrar el modal inesperadamente

### 🔧 SOLUCIÓN

Necesitas agregar `onClick` con `e.stopPropagation()` a:
1. La imagen (`<Image>` componente)
2. El overlay de gradiente (`<div className="absolute inset-0 bg-gradient...">`)

O alternativamente:
- Cambiar `closeOnClick={true}` a `closeOnClick={false}` en MapView
- Mantener cierre manual solo por botón X y `onClose` callback

