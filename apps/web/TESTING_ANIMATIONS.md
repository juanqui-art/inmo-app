# 🎬 Guía para Probar las Animaciones del Navbar

Sigue estos pasos para ver **cada animación implementada**:

---

## ✅ 1. Animación de Scroll (Shrink)

### Dónde probarlo:
- **Cualquier página QUE NO sea la homepage** (ej: `/propiedades`, `/vender`)
- La homepage tiene navbar absoluto, no sticky

### Cómo verlo:
1. Abre: `http://localhost:3000/propiedades`
2. Observa el navbar en la parte superior
3. **Haz scroll hacia abajo** lentamente
4. **Verás:**
   - ✨ Navbar reduce altura de **64px → 56px**
   - ✨ Logo se hace más pequeño
   - ✨ Icono reduce de **24px → 20px**
   - ✨ Fondo se vuelve más opaco (`/80` → `/95`)
   - ✨ Aparece sombra `shadow-xl`

### ¿Qué buscar?
```
ANTES DEL SCROLL:
- Navbar más alto
- Logo grande "InmoApp"
- Fondo semi-transparente

DESPUÉS DEL SCROLL:
- Navbar más compacto
- Logo más pequeño
- Fondo más sólido con sombra
```

---

## ✅ 2. Efecto Magnético (Magnetic Hover)

### Dónde probarlo:
- **Desktop only** (no funciona en mobile)
- **Páginas que NO sean homepage**

### Cómo verlo:
1. Abre: `http://localhost:3000/propiedades` (en desktop)
2. Busca el botón azul **"Publicar anuncio"** en el navbar
3. **Mueve el mouse CERCA del botón** (sin hacer click)
4. **Verás:**
   - ✨ El botón se mueve sutilmente hacia tu cursor
   - ✨ Máximo 10px de movimiento
   - ✨ Al alejar el mouse, regresa con efecto elástico

### ¿Qué buscar?
```
CUANDO ACERCAS EL MOUSE:
- Botón "atrae" el cursor
- Movimiento suave, no brusco

CUANDO ALEJAS EL MOUSE:
- Botón vuelve a posición original
- Efecto "elastic" (rebote suave)
```

---

## ✅ 3. Animación del Menú Móvil

### Dónde probarlo:
- **Mobile** o resize del browser a mobile (<768px)

### Cómo verlo:
1. Abre: `http://localhost:3000`
2. **Reduce el ancho del navegador** o abre en mobile
3. Click en el botón **☰ (hamburger menu)**
4. **Verás:**
   - ✨ Panel se desliza desde la derecha
   - ✨ Backdrop oscuro aparece con fade
   - ✨ Items del menú aparecen secuencialmente (stagger)

### ¿Qué buscar?
```
AL ABRIR EL MENÚ:
- Panel desliza smooth desde la derecha
- Fondo oscuro aparece gradualmente
- Links aparecen uno por uno (cascada)
  1. "Buscar propiedades"
  2. "Comprar"
  3. "Rentar"
  4. etc.
```

**Timing:**
- Panel: 300ms
- Backdrop: 300ms (fade)
- Stagger: 50ms delay entre cada item

---

## ✅ 4. Animación de Hover en Homepage

### Dónde probarlo:
- **Solo en la homepage**: `http://localhost:3000`

### Cómo verlo:
1. Abre: `http://localhost:3000`
2. Pasa el mouse sobre cualquier link del navbar:
   - "Comprar"
   - "Rentar"
   - "Vender"
   - Iconos sociales
3. **Verás:**
   - ✨ Fondo blanco semi-transparente aparece
   - ✨ Texto se vuelve más brillante
   - ✨ Transición suave

### ¿Qué buscar?
```
EN HOMEPAGE (fondo de imagen):
- Hover: bg-white/10 (fondo blanco 10%)
- Texto: opacity 80% → 100%
- Drop shadow más pronunciado

EN OTRAS PÁGINAS:
- Hover: bg-oslo-gray-800
- Texto cambia de color
```

---

