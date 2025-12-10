# 🔬 FREEMIUM SYSTEM - ULTRA-DEEP ANALYSIS
## Estado Actual vs Planificado (Ultrathink Mode)

**Fecha:** Diciembre 9, 2025
**Análisis:** Ultra-profundo de implementación de sistema freemium
**Scope:** Registro, Tiers, UI, Backend, Payment Flow

---

## 📊 RESUMEN EJECUTIVO

### Estado Global del Sistema Freemium

| Componente | Completitud | Estado | Notas |
|-----------|-------------|--------|-------|
| **Database Schema** | 100% ✅ | Listo | SubscriptionTier enum, Stripe fields |
| **Pricing Tiers Config** | 100% ✅ | Listo | FREE/BASIC/PRO definidos |
| **Permission System** | 100% ✅ | Listo | property-limits.ts con helpers |
| **Signup Flow** | 95% ✅ | Funcional | Plan selection + role assignment |
| **Landing Page (/vender)** | 100% ✅ | Producción | Premium design, 3 sections, FAQ |
| **Pricing Cards** | 100% ✅ | Producción | Reutilizable, responsive, glassmorphism |
| **Dashboard UI** | 70% 🔄 | Parcial | PlanUsage existe, falta subscription panel completo |
| **Upgrade Flow** | 90% 🔄 | Simulado | Modal funcional, Stripe pendiente |
| **Stripe Integration** | 0% ⏳ | Pendiente | Schema ready, no implementation |
| **Limit Enforcement** | 100% ✅ | Producción | Validación en createPropertyAction |

**Porcentaje Global:** ~85% completado (sin Stripe), ~60% completado (con Stripe)

---

## 🗄️ CAPA 1: DATABASE SCHEMA (100% ✅)

### Enum SubscriptionTier

```prisma
enum SubscriptionTier {
  FREE
  BASIC
  PRO
}
```

### User Model - Campos de Suscripción

```prisma
model User {
  id                     String            @id @default(cuid())
  email                  String            @unique
  name                   String
  role                   UserRole          @default(CLIENT)
  subscriptionTier       SubscriptionTier  @default(FREE)

  // Stripe Integration Fields (Ready)
  stripeCustomerId       String?           @unique
  stripeSubscriptionId   String?
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?

  // Timestamps
  createdAt              DateTime          @default(now())
  updatedAt              DateTime          @updatedAt
}
```

**Status:**
- ✅ SubscriptionTier enum con 3 valores
- ✅ Default: FREE
- ✅ Stripe fields listos (customer ID, subscription ID, price ID, period end)
- ✅ Migraciones aplicadas

**Observaciones:**
- Schema 100% preparado para Stripe integration
- Campos opcionales (nullables) permiten migración gradual
- No hay índices adicionales necesarios (stripeCustomerId ya es @unique)

---

## 💰 CAPA 2: PRICING TIERS CONFIG (100% ✅)

### Archivo: `apps/web/lib/pricing/tiers.ts`

```typescript
export const pricingTiers: PricingTier[] = [
  {
    name: "FREE",
    displayName: "Gratuito",
    price: 0,
    currency: "$",
    period: "por mes",
    features: [
      "1 propiedad activa",
      "5 imágenes por propiedad",
      "Publicación sin expiración",
      "Búsqueda y mapas",
      "Soporte por email (72h)",
    ],
    ctaText: "Comenzar gratis",
    ctaUrl: "/signup?plan=free&redirect=/dashboard/propiedades/nueva",
    highlighted: false,
  },
  {
    name: "BASIC",
    displayName: "Básico",
    price: 4.99,
    currency: "$",
    period: "por mes",
    features: [
      "3 propiedades activas",
      "10 imágenes por propiedad",
      "3 destacados por mes",
      "Analytics básico",
      "Publicación sin expiración",
      "Soporte por email (24h)",
    ],
    ctaText: "Comenzar prueba",
    ctaUrl: "/signup?plan=basic&redirect=/dashboard",
    highlighted: true, // ⭐ Plan recomendado
  },
  {
    name: "PRO",
    displayName: "Pro",
    price: 14.99,
    currency: "$",
    period: "por mes",
    features: [
      "10 propiedades activas",
      "20 imágenes por propiedad",
      "Destacados ilimitados",
      "Analytics avanzado",
      "Badge 'Agente Verificado'",
      "Publicación sin expiración",
      "Soporte WhatsApp (12h)",
    ],
    ctaText: "Escalar ahora",
    ctaUrl: "/signup?plan=pro&redirect=/dashboard",
    highlighted: false,
  },
];
```

