# Sesión: Tier Features + CRM Lite Implementation
**Fecha**: 2025-12-14
**Duración**: ~45 minutos

---

## 🎯 Objetivo de la Sesión

Analizar las features de los tiers FREE, PLUS y AGENT para determinar qué está implementado y qué falta, luego implementar las features de alta prioridad.

---

## ✅ Lo Que Se Completó

### 1. Análisis de Tiers
- Revisión completa de features por tier
- Identificación de features implementadas vs pendientes
- PRO tier ocultado temporalmente de `/vender`

### 2. TierBadge Component
**Archivo**: `apps/web/components/badges/tier-badge.tsx`
- Badge "Premium" (dorado) para tier PLUS
- Badge "Verificado" (azul) para tier AGENT/PRO
- Integrado en `PropertyCard` público

### 3. Modelos de Base de Datos (SQL aplicado en Supabase)

#### AgentClient (CRM Lite)
```prisma
model AgentClient {
  id         String     @id
  agentId    String     // El agente
  clientId   String     // El cliente/lead
  status     LeadStatus @default(NEW)
  notes      String?    // Notas del agente
  source     String?    // Origen: appointment, favorite, manual
  propertyId String?    // Propiedad de interés
}

enum LeadStatus {
  NEW           // Nuevo
  CONTACTED     // Contactado
  INTERESTED    // Interesado
  NEGOTIATING   // En negociación
  CLOSED_WON    // Cerrado - ganado
  CLOSED_LOST   // Cerrado - perdido
}
```

#### PropertyVideo (Videos externos)
```prisma
model PropertyVideo {
  id         String        @id
  url        String        // URL externa (YouTube, TikTok, etc.)
  platform   VideoPlatform // Auto-detectado
  title      String?
  order      Int
  propertyId String
}

enum VideoPlatform {
  YOUTUBE | TIKTOK | INSTAGRAM | FACEBOOK | VIMEO | OTHER
}
```

### 4. CRM Lite UI Completa

**Archivos creados**:
- `apps/web/app/actions/crm.ts` - Server actions
- `apps/web/components/crm/client-status-badge.tsx` - Badge visual
- `apps/web/components/crm/client-actions.tsx` - Dropdown de acciones
- `apps/web/lib/types/crm.ts` - Tipos TypeScript

**Página actualizada**: `/dashboard/clientes`
- Tarjetas de stats por estado
- Tabla con cliente, estado, propiedad, notas
- Dropdown para cambiar estado y editar notas

**Integración automática**:
- Cuando un cliente agenda cita → se crea AgentClient automáticamente
- Modificado: `apps/web/app/actions/appointments.ts`

### 5. Fixes Adicionales
- Resuelto error de serialización Server→Client en dashboard
- Creado `SimpleStatsCard` con iconName en lugar de icon component
- Agregado `subscriptionTier` al select de agent en property repository

---

## 📊 Estado de Tiers Post-Sesión

| Tier | Completado | Principales Pendientes |
|------|:----------:|------------------------|
| **FREE** | 83% | Sistema de tickets |
| **PLUS** | 75% | Video tour UI |
| **AGENT** | 80% | Landing page personal |

---

## 🔜 Siguiente Sesión: UI de Videos

### Objetivo
Implementar la UI para que los agentes puedan agregar videos externos (YouTube, TikTok, etc.) a sus propiedades.

### Tareas Pendientes

1. **VideoUrlInput Component**
   - Input para pegar URL
   - Validación y detección de plataforma
   - Ubicación: `apps/web/components/property-wizard/video-url-input.tsx`

2. **Actualizar Wizard Store**
   - Agregar `videos: { url: string; platform: string }[]` al store
   - Archivo: `apps/web/lib/stores/property-wizard-store.ts`

3. **Agregar Sección en Wizard**
   - Campo de video en step existente o nuevo step
   - Archivos wizard: `apps/web/components/dashboard/property-wizard/`

4. **Actualizar Server Action**
   - Guardar videos en `PropertyVideo` table
   - Archivo: `apps/web/app/actions/wizard.ts`

5. **VideoPlayer en Property Detail**
   - Reproductor de video (react-player recomendado)
   - Ubicación: `apps/web/components/property-detail/property-video-player.tsx`
   - Integrar en: `apps/web/app/(public)/propiedades/[id-slug]/page.tsx`

### Librería Recomendada
```bash
bun add react-player
```
Soporta YouTube, TikTok, Facebook, Vimeo nativamente.

### Límites por Tier (a implementar)
| Tier | Videos por Propiedad |
|------|:--------------------:|
| FREE | 0 |
| PLUS | 1 |
| AGENT | 3 |
| PRO | Ilimitado |

---

## 📁 Archivos Clave para Referencia

### CRM
- `apps/web/app/dashboard/clientes/page.tsx`
- `apps/web/app/actions/crm.ts`
- `apps/web/components/crm/`

### Tiers/Badges
- `apps/web/components/badges/tier-badge.tsx`
- `apps/web/lib/pricing/tiers.ts`
- `apps/web/lib/permissions/property-limits.ts`

### Property Wizard
- `apps/web/components/dashboard/property-wizard/`
- `apps/web/lib/stores/property-wizard-store.ts`
- `apps/web/app/actions/wizard.ts`

### Database
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/migrations/manual_crm_lite.sql`

---

## Commits de Esta Sesión

```
bdc108b chore: misc updates to wizard, property limits, and loading states
fdc314e fix(dashboard): resolve Server-Client serialization error
fdd73a9 feat(crm): implement CRM Lite with lead status and notes
12cdcb8 feat(db): add AgentClient and PropertyVideo models
77897d1 feat(tiers): add TierBadge component and integrate with PropertyCard
```
