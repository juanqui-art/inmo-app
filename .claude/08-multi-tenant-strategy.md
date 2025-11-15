# Multi-Tenant SaaS Strategy

**Última actualización**: 2025-01-06

---

## Decisión Arquitectónica

**Estrategia elegida**: Multi-Tenant con RLS (Row Level Security) + Subdominios

### Arquitectura Overview

```
┌─────────────────────────────────────────────────┐
│ Frontend: Next.js en Vercel                     │
│ - UN deployment sirve múltiples tenants         │
│ - Subdominios: agencia1.tuapp.com               │
│ - Custom domains (Fase 2): agencia1.com         │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ Backend: Supabase (1 proyecto compartido)       │
│ - PostgreSQL con RLS por organization_id        │
│ - Auth, Storage, Realtime incluidos             │
└─────────────────────────────────────────────────┘
```

### Por qué esta arquitectura

✅ **Costo predecible**: $45/mes fijo hasta 500+ tenants
✅ **Márgenes altísimos**: 95-99% de ganancia
✅ **Simplicidad**: Un codebase, un deployment, un database
✅ **Escalabilidad**: Validada por Super.so (miles de dominios), Hashnode (100k+ blogs)
✅ **Mantenimiento**: Un solo equipo pequeño puede gestionar

---

## Costos de Infraestructura

| Componente | Plan | Costo Mensual | Capacidad |
|------------|------|---------------|-----------|
| **Vercel** | Pro | $20/mes | Dominios ilimitados, Edge global |
| **Supabase** | Pro | $25/mes | 8GB DB, 100GB storage, 100k MAUs |
| **Stripe** | Pay-as-go | 2.9% + $0.30 | Por transacción |
| **TOTAL FIJO** | - | **$45/mes** | Soporta 500+ tenants |

### Proyección de Rentabilidad

**Mes 6 (20 clientes):**
- Ingresos: 20 × $29 = $580/mes
- Costos: $45/mes
- Ganancia: **$535/mes (92% margen)**

**Mes 12 (50 clientes BÁSICO):**
- Ingresos: 50 × $29 = $1,450/mes
- Costos Stripe: ~$43/mes
- Costos infra: $45/mes
- Ganancia: **$1,362/mes (94% margen)**

**Año 2 (100 clientes mix):**
- 60 × $29 (BÁSICO) = $1,740
- 30 × $79 (PRO) = $2,370
- 10 × $199 (ENTERPRISE) = $1,990
- Total ingresos: $6,100/mes
- Costos totales: ~$300/mes (infra + Stripe)
- Ganancia: **$5,800/mes (95% margen)**
- **ARR**: ~$70k

---

## Modelo de Precios

### Tiers de Suscripción

```
┌─────────────────────────────────────────────────┐
│ GRATIS                                   $0/mes │
├─────────────────────────────────────────────────┤
│ Límites:                                        │
│ - 5 propiedades                                 │
│ - 10 imágenes total                             │
│ - 1 usuario agente                              │
│ - 10MB storage                                  │
│                                                 │
│ Features:                                       │
│ - Marca "Powered by [tu app]"                  │
│ - Subdominio: agencia.tuapp.com                 │
│                                                 │
│ Objetivo: Lead magnet + conversión a BÁSICO     │
│ Costo para ti: ~$0.10/tenant/mes                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ BÁSICO                                  $29/mes │
├─────────────────────────────────────────────────┤
│ Límites:                                        │
│ - 50 propiedades                                │
│ - 250 imágenes (5 por propiedad promedio)      │
│ - 1 usuario agente                              │
│ - 125MB storage                                 │
│                                                 │
│ Features:                                       │
│ - Subdominio: agencia.tuapp.com                 │
│ - Favoritos y citas ilimitadas                 │
│ - Soporte por email                             │
│ - Sin marca "Powered by"                        │
│                                                 │
│ Target: Agentes individuales / Small agencies   │
│ Margen: ~99%                                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PRO                                     $79/mes │
├─────────────────────────────────────────────────┤
│ Límites:                                        │
│ - 200 propiedades                               │
│ - 1,000 imágenes                                │
│ - 3 usuarios agentes                            │
│ - 500MB storage                                 │
│                                                 │
│ Features:                                       │
│ - Todo de BÁSICO +                              │
│ - Custom domain: agencia.com (Fase 2)           │
│ - Subdominios personalizados                    │
│ - Analytics básicos                             │
│ - Prioridad en soporte                          │
│ - API access                                    │
│                                                 │
│ Target: Medium agencies                         │
│ Margen: ~99%                                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ EMPRESARIAL                            $199/mes │
├─────────────────────────────────────────────────┤
│ Límites:                                        │
│ - 1,000 propiedades                             │
│ - 5,000 imágenes                                │
│ - 10 usuarios agentes                           │
│ - 2.5GB storage                                 │
│                                                 │
│ Features:                                       │
│ - Todo de PRO +                                 │
│ - White-label completo                          │
│ - Analytics avanzados                           │
│ - Soporte prioritario (SLA)                     │
│ - Custom integrations                           │
│ - Dedicated database (opcional, futuro)         │
│                                                 │
│ Target: Large brokerages                        │
│ Margen: ~98%                                    │
└─────────────────────────────────────────────────┘
```