**Helpers disponibles:**
- `getTierByName(name: "FREE" | "BASIC" | "PRO")` - Obtener tier específico
- `getHighlightedTier()` - Obtener tier recomendado (BASIC)

**Status:**
- ✅ 3 tiers definidos con precios finales aprobados
- ✅ Features claras y diferenciadas
- ✅ CTAs optimizados con query params (plan + redirect)
- ✅ Highlighted tier (BASIC) para UI prominence
- ✅ Pricing en USD (decisión aprobada para Ecuador)

**Decisiones de Negocio Implementadas:**
1. ✅ FREE: 1 propiedad (generoso para adquisición)
2. ✅ BASIC: $4.99 (sweet spot vs $3-5 competitors)
3. ✅ PRO: $14.99 (value proposition para agentes serios)
4. ✅ Sin expiración automática (decisión final Nov 20, 2025)

---

## 🔐 CAPA 3: PERMISSION SYSTEM (100% ✅)

### Archivo: `apps/web/lib/permissions/property-limits.ts`

```typescript
const TIER_LIMITS = {
  FREE: { properties: 1, images: 5, featureListings: 0 },
  BASIC: { properties: 3, images: 10, featureListings: 3 },
  PRO: { properties: 10, images: 20, featureListings: Infinity },
} as const;

export async function canCreateProperty(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      properties: {
        where: { status: { not: "SOLD" } },
        select: { id: true },
      },
    },
  });

  if (!user) return false;

  const tier = user.subscriptionTier;
  const limit = TIER_LIMITS[tier].properties;
  const currentCount = user.properties.length;

  return currentCount < limit;
}

export async function canUploadImage(
  userId: string,
  propertyId: string,
  additionalImages: number = 1
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) return false;

  const property = await db.property.findUnique({
    where: { id: propertyId },
    include: { images: true },
  });

  if (!property) return false;

  const tier = user.subscriptionTier;
  const limit = TIER_LIMITS[tier].images;
  const currentCount = property.images.length;

  return currentCount + additionalImages <= limit;
}

export async function canFeatureProperty(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) return false;

  const tier = user.subscriptionTier;
  const limit = TIER_LIMITS[tier].featureListings;

  if (limit === Infinity) return true;

  // TODO: Implementar contador de featured properties en periodo actual
  // Por ahora, retornar true (optimista)
  return true;
}

// Helpers adicionales
export function getPropertyLimit(tier: SubscriptionTier): number;
export function getImageLimit(tier: SubscriptionTier): number;
export function getFeatureLimit(tier: SubscriptionTier): number | "unlimited";
```

**Status:**
- ✅ TIER_LIMITS centralizados
- ✅ canCreateProperty implementado y testeado (usado en Server Action)
- ✅ canUploadImage implementado
- ✅ canFeatureProperty preparado (pendiente contador de featured)
- ✅ Unit tests: 10 tests passing (property-limits.test.ts)

**Enforcement Locations:**
1. ✅ `createPropertyAction` (apps/web/app/actions/properties.ts:34)
   ```typescript
   const canCreate = await canCreateProperty(user.id);
   if (!canCreate) {
     const tier = user.subscriptionTier;
     const limit = getPropertyLimit(tier);
     return {
       error: {
         general: `Has alcanzado el límite de propiedades (${limit}) para tu plan ${tier}.`,
       },
     };
   }
   ```
2. ✅ `uploadPropertyImagesAction` (image limit validation)

**TODO:**
- ⏳ Feature listing counter (requires monthly reset logic)
- ⏳ Analytics tier restrictions (BASIC vs PRO features)

---

## 📝 CAPA 4: SIGNUP FLOW (95% ✅)

