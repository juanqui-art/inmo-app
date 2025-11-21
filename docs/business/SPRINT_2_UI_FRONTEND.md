# Sprint 2: UI Frontend - Freemium Implementation

> **Duración**: Semana 2 (5 días hábiles)
> **Objetivo**: Implementar interfaz de usuario para límites de tier y upgrades
> **Prerequisitos**: Sprint 1 completado (Schema + Permissions)

---

## 📋 Resumen Ejecutivo

Implementar componentes visuales para que los usuarios:
1. Vean sus límites actuales (propiedades, imágenes)
2. Sepan en qué tier están (FREE/BASIC/PRO)
3. Puedan hacer upgrade cuando alcancen límites
4. Entiendan el valor de cada tier (página /pricing)

---

## 🎯 Objetivos del Sprint

### Funcional
- ✅ Mostrar tier actual del usuario
- ✅ Mostrar límites en dashboard ("2/3 propiedades")
- ✅ Bloquear acciones cuando se alcanza límite
- ✅ Mostrar modal de upgrade con CTA
- ✅ Página de pricing con comparación de tiers

### No Funcional
- ✅ UX clara y no intrusiva
- ✅ Mensajes en español
- ✅ Responsive (mobile + desktop)
- ✅ Accesible (a11y básico)

---

## 📦 Componentes a Crear

### 1. TierBadge (Badge de Tier Actual)

**Ubicación**: `apps/web/components/subscription/tier-badge.tsx`

**Propósito**: Mostrar visualmente el tier del usuario

**Variantes**:
- `FREE` → Gris/Neutro
- `BASIC` → Azul
- `PRO` → Dorado/Premium

**Props**:
```typescript
interface TierBadgeProps {
  tier: SubscriptionTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean; // Mostrar "Gratuito", "Básico", "Pro"
}
```

**Ejemplo de uso**:
```tsx
// En navbar
<TierBadge tier={user.subscriptionTier} size="sm" />

// En perfil
<TierBadge tier={user.subscriptionTier} size="lg" showLabel />
```

**UI sugerida**:
```
FREE:  [  Gratuito  ] (gris, borde simple)
BASIC: [ 💎 Básico  ] (azul, con icono)
PRO:   [ ⭐ Pro     ] (dorado, brillante)
```

---

### 2. PropertyLimitsDisplay (Contador de Límites)

**Ubicación**: `apps/web/components/subscription/property-limits-display.tsx`

**Propósito**: Mostrar uso actual vs límite

**Props**:
```typescript
interface PropertyLimitsDisplayProps {
  current: number;      // Propiedades actuales
  limit: number;        // Límite del tier
  type: "property" | "image"; // Tipo de límite
  showProgressBar?: boolean;  // Barra de progreso
}
```

**Ejemplo de uso**:
```tsx
// En dashboard header
<PropertyLimitsDisplay
  current={2}
  limit={3}
  type="property"
  showProgressBar
/>

// Output: "Propiedades: 2/3 [====    ]"
```

**Estados visuales**:
- **< 80%**: Verde (OK)
- **80-99%**: Amarillo (Warning)
- **100%**: Rojo (Límite alcanzado)

---

### 3. UpgradeButton (Botón de Upgrade)

**Ubicación**: `apps/web/components/subscription/upgrade-button.tsx`

**Propósito**: CTA para actualizar plan

**Props**:
```typescript
interface UpgradeButtonProps {
  currentTier: SubscriptionTier;
  variant?: "primary" | "secondary" | "ghost";
  reason?: string; // Razón del upgrade (opcional)
}
```

**Ejemplo de uso**:
```tsx
// Botón simple
<UpgradeButton currentTier="FREE" />

// Con razón específica
<UpgradeButton
  currentTier="FREE"
  reason="Has alcanzado el límite de propiedades"
/>
```

**Comportamiento**:
- Si `tier === FREE` → "Actualizar a Básico"
- Si `tier === BASIC` → "Actualizar a Pro"
- Si `tier === PRO` → Ocultar botón (ya está en top tier)
- Click → Redirigir a `/pricing`

---

### 4. UpgradeModal (Modal de Límite Alcanzado)

**Ubicación**: `apps/web/components/subscription/upgrade-modal.tsx`

