# Guía de Diseño Dark Mode - InmoApp

## Filosofía de Diseño

InmoApp utiliza **dark mode como modo principal**, con light mode como alternativa opcional. Esto proporciona:

- ✅ **Menor fatiga visual** en sesiones largas
- ✅ **Aspecto moderno y premium** para real estate
- ✅ **Mejor contraste** para imágenes de propiedades
- ✅ **Ahorro de energía** en pantallas OLED

---

## Sistema de Colores

### Paleta Principal: Oslo Gray

```css
/* Backgrounds (Dark Mode Primary) */
--oslo-gray-1100: hsl(180, 3%, 6%)    /* Fondo principal */
--oslo-gray-1000: hsl(180, 2%, 10%)   /* Fondo elevado (cards) */
--oslo-gray-900:  hsl(210, 3%, 13%)   /* Fondo hover/active */
--oslo-gray-800:  hsl(200, 3%, 21%)   /* Bordes, inputs */

/* Text Colors (Dark Mode) */
--oslo-gray-50:   hsl(180, 3%, 94%)   /* Texto principal */
--oslo-gray-300:  hsl(197, 4%, 65%)   /* Texto secundario */
--oslo-gray-400:  hsl(200, 3%, 55%)   /* Texto terciario */
--oslo-gray-500:  hsl(204, 2%, 48%)   /* Texto disabled */
```

### Jerarquía de Colores (Dark Mode)

| Uso | Variable | Clase Tailwind | Ejemplo |
|-----|----------|----------------|---------|
| Fondo página | `--background` | `bg-background` | `#0E0F0F` |
| Card/Panel | `--card` | `bg-card` | `#181919` |
| Texto principal | `--foreground` | `text-foreground` | `#EFF0F0` |
| Texto secundario | `oslo-gray-300` | `text-oslo-gray-300` | `#9BA5AC` |
| Bordes | `--border` | `border-border` | `#353739` |

---

## Patrones de Glassmorphism

### Overlays Oscuros (sobre imágenes)

```tsx
// ✅ CORRECTO: Glassmorphism estandarizado
<div className="bg-oslo-gray-1000/95 backdrop-blur-md">

// ✅ CORRECTO: Overlay con degradado
<div className="bg-gradient-to-t from-oslo-gray-1100/90 via-oslo-gray-1100/50 to-transparent backdrop-blur-sm">

// ❌ INCORRECTO: Color hardcodeado
<div className="bg-black/80">
```

### Opacidades Recomendadas

```tsx
// Cards flotantes
bg-oslo-gray-1000/95 backdrop-blur-md

// Modals/Dropdowns
bg-oslo-gray-900/98 backdrop-blur-xl

// Navbar (sobre imágenes)
bg-oslo-gray-900/80 backdrop-blur-md

// Tooltips
bg-oslo-gray-800/90 backdrop-blur-sm

// Backdrop (fondo de modales)
bg-oslo-gray-1100/50 backdrop-blur-sm
```

---

## Componentes Comunes

### Card (Elevado)

```tsx
// Dark Mode First
<div className="bg-card border border-border rounded-lg shadow-lg">
  <h3 className="text-foreground">Título</h3>
  <p className="text-oslo-gray-300">Descripción</p>
</div>
```

### Button Primary

```tsx
<button className="bg-blue-600 hover:bg-blue-500 text-white">
  Click me
</button>
```

### Button Secondary

```tsx
<button className="bg-oslo-gray-800 hover:bg-oslo-gray-700 text-oslo-gray-50">
  Cancel
</button>
```

### Input

```tsx
<input
  className="bg-oslo-gray-1000 border border-oslo-gray-800 text-foreground
             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
/>
```

### Badge

```tsx
// Colored (status)
<span className="bg-blue-600/20 border border-blue-500/30 text-blue-400">
  Activo
</span>

// Neutral
<span className="bg-oslo-gray-800 border border-oslo-gray-700 text-oslo-gray-300">
  Draft
</span>
```

### Image Overlay (Property Cards)

```tsx
<div className="relative">
  <Image src={...} />

  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-oslo-gray-1100/90 via-oslo-gray-1100/40 to-transparent">
    <div className="absolute bottom-0 p-4">
      <h3 className="text-white font-bold">Título</h3>
      <p className="text-white/80">Info</p>
    </div>
  </div>
</div>
```

---