### 4.1 Signup Page (`apps/web/app/(auth)/signup/page.tsx`)

**Features implementadas:**
- ✅ Plan badge visual cuando viene con plan seleccionado
- ✅ Query params support: `?plan=free/basic/pro&redirect=/path`
- ✅ Plan config con colores diferenciados:
  - FREE: emerald (green)
  - BASIC: indigo (blue)
  - PRO: purple
- ✅ Mensaje contextual según plan:
  - Con plan: "Completa tu registro para activar el plan [Plan]"
  - Sin plan: "Únete a InmoApp y encuentra tu propiedad ideal"
- ✅ Google OAuth + Email/Password
- ✅ Link a login preservando query params

**Ejemplo visual:**

```
┌─────────────────────────────────────┐
│  Plan seleccionado: Básico          │  ← Badge si viene con plan
├─────────────────────────────────────┤
│  Crear cuenta                       │
│  Completa tu registro para activar  │
│  el plan Básico                     │
├─────────────────────────────────────┤
│  [Sign in with Google]              │
│  ─── o continúa con email ───       │
│  [Nombre]                           │
│  [Email]                            │
│  [Contraseña]                       │
│  [Crear cuenta]                     │
└─────────────────────────────────────┘
```

### 4.2 Signup Form Component

```typescript
export function SignupForm({ redirect, plan }: {
  redirect?: string;
  plan?: string
}) {
  return (
    <form action={formAction}>
      {redirect && <input type="hidden" name="redirect" value={redirect} />}
      {plan && <input type="hidden" name="plan" value={plan} />}
      {/* ... campos ... */}
    </form>
  );
}
```

**Status:**
- ✅ Hidden inputs para plan y redirect
- ✅ useActionState con signupAction
- ✅ Error handling por campo
- ✅ Loading state (isPending)

### 4.3 Signup Server Action Logic

**Archivo:** `apps/web/app/actions/auth.ts`

```typescript
export async function signupAction(_prevState: unknown, formData: FormData) {
  // 0. Rate limiting (IP-based)
  await enforceRateLimit({ tier: "auth" });

  // 1. Validar con Zod
  const validatedData = signupSchema.safeParse(rawData);

  // 2. Determinar rol según plan
  const hasPlan = rawData.plan && ["FREE", "BASIC", "PRO"].includes(rawData.plan.toUpperCase());
  const role = hasPlan ? "AGENT" : "CLIENT";

  // 3. Crear usuario en Supabase Auth
  await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,        // ← AGENT si viene con plan, CLIENT si no
        plan: rawData.plan,
      },
    },
  });

  // 4. Redirigir según parámetro o rol
  if (redirectParam) {
    redirect(redirectParam);
  } else {
    redirect(hasPlan ? "/dashboard" : "/perfil");
  }
}
```

**Lógica de Roles:**
```
Plan presente (FREE/BASIC/PRO) → AGENT → /dashboard
Sin plan                       → CLIENT → /perfil
```

**Status:**
- ✅ Plan detection funcional
- ✅ Role assignment automático
- ✅ Metadata guardada en Supabase Auth
- ✅ Database trigger crea User en Prisma (vía Supabase webhook)
- ✅ Rate limiting aplicado

**Issue pendiente:**
- ⚠️ Plan FREE no upgradea, pero asigna AGENT role
- ⚠️ Database trigger necesita mapear plan → subscriptionTier
  - Actualmente: Todos empiezan con FREE en DB
  - Expected: Si signup con plan=BASIC → subscriptionTier=BASIC en DB

**Solución sugerida:**
```typescript
// En Database Trigger (Supabase):
const tier = metadata.plan?.toUpperCase() || 'FREE';
await db.user.create({
  data: {
    id: auth_user_id,
    email,
    name: metadata.name,
    role: metadata.role || 'CLIENT',
    subscriptionTier: tier, // ← Mapear desde metadata
  },
});
```

---

## 🎨 CAPA 5: UI/UX IMPLEMENTATION

### 5.1 Landing Page `/vender` (100% ✅)

**Secciones implementadas:**