**Propósito**: Interceptar cuando se alcanza límite

**Props**:
```typescript
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "property" | "image";
  currentTier: SubscriptionTier;
  currentLimit: number;
}
```

**Ejemplo de uso**:
```tsx
// En formulario de creación de propiedades
{state?.upgradeRequired && (
  <UpgradeModal
    isOpen={true}
    onClose={() => setUpgradeModalOpen(false)}
    limitType="property"
    currentTier={user.subscriptionTier}
    currentLimit={state.currentLimit}
  />
)}
```

**Contenido del modal**:
```
┌─────────────────────────────────────────┐
│  ⚠️  Límite Alcanzado                   │
├─────────────────────────────────────────┤
│                                         │
│  Has alcanzado el límite de            │
│  1 propiedad del plan Gratuito.        │
│                                         │
│  Actualiza a Básico para publicar      │
│  hasta 3 propiedades.                  │
│                                         │
│  [Cancelar]  [Ver Planes →]            │
└─────────────────────────────────────────┘
```

---

### 5. TierComparisonTable (Tabla de Comparación)

**Ubicación**: `apps/web/components/subscription/tier-comparison-table.tsx`

**Propósito**: Comparar features de los 3 tiers

**Props**:
```typescript
interface TierComparisonTableProps {
  highlightTier?: SubscriptionTier; // Resaltar tier específico
  showPrices?: boolean;             // Mostrar precios
}
```

**Diseño sugerido**:
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Feature   │    FREE     │    BASIC    │     PRO     │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Precio      │    $0/mes   │  $4.99/mes  │ $14.99/mes  │
│ Propiedades │      1      │      3      │     10      │
│ Imágenes    │      5      │     10      │     20      │
│ Destacados  │     ❌      │   3/mes     │  Ilimitado  │
│ Analytics   │     ❌      │      ✅     │      ✅     │
│ Soporte     │ Email 72h   │ Email 24h   │WhatsApp 12h │
│             │             │             │             │
│             │ [Gratis] │ [Suscribirse] │[Suscribirse]│
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 📄 Páginas a Crear/Modificar

### 1. Página `/pricing` (Nueva)

**Ubicación**: `apps/web/app/(public)/pricing/page.tsx`

**Estructura**:
```tsx
export default async function PricingPage() {
  const user = await getCurrentUser(); // Opcional (si está autenticado)

  return (
    <div className="pricing-page">
      {/* Header */}
      <h1>Planes y Precios</h1>
      <p>Elige el plan perfecto para tu negocio inmobiliario</p>

      {/* Comparison Table */}
      <TierComparisonTable
        highlightTier={user?.subscriptionTier}
        showPrices
      />

      {/* FAQ Section */}
      <section className="faq">
        <h2>Preguntas Frecuentes</h2>
        {/* FAQs sobre suscripciones */}
      </section>
    </div>
  );
}
```

**SEO**:
- Title: "Planes y Precios - InmoApp"
- Description: "Desde $0/mes. Publica propiedades en Ecuador con planes flexibles."

---

### 2. Dashboard de Propiedades (Modificar)

**Ubicación**: `apps/web/app/(dashboard)/propiedades/page.tsx`

**Cambios a agregar**:

```tsx
export default async function PropertiesPage() {
  const user = await requireRole(["AGENT", "ADMIN"]);

  // Obtener límites
  const propertyLimit = getPropertyLimit(user.subscriptionTier);
  const currentCount = await db.property.count({
    where: { agentId: user.id }
  });

  return (
    <div className="dashboard-properties">
      {/* Header con límites */}
      <header className="flex items-center justify-between">
        <div>
          <h1>Mis Propiedades</h1>
          <PropertyLimitsDisplay
            current={currentCount}
            limit={propertyLimit}
            type="property"
            showProgressBar
          />
        </div>

        <div className="flex gap-2">
          {/* Mostrar upgrade si está cerca del límite */}
          {currentCount >= propertyLimit * 0.8 && (
            <UpgradeButton currentTier={user.subscriptionTier} />
          )}

          {/* Botón crear (deshabilitar si límite alcanzado) */}
          <Button
            disabled={currentCount >= propertyLimit}
          >
            Nueva Propiedad
          </Button>
        </div>
      </header>

      {/* Lista de propiedades */}
      <PropertiesList properties={properties} />
    </div>
  );
}
```

