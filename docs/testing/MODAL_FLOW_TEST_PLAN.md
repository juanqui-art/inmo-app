# 🧪 Plan de Pruebas: Flujo Completo de Modal de Favoritos

> **Fecha:** Diciembre 2, 2025
> **Feature:** Modal de Login con Rutas Paralelas
> **Flujo:** Usuario sin auth hace favorito → Modal login → Favorito guardado

---

## ✅ Pre-requisitos Verificados

### 1. Estructura de Archivos
```
✅ app/@auth/default.tsx - Existe y retorna null
✅ app/@auth/(.)login/page.tsx - Modal interceptado
✅ app/@propertyPreview/default.tsx - Existe y retorna null
✅ app/layout.tsx - Recibe slots auth y propertyPreview
```

### 2. Código Clave

**Store (Zustand):**
```typescript
// ✅ stores/favorites-store.ts
// Emite evento cuando detecta error de auth
window.dispatchEvent(
  new CustomEvent("favorites:auth-required", {
    detail: { propertyId },
  })
);
```

**Hook (React):**
```typescript
// ✅ hooks/use-favorites.ts
// Escucha evento y navega con router.push()
useEffect(() => {
  const handler = (event: CustomEvent<{ propertyId: string }>) => {
    router.push(`/login?intent=favorite&propertyId=${propertyId}`);
  };
  window.addEventListener("favorites:auth-required", handler);
  return () => window.removeEventListener("favorites:auth-required", handler);
}, [router]);
```

### 3. Compilación
```
✅ TypeScript: No errors
✅ Build: Pending (manual test)
```

---

## 🎯 Flujo de Prueba Completo

### Paso 1: Setup Inicial

**Pre-condiciones:**
- Usuario NO autenticado (logout si es necesario)
- Dev server corriendo (`bun run dev`)
- Abrir navegador en `http://localhost:3000`

**Verificar:**
- [ ] Navbar muestra botón "Ingresar"
- [ ] NO muestra nombre de usuario
- [ ] localStorage.getItem("authIntent") es null

---

### Paso 2: Click en Favorito (❤️)

**Acción:**
1. Navegar a homepage (`/`)
2. Buscar cualquier property card
3. Click en el icono de corazón ❤️

**Comportamiento Esperado:**

```
🔄 Flow Trace:
1. onClick en PropertyCard
   ↓
2. handleFavoriteClick("property-id")
   ↓
3. toggleFavorite() del hook
   ↓
4. Store: toggleFavoriteAction()
   ↓
5. Server Action: Error "Authentication required"
   ↓
6. Store detecta error
   ↓
7. Store guarda en localStorage:
   {
     action: "favorite",
     propertyId: "xxx",
     redirectTo: "/"
   }
   ↓
8. Store emite evento: "favorites:auth-required"
   ↓
9. Hook useFavorites escucha evento
   ↓
10. Hook ejecuta: router.push("/login?intent=favorite&propertyId=xxx")
   ↓
11. Next.js intercepta ruta
   ↓
12. ✨ Modal aparece (@auth/(.)login/page.tsx)
```

**Verificaciones:**

- [ ] **URL cambió** a `/login?intent=favorite&propertyId=<uuid>`
- [ ] **Modal aparece** sobre la página actual
- [ ] **Página de fondo** sigue visible (no recarga completa)
- [ ] **localStorage** tiene `authIntent` con:
  ```json
  {
    "action": "favorite",
    "propertyId": "82336e69-388f-4ef1-9827-7f1a30cd1bd1",
    "redirectTo": "/"
  }
  ```

**❌ Si NO funciona:**

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| Página completa de login | `window.location` en lugar de `router.push()` | Ya arreglado ✅ |
| Modal no aparece | Event listener no registrado | Verificar hook montado |
| Error en consola | TypeScript error | `bunx tsc --noEmit` |
| 404 al navegar | Falta `default.tsx` | Ya existe ✅ |

