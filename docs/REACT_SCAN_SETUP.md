# React Scan - Guía de Setup y Uso

> Performance monitoring tool para detectar y optimizar problemas de rendimiento en React

**Status:** ✅ Instalado y configurado en desarrollo

---

## Resumen Rápido

React Scan es una herramienta **zero-config** que detecta automáticamente problemas de rendimiento en tu aplicación React sin requerir cambios en el código.

### Lo que detecta:
- ❌ Renders innecesarios
- ❌ Props recreadas en cada render (callbacks, objetos, estilos)
- ❌ Componentes sin optimización `React.memo`
- ❌ Actualizaciones de contexto que causan cascadas de re-renders
- ❌ Caídas de FPS e interacciones lentas

---

## Setup Actual en Inmo App

### 1. Instalación (✅ Ya Hecho)

```bash
bun add -D react-scan
```

### 2. Configuración (✅ Ya Hecho)

#### Provider Component: `apps/web/components/react-scan-provider.tsx`

```typescript
"use client";

import { useEffect } from "react";

/**
 * React Scan Provider
 * Inicializa el monitoring de performance
 * Solo activo en desarrollo
 */
export function ReactScanProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    import("react-scan").then((module) => {
      module.scan();
    });
  }, []);

  return null;
}
```

#### Root Layout: `apps/web/app/layout.tsx`

```typescript
import { ReactScanProvider } from "@/components/react-scan-provider";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ReactScanProvider />
        {/* resto del layout */}
      </body>
    </html>
  );
}
```

---

## Cómo Usar React Scan

### 1. Acceder al Dashboard

En desarrollo (`bun run dev`), React Scan aparece automáticamente:

**Atajo de teclado:**
- **Ctrl+Shift+R** (Windows/Linux)
- **Cmd+Shift+R** (Mac)

O busca la esquina inferior derecha de la pantalla para la barra flotante de React Scan.

### 2. Interfaz Principal

La herramienta proporciona tres vistas:

#### **Ranked View** 📊
Componentes ordenados por tiempo de renderizado
```
1. PropertyCard - 245ms
2. FilterDropdown - 156ms
3. PriceHistogram - 89ms
```

#### **Overview** 📈
Desglose de tiempo:
- **React Rendering**: Tiempo gastado en cálculos de React
- **Browser Painting**: Tiempo de pintura del navegador
- **Hooks Execution**: Tiempo en efectos y hooks

#### **AI Prompts** 🤖
Resúmenes compatibles con IA para obtener sugerencias de optimización

### 3. Inspeccionar Componentes

1. Abre React Scan (Ctrl/Cmd + Shift + R)
2. Haz hover sobre cualquier componente en la página
3. Se resaltará con un contorno y mostrará información de renders

### 4. Inspector "Why Did You Render?"

Para entender por qué se renderizó un componente:

1. Selecciona un componente en React Scan
2. Verás los cambios de:
   - ✏️ Props modificadas
   - 📝 Estado actualizado
   - 🔗 Contexto cambiado

---

## Flujo de Debugging Típico

### Escenario: PropertyCard renderiza demasiado

```
1. Abrir React Scan (Cmd+Shift+R)
2. Ranked View → Ver PropertyCard en top 3
3. Click en PropertyCard
4. Inspector muestra: "props.onFavoriteClick recreada cada render"
5. Solución: Usar useCallback() para la función
```

---

## Optimizaciones Comunes Detectadas

### 1. Props Recreadas

**Problema detectado por React Scan:**
```typescript
// ❌ Recrea la función en cada render
<PropertyCard
  onFavoriteClick={() => handleFavorite(id)}
/>
```

**Solución:**
```typescript
// ✅ Función estable
const handleFavoriteClick = useCallback(
  (id) => handleFavorite(id),
  [handleFavorite]
);

<PropertyCard onFavoriteClick={handleFavoriteClick} />
```

### 2. Componentes sin Memo

**Problema:**
```typescript
// ❌ Se renderiza cada vez que padre renderiza
function PropertyCard({ data }) {
  return <div>{data.name}</div>;
}
```

**Solución:**
```typescript
// ✅ Solo renderiza si props cambian
const PropertyCard = memo(function PropertyCard({ data }) {
  return <div>{data.name}</div>;
});
```

