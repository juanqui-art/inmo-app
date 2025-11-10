# InmoApp Design System

Documentación centralizada del sistema de diseño de InmoApp, incluyendo paleta de colores, guías de dark mode y patrones de glassmorphism.

---

## 📚 Guías Disponibles

### [COLOR_PALETTE.md](./COLOR_PALETTE.md)
**Paleta de Colores Oslo Gray - Referencia Completa**

- Escala de colores Oslo Gray (11 tonos)
- Uso en Tailwind CSS
- Variables semánticas (light/dark mode)
- Jerarquía visual
- Guía de migración desde Gray default

**Úsalo cuando:** Necesites entender la paleta base, buscar un color específico, o migrar componentes.

---

### [DARK_MODE_GUIDE.md](./DARK_MODE_GUIDE.md)
**Guía de Dark Mode y Glassmorphism**

- Filosofía de diseño (dark mode first)
- Patrones de glassmorphism
- Componentes comunes (Card, Button, Input, Badge)
- Contraste y accesibilidad WCAG AAA
- Animaciones y transiciones
- Patrones anti-pattern
- Casos especiales (Hero, Modal, Navbar)
- Checklist de componente

**Úsalo cuando:** Implementes componentes, necesites glassmorphism, o verificar accesibilidad.

---

### [GLASSMORPHISM_IMPLEMENTATION_SUMMARY.md](./GLASSMORPHISM_IMPLEMENTATION_SUMMARY.md)
**Resumen de Implementación de Glassmorphism**

- Estado actual de glassmorphism en el proyecto
- Patrones implementados
- Mejores prácticas aplicadas

**Úsalo cuando:** Necesites entender la historia de implementación o resolver inconsistencias de glassmorphism.

---

## 🎨 Acceso Rápido

### Colores Principales (Dark Mode)
| Elemento | Color | Valor |
|----------|-------|-------|
| Fondo principal | `oslo-gray-1100` | `#0E0F0F` |
| Fondo elevado | `oslo-gray-1000` | `#181919` |
| Texto principal | `oslo-gray-50` | `#EFF0F0` |
| Texto secundario | `oslo-gray-300` | `#9BA5AC` |
| Bordes | `oslo-gray-800` | `#353739` |

### Glassmorphism Estándar
```tsx
// Cards flotantes
bg-oslo-gray-1000/95 backdrop-blur-md

// Modals/Dropdowns
bg-oslo-gray-900/98 backdrop-blur-xl

// Navbar
bg-oslo-gray-900/80 backdrop-blur-md
```

### Checklist Rápido
Antes de considerar un componente "terminado":

- [ ] Usa variables semánticas o oslo-gray (NO `gray-*`)
- [ ] No tiene colores hardcodeados (`black`, `white`)
- [ ] Contraste WCAG AAA (7:1 mínimo)
- [ ] Transiciones suaves (`duration-200` o `300`)
- [ ] Glassmorphism estandarizado (si aplica)
- [ ] Funciona en light mode
- [ ] Respeta `prefers-reduced-motion`

---

## 🔄 Migración Centralizada (Nov 2025)

**Cambio Reciente:**
- Documentación consolidada desde `apps/web/` a `docs/design/`
- Eliminada duplicación de archivos
- `docs/design/` es ahora la única fuente de verdad

**Impacto:**
- COLOR_PALETTE.md: Eliminado de `apps/web/` (mantener en `docs/design/`)
- DARK_MODE_GUIDE.md: Renombrado en `docs/design/` (eliminado de `apps/web/`)

---

## 📖 Recursos Externos

**Herramientas:**
- [Oslo Gray Palette](https://www.figma.com/community/file/kigen-oslo-gray) - Figma community
- [Contrast Checker](https://contrast-ratio.com) - Testing de contraste
- [Dark Mode Best Practices](https://web.dev/prefers-color-scheme/) - Web.dev guide

**Inspiración:**
- [Linear](https://linear.app) - Glassmorphism premium
- [Vercel](https://vercel.com) - Dark mode elegante
- [Stripe](https://stripe.com) - Contraste perfecto

---

## 📝 Última Actualización

- **Paleta de colores:** Octubre 2025
- **Dark Mode Guide:** Enero 2025
- **Glassmorphism Summary:** Octubre 2025
- **Centralización:** Noviembre 2025

**Mantenedor:** InmoApp Design Team