### Límites por Uso

**Storage:**
- FREE: 10MB (~20 imágenes)
- BÁSICO: 125MB (~250 imágenes)
- PRO: 500MB (~1,000 imágenes)
- ENTERPRISE: 2.5GB (~5,000 imágenes)

**Database rows** (estimación):
- 50 propiedades = ~10MB database
- 200 propiedades = ~40MB database
- 1,000 propiedades = ~200MB database

---

## Seguridad: Defense in Depth

### ⚠️ Riesgos Críticos

**1. RLS Mal Configurado = Data Leak Catastrófico**
- Sin RLS correcto, `agencia1.com` puede ver propiedades de `agencia2.com`
- Encontrado en apps reales de producción

**2. Headers HTTP NO son barrera de seguridad**
- Middleware solo hace routing (UX)
- Headers pueden ser falsificados por usuarios maliciosos
- NUNCA confiar en `x-tenant-id` para autorización

**3. user_metadata es falsificable**
- Puede ser modificado por cliente
- Siempre obtener `organizationId` desde tabla `users` en DB

### ✅ Implementación Segura (3 Capas)

#### Capa 1: RLS Policies (Database)

```sql
-- Habilitar RLS en TODAS las tablas multi-tenant
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy estricta para properties
CREATE POLICY "org_isolation_properties"
ON properties FOR ALL
USING (
  organization_id = (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
  )
);

-- Policy para images (cascade desde properties)
CREATE POLICY "org_isolation_images"
ON property_images FOR ALL
USING (
  property_id IN (
    SELECT id FROM properties
    WHERE organization_id = (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
    )
  )
);

-- Verificar que NO hay bypasses
CREATE POLICY "deny_all_by_default"
ON properties FOR ALL
TO anon, authenticated
USING (false);  -- Niega todo, otros policies permiten casos específicos
```

#### Capa 2: Server Actions (Application)

```typescript
// apps/web/app/actions/properties.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@repo/database'

export async function createPropertyAction(data: FormData) {
  // 1. Verificar auth desde Supabase (NO headers)
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  // 2. Obtener org desde DB (NO user_metadata)
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      organizationId: true,
      role: true
    }
  })

  if (!dbUser || dbUser.role !== 'AGENT') {
    throw new Error('Forbidden: Only agents can create properties')
  }

  // 3. Validar límites de suscripción
  const org = await db.organization.findUnique({
    where: { id: dbUser.organizationId },
    select: {
      plan: true,
      maxProperties: true,
      currentProperties: true
    }
  })

  if (org.currentProperties >= org.maxProperties) {
    throw new Error(`Limit reached: ${org.maxProperties} properties for ${org.plan} plan`)
  }

  // 4. Validar data con Zod
  const validated = propertySchema.parse(parseFormData(data))

  // 5. Crear con organizationId verificado
  const property = await db.property.create({
    data: {
      ...validated,
      organizationId: dbUser.organizationId  // ← SIEMPRE desde DB
    }
  })

  // 6. Incrementar contador
  await db.organization.update({
    where: { id: dbUser.organizationId },
    data: { currentProperties: { increment: 1 } }
  })

  // RLS policy verifica además en Supabase
  revalidatePath('/dashboard/propiedades')
  return { success: true, data: property }
}
```

