# 🗺️ InmoApp Roadmap - 2025-2026

> **Última actualización**: Noviembre 23, 2025
> **Status**: Plan Estratégico para próximos 6 meses
> **Objetivo**: MVP Freemium → Producción → Escala

---

## 📊 Vista General

```
Noviembre 2025          Diciembre 2025          Enero 2026          Febrero-Abril 2026
─────────────────────────────────────────────────────────────────────────────────────
│                       │                       │                   │
│  FASE 1: URGENCIAS    │  FASE 2: FOUNDATIONS  │  FASE 3: FREEMIUM │  FASE 4: SCALE
│  (Semana 1)           │  (3 semanas)          │  (6 semanas)      │  (8 semanas)
│                       │                       │                   │
│  • Email Fix          │  • Testing 25%        │  • Stripe         │  • Beta Testing
│  • Performance        │  • Logging            │  • UI Pricing     │  • Monitoring
│  • Quick Wins         │  • Security           │  • Webhooks       │  • Optimización
│                       │  • CI/CD              │                   │
│                       │                       │                   │
└───────────────────────┴───────────────────────┴───────────────────┴──────────────────
   1 semana                3 semanas               6 semanas            8+ semanas
```

**Timeline total**: 18 semanas (4.5 meses)
**Inversión estimada**: $9,000-12,000
**ROI esperado**: Payback en 10 meses

---

## 🎯 FASE 1: URGENCIAS (Semana 1)

**Objetivo**: Resolver problemas bloqueantes y quick wins

**Timeline**: Noviembre 25-29, 2025 (1 semana)
**Inversión**: 8-12 horas (~$400-600)

### Entregables

| # | Tarea | Responsable | Tiempo | Prioridad |
|---|-------|-------------|--------|-----------|
| 1.1 | **Email Domain Verification** | DevOps | 45 min | 🔴 CRÍTICA |
| 1.2 | **Error Handling para Emails** | Backend | 30 min | 🔴 CRÍTICA |
| 1.3 | **React.cache() Implementation** | Backend | 2h | 🟡 ALTA |
| 1.4 | **Map Filters URL Preservation** | Frontend | 2h | 🟢 MEDIA |
| 1.5 | **Fix Prisma Generation Issue** | DevOps | 1-2h | 🔴 CRÍTICA |
| 1.6 | **Run Full Test Suite** | QA | 1h | 🟡 ALTA |

### Criterios de Éxito

- ✅ Usuarios reciben emails de confirmación
- ✅ Performance mejora 36% (medido con Vercel Analytics)
- ✅ Filtros de mapa preservan contexto
- ✅ Tests ejecutan sin errores de módulos
- ✅ 16/23 tests passing → 20/23 passing

### Dependencias

**Bloqueantes**: Ninguna (todas las tareas son independientes)

**Habilita**: Fase 2 (testing foundations requiere Prisma funcionando)

---

## 🏗️ FASE 2: FOUNDATIONS (Semanas 2-4)

**Objetivo**: Base sólida para escalabilidad (Testing + Logging + Security)

**Timeline**: Diciembre 2-20, 2025 (3 semanas)
**Inversión**: 40-50 horas (~$2,000-2,500)

### Semana 2: Testing Infrastructure (Dic 2-6)

**Foco**: Establecer coverage >25%

| Tarea | Entregable | Tiempo | Status |
|-------|------------|--------|--------|
| **2.1 Repository Unit Tests** | FavoriteRepo, AppointmentRepo, PropertyImageRepo, UserRepo | 8h | ⏳ |
| **2.2 Server Action Tests** | Complete properties.test.ts, appointments.test.ts | 6h | ⏳ |
| **2.3 CI/CD Enforcement** | GitHub Actions con coverage threshold | 4h | ⏳ |

**Entregables**:
- ✅ 40+ tests totales (actualmente 23)
- ✅ Coverage >25% (actualmente ~5%)
- ✅ CI/CD bloquea merges si tests fallan

---

### Semana 3: Logging & Monitoring (Dic 9-13)

**Foco**: Observabilidad básica

