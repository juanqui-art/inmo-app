# Estrategia de Negocio - InmoApp

> **Última actualización**: Noviembre 20, 2025
> **Status**: 📋 Documento de Planificación Estratégica
> **Propósito**: Definir modelo de negocio, roles, flujos y monetización

---

## 📊 Resumen Ejecutivo

Este documento define la estrategia de negocio de InmoApp, incluyendo:
- Modelo de monetización
- Estructura de roles y permisos
- Flujos de usuario
- Proyecciones financieras
- Roadmap de implementación

**Decisión estratégica**: Modelo **Freemium híbrido** que evoluciona a **Dual Model** (particulares + profesionales).

---

## 🎯 Contexto y Problema

### Estado Actual del Código

**Roles implementados**:
```typescript
enum UserRole {
  CLIENT  // Puede: Ver, favoritos, agendar citas
  AGENT   // Puede: Todo lo de CLIENT + crear/editar propiedades
  ADMIN   // Puede: Acceso total
}
```

### Problema Identificado

La página `/vender` (landing page de conversión) existe y es pública, pero:

❌ **Inconsistencia**: Asume que cualquiera puede publicar, pero el código requiere rol `AGENT`
❌ **Confusión**: Usuario llega a `/vender` → signup → no puede publicar si eligió `CLIENT`
❌ **Sin estrategia clara**: No está definido quién es el público objetivo ni cómo monetizar

### Preguntas Sin Responder

1. ¿Quién puede publicar propiedades? ¿Solo agentes o también particulares?
2. ¿Cómo se diferencia un particular de un agente profesional?
3. ¿Cómo generar ingresos? ¿Freemium, comisiones, suscripciones?
4. ¿Puede un usuario cambiar de rol después del registro?

---

## 🔍 Análisis de Mercado

### Competidores Principales (2024)

#### Zillow (USA)
- **Ingresos**: $2.2 billones USD/año
- **Usuarios**: 200M mensuales (100% gratis para usuarios finales)
- **Modelo**: Two-sided marketplace
- **Desglose de ingresos**:
  - 70% → Premier Agent Program (agentes pagan por leads calificados)
  - 20% → Rentals (anuncios premium)
  - 7% → Mortgages (comisiones por hipotecas)
- **Estrategia**: Gratis para todos, monetiza profesionales

#### Idealista (España)
- **Ingresos**: €300M EUR/año (+16% YoY)
- **Valoración**: €2.9 billones (adquisición por Cinven en 2024)
- **Modelo**: Publicación premium + destacados
- **Estrategia**: Publicación gratuita limitada + planes de pago para profesionales
- **EBITDA**: €84M (28% margen)

### Conclusiones del Análisis

✅ **Modelo dominante**: Two-sided marketplace (gratis para usuarios, pago para profesionales)
✅ **Volumen es clave**: Requiere 100k+ usuarios mensuales para ser rentable con modelo lead generation
✅ **Freemium funciona**: Conversión típica 3-5% (freemium) vs 0.1% (pago desde inicio)
✅ **Recurrencia**: Suscripciones mensuales > pagos únicos (ARR predecible)

---

## 💡 Opciones de Monetización Evaluadas

### Opción 1: Freemium Clásico

**Descripción**: Todos pueden publicar gratis con límites, pago para desbloquear funciones premium.

**Estructura**:
```
FREE (gratis)
  └─ 1 publicación activa
  └─ Sin destacados
  └─ Sin analytics

PREMIUM ($9.99/mes)
  └─ 5 publicaciones activas
  └─ 3 destacados/mes
  └─ Analytics básicos

PRO ($29.99/mes)
  └─ Publicaciones ilimitadas
  └─ Destacados ilimitados
  └─ Analytics avanzados
  └─ Verificación de perfil
  └─ Soporte prioritario
```

**Ventajas**:
- ✅ Menor fricción (todos pueden probar gratis)
- ✅ Base de usuarios amplia (efecto red)
- ✅ Conversión natural (pagan cuando necesitan más)
- ✅ Simple de implementar (código casi listo)