1. **Hero Section** (100%)
   - ✅ Video background (HeroBackground component)
   - ✅ Headline: "Publica tu propiedad gratis"
   - ✅ CTA dual:
     - Authenticated: "Ir a mi Dashboard"
     - Guest: "Comenzar gratis" → /signup?plan=free
   - ✅ Trust signals (3 badges con checkmarks)
   - ✅ Gradient overlay + glassmorphism

2. **Benefits Section** (100%)
   - ✅ 3 benefit cards con iconos animados
   - ✅ Glassmorphism design
   - ✅ Hover effects
   - ✅ Decorative gradient blobs
   - Content:
     - "Plan gratuito real" (CheckCircle icon, green)
     - "Búsqueda inteligente con IA" (Users icon, indigo)
     - "Gestión profesional" (TrendingUp icon, purple)

3. **How it Works** (100%)
   - ✅ 3 steps numerados
   - ✅ Connector line (desktop only)
   - ✅ Step cards con hover animations
   - Steps:
     1. Crea tu cuenta (< 1 minuto)
     2. Publica tu propiedad (completa info + fotos)
     3. Gestiona publicaciones (dashboard)

4. **FAQ Section** (100%)
   - ✅ FAQAccordion component
   - ✅ 6 preguntas respondidas:
     - Plan gratuito features
     - Escalar a más propiedades
     - Cancelación política
     - Comisiones (NO cobramos)
     - Tarjeta de crédito para FREE (NO requerida)
     - Destacados explicación
   - ✅ CTA footer: "Ver planes y comenzar"

5. **Pricing Section** (100%)
   - ✅ PricingCard x3 (FREE, BASIC, PRO)
   - ✅ Conditional CTAs basados en auth state:
     - Guest: "Comenzar gratis", "Comenzar prueba", "Escalar ahora"
     - Current plan: "Tu Plan Actual" (disabled, outline variant)
     - Lower plans: "Incluido en tu plan" (disabled)
     - Upgrade: "Mejorar Plan" → /dashboard?upgrade=basic
   - ✅ Decorative background (gradient blobs + grid pattern)
   - ✅ Trust indicators: "Sin tarjeta", "Cancela", "Soporte"

**SEO Metadata:**
```typescript
export const metadata = {
  title: "Publica tu Propiedad Gratis | InmoApp",
  description: "Comienza con 1 propiedad gratis, sin expiración...",
  openGraph: { ... },
};
```

**Design System:**
- ✅ Consistent color scheme (indigo/purple gradients)
- ✅ Dark mode support en todas las secciones
- ✅ Responsive grid layouts
- ✅ Subtle animations (hover, scale, translate-y)
- ✅ Glassmorphism (backdrop-blur + bg-white/5)

**Performance:**
- ✅ Server Component (0kb JavaScript base)
- ✅ Lazy imports para video background
- ✅ Optimized Next.js Image components (falta implementar)

### 5.2 Pricing Card Component (100% ✅)

**Archivo:** `apps/web/components/pricing/pricing-card.tsx`

```typescript
interface PricingTier {
  name: string;
  displayName: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
  ctaUrl: string;
  disabled?: boolean;       // ← Added for current plan
  buttonVariant?: string;   // ← Added for visual variants
}
```

**Features:**
- ✅ Reutilizable (usado en /vender y upgrade modal)
- ✅ Compact mode para diferentes layouts
- ✅ Highlighted tier (scale-105, gradient, badge "⭐ Más Popular")
- ✅ Hover animations (scale, shadow, translate-y)
- ✅ Gradient overlay on hover
- ✅ CheckCircle icons con colores por tier
- ✅ Responsive typography
- ✅ Dark mode support

**Visual Hierarchy:**
```
┌──────────────────────────┐
│  ⭐ Más Popular           │  ← Badge (si highlighted)
├──────────────────────────┤
│  Básico                  │  ← displayName
│  Ideal para agentes...   │  ← description (si no compact)
├──────────────────────────┤
│  $ 4.99                  │  ← Precio grande
│  por mes                 │  ← Periodo
├──────────────────────────┤
│  ✓ 3 propiedades         │  ← Features con checkmarks
│  ✓ 10 imágenes           │
│  ✓ 3 destacados/mes      │
│  ✓ Analytics básico      │
│  ✓ Sin expiración        │
│  ✓ Soporte 24h           │
├──────────────────────────┤
│  [Comenzar prueba]       │  ← CTA button
└──────────────────────────┘
```

