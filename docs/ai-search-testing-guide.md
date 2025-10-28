# 🧪 AI Search - Guía de Testing Sesión 1

**Propósito:** Verificar que la UI está funcionando correctamente

---

## 🚀 Cómo Probar Localmente

### Paso 1: Iniciar el servidor

```bash
cd /Users/juanquizhpi/Desktop/projects/inmo-app
bun run dev
```

Espera a que veas:
```
✓ Ready in 786ms
```

### Paso 2: Abrir en navegador

```
http://localhost:3000/mapa
```

---

## 🎬 Testing Script

### Parte 1: Verificar Botón Flotante

**Ubicación:** Top center del mapa
**Apariencia:**
- Fondo: blanco (o gris oscuro en dark mode)
- Icono: ✨ Sparkles + 🤖 emoji
- Texto: "Buscar con IA"
- Badge: "Nuevo" (pequeño badge azul)
- Sombra: Shadow 2xl

**Acciones:**
1. Hover sobre el botón → debe escalar 105% + aumentar sombra
2. Click en el botón → debe abrir modal

---

### Parte 2: Modal de Búsqueda

**Verifica que aparece:**
- ✨ Header con icono gradient (blue → cyan)
- Título: "Búsqueda Inteligente"
- Subtítulo: "Describe lo que buscas en lenguaje natural"
- Botón X (close) en top-right
- Backdrop con blur (fondo oscuro semitransparente)

**Animación:**
- Entrada: Modal crece desde escala 0.9 a 1.0 (spring smooth)
- Salida: Inversa al cerrar

---

### Parte 3: Input de Búsqueda

**Ubicación:** Centro del modal (debajo del header)

**Verifica:**
1. Placeholder text: "Ej: Casa moderna con 3 habitaciones cerca del centro"
2. Textarea: 3 filas, max 200 caracteres
3. Border: 2px, gris claro (focus: blue)
4. Ring: Al hacer focus, ring azul suave (ring-2 ring-blue-500/20)

**Interacciones:**
```
✅ Typing:
  - Escribe: "Casa en Cuenca"
  - Contador debe mostrar: "13/200 caracteres"

✅ Clear button:
  - Si hay texto, aparece botón X en top-right del input
  - Click en X → borra el text
  - Si vacío, X desaparece

✅ Enter para buscar:
  - Escribe: "Casa moderna"
  - Presiona Enter (sin Shift)
  - Debe ejecutarse búsqueda (console log en dev tools)

✅ Shift+Enter para newline:
  - Escribe: "Casa"
  - Presiona Shift+Enter
  - Debe agregar nueva línea (no buscar)

✅ Loading state:
  - Durante búsqueda aparece spinner (Loader animado)
  - Botón dice "Buscando..."
  - Input deshabilitado (disabled)
```

---

### Parte 4: Ejemplos Interactivos

**Ubicación:** Debajo del input

**Encabezado:** "💡 Prueba con estos ejemplos:"

**Grid de ejemplos:**
- Desktop: 2 columnas
- Mobile: 1 columna

**Ejemplos que deben aparecer:**
```
1. Casa moderna en Cuenca con 3 habitaciones
2. Apartamento cerca de la universidad bajo $120k
3. Propiedad con jardín y garaje en el norte
4. Suite amueblada para arriendo en el centro
5. Casa colonial con patio en Gualaceo
6. Penthouse con vista panorámica a la ciudad
```

**Verifica:**
- Cada ejemplo es un botón clickeable
- Hover: Border color cambia a blue-500, fondo a blue-50
- Click: Debe llenar el input con el texto del ejemplo y ejecutar búsqueda

**Test:**
```
✅ Hover sobre ejemplo #1
   → Border vira a blue
   → Fondo se pone blue-50

✅ Click en ejemplo #2
   → Input se llena: "Apartamento cerca de la universidad bajo $120k"
   → Console log: "Search query: Apartamento cerca..."
   → Loading spinner aparece por 1 segundo (mock)
   → Console log: "Search completed (mock)"
```