| Tarea | Entregable | Tiempo | Status |
|-------|------------|--------|--------|
| **3.1 Structured Logging** | Pino logger + custom errors | 3h | ⏳ |
| **3.2 Sentry Integration** | Error tracking + alertas | 3h | ⏳ |
| **3.3 Error Boundaries** | React error boundaries en app | 2h | ⏳ |
| **3.4 Action Wrapper** | HOC para Server Actions | 2h | ⏳ |

**Entregables**:
- ✅ Logs estructurados en JSON
- ✅ Errores capturados en Sentry
- ✅ Alertas configuradas (email/Slack)
- ✅ RequestId tracking

**Costos nuevos**: Sentry Free tier (5K errors/mes)

---

### Semana 4: Security & Rate Limiting (Dic 16-20)

**Foco**: Cerrar vectores de ataque

| Tarea | Entregable | Tiempo | Status |
|-------|------------|--------|--------|
| **4.1 Security Headers** | CSP, X-Frame-Options, HSTS | 2h | ⏳ |
| **4.2 Input Sanitization** | DOMPurify integration | 3h | ⏳ |
| **4.3 Rate Limiting** | Upstash Redis + limiters | 4h | ⏳ |
| **4.4 CSRF Protection** | Tokens para Server Actions críticos | 1h | ⏳ |

**Entregables**:
- ✅ Security headers implementados
- ✅ XSS protection activa
- ✅ Rate limits:
  - 10 properties/día por usuario
  - 50 images/día
  - 5 intentos login/15min
- ✅ CSRF tokens en delete/update

**Costos nuevos**: Upstash Redis Free tier (10K requests/día)

---

### Hitos de Fase 2

**Métricas de éxito**:
- ✅ Test Coverage: 5% → 25%
- ✅ MTTR (Mean Time to Resolve): 2h → 30min
- ✅ Error visibility: 0% → 100%
- ✅ Security score: 6/10 → 8/10

**Inversión total Fase 2**: ~$2,250
**ROI**: Debugging 5x más rápido

---

## 💳 FASE 3: FREEMIUM MODEL (Semanas 5-10)

**Objetivo**: Implementar monetización completa (3 tiers + Stripe)

**Timeline**: Enero 6 - Febrero 14, 2026 (6 semanas)
**Inversión**: 120 horas (~$6,000)

### Sprint 1-2: Schema + Permissions (Sem 5-6)

**Timeline**: Enero 6-17, 2026

| Tarea | Entregable | Tiempo | Owner |
|-------|------------|--------|-------|
| **5.1 Database Migration** | Prisma migrate + SubscriptionTier | 2h | Backend |
| **5.2 Server Actions Update** | Validación de límites en createProperty | 4h | Backend |
| **5.3 Permission Middleware** | Helpers completos + edge cases | 4h | Backend |
| **5.4 Testing de Límites** | Unit + integration tests | 6h | QA |
| **5.5 Documentation** | API docs para límites | 2h | Docs |

**Entregables**:
- ✅ Enum `SubscriptionTier` en DB
- ✅ Campo `subscriptionTier` en User
- ✅ Helpers: `canCreateProperty()`, `canUploadImage()`
- ✅ Server Actions validan límites
- ✅ 20+ tests de permisos

**Status actual**: 🟡 50% completo (schema + helpers listos)

---

### Sprint 3-4: Stripe Integration (Sem 7-8)

**Timeline**: Enero 20-31, 2026

| Tarea | Entregable | Tiempo | Owner |
|-------|------------|--------|-------|
| **6.1 Stripe Account Setup** | Cuenta Stripe configurada (USD) | 1h | DevOps |
| **6.2 Products Creation** | BASIC ($4.99), PRO ($14.99) | 1h | DevOps |
| **6.3 Checkout Flow** | Embedded checkout component | 8h | Frontend |
| **6.4 Webhooks** | `checkout.session.completed`, `invoice.paid` | 6h | Backend |
| **6.5 Subscription Management** | Cancel/upgrade/downgrade | 6h | Backend |
| **6.6 Testing Stripe** | Test mode + manual QA | 4h | QA |