### 5.3 Dashboard UI - Subscription Panel (70% 🔄)

#### Implementado: PlanUsage Component

**Archivo:** `apps/web/components/dashboard/plan-usage.tsx`

```typescript
export function PlanUsage({
  tier,
  propertyCount,
  propertyLimit,
  imageLimit,
  className,
}: PlanUsageProps) {
  const percentage = (propertyCount / propertyLimit) * 100;
  const isNearLimit = percentage >= 80;

  return (
    <div className="p-4 rounded-lg bg-muted/50">
      {/* Header con badge y upgrade link */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Zap className="text-yellow-500 fill-yellow-500" />
          <span>Plan {tier}</span>
        </div>
        {tier !== "PRO" && (
          <Link href={`/dashboard?upgrade=${nextTier}`}>
            Mejorar
          </Link>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Propiedades</span>
          <span className={isNearLimit && "text-red-500"}>
            {propertyCount} / {propertyLimit}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full">
          <div
            className={isNearLimit ? "bg-red-500" : "bg-primary"}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Image limit info */}
      <div className="text-xs text-muted-foreground">
        <p>• {imageLimit} imágenes por propiedad</p>
      </div>
    </div>
  );
}
```

**Features:**
- ✅ Visual progress bar (properties usage)
- ✅ Red warning cuando ≥80% limit
- ✅ Upgrade link si no es PRO
- ✅ Image limit display
- ✅ Responsive + dark mode

**Usado en:** Dashboard layout sidebar (pendiente confirmar ubicación)

#### Pendiente: Subscription Panel Component (30% ⏳)

**Planeado:** `apps/web/components/dashboard/subscription-panel.tsx`

**Features esperadas según plan:**
- [ ] Current tier display (card con badge)
- [ ] Property usage: X/Y (con barra progreso) ← Exists en PlanUsage
- [ ] Image usage: X/Y ← Exists en PlanUsage
- [ ] Upgrade CTA buttons → Stripe checkout (disabled por ahora)
- [ ] Feature comparison table (FREE vs BASIC vs PRO)
- [ ] Billing history placeholder (ready for Stripe)
- [ ] Next billing date placeholder (stripeCurrentPeriodEnd)
- [ ] Cancel subscription button (con confirmation)

**Integración esperada:**
```typescript
<SubscriptionPanel
  user={user}
  currentTier={user.subscriptionTier}
  propertyCount={properties.length}
  propertyLimit={getPropertyLimit(user.subscriptionTier)}
  imageLimit={getImageLimit(user.subscriptionTier)}
  nextBillingDate={user.stripeCurrentPeriodEnd}
  canUpgrade={user.subscriptionTier !== "PRO"}
/>
```

### 5.4 Upgrade Flow (90% 🔄)

#### Upgrade Modal Component

**Archivo:** `apps/web/components/dashboard/upgrade-modal.tsx`

**Trigger:** Query param `?upgrade=basic` o `?upgrade=pro`

**Features implementadas:**
- ✅ Modal overlay (backdrop-blur)
- ✅ Two-column layout (plan details + payment form)
- ✅ Plan summary (PricingCard integration)
- ✅ Mock payment form (card number, expiry, CVC, name)
- ✅ Order summary (subtotal, taxes, total)
- ✅ "Modo Simulado" notice (blue banner)
- ✅ Confirm button con loading state
- ✅ Close button (X)
- ✅ Responsive (stacks vertical en mobile)

**Payment form fields (mock):**
```typescript
<input placeholder="0000 0000 0000 0000" disabled={isPending} />
<input placeholder="MM / AA" disabled={isPending} />
<input placeholder="123" disabled={isPending} />
<input placeholder="Juan Pérez" disabled={isPending} />
```

