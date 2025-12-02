# 🎯 Guía Definitiva: Modales con Rutas Paralelas en Next.js 16

> **Última actualización:** Diciembre 2025
> **Next.js:** 16.0.0+
> **Patrón:** Parallel Routes + Intercepting Routes + Zustand

---

## 📋 Tabla de Contenidos

1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Arquitectura Recomendada](#arquitectura-recomendada)
3. [Patrones de Implementación](#patrones-de-implementación)
4. [Mejores Prácticas 2025](#mejores-prácticas-2025)
5. [Problemas Comunes y Soluciones](#problemas-comunes-y-soluciones)
6. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🧠 Conceptos Fundamentales

### ¿Qué son las Rutas Paralelas?

Las **Parallel Routes** permiten renderizar múltiples páginas en el mismo layout simultáneamente. Se definen usando la convención `@folder`.

```
app/
├── layout.tsx          # Recibe children, auth, modal
├── page.tsx            # children slot (implícito)
├── @auth/
│   ├── login/page.tsx
│   └── default.tsx     # ⚠️ CRÍTICO: evita 404s
└── @modal/
    ├── photo/page.tsx
    └── default.tsx     # ⚠️ CRÍTICO: evita 404s
```

**Props del Layout:**
```tsx
export default function Layout({
  children,
  auth,
  modal,
}: {
  children: React.ReactNode;
  auth: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {auth}
      {modal}
    </>
  );
}
```

### ¿Qué son las Intercepting Routes?

Las **Intercepting Routes** permiten cargar una ruta dentro del contexto actual mientras se mantiene la URL completa.

**Convención de Prefijos:**
- `(.)` - Mismo nivel
- `(..)` - Un nivel arriba
- `(..)(..)` - Dos niveles arriba
- `(...)` - Desde la raíz

**Ejemplo:**
```
@modal/
├── (.)photo/
│   └── [id]/page.tsx   # Intercepta /photo/[id]
└── default.tsx
```

### Comportamiento de Navegación

| Tipo de Navegación | Resultado |
|-------------------|-----------|
| **Soft navigation** (`<Link>` o `router.push()`) | Intercepta → Muestra modal |
| **Hard navigation** (refresh, URL directa) | No intercepta → Muestra página completa |

---

## 🏗️ Arquitectura Recomendada

### Patrón A: Modal en Root Layout (Recomendado)

**✅ Ventajas:**
- Un solo slot `@modal` para todos los modales
- Menos complejidad
- Mejor performance

**❌ Desventajas:**
- Todos los modales en un solo directorio

```
app/
├── layout.tsx
├── @modal/
│   ├── (.)login/page.tsx
│   ├── (.)signup/page.tsx
│   ├── (.)propiedades/[id]/page.tsx
│   └── default.tsx
└── login/page.tsx
```

### Patrón B: Múltiples Slots Temáticos

**✅ Ventajas:**
- Separación lógica por funcionalidad
- Más organizado para proyectos grandes

**❌ Desventajas:**
- Riesgo de mostrar múltiples modales simultáneamente
- Más archivos `default.tsx` requeridos

```
app/
├── layout.tsx
├── @auth/
│   ├── (.)login/page.tsx
│   └── default.tsx
├── @property/
│   ├── (.)propiedades/[id]/page.tsx
│   └── default.tsx
└── @checkout/
    ├── (.)checkout/page.tsx
    └── default.tsx
```

**⚠️ Importante:** Si tienes múltiples slots paralelos, TODOS deben tener `default.tsx` o Next.js lanzará 404s.

---

## 🔧 Patrones de Implementación

### 1. Modal Básico con Intercepting Route

```tsx
// app/@modal/(.)login/page.tsx
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginModal() {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent>
        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}
```

**✅ Características:**
- `open={true}` - Modal siempre abierto cuando se renderiza
- `router.back()` - Cierra el modal (vuelve a la página anterior)
- Server Component para el form (separación de concerns)

### 2. Navegación desde Componentes

**❌ INCORRECTO:**
```tsx
// No usar <a> tags
<a href="/login">Login</a>
```

**✅ CORRECTO:**
```tsx
import Link from "next/link";

<Link href="/login">Login</Link>
```

**Razón:** Solo el componente `<Link>` de Next.js activa la intercepción de rutas. Los `<a>` tags hacen hard navigation.

### 3. Navegación Programática

**✅ CORRECTO - Dentro de Componentes:**
```tsx
"use client";

import { useRouter } from "next/navigation";

function MyComponent() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/login"); // ✅ Soft navigation
  };

  return <button onClick={handleClick}>Open Modal</button>;
}
```

**❌ INCORRECTO - Dentro de Stores (Zustand):**
```tsx
// ❌ No puedes usar hooks en Zustand stores
export const useMyStore = create((set) => ({
  openModal: () => {
    const router = useRouter(); // ❌ ERROR: Hooks solo en componentes
    router.push("/login");
  },
}));
```

---

## 🎯 Mejores Prácticas 2025

### 1. ⚠️ SIEMPRE Crear `default.tsx`

**Por qué:** Next.js no puede determinar el estado activo de slots en hard navigation. Sin `default.tsx`, obtendrás 404s.

```tsx
// app/@modal/default.tsx
export default function Default() {
  return null; // No renderiza nada cuando el modal no está activo
}
```

### 2. 🔗 Usar Next.js `<Link>` Component

```tsx
// ✅ CORRECTO
import Link from "next/link";
<Link href="/login">Login</Link>

// ❌ INCORRECTO
<a href="/login">Login</a>
```

### 3. 🎨 Separar Modal UI de Contenido

```tsx
// Modal wrapper (client component)
"use client";

import { Dialog } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function ModalWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      {children}
    </Dialog>
  );
}

// Contenido (puede ser server component)
import { ModalWrapper } from "./modal-wrapper";
import { LoginForm } from "./login-form"; // Server Component

export default function LoginModal() {
  return (
    <ModalWrapper>
      <LoginForm />
    </ModalWrapper>
  );
}
```

### 4. 🚦 Navegación desde Stores: Patrón Event-Driven

Cuando necesitas navegación desde Zustand/stores (donde no puedes usar hooks):

**✅ PATRÓN RECOMENDADO:**

```tsx
// 1. Store emite evento
export const useAuthStore = create((set) => ({
  requireAuth: (returnUrl: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth:required", {
          detail: { returnUrl },
        })
      );
    }
  },
}));

// 2. Hook escucha y navega
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuthNavigation() {
  const router = useRouter();

  useEffect(() => {
    const handler = (event: CustomEvent<{ returnUrl: string }>) => {
      router.push(`/login?returnUrl=${event.detail.returnUrl}`);
    };

    window.addEventListener("auth:required", handler as EventListener);
    return () => window.removeEventListener("auth:required", handler as EventListener);
  }, [router]);
}

// 3. Usar en layout o componente raíz
export default function RootLayout({ children }) {
  useAuthNavigation(); // ✅ Registra el listener
  return <>{children}</>;
}
```

### 5. 📦 Persistir Intents en localStorage

```tsx
// Guardar intent antes de redirect
const saveIntent = (action: string, data: unknown) => {
  localStorage.setItem("authIntent", JSON.stringify({
    action,
    data,
    returnUrl: window.location.pathname,
  }));
};

// Ejecutar intent después de login
useEffect(() => {
  const intentStr = localStorage.getItem("authIntent");
  if (!intentStr) return;

  const intent = JSON.parse(intentStr);

  // Ejecutar la acción guardada
  if (intent.action === "favorite") {
    await toggleFavorite(intent.data.propertyId);
  }

  // Limpiar
  localStorage.removeItem("authIntent");
}, []);
```

### 6. 🎭 Versión Next.js Recomendada

**✅ Next.js 15+** - Issues con dynamic routes solucionados
**❌ Next.js 14** - Problemas conocidos con intercepting routes + dynamic segments

---

## ⚠️ Problemas Comunes y Soluciones

### Problema 1: Modal no aparece, solo página completa

**Síntoma:** Al hacer click, la URL cambia pero se muestra página completa en lugar del modal.

**Causas:**
1. ❌ Usando `<a>` tags en lugar de `<Link>`
2. ❌ Usando `window.location.href` en lugar de `router.push()`
3. ❌ Path de intercepción incorrecto

**Solución:**
```tsx
// ❌ INCORRECTO
<a href="/login">Login</a>
window.location.href = "/login";

// ✅ CORRECTO
import Link from "next/link";
<Link href="/login">Login</Link>

// O programáticamente
const router = useRouter();
router.push("/login");
```

### Problema 2: 404 al refrescar página con modal

**Síntoma:** Modal funciona, pero al refrescar aparece 404.

**Causa:** Falta `default.tsx` en el slot paralelo.

**Solución:**
```tsx
// app/@modal/default.tsx
export default function Default() {
  return null;
}
```

### Problema 3: Múltiples modales se muestran simultáneamente

**Síntoma:** Tienes `@auth` y `@modal` slots, ambos se muestran al mismo tiempo.

**Causa:** Múltiples slots paralelos activos.

**Solución:** Usar un solo slot `@modal` para todos los modales, o implementar lógica de exclusión mutua:

```tsx
export default function Layout({ children, auth, modal }) {
  return (
    <>
      {children}
      {/* Solo mostrar uno a la vez */}
      {auth || modal}
    </>
  );
}
```

### Problema 4: Modal no se cierra después de acción

**Síntoma:** Después de login exitoso, el modal sigue abierto.

**Causa:** No estás navegando después de la acción.

**Solución:**
```tsx
const handleLogin = async (data) => {
  const result = await loginAction(data);

  if (result.success) {
    // ✅ Navegar después de éxito
    router.push("/dashboard");
    // O volver
    router.back();
  }
};
```

### Problema 5: Estado del modal persiste entre navegaciones

**Síntoma:** Abres modal, cierras, navegas a otra página, vuelves → modal sigue en el DOM.

**Causa:** Layouts no se re-renderizan en navegación.

**Solución:** Agregar key prop basada en pathname:

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function Layout({ children, modal }) {
  const pathname = usePathname();

  return (
    <>
      {children}
      <div key={pathname}>{modal}</div>
    </>
  );
}
```

---

## 🎓 Ejemplos Prácticos

### Ejemplo 1: Modal de Login con Intent Preservation

```tsx
// app/@auth/(.)login/page.tsx
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginModal() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const intent = searchParams.get("intent");
  const propertyId = searchParams.get("propertyId");

  const handleSuccess = () => {
    // Guardar intent para ejecución post-login
    if (intent && propertyId) {
      localStorage.setItem("authIntent", JSON.stringify({
        action: intent,
        propertyId,
        redirectTo: searchParams.get("returnUrl") || "/",
      }));
    }

    // Redirigir a perfil (AuthIntentExecutor se encargará del intent)
    router.push("/perfil");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent>
        <LoginForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
```

### Ejemplo 2: Property Preview Modal con Favoritos

```tsx
// app/@modal/(.)propiedades/[id]/page.tsx
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { PropertyPreview } from "@/components/properties/property-preview";
import { use } from "react";

export default function PropertyPreviewModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-3xl">
        <PropertyPreview
          propertyId={id}
          onViewDetails={() => {
            // Cerrar modal y navegar a página completa
            router.push(`/propiedades/${id}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### Ejemplo 3: Navegación desde Zustand Store (Event-Driven)

```tsx
// stores/favorites-store.ts
import { create } from "zustand";

export const useFavoritesStore = create((set) => ({
  toggleFavorite: async (propertyId: string) => {
    const result = await toggleFavoriteAction(propertyId);

    if (result.error?.includes("Authentication required")) {
      // Emitir evento en lugar de navegar directamente
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("favorites:auth-required", {
            detail: { propertyId },
          })
        );
      }
      return;
    }

    // ... resto de lógica
  },
}));

// hooks/use-favorites.ts
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFavoritesStore } from "@/stores/favorites-store";

export function useFavorites() {
  const store = useFavoritesStore();
  const router = useRouter();

  // Escuchar eventos del store
  useEffect(() => {
    const handler = (event: CustomEvent<{ propertyId: string }>) => {
      // Guardar intent
      localStorage.setItem("authIntent", JSON.stringify({
        action: "favorite",
        propertyId: event.detail.propertyId,
        redirectTo: window.location.pathname,
      }));

      // Navegar (abre modal via parallel routes)
      router.push(`/login?intent=favorite&propertyId=${event.detail.propertyId}`);
    };

    window.addEventListener("favorites:auth-required", handler as EventListener);
    return () => window.removeEventListener("favorites:auth-required", handler as EventListener);
  }, [router]);

  return {
    ...store,
  };
}
```

---

## 📚 Referencias y Recursos

### Documentación Oficial
- [Next.js Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
- [Next.js Intercepting Routes](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### Artículos y Guías
- [Using modals in Next.js with parallel routes](https://medium.com/@bashaus/using-modals-in-next-js-with-parallel-routes-slots-route-groups-and-interceptors-0873e173c96d)
- [Maximizing Routing Flexibility with Next.js](https://www.thisdot.co/blog/maximizing-routing-flexibility-with-next-js-parallel-and-intercepting-routes)
- [Shareable Modals in Next.js](https://javascript-conference.com/blog/shareable-modals-nextjs/)
- [Event-Driven Architecture for React](https://dev.to/nicolalc/event-driven-architecture-for-clean-react-component-communication-fph)
- [Zustand Architecture Patterns at Scale](https://brainhub.eu/library/zustand-architecture-patterns-at-scale)

### Discusiones de GitHub
- [Parallel and Intercepting Route Modals #71586](https://github.com/vercel/next.js/discussions/71586)
- [Parallel and intercepting routes #60354](https://github.com/vercel/next.js/discussions/60354)

---

## 🎯 Checklist de Implementación

Usa esta checklist al implementar modales con rutas paralelas:

- [ ] ✅ Crear slot paralelo `@modal/` en el nivel correcto
- [ ] ✅ Agregar `default.tsx` que retorna `null`
- [ ] ✅ Crear intercepting route con prefijo correcto `(.)`
- [ ] ✅ Usar `<Link>` de Next.js (no `<a>` tags)
- [ ] ✅ Implementar `router.back()` para cerrar modal
- [ ] ✅ Si necesitas navegación desde stores, usar patrón event-driven
- [ ] ✅ Guardar intents en localStorage si es necesario
- [ ] ✅ Probar soft navigation (Link) → debe abrir modal
- [ ] ✅ Probar hard navigation (refresh) → debe abrir página completa
- [ ] ✅ Verificar que no hay 404s al refrescar
- [ ] ✅ Asegurar que `children` slot también tiene `default.tsx` si es necesario

---

## 🚀 Conclusión

Las rutas paralelas e intercepting routes en Next.js 16 permiten crear experiencias de modal modernas con:

✅ **URLs compartibles** - Cada modal tiene su propia URL
✅ **Deep linking** - Funciona con marcadores y navegación del navegador
✅ **SEO friendly** - La página completa es indexable
✅ **UX superior** - No pierdes contexto al abrir modales
✅ **Progressive Enhancement** - Funciona sin JavaScript (full page fallback)

**Patrón recomendado para InmoApp:**
- Un slot `@modal` en root layout
- Intercepting routes para todos los modales
- Event-driven pattern para navegación desde Zustand stores
- localStorage para preservar intents post-autenticación

---

**Última actualización:** Diciembre 2, 2025
**Autor:** InmoApp Development Team
**Versión:** 1.0.0