**Entregables**:
- ✅ Stripe configurado en modo test
- ✅ Productos creados en Stripe
- ✅ Checkout funcional
- ✅ Webhooks procesando
- ✅ Usuarios pueden subscribirse
- ✅ Stripe fields actualizados en User

**Riesgo**: Stripe approval puede tomar 1-3 días (Ecuador)

---

### Sprint 5-6: UI + Beta Testing (Sem 9-10)

**Timeline**: Febrero 3-14, 2026

| Tarea | Entregable | Tiempo | Owner |
|-------|------------|--------|-------|
| **7.1 Pricing Page** | `/pricing` con 3 tiers | 8h | Frontend |
| **7.2 Upgrade Modals** | Modal cuando alcanza límite | 4h | Frontend |
| **7.3 Dashboard Subscription** | Ver plan actual + upgrade CTA | 4h | Frontend |
| **7.4 Email Templates** | Confirmación suscripción | 2h | Frontend |
| **7.5 Beta Cerrada** | 50 usuarios invitados | 16h | Product |
| **7.6 Analytics Setup** | Tracking conversiones | 2h | Analytics |

**Entregables**:
- ✅ Página pricing pública
- ✅ Upgrade flow completo
- ✅ Beta con 50 usuarios reales
- ✅ Feedback documentado
- ✅ Conversión Free→Paid medida

**Métrica objetivo**: 5-10% conversión Free→BASIC

---

### Hitos de Fase 3

**Métricas de éxito**:
- ✅ Sistema de suscripciones funcional
- ✅ Stripe integration 100% completa
- ✅ 50 usuarios beta activos
- ✅ Primeros $50-100 MRR
- ✅ 0 errores críticos en payments

**Inversión total Fase 3**: ~$6,000
**ROI esperado**: Primeros ingresos recurrentes

---

## 🚀 FASE 4: SCALE & PRODUCTION (Semanas 11-18)

**Objetivo**: Preparar para escala y producción completa

**Timeline**: Febrero 17 - Abril 11, 2026 (8 semanas)
**Inversión**: 80-100 horas (~$4,000-5,000)

### Semana 11-12: E2E Testing + Transacciones

| Tarea | Tiempo | Prioridad |
|-------|--------|-----------|
| **8.1 Playwright Setup** | 4h | 🔴 |
| **8.2 E2E Tests Críticos** | 12h | 🔴 |
| **8.3 Transaction Wrappers** | 6h | 🟡 |
| **8.4 Cleanup Jobs** | 4h | 🟢 |

**E2E Tests a crear**:
- Login flow completo
- Property creation + images
- Appointment creation + emails
- Favorite toggle
- Upgrade subscription

**Entregables**:
- ✅ 10+ E2E tests
- ✅ Coverage >40%
- ✅ Transacciones con rollback
- ✅ Cleanup job archivos huérfanos

---

### Semana 13-14: Advanced Monitoring

| Tarea | Tiempo | Prioridad |
|-------|--------|-----------|
| **9.1 Performance Monitoring** | 6h | 🟡 |
| **9.2 Custom Dashboards** | 4h | 🟢 |
| **9.3 Alerting Rules** | 2h | 🟡 |
| **9.4 Audit Logging** | 4h | 🟢 |

**Entregables**:
- ✅ Vercel Analytics activado ($20/mes)
- ✅ Custom metrics dashboard
- ✅ Alertas para errores críticos
- ✅ Audit log de acciones sensibles

**Costos nuevos**: +$20/mes (Vercel Analytics)

---

### Semana 15-16: Beta Pública

| Tarea | Tiempo | Prioridad |
|-------|--------|-----------|
| **10.1 Beta Expansion** | 8h | 🔴 |
| **10.2 Onboarding Flow** | 6h | 🟡 |
| **10.3 Support System** | 4h | 🟢 |
| **10.4 Documentation** | 6h | 🟢 |

**Objetivo**: 200-500 usuarios activos

**Entregables**:
- ✅ Beta pública en Cuenca/Azuay
- ✅ Onboarding mejorado
- ✅ Sistema de soporte (email)
- ✅ Docs de usuario completas

---

### Semana 17-18: Optimización & Lanzamiento