#### Capa 3: Proxy (Routing - NO Seguridad)

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export async function proxy(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get('host')!

  // Extraer subdomain
  const subdomain = hostname
    .replace('.localhost:3000', '')
    .replace('.tuapp.com', '')

  // App principal (admin dashboard)
  if (['app', 'www', 'localhost:3000'].includes(subdomain)) {
    return NextResponse.next()
  }

  // Buscar tenant (Supabase client en Edge)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: tenant } = await supabase
    .from('organizations')
    .select('id, slug, name, logo_url, primary_color')
    .or(`custom_domain.eq.${hostname},slug.eq.${subdomain}`)
    .single()

  if (!tenant) {
    return new NextResponse('Tenant not found', { status: 404 })
  }

  // Rewrite a ruta específica del tenant
  url.pathname = `/_sites/${tenant.slug}${url.pathname}`

  // Headers solo para UX (theming) - NO para auth
  const response = NextResponse.rewrite(url)
  response.headers.set('x-tenant-slug', tenant.slug)
  response.headers.set('x-tenant-theme', tenant.primary_color || '#3b82f6')

  return response
}
```

### 🧪 Testing de Seguridad (OBLIGATORIO)

```typescript
// tests/security/rls-isolation.test.ts

import { describe, it, expect, beforeEach } from 'vitest'

describe('Multi-Tenant Isolation Tests', () => {
  let org1, org2, user1, user2, property1, property2

  beforeEach(async () => {
    // Setup: Crear 2 orgs, 2 users, 2 properties
    org1 = await createOrganization({ slug: 'agencia1' })
    org2 = await createOrganization({ slug: 'agencia2' })

    user1 = await createUser({ organizationId: org1.id, role: 'AGENT' })
    user2 = await createUser({ organizationId: org2.id, role: 'AGENT' })

    property1 = await createProperty({ organizationId: org1.id, title: 'Casa Agencia 1' })
    property2 = await createProperty({ organizationId: org2.id, title: 'Casa Agencia 2' })
  })

  it('should NOT allow cross-tenant data access via RLS', async () => {
    // User1 intenta ver Property2
    const supabase = createClientForUser(user1)
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('id', property2.id)

    // RLS debe bloquear acceso
    expect(data).toHaveLength(0)
  })

  it('should NOT allow header spoofing in Server Actions', async () => {
    // Intentar falsificar tenant via headers
    const result = await fetch('/api/properties', {
      headers: {
        'x-tenant-id': org2.id,  // ← Intentar acceder a org2
        'Authorization': `Bearer ${user1.token}`
      }
    })

    const data = await result.json()

    // Debe retornar solo propiedades de org1 (ignorar header)
    expect(data.every(p => p.organizationId === org1.id)).toBe(true)
    expect(data.find(p => p.id === property2.id)).toBeUndefined()
  })

  it('should enforce subscription limits', async () => {
    // Configurar org1 con límite de 5 properties
    await db.organization.update({
      where: { id: org1.id },
      data: {
        plan: 'FREE',
        maxProperties: 5,
        currentProperties: 5  // Ya en límite
      }
    })

    // Intentar crear propiedad #6
    await expect(
      createPropertyAction(user1, { title: 'Propiedad 6' })
    ).rejects.toThrow('Limit reached: 5 properties for FREE plan')
  })
})
```

---

## Escalabilidad: Límites y Optimizaciones

### Capacidad por Número de Tenants

| Tenants | Requests/min | Latencia Middleware | Optimización Necesaria | Estado |
|---------|--------------|---------------------|------------------------|--------|
| **0-500** | 2,500 | 60-100ms | Ninguna | ✅ OK |
| **500-2k** | 10,000 | 100ms+ | Cache (Vercel KV) | ✅ OK |
| **2k-5k** | 25,000 | 150ms+ | CDN + Read replicas | ⚠️ Requiere trabajo |
| **5k+** | 50,000+ | Variable | Sharding/Microservicios | 🔴 Re-arquitectura |

### Performance: Middleware Latency

**Sin optimización:**
```
Total TTFB: 210-300ms
├─ Tenant lookup (DB query): 50ms
├─ Edge execution: 20ms
├─ Routing: 10ms
└─ Server Component render: 130-220ms
```

**Con Vercel KV cache:**
```
Total TTFB: 160-220ms (mejora: 50-80ms)
├─ Tenant lookup (cache hit): 5ms  ← 90% faster
├─ Edge execution: 5ms
├─ Routing: 5ms
└─ Server Component render: 145-205ms
```

**Implementación cache:**
```typescript
// proxy.ts con cache
import { kv } from '@vercel/kv'