---

### 3. Formulario de Creación (Modificar)

**Ubicación**: `apps/web/app/(dashboard)/propiedades/nueva/page.tsx`

**Cambios a agregar**:

```tsx
"use client";

export default function CreatePropertyPage() {
  const [state, formAction] = useFormState(createPropertyAction, null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Detectar si se alcanzó el límite
  useEffect(() => {
    if (state?.upgradeRequired) {
      setUpgradeModalOpen(true);
    }
  }, [state]);

  return (
    <>
      <form action={formAction}>
        {/* Campos del formulario */}

        {/* Mostrar error de límite */}
        {state?.error?.general && (
          <Alert variant="error">
            {state.error.general}
          </Alert>
        )}

        <Button type="submit">Crear Propiedad</Button>
      </form>

      {/* Modal de upgrade */}
      {upgradeModalOpen && (
        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          limitType="property"
          currentTier={/* obtener tier actual */}
          currentLimit={state.currentLimit}
        />
      )}
    </>
  );
}
```

---

### 4. Upload de Imágenes (Modificar)

**Ubicación**: Componente de upload de imágenes

**Cambios a agregar**:

```tsx
"use client";

export function ImageUploader({ propertyId, tier }: Props) {
  const imageLimit = getImageLimit(tier);
  const [uploadedCount, setUploadedCount] = useState(0);

  const canUploadMore = uploadedCount < imageLimit;

  return (
    <div className="image-uploader">
      {/* Header con límite */}
      <div className="flex items-center justify-between">
        <h3>Imágenes</h3>
        <PropertyLimitsDisplay
          current={uploadedCount}
          limit={imageLimit}
          type="image"
        />
      </div>

      {/* Input deshabilitado si alcanza límite */}
      <input
        type="file"
        disabled={!canUploadMore}
        onChange={handleUpload}
      />

      {/* Mensaje de límite */}
      {!canUploadMore && (
        <Alert variant="warning">
          Has alcanzado el límite de {imageLimit} imágenes.
          <UpgradeButton currentTier={tier} />
        </Alert>
      )}
    </div>
  );
}
```

---

### 5. Navbar/Header (Modificar)

**Ubicación**: `apps/web/components/layout/navbar.tsx`

**Cambios a agregar**:

```tsx
export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="navbar">
      {/* Logo */}
      <Logo />

      {/* Links */}
      <div className="nav-links">
        <Link href="/mapa">Buscar</Link>
        <Link href="/pricing">Planes</Link>
      </div>

      {/* User menu */}
      {user && (
        <div className="user-menu">
          {/* Badge de tier */}
          <TierBadge tier={user.subscriptionTier} size="sm" />

          {/* Dropdown */}
          <UserDropdown user={user} />
        </div>
      )}
    </nav>
  );
}
```

---

## 🎨 Diseño y Estilos

### Colores por Tier

```css
/* FREE - Gris/Neutro */
--tier-free-bg: #f3f4f6;
--tier-free-border: #d1d5db;
--tier-free-text: #6b7280;

/* BASIC - Azul */
--tier-basic-bg: #dbeafe;
--tier-basic-border: #3b82f6;
--tier-basic-text: #1e40af;

/* PRO - Dorado */
--tier-pro-bg: #fef3c7;
--tier-pro-border: #f59e0b;
--tier-pro-text: #92400e;
```

### Estados de Límite

```css
/* OK (< 80%) */
--limit-ok-color: #10b981;

/* Warning (80-99%) */
--limit-warning-color: #f59e0b;

/* Full (100%) */
--limit-full-color: #ef4444;
```

---

## 🧪 Testing

### Tests Unitarios

**Archivo**: `apps/web/components/subscription/__tests__/tier-badge.test.tsx`

```typescript
describe("TierBadge", () => {
  it("renders FREE tier correctly", () => {
    render(<TierBadge tier="FREE" />);
    expect(screen.getByText("Gratuito")).toBeInTheDocument();
  });

  it("renders BASIC tier with correct styles", () => {
    render(<TierBadge tier="BASIC" />);
    const badge = screen.getByText("Básico");
    expect(badge).toHaveClass("tier-basic");
  });

  // ... más tests
});
```