| Tarea | Tiempo | Prioridad |
|-------|--------|-----------|
| **11.1 Performance Tuning** | 8h | 🟡 |
| **11.2 SEO Optimization** | 6h | 🟢 |
| **11.3 Marketing Site** | 8h | 🟢 |
| **11.4 Launch Prep** | 4h | 🔴 |

**Entregables**:
- ✅ Core Web Vitals optimizados
- ✅ SEO completo (meta tags, sitemap)
- ✅ Landing page marketing
- ✅ Launch checklist completado

---

### Hitos de Fase 4

**Métricas de éxito**:
- ✅ Test Coverage: 40% → 60%
- ✅ 200-500 MAU (Monthly Active Users)
- ✅ $200-500 MRR
- ✅ Deployment confidence: 9/10
- ✅ Uptime: 99.5%

**Inversión total Fase 4**: ~$4,500
**ROI**: Producto production-ready

---

## 📊 RESUMEN FINANCIERO

### Inversión Total por Fase

| Fase | Timeline | Horas | Inversión @ $50/h | Acumulado |
|------|----------|-------|-------------------|-----------|
| **Fase 1: Urgencias** | Semana 1 | 8-12h | $400-600 | $600 |
| **Fase 2: Foundations** | Semanas 2-4 | 40-50h | $2,000-2,500 | $3,100 |
| **Fase 3: Freemium** | Semanas 5-10 | 120h | $6,000 | $9,100 |
| **Fase 4: Scale** | Semanas 11-18 | 80-100h | $4,000-5,000 | $14,100 |
| **TOTAL** | 18 semanas | 248-282h | **$12,400-14,100** | - |

---

### Costos Operacionales Mensuales

**Antes de implementar**:
```
Debugging manual:         $1,000/mes
Customer support:           $250/mes
Downtime losses:            $200/mes
────────────────────────────────────
Total:                    $1,450/mes
```

**Después de implementar** (con herramientas):
```
Vercel Pro:                  $20/mes
Sentry Team:                 $26/mes (si >5K errors)
Upstash Redis:              $0-10/mes
Debugging reducido:         $100/mes
Support reducido:            $50/mes
────────────────────────────────────
Total:                      $206/mes
────────────────────────────────────
Ahorro neto:              $1,244/mes
```

**Payback Period**: 11.3 meses ($14,100 / $1,244/mes)

---

### Proyección de Ingresos (Freemium)

**Asumiendo**:
- 500 MAU en Mes 6
- Conversión Free→Paid: 7%
- Mix: 70% BASIC, 30% PRO

```
Mes 1 (Beta cerrada):       $25 MRR (5 × BASIC)
Mes 2 (Beta expandida):    $150 MRR (25 × BASIC, 5 × PRO)
Mes 3 (Beta pública):      $350 MRR (60 × BASIC, 10 × PRO)
Mes 4-6 (Growth):          $700 MRR (120 × BASIC, 20 × PRO)
```

**Break-even operacional**: Mes 3 ($350 > $206 costos)
**Break-even total**: Mes 14-15 (recuperar inversión inicial)

---

## 🎯 HITOS CLAVE

### Q4 2025 (Noviembre-Diciembre)

| Fecha | Hito | Status |
|-------|------|--------|
| **Nov 29** | Email funcional + Performance optimizada | ⏳ |
| **Dic 6** | Testing Coverage >25% | ⏳ |
| **Dic 13** | Logging + Monitoring implementado | ⏳ |
| **Dic 20** | Security + Rate Limiting activo | ⏳ |

**Objetivo**: Foundations sólidas

---

### Q1 2026 (Enero-Marzo)

| Fecha | Hito | Status |
|-------|------|--------|
| **Ene 17** | Schema + Permissions Freemium completo | ⏳ |
| **Ene 31** | Stripe integration funcional | ⏳ |
| **Feb 14** | Beta cerrada (50 usuarios) | ⏳ |
| **Feb 28** | E2E tests + Coverage >40% | ⏳ |
| **Mar 14** | Beta pública (200-500 usuarios) | ⏳ |

**Objetivo**: Freemium MVP en producción

---

### Q2 2026 (Abril en adelante)