export async function proxy(req: NextRequest) {
  const hostname = req.headers.get('host')!

  // Cache hit: ~5ms
  let tenant = await kv.get<Tenant>(`tenant:${hostname}`)

  if (!tenant) {
    // Cache miss: ~50ms (DB query)
    tenant = await supabase
      .from('organizations')
      .select('id, slug, name, logo_url, primary_color')
      .or(`custom_domain.eq.${hostname},slug.eq.${hostname.split('.')[0]}`)
      .single()

    if (tenant) {
      // Cache por 1 hora
      await kv.set(`tenant:${hostname}`, tenant, { ex: 3600 })
    }
  }

  // Resto del proxy...
}
```

**Costo Vercel KV:**
- Free: 256MB, 100K commands/day
- Pro: $1/GB, 10M commands/day
- Para 500 tenants: ~1MB cache = **$0** (dentro de Free tier)

### Casos de Éxito en Producción

**Super.so**
- Arquitectura: Next.js + Vercel + subdominios/custom domains
- Escala: **Miles de dominios** activos
- Tech Stack: Similar a la propuesta

**Hashnode**
- Arquitectura: Multi-tenant con custom domains
- Escala: **100,000+ blogs**
- Resultado: Funciona a escala masiva

**Cal.com**
- Arquitectura: Multi-tenant scheduling platform
- Escala: **50,000+ organizations**
- Optimización: Vercel Edge + Redis cache

### Puntos de Inflexión (Cuándo Actuar)

```
📊 Métrica: # de Tenants
├─ 100: Todo funciona out-of-the-box
├─ 500: Implementar cache (Vercel KV) ← $0 extra
├─ 1,000: Optimizar queries, agregar índices compuestos
├─ 2,000: Evaluar Database per Tenant para enterprise tier
└─ 5,000: Re-arquitectura necesaria (sharding/microservicios)

💰 Métrica: Costos Mensuales
├─ $50: Normal (1 proyecto Supabase Pro)
├─ $100: Agregar CDN para imágenes (Cloudflare R2)
├─ $500: Considerar database sharding
└─ $1000+: Microservicios justificados

⚡ Métrica: Latencia P95
├─ < 200ms: ✅ Excelente
├─ 200-400ms: ✅ Aceptable, considerar cache
├─ 400-800ms: ⚠️ Problema, requiere optimización
└─ > 800ms: 🔴 Crítico, re-arquitectura urgente

📦 Métrica: Database Size
├─ < 2GB: ✅ Dentro del plan (Supabase Pro = 8GB)
├─ 2-8GB: ✅ OK, monitorear crecimiento
├─ 8-20GB: ⚠️ Pagar overage ($0.125/GB)
└─ > 20GB: 🔴 Considerar archiving/sharding
```

---

## Plan de Implementación

### Fase 1: MVP Multi-Tenant (3-4 semanas)

#### Semana 1-2: Core Multi-Tenancy

**Database Schema:**
```
- [ ] Crear modelo Organization en Prisma
- [ ] Migrar User: agregar organizationId
- [ ] Migrar Property: agregar organizationId
- [ ] Crear enums: SubscriptionPlan, SubscriptionStatus
- [ ] Migración de datos existentes
- [ ] Crear RLS policies en Supabase
```

**Backend (Repositories):**
```
- [ ] Actualizar PropertyRepository con filtros por org
- [ ] Actualizar UserRepository
- [ ] Crear OrganizationRepository (CRUD)
- [ ] Helpers para verificar límites (checkPropertyLimit)
```

**Testing de Seguridad:**
```
- [ ] Tests de aislamiento RLS (CRÍTICO)
- [ ] Tests de header spoofing
- [ ] Tests de límites por plan
- [ ] Pen testing básico
```

**Entregables:**
```
✅ Organization model funcional
✅ RLS policies testeadas y verificadas
✅ Datos de users/properties migrados
✅ Tests de seguridad pasando
```

---

#### Semana 3: Billing & Subscriptions

**Stripe Setup:**
```
- [ ] Crear cuenta Stripe (modo test)
- [ ] Crear 4 productos:
      - FREE (gratis, no requiere payment method)
      - BASIC ($29/mes)
      - PRO ($79/mes)
      - ENTERPRISE ($199/mes)