### Tests de Integración

**Archivo**: `apps/web/app/(dashboard)/propiedades/__tests__/limits.test.tsx`

```typescript
describe("Property Limits", () => {
  it("shows upgrade modal when FREE user tries to create 2nd property", async () => {
    // Mock user con tier FREE y 1 propiedad existente
    const user = createMockUser({ subscriptionTier: "FREE" });

    // Intentar crear segunda propiedad
    const result = await createPropertyAction(null, formData);

    // Debe retornar upgradeRequired
    expect(result.upgradeRequired).toBe(true);
    expect(result.currentLimit).toBe(1);
  });
});
```

---

## 📋 Checklist de Implementación

### Día 1-2: Componentes Base
- [ ] Crear `tier-badge.tsx`
- [ ] Crear `property-limits-display.tsx`
- [ ] Crear `upgrade-button.tsx`
- [ ] Tests unitarios de componentes

### Día 2-3: Modales y Tablas
- [ ] Crear `upgrade-modal.tsx`
- [ ] Crear `tier-comparison-table.tsx`
- [ ] Integrar con Radix UI Dialog
- [ ] Responsive design

### Día 3-4: Páginas
- [ ] Crear `/pricing` page
- [ ] Modificar dashboard de propiedades
- [ ] Modificar formulario de creación
- [ ] Modificar upload de imágenes

### Día 4-5: Integración y Testing
- [ ] Agregar badges en navbar
- [ ] Tests de integración
- [ ] Verificar responsive
- [ ] Verificar accesibilidad (a11y)
- [ ] QA manual

---

## 🚀 Criterios de Aceptación

### Funcional
- ✅ Usuario puede ver su tier actual en navbar
- ✅ Usuario ve contador "X/Y propiedades" en dashboard
- ✅ Usuario no puede crear propiedad si alcanza límite
- ✅ Usuario ve modal de upgrade cuando alcanza límite
- ✅ Usuario puede navegar a `/pricing` y ver comparación

### UX
- ✅ Mensajes claros en español
- ✅ Colores diferenciados por tier (FREE gris, BASIC azul, PRO dorado)
- ✅ Estados visuales de límites (verde/amarillo/rojo)
- ✅ Modal no intrusivo (se puede cerrar)
- ✅ Responsive en mobile y desktop

### Técnico
- ✅ Componentes reutilizables
- ✅ Props con TypeScript
- ✅ Tests unitarios (>80% coverage)
- ✅ Accesibilidad básica (a11y)

---

## 📚 Referencias

### UI/UX Inspiration
- **Stripe Pricing**: https://stripe.com/pricing
- **Linear Pricing**: https://linear.app/pricing
- **Vercel Pricing**: https://vercel.com/pricing

### Componentes
- **Radix UI**: https://www.radix-ui.com/
  - Dialog (para modales)
  - Badge (para tier badges)
  - Progress (para barras de progreso)

### Accesibilidad
- **a11y Project**: https://www.a11yproject.com/checklist/
- **ARIA Labels**: Agregar `aria-label` a badges y botones

---

## 🎯 Entregables

Al finalizar Sprint 2:

1. **6 componentes nuevos**:
   - `tier-badge.tsx`
   - `property-limits-display.tsx`
   - `upgrade-button.tsx`
   - `upgrade-modal.tsx`
   - `tier-comparison-table.tsx`
   - Tests de cada componente

2. **1 página nueva**:
   - `/pricing` con tabla de comparación

3. **3 páginas modificadas**:
   - Dashboard de propiedades (con límites)
   - Formulario de creación (con modal de upgrade)
   - Upload de imágenes (con límites)

4. **1 layout modificado**:
   - Navbar con badge de tier

**Total**: ~8-10 archivos creados/modificados

---

## ⏭️ Siguiente Paso

Una vez completado Sprint 2, el usuario podrá:
- ✅ Ver su tier actual visualmente
- ✅ Entender sus límites actuales
- ✅ Saber cuándo necesita actualizar
- ✅ Comparar tiers en `/pricing`

**Próximo sprint**: Sprint 3-4 (Stripe Integration) para hacer funcionales los upgrades.

---

**Creado**: Noviembre 21, 2025
**Status**: 📋 Listo para implementar