**Flow:**
```
1. User clicks "Mejorar Plan" en dashboard
   ↓
2. URL cambia a /dashboard?upgrade=basic
   ↓
3. UpgradeModal detecta query param y se abre
   ↓
4. User completa form (mock) y click "Confirmar"
   ↓
5. upgradeSubscriptionAction ejecuta:
   - Simula delay 1s
   - Actualiza subscriptionTier en DB
   - Promote CLIENT → AGENT si aplica
   ↓
6. window.location.href = "/dashboard" (hard reload)
   ↓
7. Dashboard refleja nuevo tier
```

**Observaciones:**
- ✅ Funciona end-to-end (sin Stripe)
- ✅ User experience smooth
- ⚠️ Hard reload (window.location.href) - mejorable con revalidate
- ⏳ Falta Stripe Checkout Session integration

#### Upgrade Server Action

**Archivo:** `apps/web/app/actions/subscription.ts`

```typescript
export async function upgradeSubscriptionAction(formData: FormData) {
  const user = await requireAuth();
  const plan = formData.get("plan") as string;

  if (!plan || !["BASIC", "PRO"].includes(plan)) {
    return { error: "Plan inválido" };
  }

  // Simular delay de procesamiento
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Actualizar tier
  await db.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: plan as "BASIC" | "PRO",
      role: user.role === "CLIENT" ? "AGENT" : user.role,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
```

**Status:**
- ✅ Auth verification
- ✅ Plan validation
- ✅ Database update
- ✅ Role promotion (CLIENT → AGENT on first paid plan)
- ✅ Cache revalidation
- ⏳ Stripe integration pendiente

**TODO para Stripe:**
```typescript
// Create Stripe Checkout Session
const session = await stripe.checkout.sessions.create({
  customer: user.stripeCustomerId || undefined,
  mode: 'subscription',
  line_items: [{ price: STRIPE_PRICE_IDS[plan], quantity: 1 }],
  success_url: `${env.NEXT_PUBLIC_SITE_URL}/dashboard?upgrade_success=true`,
  cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/dashboard?upgrade_cancelled=true`,
  metadata: { userId: user.id, tier: plan },
});

