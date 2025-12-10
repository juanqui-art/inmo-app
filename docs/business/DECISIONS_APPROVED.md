# Decisiones Aprobadas - Implementación Freemium

> **Fecha de aprobación**: Noviembre 20, 2025
> **Última actualización**: Diciembre 5, 2025
> **Status**: ✅ ACTUALIZADO - Modelo 4 Tiers con Segmentación B2C/B2B

---

## 📋 Resumen Ejecutivo

**Modelo aprobado**: Freemium con **4 tiers** (FREE/PLUS/AGENT/PRO) con clara segmentación B2C/B2B

**Estrategia**: Enfoque dual - PLUS para dueños B2C (venta rápida), AGENT/PRO para agentes B2B (herramientas de gestión)

**Cambio clave vs versión anterior**:
- ❌ Eliminado BASIC ($4.99) - valor ambiguo
- ✅ Agregado PLUS ($9.99) - enfocado en dueños B2C
- ✅ Agregado AGENT ($29.99) - bridge para agentes pequeños con CRM

---

## ✅ Decisiones Críticas Aprobadas

### 1. Modelo de Negocio
- **✅ ACTUALIZADO**: Freemium (4 tiers: FREE/PLUS/AGENT/PRO)
- **Segmentación**: B2C (PLUS) vs B2B (AGENT/PRO)
- **Alineado con**: `CLAUDE.md` - Freemium Model Section

---

### 2. Pricing de Planes

```
FREE:    $0/mes      (Probar plataforma)
PLUS:    $9.99/mes   (Dueños B2C - venta rápida)
AGENT:   $29.99/mes  (Agentes pequeños B2B - CRM Lite)
PRO:     $59.99/mes  (Agentes profesionales B2B - CRM Full)
```

**Moneda**: USD (Ecuador usa dólar)

**Período**: Solo mensual (NO anual en MVP)

**Razón del cambio**:
- PLUS ($9.99): Mayor valor percibido vs BASIC ($4.99) - incluye destacado + 25 fotos
- AGENT ($29.99): Justificado por CRM + herramientas de gestión (reemplaza CRMs de $39-48)
- PRO ($59.99): Premium B2B con analytics + data local

---

### 3. Límites por Tier

| Feature | FREE | PLUS | AGENT | PRO |
|---------|------|------|-------|-----|
| **Target** | Probar | Dueños B2C | Agentes pequeños | Agentes pro |
| **Propiedades activas** | 1 | 3 | 10 | 20 |
| **Imágenes/propiedad** | 6 | 25 | 20 | 25 |
| **Duración publicación** | **Ilimitada** | **Ilimitada** | **Ilimitada** | **Ilimitada** |
| **Destacados** | ❌ No | 1 permanente | 5 permanentes | Ilimitados |
| **CRM** | ❌ | ❌ | Lite | Completo |
| **Analytics** | ❌ No | ❌ | Básico | Avanzado + Smart Data |
| **Soporte** | Email (72h) | Email (48h) | Email (24h) | WhatsApp (12h) |

**Decisión clave**:
- **Sin expiración automática** (auto-renovación ilimitada)
- **Destacados permanentes** (NO créditos mensuales) - simplicidad técnica

**Razón**:
- ✅ Técnicamente simple (solo flag `isFeatured` en DB)
- ✅ Flexible para cualquier tipo de usuario
- ✅ Generoso (mejor para lanzamiento y adquisición)
- ✅ Se puede ajustar después según datos reales

---

### 4. Nomenclatura de Planes

**En código (Prisma, TypeScript)**:
```typescript
enum SubscriptionTier {
  FREE
  PLUS   // Reemplaza BASIC
  AGENT  // Nuevo tier B2B
  PRO
}
```

**En UI (traducido a español)**:
- FREE → "Gratuito"
- PLUS → "Plus"
- AGENT → "Agente"
- PRO → "Pro"

**Razón**: Estándar internacional en código, localizado en interfaz

---

### 5. Migración de Usuarios Existentes

**Decisión**: Todos los usuarios BASIC migran automáticamente a PLUS

**Estrategia de migración**:
```sql
UPDATE users
SET subscription_tier = 'PLUS'
WHERE subscription_tier = 'BASIC';
```

**Razón**:
- PLUS es el tier más cercano en propuesta de valor
- Mejora la experiencia del usuario (más features por casi mismo precio)
- Zero pérdida de datos

---

## 🚫 Decisiones POSPUESTAS (Para después del MVP)

Estas se decidirán DESPUÉS de validar con usuarios reales:

### Postponed para Fase 2:
- [ ] WhatsApp Business API integration (Opción 1: Sin API en MVP)
- [ ] Plan anual con descuento
- [ ] Destacados como add-on para FREE
- [ ] Programa de referidos
- [ ] Trial period (7-14 días gratis)
- [ ] Early bird pricing

**Razón**: No queremos paralizar desarrollo con decisiones prematuras. MVP primero, optimización después.

---

## 📊 Comparativa con Competencia