**Desventajas**:
- ❌ Conversión baja (<5%)
- ❌ Costos de infraestructura altos (usuarios gratis)
- ❌ Requiere volumen para rentabilidad

**Proyección Año 1**:
- 5,000 usuarios → 5% conversión = 250 premium
- Ingresos mensuales: $2,500 USD ($30k/año)
- Costos infra: $500/mes ($6k/año)
- **Margen neto**: $24k USD/año

---

### Opción 2: Dual Model (Particulares vs Profesionales)

**Descripción**: Diferenciación clara entre usuarios ocasionales y profesionales.

**Estructura**:
```
SELLER (particular - vende su casa)
  └─ 1 publicación gratis (30 días)
  └─ Publicaciones adicionales: $19.99 c/u (pago único)
  └─ Sin destacados
  └─ Sin soporte

AGENT (profesional - agente/inmobiliaria)
  └─ Suscripción: $49/mes (plan básico) o $99/mes (plan pro)
  └─ 10-50 propiedades activas
  └─ Destacados incluidos
  └─ CRM básico integrado
  └─ Analytics y reportes
  └─ Verificación de perfil
  └─ Soporte prioritario

ADMIN
  └─ Moderación y gestión
```

**Ventajas**:
- ✅ Diferenciación clara de públicos
- ✅ Particulares generan contenido (gratis)
- ✅ Profesionales pagan recurrente (ARR predecible)
- ✅ Mayor ticket promedio ($49-99/mes vs $9.99/mes)
- ✅ Escalable

**Desventajas**:
- ❌ Más complejo de implementar (2 flujos de signup)
- ❌ Requiere verificación de identidad profesional
- ❌ Competencia entre particulares y profesionales

**Proyección Año 1**:
- 4,000 particulares (10% pagan $19.99) = $400/mes
- 200 agentes ($49/mes promedio) = $9,800/mes
- Ingresos mensuales: $10,200 USD ($122k/año)
- Costos infra: $800/mes ($9.6k/año)
- **Margen neto**: $112k USD/año

---

### Opción 3: Commission-Based (Marketplace)

**Descripción**: Publicación 100% gratis, comisión solo al cerrar transacción.

**Estructura**:
```
Publicación: 100% gratis
Comisión al cerrar: 1-3% del valor de la transacción
```

**Ventajas**:
- ✅ Cero fricción (100% gratis hasta cerrar)
- ✅ Alineación de incentivos (ganas si ellos ganan)
- ✅ Alto volumen de listados
- ✅ Escalable a largo plazo

**Desventajas**:
- ❌ **MUY COMPLEJO**: Requiere sistema de pagos/escrow
- ❌ Requiere validación legal de transacciones (notarios)
- ❌ Difícil verificar que la venta ocurrió en la plataforma
- ❌ Ciclo de ingresos muy lento (3-6 meses por transacción)
- ❌ Requiere equipo legal

**Proyección Año 1**:
- Requiere 100+ transacciones cerradas
- Valor promedio propiedad: $100k USD
- Comisión 2% = $2k por transacción
- Ingresos anuales: $200k USD (pero muy difícil de alcanzar en Año 1)

**Conclusión**: ❌ No recomendado para MVP/Año 1

---

### Opción 4: Lead Generation (Modelo Zillow)

**Descripción**: Usuarios buscan gratis, agentes pagan por leads calificados.

**Estructura**:
```
USER (comprador/arrendatario)
  └─ Busca 100% gratis
  └─ Solicita info (genera lead)
  └─ Nunca paga

AGENT (paga por leads)
  └─ Suscripción base: $99/mes
  └─ + $10-50 por lead calificado
  └─ Dashboard de leads
  └─ CRM integrado
```

**Ventajas**:
- ✅ Modelo probado (Zillow $2.2B/año)
- ✅ Ingresos predecibles (suscripción + leads)
- ✅ Usuarios nunca pagan (máximo crecimiento)
- ✅ Escalable