## ✅ 5. Animación del Logo

### Dónde probarlo:
- Páginas que NO sean homepage + scroll

### Cómo verlo:
1. Abre: `http://localhost:3000/propiedades`
2. Observa el logo "🏠 InmoApp" en el navbar
3. **Haz scroll hacia abajo**
4. **Verás:**
   - ✨ Logo reduce de `text-xl` → `text-lg`
   - ✨ Icono casa reduce de `24px` → `20px`
   - ✨ Transición sincronizada con navbar

---

## ✅ 6. Iconos Sociales (TikTok)

### Dónde probarlo:
- Desktop: Navbar
- Mobile: Menú hamburguesa (sección inferior)

### Cómo verlo:
1. **Desktop**: Observa los iconos entre navegación y búsqueda
   - Facebook, Instagram, TikTok, Twitter
2. **Mobile**: Abre menú → scroll al final → "Síguenos en redes sociales"
3. **Verás:**
   - ✨ TikTok usando SVG custom
   - ✨ Filtros de brillo según contexto
   - ✨ Hover con scale 110%

---

## 🐛 Si NO ves las animaciones:

### Opción 1: Verifica `prefers-reduced-motion`
```bash
# En DevTools Console:
window.matchMedia('(prefers-reduced-motion: reduce)').matches
```
Si devuelve `true`, las animaciones GSAP están desactivadas (por accesibilidad)

**Solución:**
1. Configuración del sistema → Accesibilidad
2. Desactiva "Reducir movimiento" / "Reduce motion"

### Opción 2: Hard Refresh
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Opción 3: Limpiar caché
```bash
rm -rf .next
bun run dev
```

### Opción 4: Verificar consola
Abre DevTools (F12) → Console
Si hay errores en rojo, repórtalos

---

## 🎥 Video de Referencia

Graba tu pantalla mientras pruebas y compara con estos comportamientos:

### Navbar Shrink (scroll):
- **Inicio:** Navbar alto, logo grande
- **Scroll 50px:** Navbar se comprime smooth
- **Scroll hacia arriba:** Navbar se expande

### Magnetic Hover:
- **Mouse lejos:** Botón estático
- **Mouse cerca:** Botón se mueve hacia cursor
- **Mouse sale:** Botón rebota a posición original

### Mobile Menu:
- **Click hamburger:** Panel desliza + links en cascada
- **Click backdrop:** Menú se cierra

---

## 📊 Performance Check

Abre DevTools → Performance
1. Graba mientras haces scroll
2. Detén grabación
3. Busca sección "Frames"
4. **Deberías ver:** 60fps constante (verde)

Si ves bajadas a <60fps, reporta qué animación causa el problema.

---

## ✨ Resumen de Qué Probar

| # | Animación | Dónde | Acción | Resultado Esperado |
|---|-----------|-------|--------|-------------------|
| 1 | Navbar Shrink | `/propiedades` | Scroll down | Navbar se comprime |
| 2 | Magnetic Hover | Desktop navbar | Hover "Publicar anuncio" | Botón atrae cursor |
| 3 | Mobile Menu | Mobile | Click ☰ | Panel desliza + stagger |
| 4 | Hover Effects | Homepage `/` | Hover links | Fondo white/10 |
| 5 | Logo Shrink | `/propiedades` | Scroll down | Logo se reduce |
| 6 | Social Icons | Navbar | Hover TikTok | Scale 110% |

---

## 🚨 Problemas Comunes

### "No veo el shrink"
- ¿Estás en homepage? → NO funciona ahí (navbar absoluto)
- Prueba en `/propiedades` o `/vender`

### "No veo magnetic effect"
- ¿Estás en mobile? → Solo funciona en desktop
- ¿Estás en homepage? → Solo funciona fuera de homepage

### "Mobile menu sin animación"
- Hard refresh (Ctrl+Shift+R)
- Verifica que ancho sea <768px

---

**¿Listo?** Empieza con la animación #1 (Navbar Shrink) en `/propiedades` 🚀
