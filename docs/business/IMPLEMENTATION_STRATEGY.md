# Estrategia de Implementación - Modelo Freemium

> **Última actualización**: Noviembre 20, 2025
> **Status**: 📋 Decisión Estratégica Documentada
> **Propósito**: Definir estrategia Git y plan de implementación para cambios Freemium
> **Decisión**: NO fork, usar Feature Branch + Git Worktree (opcional)

---

## 📊 Resumen Ejecutivo

**Decisión**: Implementar modelo Freemium usando **feature branch largo** con sub-branches por sprint, **sin hacer fork del repositorio**.

**Razón**: El fork agrega complejidad innecesaria para un solo desarrollador. Feature branches son suficientes y mantienen el flujo de trabajo existente.

**Plan**: 4-6 sprints (8-12 semanas) con implementación incremental y PR final a `main`.

---

## ❌ Decisión: NO Hacer Fork

### Pregunta Evaluada
> ¿Debemos hacer fork del repositorio para implementar Freemium?

### Respuesta: NO

### Razones:

#### 1. **Complejidad Innecesaria**
```bash
# Con fork tendrías:
juanqui-art/inmo-app          # Repo original
juanqui-art/inmo-app-freemium # Fork

# Problemas:
❌ Sincronización manual entre repos
❌ Gestión duplicada de issues
❌ PRs complicadas (cross-repo)
❌ Overhead de mantener 2 repositorios
❌ Confusión sobre "dónde commitear"
```

#### 2. **Flujo de Trabajo Ya Establecido**
El proyecto ya usa un flujo efectivo:
- ✅ Feature branches (`claude/*`)
- ✅ Pull requests
- ✅ Merges a `main`
- ✅ Deploy automático desde `main` (Vercel)

**Un fork rompería este flujo probado.**

#### 3. **Es una Evolución, No un Proyecto Nuevo**
- No estás creando un producto diferente
- Es la evolución natural de InmoApp
- Los usuarios actuales **migran** (no hay split permanente)
- No necesitas 2 versiones en producción

#### 4. **Para 1 Desarrollador es Overkill**
Forks tienen sentido cuando:
- ✅ Múltiples equipos trabajando en paralelo
- ✅ Divergencia permanente de productos
- ✅ Necesitas mantener 2 versiones en producción

**Tu caso**: 1 desarrollador, 1 producto, evolución lineal → **Feature branch es suficiente**

---

## ✅ Estrategia Recomendada

### Feature Branch + Sprints + Git Worktree (opcional)

```
main (producción)
  ↓
  git tag v1.5-pre-freemium (snapshot)
  ↓
feature/freemium-implementation (branch principal)
  ├── feature/freemium-schema (Sprint 1)
  ├── feature/freemium-permissions (Sprint 2)
  ├── feature/freemium-stripe (Sprint 3)
  ├── feature/freemium-ui (Sprint 4)
  └── feature/freemium-testing (Sprint 5)
  ↓
  PR → main (cuando todo esté listo)
```

---

## 🛡️ Fase 0: Preparación (Antes de Implementar)

### Paso 1: Crear Snapshot de Seguridad

**Propósito**: Punto de retorno si algo sale mal.

```bash
# Crear tag del estado actual
git tag v1.5-pre-freemium -m "Estado antes de implementación Freemium (Nov 2025)"
git push origin v1.5-pre-freemium

# Verificar
git tag -l
# Salida esperada:
# v1.5-pre-freemium
```

**Esto permite rollback instantáneo**:
```bash
# Si necesitas volver atrás:
git checkout v1.5-pre-freemium
git checkout -b hotfix/revert-freemium
# Deploy desde esta branch
```

---

### Paso 2: Crear Feature Branch Principal

```bash
# Desde main
git checkout main
git pull origin main

# Crear feature branch
git checkout -b feature/freemium-implementation

# Push inicial
git push -u origin feature/freemium-implementation
```

---

### Paso 3 (OPCIONAL): Configurar Git Worktree

**¿Cuándo usar worktree?**
- ✅ Quieres probar main y feature lado a lado
- ✅ Necesitas hacer hotfixes en main sin perder trabajo
- ✅ Quieres comparar versiones fácilmente

**Configuración**:

```bash
# Directorio actual (main)
cd ~/inmo-app

# Crear worktree para feature branch
git worktree add ../inmo-app-freemium feature/freemium-implementation

# Ahora tienes:
~/inmo-app/              # main (producción)
~/inmo-app-freemium/     # feature branch (desarrollo)

# Ambos comparten el mismo .git
```