**Desventajas**:
- ❌ Requiere volumen ALTO (100k+ usuarios/mes)
- ❌ Competencia feroz (Zillow, Realtor.com ya dominan)
- ❌ Calidad de leads variable (fricción con agentes)
- ❌ CRM complejo de desarrollar

**Proyección Año 1**:
- Requiere 50k+ usuarios mensuales
- 100 agentes pagando → $9,900/mes
- 500 leads/mes × $20 = $10,000/mes
- Ingresos mensuales: $19,900 USD ($238k/año)

**Conclusión**: ⚠️ Viable solo después de Año 2-3 con tráfico consolidado

---

## ✅ Decisión Estratégica: Modelo Híbrido Evolutivo

### Estrategia Recomendada

Implementación por **fases** que evoluciona de simple a complejo:

```
FASE 1 (Meses 1-6)     → Freemium Clásico
FASE 2 (Meses 7-18)    → Dual Model (Freemium + Profesionales)
FASE 3 (Meses 19+)     → Lead Generation (si se alcanza escala)
```

---

## 🚀 FASE 1: Freemium Clásico (MVP - Meses 1-6)

### Objetivo

Validar product-market fit con mínima fricción y máxima adopción.

### Roles Simplificados

```typescript
enum UserRole {
  FREE     // Plan gratuito (todos empiezan aquí)
  PREMIUM  // Plan de pago
  ADMIN    // Administración
}

enum SubscriptionTier {
  FREE     // 1 publicación, sin destacados
  PREMIUM  // 5 publicaciones, 3 destacados/mes
  PRO      // Ilimitado + analytics
}
```

### Permisos

| Acción | FREE | PREMIUM | PRO | ADMIN |
|--------|------|---------|-----|-------|
| Publicar propiedades | 1 activa | 5 activas | Ilimitado | Ilimitado |
| Destacar en búsquedas | ❌ | 3/mes | Ilimitado | Ilimitado |
| Ver analytics | ❌ | Básico | Avanzado | Total |
| Subir imágenes | 3 por propiedad | 10 por propiedad | 20 por propiedad | Ilimitado |
| Editar propiedades | ✅ | ✅ | ✅ | ✅ |
| Ver favoritos | ✅ | ✅ | ✅ | ✅ |
| Agendar citas | ✅ | ✅ | ✅ | ✅ |

### Precios Fase 1

```
FREE:     $0/mes      (1 publicación, sin destacados)
PREMIUM:  $9.99/mes   (5 publicaciones, 3 destacados/mes)
PRO:      $29.99/mes  (ilimitado + analytics)

Add-ons:
  └─ Destacar propiedad por 7 días: $4.99 (usuarios FREE)
  └─ Publicación adicional (30 días): $14.99 (usuarios FREE)
```

### Flujo de Usuario `/vender`

```
1. Usuario llega a /vender (landing page)
   ↓
2. ¿Está autenticado?
   NO  → /signup (crea cuenta FREE)
   SÍ  → Ir al paso 3
   ↓
3. ¿Tiene espacio para publicar?
   NO  → /pricing (upgrade a PREMIUM/PRO)
   SÍ  → /dashboard/propiedades/nueva
   ↓
4. Publica propiedad exitosamente
   ↓
5. (Opcional) Ofrece destacar por $4.99
```

### Cambios Técnicos Requeridos

#### 1. Schema Prisma