- [ ] Configurar metadata en prices (maxProperties, maxImages, etc)
- [ ] Setup webhook endpoint en Stripe Dashboard
```

**Server Actions:**
```
- [ ] createCheckoutSession (redirect a Stripe)
- [ ] createBillingPortalSession (gestionar suscripción)
- [ ] Webhook handler: /api/webhooks/stripe
      - customer.subscription.created
      - customer.subscription.updated
      - customer.subscription.deleted
      - invoice.payment_failed
```

**Enforcement:**
```
- [ ] Actualizar createPropertyAction con checkPropertyLimit
- [ ] Actualizar uploadPropertyImagesAction con checkImageLimit
- [ ] Server Action para invitar usuarios (checkUserLimit)
- [ ] Tracking de uso: increment/decrement counters
```

**UI:**
```
- [ ] Pricing page (/pricing)
- [ ] Billing dashboard (/dashboard/billing)
      - Plan actual
      - Próxima facturación
      - Botón "Upgrade Plan"
      - Botón "Manage Subscription"
- [ ] Usage dashboard (progress bars)
      - 35/50 propiedades (70%)
      - 142/250 imágenes (57%)
```

**Entregables:**
```
✅ Stripe checkout funcional
✅ Webhooks procesando correctamente
✅ Límites enforced en todas las acciones
✅ UI para gestionar suscripción
```

---

#### Semana 4: Subdominios & Polish

**Middleware:**
```
- [ ] Implementar tenant detection por subdomain
- [ ] Rewrite a /_sites/[tenant]
- [ ] Headers para theming (x-tenant-slug, x-tenant-theme)
- [ ] 404 para tenants no encontrados
```

**DNS:**
```
- [ ] Configurar wildcard DNS: *.tuapp.com → Vercel
      Tipo: A
      Nombre: *
      Valor: 76.76.21.21
- [ ] Verificar SSL automático para subdominios
```

**Dynamic Routes:**
```
- [ ] Crear app/_sites/[domain]/layout.tsx (personalizado)
- [ ] app/_sites/[domain]/page.tsx (homepage del tenant)
- [ ] app/_sites/[domain]/propiedades/page.tsx (listings)
- [ ] app/_sites/[domain]/propiedades/[id]/page.tsx (detail)
```

**Branding:**
```
- [ ] Logo upload en Organization settings
- [ ] Color picker para primaryColor
- [ ] CSS variables dinámicas en layout
```

**Testing E2E:**
```
- [ ] Signup → crea Organization automáticamente
- [ ] Subdomain routing funciona (agencia1.tuapp.com)
- [ ] Theming personalizado se aplica
- [ ] Upgrade flow completo (FREE → BASIC)
- [ ] Límites se respetan
```

**Entregables:**
```
✅ Subdominios funcionando (agencia.tuapp.com)
✅ Middleware con tenant detection
✅ Branding personalizado por tenant
✅ E2E tests del flujo completo
✅ Deploy a producción (staging)
```

---

### Fase 2: Custom Domains (Después de 20+ clientes)

#### Semana 1: Vercel Domains API

**Database:**
```
- [ ] Agregar campos a Organization:
      - customDomain (String?, unique)
      - domainVerified (Boolean, default: false)
      - domainAddedAt (DateTime?)
```

**Vercel Integration:**
```
- [ ] Generar Vercel API token (Project settings)
- [ ] Server Action: addCustomDomain(domain)
      - Validar formato de dominio
      - Verificar que no esté en uso
      - POST a Vercel Domains API
      - Guardar en DB (domainVerified: false)
- [ ] Server Action: removeDomain(domain)
      - DELETE de Vercel Domains API
      - Actualizar DB
- [ ] Server Action: checkDomainStatus(domain)
      - GET de Vercel Config API
      - Actualizar domainVerified si está verificado