return { checkoutUrl: session.url };
```

---

## 🔌 CAPA 6: STRIPE INTEGRATION (0% ⏳)

### 6.1 Environment Variables (Ready)

**Schema preparado:** `packages/env/src/index.ts`

```typescript
STRIPE_SECRET_KEY: z.string().min(1).startsWith("sk_").optional(),
STRIPE_WEBHOOK_SECRET: z.string().min(1).startsWith("whsec_").optional(),
STRIPE_BASIC_PRICE_ID: z.string().min(1).startsWith("price_").optional(),
STRIPE_PRO_PRICE_ID: z.string().min(1).startsWith("price_").optional(),
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).startsWith("pk_").optional(),
```

**Estado:**
- ✅ Validación Zod configurada
- ✅ Todas optional (no bloquea desarrollo)
- ⏳ Variables NO configuradas en .env.local

### 6.2 Database Fields (Ready)

```prisma
stripeCustomerId       String?   @unique
stripeSubscriptionId   String?
stripePriceId          String?
stripeCurrentPeriodEnd DateTime?
```

**Estado:**
- ✅ Campos listos en schema
- ✅ Migration aplicada
- ⏳ Nunca poblados (all NULL)

### 6.3 Stripe Setup Pendiente

**Pasos requeridos:**

1. **Crear Stripe Account** (0%)
   - [ ] Signup en Stripe Dashboard
   - [ ] Completar KYC (verificación identidad)
   - [ ] Configurar business details

2. **Create Products** (0%)
   ```
   Plan Básico ($4.99/mes)
   - Recurring billing
   - Monthly interval
   - Copy price_id → STRIPE_BASIC_PRICE_ID

   Plan Pro ($14.99/mes)
   - Recurring billing
   - Monthly interval
   - Copy price_id → STRIPE_PRO_PRICE_ID
   ```

3. **Configure Webhooks** (0%)
   - [ ] Setup webhook endpoint: `/api/webhooks/stripe`
   - [ ] Subscribe to events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - [ ] Copy signing secret → STRIPE_WEBHOOK_SECRET

4. **Implementar Webhook Handler** (0%)
   ```typescript
   // apps/web/app/api/webhooks/stripe/route.ts
   export async function POST(req: Request) {
     const signature = req.headers.get('stripe-signature');
     const event = stripe.webhooks.constructEvent(
       await req.text(),
       signature,
       env.STRIPE_WEBHOOK_SECRET
     );

     switch (event.type) {
       case 'checkout.session.completed':
         // Update user subscriptionTier
         // Create/update stripeCustomerId
         break;
       case 'customer.subscription.updated':
         // Update subscriptionTier, period end
         break;
       case 'customer.subscription.deleted':
         // Downgrade to FREE
         break;
     }
   }
   ```

5. **Integrar Checkout** (0%)
   - [ ] Replace upgradeSubscriptionAction simulation
   - [ ] Create Checkout Session
   - [ ] Redirect to Stripe hosted page
   - [ ] Handle success/cancel URLs

**Tiempo estimado:** 16-20 horas
- Stripe setup: 1h
- Products creation: 1h
- Webhook implementation: 8h
- Checkout integration: 6h
- Testing: 4h

---

## 📈 CAPA 7: USAGE & ANALYTICS (Missing)

### Current State: Sin tracking

**Pendiente implementar:**

1. **PropertyAnalytics Model** (Sugerido en plan)
   ```prisma
   model PropertyAnalytics {
     id            String   @id @default(cuid())
     propertyId    String
     eventType     String   // view, click, favorite, contact
     userId        String?
     timestamp     DateTime
     metadata      Json?

     property      Property @relation(...)
   }
   ```

2. **Analytics Dashboard** (0%)
   - [ ] `apps/web/app/dashboard/analytics/page.tsx`
   - [ ] Views por día/semana charts
   - [ ] Click-through rate (map → detail)
   - [ ] Favorite count per property
   - [ ] Appointment requests per property
   - [ ] Peak hours/days heatmap
   - [ ] Comparison across properties

3. **Tier-based Analytics Access** (0%)
   - [ ] FREE: Sin analytics
   - [ ] BASIC: Analytics básico (views, favorites)
   - [ ] PRO: Analytics avanzado (CTR, peak hours, A/B testing)

**Beneficio esperado:** +25-40% retención de agentes

---

## 🧪 CAPA 8: TESTING STATUS

### Unit Tests (Property Limits) ✅

**Archivo:** `apps/web/lib/__tests__/property-limits.test.ts`

```
✅ canCreateProperty - FREE tier (limit 1)
✅ canCreateProperty - BASIC tier (limit 3)
✅ canCreateProperty - PRO tier (limit 10)
✅ canCreateProperty - respects SOLD exclusion
✅ canUploadImage - FREE tier (limit 5)
✅ canUploadImage - BASIC tier (limit 10)
✅ canUploadImage - PRO tier (limit 20)
✅ getPropertyLimit helpers
✅ getImageLimit helpers
✅ getFeatureLimit helpers