```prisma
model User {
  id               String           @id @default(uuid())
  email            String           @unique
  name             String?
  role             UserRole         @default(FREE)
  subscriptionTier SubscriptionTier @default(FREE)
  stripeCustomerId String?          @map("stripe_customer_id")
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")

  // Relations
  properties       Property[]
  favorites        Favorite[]
  appointments     Appointment[]
  subscription     Subscription?
}

model Subscription {
  id                 String           @id @default(uuid())
  userId             String           @unique @map("user_id")
  tier               SubscriptionTier
  status             SubscriptionStatus
  stripeSubscriptionId String?        @map("stripe_subscription_id")
  currentPeriodStart DateTime         @map("current_period_start")
  currentPeriodEnd   DateTime         @map("current_period_end")
  cancelAtPeriodEnd  Boolean          @default(false) @map("cancel_at_period_end")
  createdAt          DateTime         @default(now()) @map("created_at")
  updatedAt          DateTime         @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("subscriptions")
}

enum UserRole {
  FREE
  PREMIUM
  ADMIN
}

enum SubscriptionTier {
  FREE
  PREMIUM
  PRO
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  PAST_DUE
  INCOMPLETE
}
```

#### 2. Helpers de Autorización

```typescript
// apps/web/lib/auth.ts

export async function canCreateProperty(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      properties: {
        where: { status: { notIn: ['SOLD', 'RENTED'] } }
      },
      subscription: true
    }
  })

  if (!user) return false

  const activeProperties = user.properties.length

  // Límites por tier
  const limits = {
    FREE: 1,
    PREMIUM: 5,
    PRO: Infinity
  }

  const limit = limits[user.subscriptionTier] || 0
  return activeProperties < limit
}

export function getPropertyLimit(tier: SubscriptionTier): number {
  const limits = {
    FREE: 1,
    PREMIUM: 5,
    PRO: Infinity
  }
  return limits[tier] || 0
}

export function getFeaturesByTier(tier: SubscriptionTier) {
  return {
    maxProperties: getPropertyLimit(tier),
    maxImages: tier === 'FREE' ? 3 : tier === 'PREMIUM' ? 10 : 20,
    canHighlight: tier !== 'FREE',
    highlightsPerMonth: tier === 'PREMIUM' ? 3 : tier === 'PRO' ? Infinity : 0,
    hasAnalytics: tier !== 'FREE',
    analyticsLevel: tier === 'PRO' ? 'advanced' : 'basic',
    hasSupport: tier === 'PRO',
    hasVerification: tier === 'PRO'
  }
}
```

#### 3. Server Action de Creación

```typescript
// apps/web/app/actions/properties.ts

export async function createPropertyAction(formData: FormData) {
  "use server"

  const user = await getCurrentUser()
  if (!user) {
    return { error: "No autenticado" }
  }

  // Verificar límite de propiedades
  const canCreate = await canCreateProperty(user.id)
  if (!canCreate) {
    return {
      error: "Límite de propiedades alcanzado",
      upgradeRequired: true,
      currentTier: user.subscriptionTier
    }
  }

  // Continuar con creación...
  // ...
}
```

#### 4. Página de Pricing

```typescript
// apps/web/app/(public)/pricing/page.tsx

export default function PricingPage() {
  return (
    <div className="pricing-grid">
      <PricingCard
        tier="FREE"
        price="$0"
        features={[
          "1 propiedad activa",
          "3 imágenes por propiedad",
          "Sin destacados",
          "Funciones básicas"
        ]}
      />
      <PricingCard
        tier="PREMIUM"
        price="$9.99/mes"
        features={[
          "5 propiedades activas",
          "10 imágenes por propiedad",
          "3 destacados/mes",
          "Analytics básicos"
        ]}
        recommended
      />
      <PricingCard
        tier="PRO"
        price="$29.99/mes"
        features={[
          "Propiedades ilimitadas",
          "20 imágenes por propiedad",
          "Destacados ilimitados",
          "Analytics avanzados",
          "Verificación de perfil",
          "Soporte prioritario"
        ]}
      />
    </div>
  )
}
```

#### 5. Integración Stripe