### 3. Context Updates en Cascada

**Problema:**
```typescript
// ❌ Toda la app se actualiza
const FilterContext = createContext();
const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({});
  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
};
```

**Solución:**
```typescript
// ✅ Separar estado y setter en valores diferentes
const FilterContext = createContext();
const FilterDispatchContext = createContext();

const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({});
  const dispatchRef = useRef(setFilters);

  return (
    <FilterContext.Provider value={filters}>
      <FilterDispatchContext.Provider value={dispatchRef.current}>
        {children}
      </FilterDispatchContext.Provider>
    </FilterContext.Provider>
  );
};
```

---

## Pasos Siguientes para Optimización

### 1. Auditoría Inicial

```bash
# Ejecuta la app en desarrollo
bun run dev

# Navega a: http://localhost:3000
# Abre React Scan (Cmd/Ctrl + Shift + R)
# Nota los componentes con mayor tiempo de renderizado
```

### 2. Crear Ticket de Optimización

Cuando encuentres un problema:

```markdown
**React Scan Report**

Component: PropertyCard
Issues:
- Props recreadas: onFavoriteClick, onShare
- Renders innecesarios: 5 veces en 2 segundos

Estimated Impact:
- Reducción de 150ms por página
- FPS: 60 → 58 (current)

Solution:
- Usar useCallback para callbacks
- Implementar React.memo()
```

### 3. Verificar Mejoras

Después de optimizar:
1. Abre React Scan nuevamente
2. Compara el tiempo de renderizado antes/después
3. Usa la vista Overview para confirmar mejora global

---

## Modos y Configuración

### Development Only

React Scan solo está activo en `NODE_ENV !== "development"`:

```typescript
if (process.env.NODE_ENV !== "development") {
  return; // No se ejecuta en prod
}
```

✅ **Beneficio:** Sin impacto en performance de producción

### Keyboard Shortcuts

| Atajo | Acción |
|-------|--------|
| `Ctrl+Shift+R` / `Cmd+Shift+R` | Toggle React Scan |
| `?` | Mostrar ayuda |
| `ESC` | Cerrar inspector |

---

## Casos de Uso en Inmo App

### 1. Property Listing Page
Detecta renders innecesarios en PropertyCard cuando:
- Usuario scrollea la lista
- Aplica filtros
- Cambia el modo oscuro/claro

### 2. Filter Components
Identifica cascadas de updates cuando:
- Usuario interactúa con PriceFilter
- Abre/cierra FilterDropdown
- Actualiza SearchBar

### 3. Navigation
Monitorea renders de Navbar cuando:
- Usuario navega entre rutas
- Cambia el estado de autenticación
- Abre/cierra menús

---

## Troubleshooting

### React Scan no aparece

```bash
# 1. Asegúrate de estar en desarrollo
echo $NODE_ENV  # Debe ser 'development'

# 2. Reinicia dev server
bun run dev

# 3. Abre DevTools
# Cmd+Shift+R o Ctrl+Shift+R
```

### Dashboard lento mientras React Scan está activo

Normal en apps grandes. Soluciones:
1. Inspecciona solo componentes específicos
2. Cierra React Scan cuando no debuguees (Cmd+Shift+R)
3. Filtra por ruta específica si es posible

### No veo cambios después de optimizar

1. Asegúrate de guardar el archivo (⌘+S)
2. Espera Fast Refresh (HMR)
3. Cierra y reabre React Scan

---

## Recursos

- **Documentación oficial:** https://react-scan.com/
- **GitHub:** https://github.com/aidenybai/react-scan
- **Empresa:** Million Software (usada por Perplexity, Shopify, Faire)

---

## Próximos Pasos

1. ✅ Ejecutar `bun run dev`
2. ✅ Abrir http://localhost:3000
3. ✅ Presionar Cmd/Ctrl + Shift + R
4. 📊 Analizar performance en diferentes páginas
5. 🎯 Priorizar optimizaciones basadas en impacto
6. 📝 Documentar cambios en PRs

---

**Creado:** Octubre 31, 2025
**Versión:** React Scan v0.4.3
**Configuración:** Zero-config + Provider pattern