---

### Paso 3: Completar Login

**Acción:**
1. En el modal, ingresar credenciales válidas
2. Click en "Iniciar Sesión"

**Comportamiento Esperado:**

```
🔄 Flow Trace:
1. Submit form
   ↓
2. loginAction() ejecuta
   ↓
3. Supabase auth success
   ↓
4. Redirect a /perfil (o /dashboard)
   ↓
5. AuthIntentExecutor se monta
   ↓
6. Lee localStorage.getItem("authIntent")
   ↓
7. Encuentra: { action: "favorite", propertyId: "xxx" }
   ↓
8. Ejecuta: toggleFavoriteAction("xxx")
   ↓
9. Server Action: Success (usuario ahora autenticado)
   ↓
10. Toast: "✅ Agregado a favoritos"
   ↓
11. localStorage.removeItem("authIntent")
   ↓
12. ✨ Favorito guardado en DB
```

**Verificaciones:**

- [ ] **Modal se cierra** automáticamente
- [ ] **Navegación** a `/perfil` o dashboard
- [ ] **Toast aparece:** "Agregado a favoritos" o similar
- [ ] **localStorage.authIntent** ha sido eliminado
- [ ] **DB verificación:** Favorito existe en tabla `Favorite`

**SQL para verificar:**
```sql
SELECT * FROM "Favorite"
WHERE "userId" = '<user-id>'
  AND "propertyId" = '<property-id>';
```

---

### Paso 4: Verificar Persistencia

**Acción:**
1. Navegar a `/favoritos` o perfil
2. Verificar que la propiedad aparece en favoritos

**Verificaciones:**

- [ ] **Propiedad listada** en página de favoritos
- [ ] **Icono de corazón** en property card está filled (rojo)
- [ ] **Click en corazón** ahora la remueve de favoritos (toggle)

---

### Paso 5: Pruebas de Edge Cases

#### Test 5.1: Refresh Durante Modal

**Acción:**
1. Abrir modal de login (favorito sin auth)
2. **Presionar F5** (refresh)

**Esperado:**
- [ ] **Página completa** de login se muestra
- [ ] **NO modal**
- [ ] URL sigue siendo `/login?intent=...`
- [ ] Al hacer login, intent se ejecuta igual

#### Test 5.2: Navegación Directa

**Acción:**
1. Copiar URL del modal: `/login?intent=favorite&propertyId=xxx`
2. Abrir en nueva pestaña

**Esperado:**
- [ ] **Página completa** de login (no modal)
- [ ] Al hacer login, intent se ejecuta
- [ ] Favorito se guarda correctamente

#### Test 5.3: Browser Back Button

**Acción:**
1. Abrir modal de login
2. Click en **botón atrás del navegador**

**Esperado:**
- [ ] **Modal se cierra**
- [ ] **Vuelve a homepage** (o página anterior)
- [ ] **authIntent** sigue en localStorage (para retry)

#### Test 5.4: Multiple Favoritos

**Acción:**
1. Sin auth, hacer favorito a Property A
2. Modal se abre
3. **Cerrar modal** con X o back
4. Sin hacer login, hacer favorito a Property B
5. Nuevo modal se abre

**Esperado:**
- [ ] **localStorage sobrescribe** intent con Property B
- [ ] Al hacer login, **solo Property B** se guarda
- [ ] Property A **NO se guarda** (última acción gana)

---

## 🔍 Debugging Checklist

Si algo falla, verificar en orden:

### 1. Network Tab (Chrome DevTools)

- [ ] Request a `toggleFavoriteAction` retorna 200
- [ ] Response body contiene `{ success: false, error: "Authentication required" }`
- [ ] NO hay errores 500

### 2. Console Tab

- [ ] NO hay errores de JavaScript
- [ ] Verificar que evento se dispara:
  ```js
  // Agregar temporalmente en hook
  console.log("Event received:", event.detail);
  ```