**Uso diario**:

```bash
# Terminal 1: main funcionando
cd ~/inmo-app
bun run dev  # Puerto 3000

# Terminal 2: feature branch
cd ~/inmo-app-freemium
# Cambiar puerto en package.json: "dev": "next dev -p 3001"
bun run dev  # Puerto 3001

# Ahora puedes comparar ambas versiones en tiempo real
```

**Ventajas**:
- No necesitas hacer `git stash` ni cambiar branches
- Puedes probar ambas versiones simultáneamente
- Hotfixes en main sin interrumpir desarrollo

**Cómo limpiar después**:
```bash
# Cuando ya no necesites worktree
git worktree remove ../inmo-app-freemium
```

---

## 🚀 Plan de Implementación por Sprints

### Sprint 1: Schema & Migrations (Semanas 1-2)

**Branch**: `feature/freemium-schema`

```bash
# Crear branch desde feature principal
git checkout feature/freemium-implementation
git checkout -b feature/freemium-schema

# Cambios:
- Actualizar packages/database/prisma/schema.prisma
- Crear migración con Prisma
- Script de migración de datos (grandfathering)
- Tests de schema

# Commits:
git commit -m "feat(schema): add subscriptionTier and stripeCustomerId to User"
git commit -m "feat(schema): create Subscription model and SubscriptionStatus enum"
git commit -m "feat(schema): update UserRole enum (remove CLIENT/AGENT, add FREE/PREMIUM/PRO)"
git commit -m "feat(migration): add grandfathering script for existing users"
git commit -m "test(schema): add tests for subscription model"

# PR → feature/freemium-implementation
git push -u origin feature/freemium-schema
# Crear PR en GitHub: feature/freemium-schema → feature/freemium-implementation
```

**Entregable**: Schema actualizado, migración probada, usuarios actuales migrados.

---

### Sprint 2: Permissions & Helpers (Semanas 3-4)

**Branch**: `feature/freemium-permissions`

```bash
git checkout feature/freemium-implementation
git pull origin feature/freemium-implementation  # Include Sprint 1 changes
git checkout -b feature/freemium-permissions

# Cambios:
- Crear apps/web/lib/permissions.ts
- Implementar canCreateProperty()
- Implementar canUploadImages()
- Implementar getFeaturesByTier()
- Implementar canHighlight()
- Actualizar apps/web/lib/auth.ts (requireRole actualizado)
- Actualizar Server Actions con validaciones

# Commits:
git commit -m "feat(permissions): create permissions helper library"
git commit -m "feat(permissions): implement canCreateProperty with tier limits"
git commit -m "feat(permissions): implement canUploadImages validation"
git commit -m "feat(permissions): implement getFeaturesByTier helper"
git commit -m "refactor(auth): update requireRole to work with new UserRole enum"
git commit -m "feat(actions): add tier validation to createPropertyAction"
git commit -m "test(permissions): add comprehensive tests for permission helpers"

# PR → feature/freemium-implementation
git push -u origin feature/freemium-permissions
```

**Entregable**: Helpers de permisos funcionando, validaciones en Server Actions.

---

### Sprint 3: Stripe Integration (Semanas 5-6)

**Branch**: `feature/freemium-stripe`

```bash
git checkout feature/freemium-implementation
git pull origin feature/freemium-implementation
git checkout -b feature/freemium-stripe

# Cambios:
- Crear apps/web/lib/stripe.ts
- Configurar Stripe checkout
- Implementar webhooks (/api/webhooks/stripe)
- Crear subscription management endpoints
- Server Actions para checkout
- Tests de integración Stripe (usando Stripe test mode)

# Commits:
git commit -m "feat(stripe): initialize Stripe SDK and config"
git commit -m "feat(stripe): create checkout session endpoint"
git commit -m "feat(stripe): implement subscription webhooks"
git commit -m "feat(stripe): add subscription management actions"
git commit -m "feat(stripe): handle subscription lifecycle (create/update/cancel)"
git commit -m "test(stripe): add webhook tests with Stripe fixtures"

# PR → feature/freemium-implementation
git push -u origin feature/freemium-stripe
```

**Entregable**: Integración Stripe funcional, usuarios pueden suscribirse.

---

### Sprint 4: UI & UX (Semanas 7-8)

**Branch**: `feature/freemium-ui`