Total: 10 tests passing
```

### Integration Tests (Pendiente) ⏳

**Sugeridos:**
```typescript
describe("Freemium Flow E2E", () => {
  test("FREE user blocked at property limit", async () => {
    // 1. Signup as FREE
    // 2. Create 1 property (success)
    // 3. Try create 2nd property (blocked)
    // 4. Verify error message shows upgrade CTA
  });

  test("Upgrade flow BASIC → PRO", async () => {
    // 1. Login as BASIC user
    // 2. Navigate to /dashboard?upgrade=pro
    // 3. Complete upgrade modal (mock)
    // 4. Verify tier updated to PRO
    // 5. Verify property limit increased
  });

  test("Plan selection in signup flow", async () => {
    // 1. Visit /vender
    // 2. Click "Comenzar prueba" (BASIC)
    // 3. Verify /signup?plan=basic
    // 4. Complete signup
    // 5. Verify role=AGENT, tier=FREE (hasta Stripe)
  });
});
```

---

## 📋 GAPS & ACTION ITEMS

### 🔴 CRÍTICO (Blockers para producción)

1. **Stripe Integration** (16-20h)
   - [ ] Crear cuenta Stripe
   - [ ] Configurar Products (BASIC, PRO)
   - [ ] Implementar webhook handler
   - [ ] Reemplazar upgradeSubscriptionAction simulado
   - [ ] Testing end-to-end con Stripe test mode

2. **Database Trigger Fix** (1h)
   - [ ] Mapear signup plan → subscriptionTier en DB
   - Actualmente: Todos FREE al signup
   - Esperado: plan=BASIC → subscriptionTier=BASIC

### 🟡 IMPORTANTE (Alta prioridad, no blocker)

3. **Complete Subscription Panel** (4-6h)
   - [ ] Crear SubscriptionPanel component
   - [ ] Feature comparison table
   - [ ] Billing history (from Stripe)
   - [ ] Cancel subscription flow
   - [ ] Next billing date display

4. **Featured Property Counter** (2-3h)
   - [ ] Implementar monthly counter logic
   - [ ] canFeatureProperty con validation real
   - [ ] Admin interface para manual feature

5. **Upgrade Flow Polish** (2h)
   - [ ] Replace window.location.href con router refresh
   - [ ] Add success toast notification
   - [ ] Stripe-specific error handling

### 🟢 NICE TO HAVE (Mejoras futuras)

6. **Analytics Dashboard** (8-10h)
   - PropertyAnalytics model
   - Views tracking
   - Charts (recharts integration)
   - Tier-based access control

7. **E2E Tests** (6-8h)
   - Playwright setup
   - Signup flow with plan
   - Upgrade flow
   - Limit enforcement

8. **Email Templates** (3-4h)
   - Subscription confirmed
   - Payment failed
   - Subscription cancelled
   - Plan downgraded

---

## 🎯 SCORECARD FINAL

| Área | Score | Completitud | Status |
|------|-------|-------------|--------|
| **Database Schema** | 10/10 | 100% | ✅ Production-ready |
| **Pricing Config** | 10/10 | 100% | ✅ Production-ready |
| **Permission System** | 10/10 | 100% | ✅ Production-ready |
| **Signup Flow** | 9/10 | 95% | 🔄 Minor DB trigger fix |
| **Landing Page UI** | 10/10 | 100% | ✅ Production-ready |
| **Dashboard UI** | 7/10 | 70% | 🔄 Partial subscription panel |
| **Upgrade Flow** | 9/10 | 90% | 🔄 Works, needs Stripe |
| **Stripe Integration** | 0/10 | 0% | ⏳ Not started |
| **Analytics** | 0/10 | 0% | ⏳ Not started |
| **Testing** | 5/10 | 50% | 🔄 Unit tests only |

### Overall Assessment

**Sin Stripe:** 85% completado → **Functional for beta testing with manual billing**
**Con Stripe:** 60% completado → **Production-ready with real payments**

**Tiempo restante estimado:**
- Stripe integration: 16-20h
- Subscription panel: 4-6h
- DB trigger fix: 1h
- Polish & testing: 4-6h
- **Total: 25-33 horas (~3-4 días full-time)**

---

## 🚀 RECOMMENDATION

**Current State:** El sistema freemium está **sólidamente implementado en su core**, con excelente foundation (schema, permissions, UI). La landing page y signup flow son **production-grade**.

**Beta Launch Path (Sin Stripe - 2 días):**
1. Fix DB trigger (plan → tier mapping) - 1h
2. Complete subscription panel - 6h
3. Manual testing completo - 4h
4. Deploy con billing manual (PayPhone/Transferencias)
**Total: ~11 horas (1-2 días)**

**Production Launch Path (Con Stripe - 1 semana):**
1. Stripe setup completo - 20h
2. Subscription panel - 6h
3. E2E tests - 8h
4. DB trigger fix - 1h
5. Manual QA - 4h
**Total: ~39 horas (5-6 días)**

**Mi recomendación:**
- **Beta con billing manual primero** (validar product-market fit sin Stripe overhead)
- **Stripe cuando tengas 20-30 clientes pagando** (ROI de implementation time)

---

**Análisis completado:** Diciembre 9, 2025
**Próxima actualización:** Post-Stripe integration