### 3. Application Tab → localStorage

- [ ] Key `authIntent` existe después de click
- [ ] Value es JSON válido
- [ ] Contiene `propertyId` correcto

### 4. React DevTools

- [ ] `useFavorites` hook está montado
- [ ] `useRouter` tiene valor válido
- [ ] No hay errores de hooks

### 5. Next.js Server Logs

```bash
# En terminal donde corre dev server
# Buscar:
[toggleFavoriteAction] Authentication required
```

---

## 📊 Matriz de Compatibilidad

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 120+ | ✅ Expected | CustomEvents support |
| Firefox | 115+ | ✅ Expected | Full support |
| Safari | 16+ | ✅ Expected | iOS 16+ |
| Edge | 120+ | ✅ Expected | Chromium-based |

---

## 🎬 Video de Prueba (Opcional)

Para documentar el flujo completo:

1. Grabar screen con OBS o QuickTime
2. Mostrar:
   - Click en favorito
   - Modal aparece
   - Login exitoso
   - Toast success
   - Verificación en /favoritos

**Duración esperada:** 30-45 segundos

---

## ✅ Criterios de Aceptación

Para considerar el flujo **completamente funcional**, TODOS deben pasar:

- [x] ✅ TypeScript compila sin errores
- [ ] ⏳ Modal aparece en soft navigation (Link/router.push)
- [ ] ⏳ Página completa en hard navigation (refresh/URL directa)
- [ ] ⏳ authIntent se guarda en localStorage
- [ ] ⏳ Login exitoso ejecuta favorito
- [ ] ⏳ Toast de confirmación aparece
- [ ] ⏳ Favorito persiste en DB
- [ ] ⏳ UI se actualiza (corazón filled)
- [ ] ⏳ No hay 404s al refrescar
- [ ] ⏳ Browser back cierra modal correctamente

**Progreso:** 1/10 (10%)

---

## 🐛 Issues Conocidos

### Issue #1: Event Listener Timing
**Síntoma:** Evento se dispara antes de que listener esté registrado
**Workaround:** Hook `useFavorites` debe montarse en layout/app raíz
**Status:** ⚠️ Potencial - monitorear

### Issue #2: localStorage en SSR
**Síntoma:** Error "localStorage is not defined" en server
**Solución:** Ya implementado - verificamos `typeof window !== "undefined"`
**Status:** ✅ Resuelto

---

## 📝 Notas de Implementación

### CustomEvent vs EventEmitter

**Por qué CustomEvent:**
- ✅ Nativo del navegador (no requiere librería)
- ✅ Type-safe con TypeScript
- ✅ Garbage collected automáticamente
- ✅ Compatible con React Strict Mode

**Alternativas consideradas:**
- ❌ EventEmitter (Node.js) - No nativo en browser
- ❌ RxJS - Overhead innecesario
- ❌ Redux - Demasiado complejo para este caso

---

## 🚀 Siguiente Paso

Una vez que TODAS las pruebas pasen:

1. **Commit cambios:**
   ```bash
   git add .
   git commit -m "feat(auth): unify login modals using parallel routes pattern

   - Replace AuthModal component with intercepted routes
   - Implement event-driven navigation from Zustand store
   - Add localStorage intent preservation
   - Update 6 components to use new pattern
   - Add comprehensive modal patterns guide

   BREAKING: Removes AuthModal component (now using parallel routes)
   "
   ```

2. **Update ROADMAP.md** - Marcar como completado

3. **Deprecar AuthModal component:**
   ```tsx
   // components/auth/auth-modal.tsx
   /**
    * @deprecated Use parallel routes pattern instead
    * See: docs/architecture/MODAL_PATTERNS_GUIDE.md
    */
   ```

---

**Última actualización:** Diciembre 2, 2025
**Autor:** InmoApp Development Team
**Status:** ⏳ Pending Manual Test
