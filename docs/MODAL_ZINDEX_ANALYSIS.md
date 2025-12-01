# 🐛 Análisis del Problema: Modal Detrás del Hero Section

## 🔍 Problema Identificado

**Síntomas:**
1. ✅ Modal de login aparece **detrás** del hero section
2. ✅ Navbar cambia a un color gris (`#484D50`) inesperado

---

## 🎯 Causa Raíz

### Problema #1: Stacking Context Creado por CSS Animations

**Ubicación:** `navbar-scroll-animations.css` línea 193

```css
@supports (animation-timeline: scroll()) {
  [data-navbar] {
    transform: translateZ(0); /* ⚠️ ESTO CREA UN STACKING CONTEXT */
  }
}
```

**¿Por qué es un problema?**

`transform: translateZ(0)` crea un **nuevo stacking context**, lo que significa que el navbar y todo su contenido quedan "aislados" en su propia capa de z-index.

**Resultado:**
- Navbar tiene `z-50`
- Hero section tiene `z-0` y `z-10` (contenido)
- Modal tiene `z-50` (en Radix UI Dialog)

Pero como el navbar crea su propio stacking context, el modal **no puede aparecer por encima** del hero section si el hero también crea su propio contexto.

---

### Problema #2: Hero Section con Stacking Context Implícito

**Ubicación:** `hero-section.tsx` línea 262

```tsx
<section
  className="relative h-screen ... overflow-hidden -mt-16"
>
```

**Elementos con z-index:**
- Background: `z-0` (línea 268)
- Content: `z-10` (línea 274)

Aunque no hay `transform`, el uso de `position: relative` + `z-index` + animaciones GSAP puede crear contextos implícitos.

---

### Problema #3: Navbar Background Color

**Ubicación:** `navbar-scroll-animations.css` líneas 25-37

```css
@keyframes navbar-shrink-homepage {
  from {
    background-color: transparent;
  }
  to {
    background-color: rgba(30, 30, 30, 0.6); /* ⬅️ #1E1E1E con 60% opacidad */
  }
}
```

**Cálculo del color:**
- `rgba(30, 30, 30, 0.6)` = `#1E1E1E` con 60% de opacidad
- Sobre un fondo oscuro, esto se ve como `#484D50` aproximadamente

**Pero en `public-header-client.tsx` línea 40:**

```tsx
className="... bg-black/50 backdrop-blur-lg ..."
```

Hay **dos backgrounds superpuestos**:
1. Inline: `bg-black/50` (negro 50%)
2. Animación CSS: `rgba(30, 30, 30, 0.6)` (gris oscuro 60%)

---

## 🛠️ Soluciones

### Solución #1: Remover `transform: translateZ(0)` del Navbar

**Archivo:** `navbar-scroll-animations.css`

```css
/* ❌ REMOVER ESTO */
@supports (animation-timeline: scroll()) {
  [data-navbar] {
    transform: translateZ(0); /* Crea stacking context innecesario */
  }
}
```

**Razón:**
- Las animaciones CSS ya son GPU-accelerated
- No necesitas forzar una capa GPU con `translateZ(0)`
- Esto elimina el stacking context problemático

---

### Solución #2: Aumentar z-index del Modal

**Archivo:** `@auth/(.)login/page.tsx`

```tsx
<DialogContent className="... z-[100]">
  {/* Modal content */}
</DialogContent>
```

**Razón:**
- Asegura que el modal esté por encima de todo
- `z-[100]` es mayor que navbar (`z-50`) y hero (`z-10`)

---

### Solución #3: Consolidar Background del Navbar

**Opción A:** Remover `bg-black/50` del className

```tsx
// public-header-client.tsx línea 40
className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 shadow-lg shadow-black/20"
```

Dejar que la animación CSS maneje el background completamente.

**Opción B:** Remover la animación de background-color

```css
/* navbar-scroll-animations.css */
@keyframes navbar-shrink-homepage {
  from {
    /* background-color: transparent; ❌ Remover */
    box-shadow: none;
    backdrop-filter: none;
    border-bottom-color: transparent;
  }
  to {
    /* background-color: rgba(30, 30, 30, 0.6); ❌ Remover */
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(24px);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}
```

Dejar que el className inline maneje el background.

---

### Solución #4: Ajustar Hero Section (Opcional)

**Archivo:** `hero-section.tsx`

```tsx
<section
  className="relative h-screen ... -mt-16 isolate"
  //                                      ^^^^^^^ Nuevo
>
```

La propiedad `isolate` crea un stacking context **controlado** que no interfiere con elementos externos.

---

## 📋 Plan de Implementación Recomendado

### Paso 1: Remover `transform: translateZ(0)`

```css
/* navbar-scroll-animations.css - COMENTAR O ELIMINAR */
/*
@supports (animation-timeline: scroll()) {
  [data-navbar] {
    transform: translateZ(0);
  }
}
*/
```

### Paso 2: Consolidar Background del Navbar

```tsx
// public-header-client.tsx
className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 shadow-lg shadow-black/20"
// Remover: bg-black/50
```

### Paso 3: Asegurar Modal en Top

```tsx
// @auth/(.)login/page.tsx
<DialogContent className="... relative z-[100]">
```

