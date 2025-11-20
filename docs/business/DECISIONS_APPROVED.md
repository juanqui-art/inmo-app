# Decisiones Aprobadas - Implementación Freemium

> **Fecha de aprobación**: Noviembre 20, 2025
> **Status**: ✅ APROBADO - Listo para implementar
> **Siguiente paso**: Sprint 1 - Schema + Migrations

---

## 📋 Resumen Ejecutivo

**Modelo aprobado**: Freemium simplificado (3 tiers) para mercado Ecuador

**Estrategia**: Implementar MVP flexible, validar con usuarios reales, ajustar según feedback

---

## ✅ Decisiones Críticas Aprobadas

### 1. Modelo de Negocio
- **✅ APROBADO**: Freemium (3 tiers: FREE/BASIC/PRO)
- **Alineado con**: `ECUADOR_STRATEGY.md`

---

### 2. Pricing de Planes

```
FREE:    $0/mes
BASIC:   $4.99/mes
PRO:     $14.99/mes
```

**Moneda**: USD (Ecuador usa dólar)

**Período**: Solo mensual (NO anual en MVP)

**Razón**: Precios ajustados a mercado ecuatoriano (más bajo que competencia)

---

### 3. Límites por Tier

| Feature | FREE | BASIC | PRO |
|---------|------|-------|-----|
| **Propiedades activas** | 1 | 3 | 10 |
| **Imágenes/propiedad** | 5 | 10 | 20 |
| **Duración publicación** | **Ilimitada** | **Ilimitada** | **Ilimitada** |
| **Destacados** | ❌ No | 3/mes | Ilimitados |
| **Analytics** | ❌ No | Básico | Avanzado |
| **Soporte** | Email (72h) | Email (24h) | WhatsApp (12h) |

**Decisión clave**: **Sin expiración automática** (auto-renovación ilimitada)

**Razón**:
- ✅ Técnicamente simple (no requiere cron jobs, emails, contadores)
- ✅ Flexible para cualquier tipo de usuario
- ✅ Generoso (mejor para lanzamiento y adquisición)
- ✅ Se puede ajustar después según datos reales

---

### 4. Nomenclatura de Planes

**En código (Prisma, TypeScript)**:
```typescript
enum SubscriptionTier {
  FREE
  BASIC
  PRO
}
```

**En UI (traducido a español)**:
- FREE → "Gratuito"
- BASIC → "Básico"
- PRO → "Pro"

**Razón**: Estándar internacional en código, localizado en interfaz

---

### 5. Migración de Usuarios Existentes

**Decisión**: NO aplica (solo datos de prueba en DB actual)

**Acción**: Reset limpio de usuarios al implementar nuevo schema

---

## 🚫 Decisiones POSPUESTAS (Para después del MVP)

Estas se decidirán DESPUÉS de validar con usuarios reales:

### Postponed para Fase 2:
- [ ] Plan anual con descuento
- [ ] Destacados como add-on para FREE
- [ ] Programa de referidos
- [ ] Trial period (7-14 días gratis)
- [ ] Early bird pricing

**Razón**: No queremos paralizar desarrollo con decisiones prematuras. MVP primero, optimización después.

---

## 📊 Comparativa con Competencia

| Proveedor | Costo Mensual | Límite Propiedades |
|-----------|---------------|-------------------|
| **InmoApp FREE** | $0 | 1 (sin expiración) |
| **InmoApp BASIC** | $4.99 | 3 |
| **InmoApp PRO** | $14.99 | 10 |
| **PlusValia** | $20-50 | Por publicación (30 días) |
| **Facebook** | $0 | Ilimitado (pero desorganizado) |

**Ventaja competitiva**: Más barato que PlusValia, más organizado que Facebook

---

## 🎯 Target de Mercado (MVP)

### Fase 1: Cuenca/Azuay (Meses 1-6)

**Mercado inicial**: Provincia del Azuay (880k habitantes)

**Usuarios objetivo**:
- Particulares vendiendo su casa (1-2 propiedades)
- Agentes pequeños comenzando (3-5 propiedades)
- Inmobiliarias locales (10+ propiedades)

**NO definimos target específico**: El MVP nos dirá quién adopta primero (migrantes comprando, agentes vendiendo, o particulares)

---

## 🛠️ Implementación Técnica

### Schema Changes Required:

```prisma
enum SubscriptionTier {
  FREE
  BASIC
  PRO
}

model User {
  // Agregar campo:
  subscriptionTier SubscriptionTier @default(FREE)
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
    case 'BASIC': return 3
    case 'PRO': return 10
  }
}

export function getImageLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case 'FREE': return 5
    case 'BASIC': return 10
    case 'PRO': return 20
  }
}

export function canCreateProperty(user: User, currentCount: number): boolean {
  const limit = getPropertyLimit(user.subscriptionTier)
  return currentCount < limit
}
```

---

## 📅 Roadmap de Implementación

### Sprint 1-2: Schema + Permissions (Semanas 1-2)
- [ ] Actualizar schema Prisma
- [ ] Crear migración
- [ ] Helpers de autorización
- [ ] Server Actions con validación

### Sprint 3-4: Stripe Integration (Semanas 3-4)
- [ ] Configurar Stripe (USD)
- [ ] Crear productos: BASIC ($4.99), PRO ($14.99)
- [ ] Checkout flow
- [ ] Webhooks básicos

### Sprint 5-6: UI + Testing (Semanas 5-6)
- [ ] Página `/pricing`
- [ ] Modal de upgrade
- [ ] Testing completo
- [ ] Beta cerrada (50 usuarios)

**Timeline total**: 6 semanas (1.5 meses)

---

## 🎓 Lecciones Aprendidas

**Por qué llegamos a estas decisiones**:

1. **Simplicidad técnica**: Auto-renovación ilimitada evita complejidad innecesaria
2. **Flexibilidad de mercado**: No asumimos quién será el cliente ideal
3. **Validación sobre predicción**: MVP → Beta → Datos → Ajustar
4. **Pricing competitivo**: $4.99 es más bajo que PlusValia ($20+) pero monetiza mejor que gratis total

---

## 📖 Referencias

**Documentos relacionados**:
- `ECUADOR_STRATEGY.md` - Estrategia de mercado local
- `IMPLEMENTATION_STRATEGY.md` - Git workflow y sprints
- `COST_SCALING_ANALYSIS.md` - Análisis de costos de infraestructura

**Próximo documento a crear**:
- `TECHNICAL_ROADMAP.md` - Plan técnico detallado sprint por sprint

---

**Aprobado por**: Juan (Product Owner)
**Fecha**: Noviembre 20, 2025
**Status**: ✅ Listo para implementar Sprint 1