```typescript
// apps/web/lib/stripe.ts

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

// Crear checkout session
export async function createCheckoutSession(
  userId: string,
  tier: 'PREMIUM' | 'PRO'
) {
  const priceIds = {
    PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID!,
    PRO: process.env.STRIPE_PRO_PRICE_ID!
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    mode: 'subscription',
    line_items: [
      {
        price: priceIds[tier],
        quantity: 1
      }
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?upgrade=cancelled`,
    metadata: {
      userId,
      tier
    }
  })

  return session
}
```

### Proyección Fase 1 (6 meses)

**Meta de usuarios**:
- Mes 1: 100 usuarios
- Mes 2: 300 usuarios
- Mes 3: 500 usuarios
- Mes 4: 1,000 usuarios
- Mes 5: 2,000 usuarios
- Mes 6: 5,000 usuarios

**Conversión esperada**: 3-5%

**Ingresos Mes 6**:
- 5,000 usuarios × 5% conversión = 250 paying
- 200 × $9.99 (PREMIUM) = $1,998
- 50 × $29.99 (PRO) = $1,499
- **Total mensual**: $3,497 USD

**Ingresos Año 1 (promedio)**: ~$15,000 USD
**Costos infraestructura**: $6,000 USD
**Margen neto**: $9,000 USD

---

## 🎯 FASE 2: Dual Model (Meses 7-18)

### Objetivo

Diferenciar entre usuarios ocasionales (particulares) y profesionales (agentes/inmobiliarias) para maximizar ingresos recurrentes.

### Roles Expandidos

```typescript
enum UserRole {
  SELLER    // Particular (vende su casa)
  AGENT     // Profesional (agente/inmobiliaria)
  ADMIN     // Administración
}

enum SubscriptionTier {
  // Para SELLER
  FREE           // 1 gratis
  BASIC_SELLER   // Pago por publicación

  // Para AGENT
  AGENT_BASIC    // $49/mes
  AGENT_PRO      // $99/mes
}
```

### Permisos Fase 2

| Acción | SELLER (Free) | SELLER (Paid) | AGENT (Basic) | AGENT (Pro) | ADMIN |
|--------|---------------|---------------|---------------|-------------|-------|
| Publicaciones activas | 1 gratis | 1 por $19.99 | 10 | 50 | Ilimitado |
| Destacados | ❌ | $4.99 c/u | 5/mes incluidos | Ilimitado | Ilimitado |
| Imágenes por propiedad | 5 | 10 | 15 | 25 | Ilimitado |
| Analytics | ❌ | ❌ | Básico | Avanzado | Total |
| CRM integrado | ❌ | ❌ | ✅ | ✅ | ✅ |
| Verificación perfil | ❌ | ❌ | ❌ | ✅ | ✅ |
| Soporte | Email | Email | Chat | Prioritario | Total |

### Precios Fase 2

```
SELLER:
  └─ 1 publicación gratis (30 días)
  └─ Publicaciones adicionales: $19.99 c/u (pago único, 30 días)
  └─ Destacar: $4.99 por 7 días

AGENT:
  └─ BASIC:  $49/mes  (10 propiedades, 5 destacados/mes, CRM básico)
  └─ PRO:    $99/mes  (50 propiedades, destacados ilimitados, analytics)

Add-ons para AGENT:
  └─ Slot adicional de propiedad: $5/mes
```

### Flujo de Signup Diferenciado

```
Usuario llega a /signup
  ↓
1. ¿Para qué registrarte?
   [ ] Buscar propiedades (comprar/rentar)
   [ ] Vender/rentar mi propiedad
   [ ] Soy agente inmobiliario

2. Si elige "Vender mi propiedad":
   → Crea cuenta como SELLER (FREE)
   → 1 publicación gratis
   → Redirect: /dashboard/propiedades/nueva

3. Si elige "Soy agente inmobiliario":
   → Crea cuenta como AGENT
   → Trial de 14 días (AGENT_BASIC)
   → Después requiere suscripción
   → Redirect: /dashboard/onboarding (verificación)