```bash
git checkout feature/freemium-implementation
git pull origin feature/freemium-implementation
git checkout -b feature/freemium-ui

# Cambios:
- Crear apps/web/app/(public)/pricing/page.tsx
- Crear components/upgrade-prompt.tsx
- Actualizar dashboard para mostrar límites
- Actualizar /vender con nuevo flujo
- Agregar indicadores de tier en UI
- Badges "PREMIUM" / "PRO" en perfiles
- Actualizar signup (sin selector de rol)

# Commits:
git commit -m "feat(ui): create pricing page with Ecuador tiers"
git commit -m "feat(ui): implement UpgradePrompt modal component"
git commit -m "feat(ui): add tier limits display in dashboard"
git commit -m "feat(ui): update /vender flow for Freemium model"
git commit -m "feat(ui): add tier badges to user profiles"
git commit -m "refactor(auth): remove role selector from signup form"
git commit -m "feat(ui): add usage indicators (properties count, images used)"

# PR → feature/freemium-implementation
git push -u origin feature/freemium-ui
```

**Entregable**: UI completa, flujo de usuario intuitivo, página de pricing.

---

### Sprint 5: Testing & Refinement (Semanas 9-10)

**Branch**: Trabajar directamente en `feature/freemium-implementation`

```bash
git checkout feature/freemium-implementation
git pull origin feature/freemium-implementation

# Actividades:
- Tests E2E con Playwright (flujo completo de signup → publish → upgrade)
- Tests de integración (Stripe test mode)
- Testing manual exhaustivo
- Performance testing
- Security audit
- Documentación de usuario

# Commits:
git commit -m "test(e2e): add complete user journey tests"
git commit -m "test(integration): add Stripe subscription flow tests"
git commit -m "docs(user): add pricing and subscription documentation"
git commit -m "fix(ui): address feedback from testing"
git commit -m "perf(dashboard): optimize tier checks with caching"
```

**Entregable**: Sistema probado exhaustivamente, listo para producción.

---

### Sprint 6: Launch Preparation (Semanas 11-12)

```bash
# Actividades finales:
- Beta testing con usuarios reales (invitar 10-20 usuarios)
- Ajustes según feedback
- Crear plan de comunicación (email a usuarios actuales)
- Configurar Stripe en producción
- Preparar rollback plan
- Documentar proceso de soporte

# Cuando esté 100% listo:
git checkout feature/freemium-implementation
git pull origin feature/freemium-implementation

# PR GRANDE → main
git push origin feature/freemium-implementation
# Crear PR en GitHub: feature/freemium-implementation → main
```

**PR Checklist**:
```markdown
## Freemium Implementation - Ready for Production

### Changes
- [ ] Schema updated (User, Subscription models)
- [ ] Migrations tested (grandfathering working)
- [ ] Permission helpers implemented
- [ ] Stripe integration functional
- [ ] UI/UX complete
- [ ] Tests passing (113+ tests)
- [ ] E2E tests added
- [ ] Documentation updated
- [ ] Beta tested with real users

### Deployment Plan
- [ ] Backup database before migration
- [ ] Run migrations in production
- [ ] Monitor Stripe webhooks
- [ ] Send communication to existing users
- [ ] Monitor error logs for 48h

### Rollback Plan
- [ ] Tag created: v1.5-pre-freemium
- [ ] Database backup available
- [ ] Revert script tested

### Risks
- [ ] Existing users migrated correctly
- [ ] Stripe webhooks working
- [ ] No breaking changes for free users
```

---

## 🚨 Estrategia de Rollback

### Si algo sale mal después del merge a main:

#### Opción 1: Revertir al Tag

```bash
# Checkout del snapshot pre-freemium
git checkout v1.5-pre-freemium

# Crear branch de emergencia
git checkout -b hotfix/revert-freemium

# Deploy desde esta branch (en Vercel)
# Settings → Git → Production Branch → hotfix/revert-freemium

# Notificar usuarios
```

#### Opción 2: Revert del Merge

```bash
# Revertir el merge commit
git revert -m 1 <commit-hash-del-merge>
git push origin main

# Deploy automático revierte cambios
```

#### Opción 3: Rollback de Database

```bash
# Si solo es problema de datos
cd packages/database

# Restaurar backup
# (Supabase Dashboard → Database → Backups → Restore)

# O revertir migración específica
bunx prisma migrate resolve --rolled-back 20251120_add_subscription_model
```

---

## 📊 Monitoreo Post-Launch

### Primeras 48 horas:

**Métricas a vigilar**:
```bash
# Errores
- Stripe webhook failures
- Migration errors (check logs)
- User complaints (support tickets)

# Conversiones
- Signups (should continue normal rate)
- Upgrades (track first conversions)
- Churn (should be ~0% in first week)

# Performance
- Page load times (/pricing, /dashboard)
- Database query performance
- Stripe API latency
```

**Alertas recomendadas**:
```javascript
// Vercel/Sentry
- Error rate > 1% (normal es <0.1%)
- Stripe webhook failures > 5 in 1 hour
- Database query time > 1s
- Any 500 errors on /pricing or /dashboard
```

---

## 🎓 Mejores Prácticas Durante Implementación

### DO ✅

1. **Commits pequeños y descriptivos**
   ```bash
   ✅ git commit -m "feat(schema): add subscriptionTier to User model"
   ❌ git commit -m "WIP"
   ```

2. **Tests antes de cada PR**
   ```bash
   bun run type-check
   bun run test
   bun run build
   ```

3. **Documentar decisiones en commits**
   ```bash
   git commit -m "feat(permissions): use subscriptionTier over role for limits

   Reasoning: Simplifies permission checks and allows for easier
   tier upgrades without changing user roles.

   See: docs/business/PERMISSIONS_FREEMIUM.md"
   ```

4. **PR templates**
   Cada PR debe incluir:
   - ¿Qué cambió?
   - ¿Por qué?
   - ¿Cómo probar?
   - Screenshots (si es UI)
   - Rollback plan

5. **Deploy a staging primero**
   ```bash
   # Vercel preview deployment
   git push origin feature/freemium-ui
   # Probar en: https://inmo-app-git-feature-freemium-ui-juanqui.vercel.app
   ```

### DON'T ❌

1. **No hacer commits gigantes**
   ```bash
   ❌ git add .
   ❌ git commit -m "finished freemium"
   ```

2. **No saltarse tests**
   ```bash
   ❌ git commit -m "fix: quick fix (no time for tests)"
   ```

3. **No mergear sin code review**
   - Aunque seas solo tú, revisa tu propio PR después de 24h
   - Perspective fresca = menos bugs

4. **No cambiar main directamente**
   ```bash
   ❌ git checkout main
   ❌ git commit -m "quick fix"
   ```

---

## 📚 Referencias

**Documentos relacionados**:
- `docs/business/BUSINESS_STRATEGY.md` - Estrategia general de negocio
- `docs/business/ECUADOR_STRATEGY.md` - Plan de lanzamiento Ecuador
- `docs/business/PERMISSIONS_FREEMIUM.md` - Especificación técnica de permisos
- `docs/business/DECISIONS_PENDING.md` - Decisiones por tomar antes de implementar
- `docs/git/WORKTREES_CHEATSHEET.md` - Guía de Git Worktrees

**Recursos externos**:
- [Git Worktrees](https://git-scm.com/docs/git-worktree)
- [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
- [Stripe Testing](https://stripe.com/docs/testing)

---

## 📝 Checklist de Pre-Implementación

Antes de comenzar Sprint 1, verificar:

- [ ] Revisado `docs/business/DECISIONS_PENDING.md`
- [ ] Decidido política de grandfathering (¿1 año gratis para AGENT?)
- [ ] Confirmado límites por tier (1, 5, ∞ propiedades)
- [ ] Cuenta de Stripe creada (test mode)
- [ ] Precios configurados en Stripe ($4.99 PREMIUM, $14.99 PRO)
- [ ] Tag de seguridad creado (`v1.5-pre-freemium`)
- [ ] Feature branch creado (`feature/freemium-implementation`)
- [ ] (Opcional) Git worktree configurado
- [ ] Backup de base de datos de producción
- [ ] Plan de comunicación a usuarios actuales preparado

---

## 🎯 Resumen de Decisiones

| Pregunta | Decisión | Razón |
|----------|----------|-------|
| **¿Fork del repo?** | ❌ NO | Complejidad innecesaria para 1 dev |
| **¿Qué estrategia?** | ✅ Feature Branch | Mantiene flujo actual |
| **¿Usar Git Worktree?** | ⚠️ Opcional | Útil para comparar versiones |
| **¿Cuántos sprints?** | 5-6 sprints | 10-12 semanas |
| **¿Deploy gradual?** | ✅ SÍ | Staging → Beta → Producción |
| **¿Rollback plan?** | ✅ Tag + Revert | v1.5-pre-freemium |

---

**Última actualización**: Noviembre 20, 2025
**Próxima revisión**: Al iniciar Sprint 1
**Owner**: Juan (desarrollador)
**Status**: 📋 Documentado, listo para implementación