| Fecha | Hito | Status |
|-------|------|--------|
| **Abr 11** | Optimización completa + Launch | ⏳ |
| **Abr 30** | 500 MAU, $700 MRR | ⏳ |

**Objetivo**: Producto escalando

---

## 🔄 DEPENDENCIAS CRÍTICAS

### Dependencias Externas

| Dependencia | Tiempo Estimado | Riesgo | Mitigación |
|-------------|-----------------|--------|------------|
| **Stripe Approval** | 1-3 días | 🟡 Medio | Aplicar early en Sprint 3 |
| **DNS Propagation** | 5-30 min | 🟢 Bajo | Programar con anticipación |
| **Prisma Binaries** | - | 🔴 Actual | Resolver en Fase 1 |
| **Beta User Acquisition** | 2-4 semanas | 🟡 Medio | Marketing anticipado |

---

### Dependencias Internas

```
Fase 1 (Urgencias)
  ↓ habilita
Fase 2 (Foundations) ← Tests requieren Prisma
  ↓ habilita
Fase 3 (Freemium) ← Schema requiere Prisma
  ↓ Sprint 1-2
  ↓ habilita
  ↓ Sprint 3-4 ← Stripe requiere schema
  ↓ habilita
  ↓ Sprint 5-6 ← UI requiere Stripe
  ↓ habilita
Fase 4 (Scale) ← Beta requiere Freemium completo
```

**Path crítico**: Fase 1 → Fase 2 → Fase 3 (secuencial)
**Paralelizable**: Dentro de cada fase, muchas tareas son paralelas

---

## 📈 MÉTRICAS DE SEGUIMIENTO

### KPIs Técnicos

| Métrica | Baseline | Meta Q4 2025 | Meta Q1 2026 | Meta Q2 2026 |
|---------|----------|--------------|--------------|--------------|
| **Test Coverage** | 5% | 25% | 40% | 60% |
| **MTTR (bugs)** | 2h | 30min | 15min | 10min |
| **Deployment Freq** | Manual | 2x/semana | Diario | Diario |
| **Error Rate** | Desconocido | <5% | <2% | <1% |
| **Uptime** | 95% (estimado) | 99% | 99.5% | 99.9% |

---

### KPIs de Producto

| Métrica | Meta Q4 2025 | Meta Q1 2026 | Meta Q2 2026 |
|---------|--------------|--------------|--------------|
| **MAU** | - | 200 | 500 |
| **Conversión Free→Paid** | - | 5% | 7% |
| **MRR** | - | $150 | $700 |
| **Churn Rate** | - | <10% | <5% |
| **NPS** | - | >30 | >50 |

---

### KPIs de Negocio

| Métrica | Meta Q1 2026 | Meta Q2 2026 |
|---------|--------------|--------------|
| **CAC (Cost Acquisition)** | <$20 | <$15 |
| **LTV (Lifetime Value)** | >$60 | >$100 |
| **LTV/CAC Ratio** | >3 | >5 |
| **Break-even Unit Economics** | Mes 3 | Mes 2 |

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Prisma binaries no descargan** | 🔴 Alta (actual) | 🔴 Crítico | Usar env var override, investigar firewall |
| **Stripe integration compleja** | 🟡 Media | 🟡 Alto | Comenzar con test mode, docs extensas |
| **Performance issues en escala** | 🟢 Baja | 🟡 Alto | React.cache() implementado en Fase 1 |
| **Tests flaky** | 🟡 Media | 🟢 Medio | Setup consistente, retry logic |

---

### Riesgos de Negocio

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Baja adopción beta** | 🟡 Media | 🔴 Crítico | Marketing anticipado, incentivos |
| **Conversión <5%** | 🟡 Media | 🟡 Alto | A/B testing, pricing ajustado |
| **Stripe approval lenta** | 🟡 Media | 🟡 Alto | Aplicar early, docs completos |
| **Competencia agresiva** | 🟢 Baja | 🟡 Alto | Diferenciación (AI search, UX) |

---