| Proveedor | Costo Mensual | Límite Propiedades | CRM | Analytics |
|-----------|---------------|-------------------|-----|-----------|
| **InmoApp FREE** | $0 | 1 (sin expiración) | ❌ | ❌ |
| **InmoApp PLUS** | $9.99 | 3 + 1 destacado | ❌ | ❌ |
| **InmoApp AGENT** | $29.99 | 10 + 5 destacados | ✅ Lite | ✅ Básico |
| **InmoApp PRO** | $59.99 | 20 + ∞ destacados | ✅ Full | ✅ Avanzado |
| **PlusValia** | $20-50 | Por publicación (30 días) | ❌ | ❌ |
| **Facebook** | $0 | Ilimitado (pero desorganizado) | ❌ | ❌ |
| **CRMs LATAM** | $39-48 | N/A | ✅ | ✅ |

**Ventaja competitiva**:
- PLUS: Más barato que PlusValia, más organizado que Facebook
- AGENT: Reemplaza CRM + plataforma en un solo servicio
- PRO: Data local de mercado (único en Ecuador)

---

## 🎯 Target de Mercado (MVP)

### Segmentación Clara:

**PLUS ($9.99) - B2C**:
- Particulares vendiendo su casa (1-3 propiedades max)
- Urgencia de venta (necesitan visibilidad YA)
- LTV esperado: $20-30 (2-3 meses, luego cancelan)
- **No es MRR confiable** - es lead magnet para inventario

**AGENT ($29.99) - B2B Core**:
- Agentes freelance/pequeños (2-10 propiedades activas)
- Necesitan herramientas de gestión de leads
- LTV esperado: $360/año (80% retención)
- **MRR recurrente confiable**

**PRO ($59.99) - B2B Premium**:
- Agencias establecidas (10-50 propiedades)
- Necesitan analytics de mercado y reportes
- LTV esperado: $720/año (85% retención)
- **MRR premium**

### Fase 1: Todo Ecuador, Marketing en Cuenca/Azuay (Meses 1-6)

**Mercado inicial de marketing**: Provincia del Azuay (880k habitantes)

**Pero plataforma acepta**: Todo Ecuador (sin restricciones geográficas)

**Razón**: Marketing focalizado (menor costo Facebook Ads) pero sin límite técnico

---

## 🛠️ Implementación Técnica

### Schema Changes Required:

```prisma
enum SubscriptionTier {
  FREE
  PLUS   // Reemplaza BASIC
  AGENT  // Nuevo
  PRO
}

model User {
  // Campo existente actualizado:
  subscriptionTier SubscriptionTier @default(FREE)

  // Stripe fields (para futura integración):
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?
}

// NO agregar a Property:
// - expiresAt (sin expiración)
// - republishCount (sin límite de renovaciones)
```

### Helpers Required:

```typescript
// apps/web/lib/permissions/property-limits.ts

export function getPropertyLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case 'FREE': return 1
    case 'PLUS': return 3
    case 'AGENT': return 10
    case 'PRO': return 20
  }
}

export function getImageLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case 'FREE': return 6
    case 'PLUS': return 25
    case 'AGENT': return 20
    case 'PRO': return 25
  }
}

export function getFeaturedLimit(tier: SubscriptionTier): number | null {
  switch (tier) {
    case 'FREE': return 0
    case 'PLUS': return 1     // 1 destacado permanente
    case 'AGENT': return 5    // 5 destacados permanentes
    case 'PRO': return null   // Ilimitados
  }
}
```

---

## 📅 Roadmap de Implementación

### ✅ Sprint 1: Schema + Permissions (COMPLETADO - Dic 5, 2025)
- ✅ Actualizar schema Prisma (4 tiers)
- ✅ Crear migración SQL
- ✅ Helpers de autorización actualizados
- ✅ Server Actions con validación de nuevos tiers
- ✅ Componentes UI actualizados
- ✅ Type-check pasando (0 errores)

### Sprint 2: Stripe Integration (Próximo)
- [ ] Configurar Stripe (USD)
- [ ] Crear productos: PLUS ($9.99), AGENT ($29.99), PRO ($59.99)
- [ ] Checkout flow
- [ ] Webhooks básicos

### Sprint 3: UI + Testing
- [ ] Actualizar página `/pricing` con 4 tiers
- [ ] Modal de upgrade con nueva progresión
- [ ] Testing completo
- [ ] Beta cerrada (50 usuarios)

**Timeline total**: 6 semanas (1.5 meses)

---

## 🎓 Lecciones Aprendidas

**Por qué llegamos a estas decisiones**:

1. **BASIC era ambiguo**: 3 propiedades no sirve ni a dueños (1 propiedad) ni a agentes (necesitan 10+)
2. **Segmentación B2C/B2B**: Separar value props - velocidad (PLUS) vs herramientas (AGENT/PRO)
3. **Pricing basado en valor**: PLUS más caro pero con destacado (valor real). AGENT justificado por CRM
4. **Simplicidad técnica**: Destacados permanentes (no créditos) evita complejidad de cron jobs
5. **Flexibilidad geográfica**: Marketing focalizado NO significa restricción técnica

---

## 📖 Referencias

**Documentos relacionados**:
- `CLAUDE.md` - Freemium Model (actualizado Dic 5, 2025)
- `ECUADOR_STRATEGY.md` - Estrategia de mercado local
- `IMPLEMENTATION_STRATEGY.md` - Git workflow y sprints
- `COST_SCALING_ANALYSIS.md` - Análisis de costos de infraestructura

**Migration SQL**:
- `packages/database/migrations/20251205_update_subscription_tiers.sql`

---

**Aprobado por**: Juan (Product Owner)
**Fecha original**: Noviembre 20, 2025
**Actualización**: Diciembre 5, 2025
**Status**: ✅ Implementado y desplegado
