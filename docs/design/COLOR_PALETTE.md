# Paleta de Colores InmoApp

## Oslo Gray - Paleta Principal

InmoApp utiliza **Oslo Gray** como paleta neutral base, proporcionando un tono profesional con un sutil undertone azulado.

### Escala de Colores Oslo Gray

```css
/* Variables CSS */
--oslo-gray-50:   hsl(180, 3%, 94%)   /* #EFF0F0 - Casi blanco */
--oslo-gray-100:  hsl(204, 7%, 86%)   /* #D6DBDF - Gris muy claro */
--oslo-gray-200:  hsl(202, 6%, 75%)   /* #B8C1C7 - Gris claro */
--oslo-gray-300:  hsl(197, 4%, 65%)   /* #9BA5AC - Gris medio-claro */
--oslo-gray-400:  hsl(200, 3%, 55%)   /* #868D92 - Gris medio */
--oslo-gray-500:  hsl(204, 2%, 48%)   /* #797F84 - Gris medio-oscuro */
--oslo-gray-600:  hsl(210, 2%, 39%)   /* #616669 - Gris oscuro */
--oslo-gray-700:  hsl(210, 3%, 30%)   /* #494C4F - Gris muy oscuro */
--oslo-gray-800:  hsl(200, 3%, 21%)   /* #353739 - Casi negro */
--oslo-gray-900:  hsl(210, 3%, 13%)   /* #20212 - Negro suave */
--oslo-gray-1000: hsl(180, 2%, 10%)   /* #181919 - Negro profundo */
--oslo-gray-1100: hsl(180, 3%, 6%)    /* #0E0F0F - Negro absoluto */
```

---

## Uso en Tailwind CSS

### Clases de Utilidad

Usa las clases `oslo-gray-*` en cualquier lugar:

```tsx
// Texto
<p className="text-oslo-gray-700">Texto oscuro</p>

// Background
<div className="bg-oslo-gray-100">Fondo claro</div>

// Bordes
<button className="border-oslo-gray-300">Botón con borde</button>

// Con opacidad
<div className="bg-oslo-gray-900/50">Fondo semi-transparente</div>
```

---

## Variables Semánticas

El sistema de diseño mapea automáticamente Oslo Gray a variables semánticas:

### Light Mode
```css
--background:        #FFFFFF           /* Fondo blanco puro */
--foreground:        oslo-gray-1100    /* Texto principal */
--muted:             oslo-gray-100     /* Fondos suaves */
--muted-foreground:  oslo-gray-500     /* Texto secundario */
--border:            oslo-gray-300     /* Bordes */
--input:             oslo-gray-300     /* Inputs */
--ring:              oslo-gray-900     /* Focus rings */
```

### Dark Mode
```css
--background:        oslo-gray-1100    /* Fondo negro */
--foreground:        oslo-gray-50      /* Texto principal */
--muted:             oslo-gray-900     /* Fondos suaves */
--muted-foreground:  oslo-gray-400     /* Texto secundario */
--border:            oslo-gray-800     /* Bordes */
--input:             oslo-gray-800     /* Inputs */
```

---

## Guía de Uso

### Jerarquía Visual

**Texto:**
- Primary: `oslo-gray-1100` (light) / `oslo-gray-50` (dark)
- Secondary: `oslo-gray-700` / `oslo-gray-400`
- Tertiary: `oslo-gray-500` / `oslo-gray-500`
- Disabled: `oslo-gray-400` / `oslo-gray-600`

**Backgrounds:**
- Primary: `white` / `oslo-gray-1100`
- Secondary: `oslo-gray-50` / `oslo-gray-1000`
- Elevated: `oslo-gray-100` / `oslo-gray-900`
- Hover: `oslo-gray-100` / `oslo-gray-800`

**Bordes:**
- Default: `oslo-gray-300` / `oslo-gray-800`
- Strong: `oslo-gray-400` / `oslo-gray-700`
- Subtle: `oslo-gray-200` / `oslo-gray-900`

---

## Colores Complementarios

### Acciones y Estados

**Primary (Indigo):** `indigo-500`, `indigo-600` para CTAs y acciones principales
- Valores: hsl(239, 84%, 67%) / hsl(243, 75%, 59%)
- Dark mode: indigo-500
- Light mode: indigo-600
- Uso: Botones primarios, links principales, acciones críticas

**Success:** `green-600` para confirmaciones y éxito

**Error/Destructive:** Mantener configuración existente para errores

**Warning:** `yellow-600` para advertencias

---

## Paleta Indigo Completa

Indigo es ahora la paleta de colores primaria para acciones:

```css
--indigo-50:   226 100% 97%;   /* #E0E7FF */
--indigo-100:  226 100% 94%;   /* #C7D2FE */
--indigo-200:  226 96% 89%;    /* #A5B4FC */
--indigo-300:  226 94% 82%;    /* #818CF8 */
--indigo-400:  226 91% 73%;    /* #6366F1 */
--indigo-500:  239 84% 67%;    /* #4F46E5 - Primary (Dark Mode) */
--indigo-600:  243 75% 59%;    /* #4338CA - Primary (Light Mode) */
--indigo-700:  244 58% 51%;    /* #3730A3 */
--indigo-800:  243 54% 41%;    /* #312E81 */
--indigo-900:  242 47% 34%;    /* #1E1B4B */
```

---

## Ejemplos de Componentes

### Card
```tsx
<div className="bg-white dark:bg-oslo-gray-1000 border border-oslo-gray-300 dark:border-oslo-gray-800">
  <h3 className="text-oslo-gray-1100 dark:text-oslo-gray-50">Título</h3>
  <p className="text-oslo-gray-700 dark:text-oslo-gray-400">Descripción</p>
</div>
```

### Button (Secondary)
```tsx
<button className="bg-oslo-gray-100 hover:bg-oslo-gray-200 text-oslo-gray-900">
  Botón Secundario
</button>
```

### Input
```tsx
<input className="border-oslo-gray-300 dark:border-oslo-gray-800 bg-white dark:bg-oslo-gray-1000" />
```

---

## Ventajas de Oslo Gray

✅ **Profesional:** Tono frío y sofisticado
✅ **Accesible:** Buenos ratios de contraste para WCAG AA
✅ **Consistente:** 11 tonos para máxima granularidad
✅ **Moderno:** Sutil undertone azulado
✅ **Versátil:** Funciona en light y dark mode

---

## Migración desde Gray Default

Si encuentras componentes con `gray-*`, puedes:

**Opción 1:** Usar variables semánticas (recomendado)
```tsx
// Antes
<div className="bg-gray-100">

// Después (usa variable semántica)
<div className="bg-muted">
```

**Opción 2:** Reemplazar directamente
```tsx
// Antes
<div className="text-gray-700">

// Después
<div className="text-oslo-gray-700">
```

---

## Referencia Rápida

| Uso | Light Mode | Dark Mode |
|-----|------------|-----------|
| Texto principal | `oslo-gray-1100` | `oslo-gray-50` |
| Texto secundario | `oslo-gray-700` | `oslo-gray-400` |
| Fondo primario | `white` | `oslo-gray-1100` |
| Fondo secundario | `oslo-gray-50` | `oslo-gray-1000` |
| Fondo hover | `oslo-gray-100` | `oslo-gray-900` |
| Bordes | `oslo-gray-300` | `oslo-gray-800` |

---

**Generado por:** Kigen.design
**Implementado en:** `apps/web/app/globals.css`