```

**UI:**
```
- [ ] /dashboard/dominio page (solo PRO/ENTERPRISE)
- [ ] Form para agregar custom domain
- [ ] Instrucciones DNS visuales
      - CNAME: @ → cname.vercel-dns.com
      - A: @ → 76.76.21.21
- [ ] Status badge (Pending / Verified / Error)
- [ ] Botón "Check Status" (polling)
```

**Middleware Update:**
```
- [ ] Buscar tenant por custom_domain OR slug
- [ ] Soporte para apex + www
```

**Entregables:**
```
✅ Custom domains: agencia.com
✅ SSL automático (Let's Encrypt via Vercel)
✅ Instrucciones DNS claras para clientes
✅ Verificación de ownership
```

---

#### Semana 2: Testing & Launch

**Testing:**
```
- [ ] Probar dominio apex (agencia.com)
- [ ] Probar www subdomain (www.agencia.com)
- [ ] Redirecciones www → apex
- [ ] SSL certificates generados automáticamente
- [ ] Error handling:
      - Domain already in use (otro proyecto Vercel)
      - DNS misconfigured
      - SSL generation failed
```

**Documentation:**
```
- [ ] Guía para clientes: "Cómo conectar tu dominio"
- [ ] Video tutorial (Loom)
- [ ] FAQ: problemas comunes de DNS
```

**Pricing Update:**
```
- [ ] Actualizar tier PRO: incluye custom domain
- [ ] Email a clientes BASIC: "Upgrade to PRO"
- [ ] Landing page: destacar custom domain como feature
```

**Entregables:**
```
✅ Feature completo de custom domains
✅ Documentación para clientes
✅ Feature premium justifica tier PRO ($79/mes)
```

---

## Schema Changes Completo

```prisma
// packages/database/prisma/schema.prisma

model Organization {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique  // Para subdominios (agencia1)

  // Subscription
  plan                   SubscriptionPlan   @default(FREE)
  status                 SubscriptionStatus @default(TRIAL)
  trialEndsAt            DateTime?

  stripeCustomerId       String?  @unique
  stripeSubscriptionId   String?  @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?

  // Usage limits (según plan)
  maxProperties Int @default(5)
  maxImages     Int @default(10)
  maxUsers      Int @default(1)
  maxStorageMB  Int @default(10)

  // Current usage (denormalized para performance)
  currentProperties Int @default(0)
  currentImages     Int @default(0)
  currentUsers      Int @default(0)
  currentStorageMB  Int @default(0)

  // Custom domain (Fase 2)
  customDomain   String?   @unique
  domainVerified Boolean   @default(false)
  domainAddedAt  DateTime?

  // Branding
  logoUrl        String?
  primaryColor   String?   @default("#3b82f6")
  secondaryColor String?   @default("#64748b")
  fontFamily     String?   @default("Inter")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users      User[]
  properties Property[]

  @@index([slug])
  @@index([customDomain])
}

enum SubscriptionPlan {
  FREE
  BASIC
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  TRIAL       // 14 días gratis
  ACTIVE
  PAST_DUE
  CANCELED
  INCOMPLETE
}

// Actualizar User (agregar organizationId)
model User {
  id             String       @id
  email          String       @unique
  name           String
  role           UserRole     @default(CLIENT)
  phone          String?
  avatar         String?

  organizationId String       // ← NUEVO
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  agentProperties      Property[]     @relation("AgentProperties")
  favoriteProperties   Favorite[]
  clientAppointments   Appointment[]  @relation("ClientAppointments")
  agentAppointments    Appointment[]  @relation("AgentAppointments")

  @@index([organizationId])
}

// Actualizar Property (agregar organizationId)
model Property {
  id          String   @id @default(uuid())
  title       String
  description String   @db.Text
  price       Decimal  @db.Decimal(12, 2)

  transactionType TransactionType
  category        PropertyCategory
  status          PropertyStatus   @default(AVAILABLE)

  bedrooms  Int
  bathrooms Decimal @db.Decimal(3, 1)
  area      Decimal @db.Decimal(10, 2)

  address   String
  city      String
  state     String
  zipCode   String?
  latitude  Decimal? @db.Decimal(10, 8)
  longitude Decimal? @db.Decimal(11, 8)

  organizationId String       // ← NUEVO
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  agentId String
  agent   User   @relation("AgentProperties", fields: [agentId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  images       PropertyImage[]
  favorites    Favorite[]
  appointments Appointment[]

  @@index([organizationId, status])
  @@index([transactionType, status])
  @@index([category])
  @@index([city, state])
  @@index([price])
  @@index([agentId])
}

// PropertyImage, Favorite, Appointment sin cambios (heredan org via Property)
```

---

## Cuándo Migrar de Arquitectura

### ✅ Mantener Multi-Tenant con RLS SI:

- Tienes < 2,000 tenants activos
- Costos de infraestructura < $100/mes
- No tienes clientes enterprise con compliance estricto (HIPAA, SOC2)
- Equipo pequeño (1-3 developers)
- Latencia < 400ms P95
- Database size < 8GB

### ⚠️ Considerar Database per Tenant SI:

- Tienes > 2,000 tenants activos
- Clientes enterprise piden "dedicated database" como feature
- Compliance requiere aislamiento físico total
- Latencia de middleware > 150ms consistentemente
- Dispuesto a pagar $10/mes por tenant enterprise
- Tienes recursos para gestionar múltiples proyectos Supabase

**Costo Database per Tenant:**
```
10 clientes enterprise:
- Supabase: $25 (base) + ($10 × 9) = $115/mes
- Ingresos: 10 × $199 = $1,990/mes
- Ganancia: $1,875/mes (94% margen)
✅ Aún muy rentable
```

### 🔴 Considerar Microservicios SI:

- Tienes > 5,000 tenants activos
- Tráfico > 50,000 requests/min
- Múltiples regiones geográficas (EU, Asia, US)
- Equipo grande (10+ developers)
- ARR > $1M/año
- Necesitas deploys independientes por servicio

---

## Recursos y Referencias

### Documentación Oficial

- [Vercel Multi-Tenant Guide](https://vercel.com/guides/nextjs-multi-tenant-application)
- [Platforms Starter Kit](https://github.com/vercel/platforms) (código de referencia oficial)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel Domains API](https://vercel.com/docs/rest-api/endpoints/domains)

### Casos de Estudio

- [Super.so](https://super.so): Miles de dominios con Next.js
- [Hashnode](https://hashnode.com): 100k+ blogs multi-tenant
- [Cal.com](https://cal.com): Scheduling platform multi-tenant
- [Vercel Blog: Super serves thousands of domains](https://vercel.com/blog/super-serves-thousands-of-domains-on-one-project-with-next-js-and-vercel)

### Seguridad

- [RLS Security Testing Guide](https://www.precursorsecurity.com/security-blog/row-level-recklessness-testing-supabase-security)
- [Multi-Tenant Security Checklist](https://www.tomaszezula.com/keep-data-safe-in-multi-tenant-systems-a-case-for-supabase-and-row-level-security/)
- [Supabase RLS Examples](https://medium.com/@jigsz6391/supabase-row-level-security-explained-with-real-examples-6d06ce8d221c)

### Performance

- [Optimizing Next.js for Edge Computing](https://codism.io/optimizing-next-js-for-edge-computing-advanced-latency-reduction/)
- [Leveraging Edge Caching in Next.js](https://dev.to/melvinprince/leveraging-edge-caching-in-nextjs-with-vercel-for-ultra-low-latency-4a6)

---

## Conclusión

**Esta arquitectura ES viable y rentable para:**

✅ **0-2,000 tenants** (sweet spot perfecto)
✅ **Márgenes 95-99%** (casi todo es ganancia)
✅ **Infraestructura simple** ($45/mes fijo hasta 500 tenants)
✅ **Equipo pequeño** (1-3 devs pueden mantener)
✅ **Casos de éxito validados** (Super.so, Hashnode, Cal.com)

**Requiere inversión en:**

⚠️ **Security testing** (RLS policies, 2-3 días)
⚠️ **Monitoring** (Sentry, Vercel Analytics)
⚠️ **Documentación** de límites para clientes

**NO recomendado SI:**

❌ No tienes experiencia con RLS (aprende primero)
❌ Clientes enterprise con compliance extremo desde día 1
❌ Necesitas > 5,000 tenants en año 1 (improbable para startup)

**Próximo paso**: Implementar Fase 1 (MVP Multi-Tenant, 3-4 semanas)