---

## 🎨 Diagrama del Problema

### Antes (Problemático)

```
┌─────────────────────────────────┐
│ Navbar (z-50)                   │ ← Stacking context por transform
│ + transform: translateZ(0)      │
└─────────────────────────────────┘
         ↓ Aislado
┌─────────────────────────────────┐
│ Hero Section (z-0, z-10)        │
│ + Animaciones GSAP              │
└─────────────────────────────────┘
         ↓ Modal queda atrapado aquí
┌─────────────────────────────────┐
│ Modal (z-50) ❌                 │ ← No puede subir por stacking context
└─────────────────────────────────┘
```

### Después (Solucionado)

```
┌─────────────────────────────────┐
│ Modal (z-100) ✅                │ ← Arriba de todo
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Navbar (z-50)                   │ ← Sin stacking context
│ - transform removido            │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Hero Section (z-0, z-10)        │
└─────────────────────────────────┘
```

---

## ✅ Verificación

Después de aplicar las soluciones, verifica:

1. **Modal visible:** Abre `/login` y confirma que el modal aparece sobre todo
2. **Navbar background:** Verifica que el color es consistente al hacer scroll
3. **Animaciones:** Confirma que las animaciones GSAP siguen funcionando
4. **Performance:** Abre DevTools Performance y verifica 60fps

---

## 📚 Recursos

- [MDN: Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)
- [CSS Triggers: transform](https://csstriggers.com/transform)
- [Radix UI Dialog Z-Index](https://www.radix-ui.com/docs/primitives/components/dialog#portal)

---

## ✅ Solución Implementada: Navbar Transparente en Modal (Diciembre 2025)

**Problema resuelto:** Navbar con background gris inconsistente cuando modal abierto

### Contexto
Cuando se abre un modal de autenticación, el navbar cambiaba visualmente a un color gris (#494949 aprox) que no era coherente con el resto de la interfaz. Este cambio era causado por:

1. La animación CSS de scroll (`navbar-shrink-homepage`) aplicando `background-color: rgba(30, 30, 30, 0.6)`
2. El overlay del modal (`bg-black/60`) haciendo más evidente este background gris
3. Falta de coherencia visual - el navbar distraía del foco principal (el modal)

### Solución Implementada

**Estrategia:** CSS selector con `:has()` para hacer el navbar **completamente transparente** cuando un modal está abierto.

**Cambios realizados en `apps/web/app/navbar-scroll-animations.css`:**

1. **Regla CSS para estado modal abierto** (línea ~147):
```css
body:has([data-state="open"][data-radix-dialog-overlay]),
body:has([role="dialog"]) {
  [data-navbar] {
    /* Remove all background */
    background-color: transparent !important;

    /* Remove blur effect */
    backdrop-filter: none !important;

    /* Remove border */
    border-bottom-color: transparent !important;

    /* Remove shadow */
    box-shadow: none !important;
  }
}
```

2. **Transición suave** (línea ~218):
```css
[data-navbar] {
  transition: backdrop-filter 0.3s ease-out,
              background-color 0.3s ease-out,
              border-bottom-color 0.3s ease-out,
              box-shadow 0.3s ease-out;
}
```

3. **Data attribute en DialogOverlay** (`packages/ui/src/components/dialog.tsx:34`):
```tsx
<DialogPrimitive.Overlay
  ref={ref}
  data-radix-dialog-overlay=""
  className={cn(...)}
  {...props}
/>
```

### Beneficios

- ✅ **Máximo foco en modal:** Navbar no distrae, permite concentración total en el contenido del modal
- ✅ **Aspecto limpio:** Elimina todos los estilos visuales del navbar (background, blur, borde, sombra)
- ✅ **Automático:** Funciona con cualquier modal de Radix UI sin cambios adicionales
- ✅ **Performante:** CSS puro, sin JavaScript
- ✅ **Transiciones suaves:** Cambio visual gradual de 0.3s
- ✅ **Usabilidad preservada:** Links del navbar siguen siendo clickeables y legibles

### Compatibilidad

**CSS `:has()` selector:**
- ✅ Chrome 105+ (Sept 2022)
- ✅ Safari 15.4+ (Mar 2022)
- ✅ Firefox 121+ (Dec 2023)
- ✅ Edge 105+ (Sept 2022)

**Cobertura:** ~95% de usuarios (Can I Use data, 2025)

**Fallback:** Si el navegador no soporta `:has()`, el navbar mantiene su comportamiento actual (graceful degradation)

### Archivos Modificados

- `apps/web/app/navbar-scroll-animations.css` - +27 líneas (regla modal transparente)
- `packages/ui/src/components/dialog.tsx` - +1 línea (data attribute)

### Testing

✅ **Verificado:**
1. Navbar transparente en homepage sin modal (scroll=0)
2. Navbar se vuelve completamente transparente al abrir modal
3. Transición suave de 0.3s al abrir/cerrar modal
4. Override correcto de animación de scroll (navbar permanece transparente incluso al scrollear con modal abierto)
5. Compatible con páginas internas (/propiedades)
6. Links del navbar mantienen contraste suficiente sobre overlay oscuro

**Fecha de implementación:** Diciembre 1, 2025