---

### Parte 5: Tips Section

**Ubicación:** Debajo de ejemplos

**Encabezado:** "🎯 Tips para mejores resultados:"

**Tips que deben mostrarse:**
```
• Menciona la ubicación específica (Ej: "en El Ejido")
• Incluye características importantes (garaje, jardín, etc.)
• Especifica tu presupuesto si lo tienes claro
• Describe el estilo o tipo de propiedad (moderno, colonial, etc.)
```

**Estilo:**
- Fondo: blue-50 (o blue-900/10 en dark mode)
- Borde: border-blue-200
- Texto: Gris oscuro (text-oslo-gray-700)
- Font: small (text-sm)

---

## 🎨 Dark Mode Testing

**Cómo activar dark mode:**

```
Cmd + K (Mac) o Ctrl + K (Windows)
Buscar: "Appearance"
Seleccionar: "Dark"
```

**Verifica en dark mode:**
- ✅ Modal background: oslo-gray-900 (oscuro)
- ✅ Texto: blanco/gris claro
- ✅ Input background: oslo-gray-800
- ✅ Borders: oslo-gray-700
- ✅ Tips background: blue-900/10
- ✅ No hay glitches visuales

---

## 📱 Responsive Design Testing

### Mobile (375px)

```bash
# En DevTools: F12 → Toggle device toolbar (Cmd+Shift+M)
# Seleccionar: iPhone 12/13
```

**Verifica:**
```
✅ Modal:
   - 100% ancho (mx-4 = margen 16px)
   - Centrado verticalmente
   - Scrollable si contenido > viewport

✅ Button:
   - Botón flotante visible en top
   - Clickeable sin problemas

✅ Input:
   - Fully visible
   - Keyboard no cubre (autofocus deshabilitado en mobile)

✅ Grid de ejemplos:
   - 1 columna (no 2)
   - Full width

✅ Font sizes:
   - Readable (no menos de 16px)
   - Line height adecuado
```

### Tablet (768px)

```
✅ Modal: max-w-2xl se respeta
✅ Grid: 2 columnas
✅ Padding: Normal (32px)
✅ Todo centrado en pantalla
```

### Desktop (1024px+)

```
✅ Modal: max-w-2xl (máximo ancho)
✅ Centrado: Perfecto en pantalla
✅ Interacciones: Suaves y rápidas
✅ Animaciones: Sin lag
```

---

## ⚡ Performance Testing

**En DevTools → Performance:**

1. Abre modal
2. Presiona record
3. Interactúa: typing, hovering, clicking ejemplos
4. Presiona stop

**Verifica:**
- Frame rate: 60 FPS (o cercano)
- No hay Long Tasks
- CPU usage bajo

---

## 🔗 Console Logging

**Abre DevTools:** F12 → Console tab

**Verifica que aparecen logs:**

```javascript
// Al presionar Enter o click en botón Buscar:
"Search query: Casa moderna en Cuenca con 3 habitaciones"

// Después de ~1 segundo (mock delay):
"Search completed (mock)"
```

**Esperado en Console (sin errores):**
```
✅ React DevTools download prompt (normal)
✅ HMR connected message (normal)
✅ Nuestros logs cuando buscamos (normal)
❌ No debe haber errores rojos
```

---

## 🎯 Test Cases Completos

### Test Case 1: Open & Close

```gherkin
GIVEN usuario en /mapa
WHEN hace click en botón "Buscar con IA"
THEN modal debe abrir con animación suave

WHEN hace click en X (close button)
THEN modal debe cerrar con animación inversa
```

### Test Case 2: Typing Interaction

```gherkin
GIVEN modal abierto
WHEN usuario escribe: "Casa moderna 3 habitaciones"
THEN:
  - Input contiene el texto
  - Contador muestra: "30/200"
  - Botón X aparece
  - Botón "Buscar" está enabled (azul)

WHEN usuario presiona X (clear)
THEN:
  - Input vacío
  - Contador: "0/200"
  - Botón X desaparece
```