## Contraste y Accesibilidad

### WCAG AAA Compliance

**Texto Grande (18px+):**
- Ratio mínimo: 4.5:1
- Oslo Gray 50 sobre 1100: ✅ 15.3:1

**Texto Normal (< 18px):**
- Ratio mínimo: 7:1
- Oslo Gray 300 sobre 1100: ✅ 7.8:1

### Testing de Contraste

```bash
# Usar herramientas:
# - https://contrast-ratio.com
# - Chrome DevTools > Accessibility
# - WebAIM Contrast Checker
```

---

## Animaciones y Transiciones

### Transiciones Suaves

```tsx
// Estados hover/active
className="transition-all duration-200 ease-in-out"

// Cambio de tema
className="transition-colors duration-300"

// Backdrop/Modal
className="transition-opacity duration-200"
```

### Respeto a Preferencias

```tsx
// En CSS globals
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Patrones Anti-Pattern

### ❌ NO HACER

```tsx
// ❌ Colores hardcodeados
<div className="bg-black text-white">

// ❌ Gray estándar (usar oslo-gray)
<div className="bg-gray-900 text-gray-100">

// ❌ Solo dark mode sin light mode
<div className="bg-oslo-gray-900">

// ❌ Contraste insuficiente
<p className="text-oslo-gray-600">Texto ilegible</p>
```

### ✅ HACER

```tsx
// ✅ Variables semánticas
<div className="bg-background text-foreground">

// ✅ Oslo Gray + variantes
<div className="bg-oslo-gray-1000 text-oslo-gray-50
                dark:bg-oslo-gray-1000 dark:text-oslo-gray-50">

// ✅ Soporte completo ambos modos
<div className="bg-white dark:bg-oslo-gray-1000
                text-gray-900 dark:text-oslo-gray-50">

// ✅ Contraste adecuado
<p className="text-oslo-gray-300">Texto legible</p>
```

---

## Casos Especiales

### Homepage Hero (sobre imágenes brillantes)

```tsx
// Overlay fuerte para legibilidad
<div className="bg-oslo-gray-1100/70 backdrop-blur-lg">
  <h1 className="text-white drop-shadow-2xl">Título</h1>
</div>
```

### Modal/Dialog

```tsx
// Backdrop
<div className="fixed inset-0 bg-oslo-gray-1100/60 backdrop-blur-sm" />

// Content
<div className="bg-oslo-gray-1000 border border-oslo-gray-800 rounded-xl shadow-2xl">
  {children}
</div>
```

### Navbar (Homepage transparent)

```tsx
// Homepage: transparent inicial
<header className="fixed top-0 bg-transparent">
  <div className="text-white drop-shadow-lg">Logo</div>
</header>

// Scrolled: glassmorphism
<header className="fixed top-0 bg-oslo-gray-900/80 backdrop-blur-md">
  <div className="text-oslo-gray-50">Logo</div>
</header>
```

---

## Light Mode (Opcional)

Si necesitas light mode, usa las mismas variables semánticas:

```tsx
// El mismo componente funciona en ambos modos
<div className="bg-card text-foreground border border-border">
  <p className="text-muted-foreground">Descripción</p>
</div>

// Variables se adaptan automáticamente:
// Dark: bg-card = oslo-gray-1000
// Light: bg-card = white
```

---

## Checklist de Componente

Antes de considerar un componente "terminado":

- [ ] Usa variables semánticas o oslo-gray (NO gray-*)
- [ ] No tiene colores hardcodeados (black, white)
- [ ] Contraste WCAG AAA (7:1 mínimo)
- [ ] Transiciones suaves (duration-200 o 300)
- [ ] Glassmorphism estandarizado (si aplica)
- [ ] Funciona en light mode (opcional pero recomendado)
- [ ] Respeta prefers-reduced-motion

---

## Recursos

**Herramientas:**
- [Oslo Gray Palette](https://www.figma.com/community/file/kigen-oslo-gray)
- [Contrast Checker](https://contrast-ratio.com)
- [Dark Mode Best Practices](https://web.dev/prefers-color-scheme/)

**Inspiración:**
- [Linear](https://linear.app) - Glassmorphism premium
- [Vercel](https://vercel.com) - Dark mode elegante
- [Stripe](https://stripe.com) - Contraste perfecto

---

**Última actualización:** 2025-01-14
**Mantenedor:** InmoApp Design Team