### Riesgos de Equipo

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Scope creep** | 🔴 Alta | 🟡 Alto | Roadmap estricto, sprints definidos |
| **Burnout** | 🟡 Media | 🔴 Crítico | Timeline realista (18 semanas) |
| **Knowledge silos** | 🟡 Media | 🟡 Alto | Documentación extensa |

---

## ✅ CHECKLIST DE LANZAMIENTO

### Pre-Launch (Antes de Beta Pública)

#### Técnico
- [ ] Email funcional y verificado
- [ ] Tests >40% coverage
- [ ] CI/CD bloqueando merges con tests fallidos
- [ ] Sentry capturando errores
- [ ] Rate limiting activo
- [ ] Security headers implementados
- [ ] Freemium 100% funcional
- [ ] Stripe webhooks probados

#### Producto
- [ ] Onboarding flow completo
- [ ] Pricing page pulida
- [ ] Upgrade flow sin fricción
- [ ] Email templates profesionales
- [ ] Support email configurado

#### Legal
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] GDPR compliance (si aplica)

#### Marketing
- [ ] Landing page optimizada
- [ ] SEO básico completo
- [ ] Google Analytics configurado
- [ ] Social media accounts
- [ ] Press kit preparado

---

### Post-Launch (Primeros 30 días)

#### Métricas a monitorear
- [ ] DAU/MAU ratio
- [ ] Conversion funnel
- [ ] Churn rate
- [ ] Error rate
- [ ] Page load times
- [ ] Stripe successful payments

#### Soporte
- [ ] Responder emails <24h
- [ ] Documentar FAQs
- [ ] Iterar basado en feedback
- [ ] Bugs críticos <4h

---

## 📚 RECURSOS ADICIONALES

### Documentación Relacionada

- **Técnica**:
  - `docs/technical-debt/00-DEEP-ANALYSIS.md` - Análisis completo
  - `docs/technical-debt/README.md` - Índice de deuda
  - `docs/technical-debt/07-TESTING.md` - Plan de testing

- **Negocio**:
  - `docs/business/DECISIONS_APPROVED.md` - Decisiones Freemium
  - `docs/business/ECUADOR_STRATEGY.md` - Estrategia de mercado
  - `docs/business/COST_SCALING_ANALYSIS.md` - Análisis de costos

- **Implementación**:
  - `docs/business/TECHNICAL_SPEC.md` - Especificación técnica
  - `docs/business/IMPLEMENTATION_STRATEGY.md` - Git workflow

---

### Herramientas y Servicios

| Servicio | Propósito | Costo | Cuándo |
|----------|-----------|-------|--------|
| **Sentry** | Error tracking | $0-26/mes | Fase 2 |
| **Upstash Redis** | Rate limiting | $0-10/mes | Fase 2 |
| **Vercel Analytics** | Performance | $20/mes | Fase 4 |
| **Stripe** | Payments | 2.9% + $0.30 | Fase 3 |
| **Resend** | Emails | $0-20/mes | Fase 1 |

---

## 🎬 PRÓXIMOS PASOS INMEDIATOS

### Semana del 25-29 Noviembre 2025

**Lunes 25**:
- [ ] 🔴 Email domain verification (45 min)
- [ ] 🔴 Fix Prisma generation issue (1-2h)

**Martes 26**:
- [ ] 🟡 Implement React.cache() (2h)
- [ ] 🟡 Map filters URL fix (2h)

**Miércoles 27**:
- [ ] 🟡 Run full test suite (1h)
- [ ] 🟢 Document quick wins (1h)

**Jueves 28**:
- [ ] 🟡 Plan Fase 2 sprints (2h)
- [ ] 🟢 Setup project board (1h)

**Viernes 29**:
- [ ] ✅ Review Fase 1 completion
- [ ] 📊 Report metrics
- [ ] 🎯 Kick-off Fase 2

---

**Roadmap creado**: Noviembre 23, 2025
**Próxima revisión**: Diciembre 6, 2025 (fin Fase 2 - Semana 2)
**Owner**: Product Team

---

**Notas**:
- Este roadmap es un plan vivo y se ajustará según feedback de beta users
- Prioridades pueden cambiar según necesidades del negocio
- Timeline asume 1 desarrollador full-time (ajustar si hay más recursos)