### Test Case 3: Search Execution

```gherkin
GIVEN modal abierto con input lleno
WHEN usuario presiona Enter
THEN:
  - Console log: "Search query: ..."
  - Loading spinner aparece
  - Botón dice "Buscando..."
  - Input deshabilitado
  - Spinner desaparece después de 1s
  - Console log: "Search completed (mock)"
```

### Test Case 4: Example Click

```gherkin
GIVEN modal abierto
WHEN usuario hace click en ejemplo #3
THEN:
  - Input se llena automáticamente
  - Búsqueda se ejecuta
  - Logs aparecen en console
```

### Test Case 5: Mobile Responsive

```gherkin
GIVEN DevTools en 375px width
WHEN usuario abre modal
THEN:
  - Modal 100% ancho (no overflow)
  - Ejemplos en 1 columna
  - Font sizes readables
  - No horizontal scroll
  - Botones clickeables fácilmente
```

---

## 📊 Checklist de QA

Marcar como ✅ después de verificar:

```
UI VISUALS:
  [ ] Botón flotante visible en top center
  [ ] Modal tiene backdrop blur
  [ ] Header con icono gradient
  [ ] Input con border y ring
  [ ] Ejemplos en grid
  [ ] Tips section visible
  [ ] X (close) button en top-right

INTERACCIONES:
  [ ] Botón abre modal
  [ ] X cierra modal
  [ ] Typing en input funciona
  [ ] Clear button (X) borra texto
  [ ] Enter busca
  [ ] Shift+Enter newline
  [ ] Ejemplo click llena input
  [ ] Loading state aparece

ANIMACIONES:
  [ ] Modal entra smooth
  [ ] Modal sale smooth
  [ ] Ejemplos tienen stagger
  [ ] Hover scales funcionan
  [ ] Backdrop fade in/out

RESPONSIVE:
  [ ] Mobile (375px) ✅
  [ ] Tablet (768px) ✅
  [ ] Desktop (1024px) ✅

DARK MODE:
  [ ] Colors correct
  [ ] Text readable
  [ ] No glitches

PERFORMANCE:
  [ ] 60 FPS
  [ ] No console errors
  [ ] No memory leaks (en DevTools)

ACCESSIBILITY:
  [ ] Teclado funciona
  [ ] Focus visible
  [ ] Labels presentes
  [ ] Contrast suficiente
```

---

## 🐛 Troubleshooting

### Problema: Modal no abre

**Solución:**
```bash
# 1. Verifica servidor está corriendo
bun run dev

# 2. Hard refresh (Cmd+Shift+R)
# 3. Abre DevTools → Console, busca errores
# 4. Verifica que importes son correctos en map-container.tsx
```

### Problema: Animaciones lentas

**Solución:**
```bash
# 1. DevTools → Performance → grabar
# 2. Busca Long Tasks (>50ms)
# 3. Reduce damping en AISearchModal transition si es necesario
```

### Problema: Input no responde a Enter

**Solución:**
```
# 1. Verifica que focus está en textarea (click primero)
# 2. Intenta Shift+Enter (debería agregar newline)
# 3. Verifica en console si hay errores al presionar Enter
```

### Problema: Modal no aparece en mobile

**Solución:**
```
# 1. Verifica z-index (debe ser z-50)
# 2. Abre DevTools mobile view (Cmd+Shift+M)
# 3. Hard refresh
# 4. Verifica que modal no está fuera de viewport
```

---

## 📚 Próximos Pasos Después de QA

Una vez verificado todo, proceder a **Sesión 2:**

1. Setup OpenAI API
2. Crear `lib/ai/search-parser.ts`
3. Crear `app/actions/ai-search.ts`
4. Actualizar `useAISearch` hook
5. Conectar resultados al mapa

---

**Last Updated:** 28 Octubre, 2025
**Status:** Listo para testing