```

### Cambios Técnicos Fase 2

#### Verificación de Agentes

```typescript
model AgentVerification {
  id              String   @id @default(uuid())
  userId          String   @unique @map("user_id")
  status          VerificationStatus @default(PENDING)
  businessName    String?  @map("business_name")
  licenseNumber   String?  @map("license_number")
  licenseDocument String?  @map("license_document") // S3 URL
  phone           String?
  website         String?
  submittedAt     DateTime @default(now()) @map("submitted_at")
  reviewedAt      DateTime? @map("reviewed_at")
  reviewedBy      String?  @map("reviewed_by")
  notes           String?  @db.Text

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("agent_verifications")
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### Proyección Fase 2 (Mes 12)

**Meta de usuarios**:
- 10,000 sellers (80% free, 20% pagan $19.99 al menos 1 vez)
- 500 agents (60% basic, 40% pro)

**Ingresos mensuales**:
- Sellers: 2,000 × $19.99 / 6 meses promedio = $666/mes
- Agents Basic: 300 × $49 = $14,700/mes
- Agents Pro: 200 × $99 = $19,800/mes
- **Total mensual**: $35,166 USD

**Ingresos Año 2**: ~$420,000 USD
**Costos infraestructura**: $12,000 USD
**Costos soporte (1 persona)**: $36,000 USD
**Margen neto**: $372,000 USD

---

## 📈 FASE 3: Lead Generation (Meses 19+)

### Prerrequisitos

Solo implementar si se alcanza:
- ✅ 50,000+ usuarios mensuales activos
- ✅ 10,000+ propiedades activas
- ✅ 500+ agentes pagando

### Modelo

```
Usuarios buscan/contactan: 100% GRATIS
Agentes pagan por:
  └─ Suscripción base: $99/mes
  └─ Leads calificados: $10-50 c/u (según valor propiedad)
```

### Cálculo de Lead Pricing

```
Propiedad < $100k  → $10 por lead
Propiedad $100k-$300k → $20 por lead
Propiedad $300k-$500k → $30 por lead
Propiedad > $500k → $50 por lead
```

### Proyección Fase 3 (Año 3)

**Meta**:
- 100,000 usuarios mensuales
- 1,000 agentes en programa de leads

**Ingresos mensuales**:
- Suscripciones base: 1,000 × $99 = $99,000
- Leads (5,000/mes × $25 promedio) = $125,000
- **Total mensual**: $224,000 USD

**Ingresos Año 3**: ~$2.7M USD

---

## 🛠️ Roadmap de Implementación

### Q1 2026: Preparación Fase 1

**Semanas 1-2: Cambios de Schema**
- [ ] Actualizar Prisma schema (User, Subscription models)
- [ ] Crear migración
- [ ] Actualizar repositorios

**Semanas 3-4: Sistema de Permisos**
- [ ] Refactorizar helpers de auth (`canCreateProperty`, `getFeaturesByTier`)
- [ ] Actualizar Server Actions con validaciones de tier
- [ ] Crear middleware de límites

**Semanas 5-6: UI de Pricing**
- [ ] Diseñar página `/pricing`
- [ ] Crear componentes de pricing cards
- [ ] Implementar modal de upgrade en dashboard

**Semanas 7-8: Integración Stripe**
- [ ] Configurar Stripe account
- [ ] Crear productos/precios en Stripe
- [ ] Implementar checkout flow
- [ ] Webhooks para actualizar subscriptions

**Semanas 9-10: Testing y Launch**
- [ ] Tests de flujos de pago
- [ ] Tests de límites por tier
- [ ] Documentación de usuario
- [ ] Soft launch (beta testers)

**Semanas 11-12: Optimización**
- [ ] Analizar conversión
- [ ] A/B testing de pricing page
- [ ] Ajustar límites según feedback

---

### Q2-Q3 2026: Fase 1 Operación

**Objetivos**:
- Alcanzar 5,000 usuarios
- 3-5% conversión
- Validar product-market fit

**Métricas clave**:
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- Churn rate
- MRR (Monthly Recurring Revenue)

---

### Q4 2026 - Q2 2027: Preparación Fase 2

**Solo si Fase 1 es exitosa** (>3% conversión, <10% churn):

**Q4 2026: Investigación**
- [ ] Encuestas a usuarios actuales (¿particulares o agentes?)
- [ ] Análisis de comportamiento (¿cuántos publican >1 propiedad?)
- [ ] Definir pricing de AGENT tiers

**Q1 2027: Desarrollo**
- [ ] Actualizar schema para SELLER/AGENT roles
- [ ] Crear flujo de verificación de agentes
- [ ] Implementar CRM básico para agentes
- [ ] Dashboard de analytics

**Q2 2027: Launch Fase 2**
- [ ] Migrar usuarios existentes (FREE → SELLER)
- [ ] Lanzar programa de agentes
- [ ] Marketing dirigido a inmobiliarias

---

## 📊 Métricas de Éxito

### Fase 1 (Freemium)

| Métrica | Target Mes 3 | Target Mes 6 |
|---------|--------------|--------------|
| Usuarios totales | 500 | 5,000 |
| Conversión a pago | 3% | 5% |
| Churn mensual | <15% | <10% |
| MRR | $500 | $3,500 |
| CAC | <$20 | <$15 |
| LTV/CAC ratio | >2 | >3 |

### Fase 2 (Dual Model)

| Métrica | Target Mes 12 | Target Mes 18 |
|---------|---------------|---------------|
| Sellers totales | 5,000 | 10,000 |
| Agents pagando | 100 | 500 |
| MRR | $10,000 | $35,000 |
| ARR | $120,000 | $420,000 |
| Agent churn | <5% | <3% |

---

## 🎓 Decisiones Pendientes

Antes de implementar, definir:

### 1. Pricing Final

- [ ] ¿$9.99 o $7.99 para PREMIUM?
- [ ] ¿Ofrecer plan anual con descuento? (ej: $99/año = 2 meses gratis)
- [ ] ¿Precios en USD o moneda local?

### 2. Límites de Plan FREE

- [ ] ¿1 publicación o 2?
- [ ] ¿Cuántas imágenes? (3, 5, o 10)
- [ ] ¿Duración? (30 días, 60 días, o ilimitado)

### 3. Features Premium

- [ ] ¿Qué analytics mostrar en plan PREMIUM vs PRO?
- [ ] ¿Destacar propiedad en home page o solo en búsquedas?
- [ ] ¿Badge de "Verificado" solo para PRO?

### 4. Estrategia de Lanzamiento

- [ ] ¿Beta cerrada primero o lanzamiento público?
- [ ] ¿Ofrecer "Early Bird" pricing? (ej: $4.99/mes primeros 100 usuarios)
- [ ] ¿Programa de referidos? (ej: invita amigo → 1 mes gratis)

---

## 📚 Recursos Adicionales

### Documentos Relacionados

- `docs/authorization/PERMISSIONS_MATRIX.md` - Matriz de permisos actual
- `docs/architecture/DATABASE.md` - Schema de base de datos
- `packages/database/prisma/schema.prisma` - Schema Prisma

### Herramientas Recomendadas

- **Stripe**: Procesamiento de pagos y suscripciones
- **PostHog**: Analytics de producto (funnel de conversión)
- **Hotjar**: Heatmaps de pricing page
- **Intercom**: Soporte y onboarding de usuarios premium

### Benchmarks de Industria

- **Conversión Freemium típica**: 2-5%
- **Churn mensual aceptable**: <10% (B2C), <5% (B2B)
- **LTV/CAC ratio saludable**: >3
- **Payback period**: <12 meses

---

## 🔄 Proceso de Revisión

Este documento debe revisarse:

- **Mensual**: Durante Fase 1 (ajustar según datos)
- **Trimestral**: Durante Fase 2 (evaluar transición a Fase 3)
- **Anual**: Revisión estratégica completa

---

**Última actualización**: Noviembre 20, 2025
**Próxima revisión**: Al finalizar Mes 3 de Fase 1
**Owner**: Equipo de Producto
