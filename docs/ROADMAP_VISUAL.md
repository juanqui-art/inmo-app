# 🗺️ InmoApp Roadmap - Vista Visual

> **Timeline**: Nov 2025 - Abr 2026 (18 semanas)
> **Inversión**: $12,400-14,100
> **ROI**: Payback en 11 meses

---

## 📅 Timeline Visual

```
NOV 2025        DIC 2025                    ENE 2026              FEB 2026         MAR 2026       ABR 2026
───────────────────────────────────────────────────────────────────────────────────────────────────────────
Week 1          Week 2    Week 3    Week 4    Week 5-6        Week 7-8      Week 9-10    Week 11-14   Week 15-18
│               │         │         │         │               │             │            │            │
│ URGENCIAS     │ TESTING │ LOGGING │SECURITY │ FREEMIUM      │  STRIPE     │ BETA       │ E2E        │ PRODUCTION
│               │         │         │         │ SCHEMA        │ INTEGRATION │ CERRADA    │ TESTS      │ READY
│               │         │         │         │               │             │            │            │
├─ Email Fix   ├─ Repos  ├─ Pino   ├─Headers ├─ Migration    ├─ Products   ├─ UI        ├─ Playwright│ Launch
├─ Perf +36%   ├─ Actions├─ Sentry ├─ DOMPur ├─ Permissions  ├─ Checkout   ├─ 50 users  ├─ Trans.   ├─ 500 MAU
├─ Map Fix     ├─ CI/CD  ├─ Errors ├─ Redis  ├─ Tests        ├─ Webhooks   ├─ Feedback  ├─ Monitor  ├─ $700 MRR
│               │         │         │         │               │             │            │            │
└─ $500        └─ $1000  └─ $750   └─ $750   └─ $2000        └─ $2000      └─ $2000     └─ $2000    └─ $3000
```

**Legend**:
- 🔴 **URGENCIAS** (Week 1): Quick wins críticos
- 🟡 **FOUNDATIONS** (Week 2-4): Testing + Logging + Security
- 💳 **FREEMIUM** (Week 5-10): Monetización completa
- 🚀 **SCALE** (Week 11-18): Production ready

---

## 🎯 Hitos por Mes

### 📌 Noviembre 2025

**Semana 1** (Nov 25-29)
```
✓ Email funcional              [45 min]  🔴 CRÍTICO
✓ Performance +36%             [2h]      🟡 ALTA
✓ Map filters fix              [2h]      🟢 MEDIA
✓ Prisma generation fix        [1h]      🔴 CRÍTICO
─────────────────────────────────────────────────
Total: 8-12 horas              $400-600
```

---

### 📌 Diciembre 2025

**Semana 2** (Dic 2-6): Testing
```
✅ Fix failing tests           [2h]      ✅ COMPLETADO
□ Repository tests             [8h]      Coverage: 5% → 15%
□ Server Action tests          [6h]
□ CI/CD enforcement            [4h]
─────────────────────────────────────────────────
Total: 18h (~2h completado)    ~$900
Target: 25% coverage
Status: Tests existentes 100%, nuevos tests pendientes
```

**Semana 3** (Dic 9-13): Logging
```
□ Pino structured logging      [3h]      MTTR: 2h → 1h
□ Sentry integration           [3h]
□ Error boundaries             [2h]
□ Action wrapper               [2h]
─────────────────────────────────────────────────
Total: 10h                     ~$500
Target: Error visibility 100%
```

**Semana 4** (Dic 16-20): Security
```
□ Security headers             [2h]      Security: 6/10 → 8/10
□ DOMPurify sanitization       [3h]
□ Rate limiting (Redis)        [4h]
□ CSRF protection              [1h]
─────────────────────────────────────────────────
Total: 10h                     ~$500
Target: Production-grade security
```

**Diciembre Total**: 38h | ~$1,900

---

### 📌 Enero 2026

**Semana 5-6** (Ene 6-17): Freemium Schema
```
□ DB Migration                 [2h]
□ Server Actions update        [4h]
□ Permission middleware        [4h]
□ Testing límites              [6h]
─────────────────────────────────────────────────
Total: 16h                     ~$800
Entregable: Freemium backend completo
```

**Semana 7-8** (Ene 20-31): Stripe
```
□ Stripe setup                 [2h]
□ Checkout flow                [8h]
□ Webhooks                     [6h]
□ Subscription mgmt            [6h]
─────────────────────────────────────────────────
Total: 22h                     ~$1,100
Entregable: Payments funcionales
```

**Enero Total**: 38h | ~$1,900

---

### 📌 Febrero 2026

**Semana 9-10** (Feb 3-14): Beta UI
```
□ Pricing page                 [8h]
□ Upgrade modals               [4h]
□ Dashboard subscription       [4h]
□ Beta cerrada (50 users)      [16h]
─────────────────────────────────────────────────
Total: 32h                     ~$1,600
Entregable: Primeros $25-50 MRR
```

**Semana 11-12** (Feb 17-28): E2E + Transactions
```
□ Playwright setup             [4h]
□ E2E tests críticos           [12h]
□ Transaction wrappers         [6h]
□ Cleanup jobs                 [4h]
─────────────────────────────────────────────────
Total: 26h                     ~$1,300
Target: Coverage >40%
```

**Febrero Total**: 58h | ~$2,900

---

### 📌 Marzo 2026

**Semana 13-14** (Mar 3-14): Monitoring
```
□ Performance monitoring       [6h]
□ Custom dashboards            [4h]
□ Alerting rules               [2h]
□ Audit logging                [4h]
─────────────────────────────────────────────────
Total: 16h                     ~$800
Costo nuevo: +$20/mes (Vercel Analytics)
```

**Semana 15-16** (Mar 17-28): Beta Pública
```
□ Beta expansion               [8h]      Target: 200-500 MAU
□ Onboarding flow              [6h]
□ Support system               [4h]
□ Documentation                [6h]
─────────────────────────────────────────────────
Total: 24h                     ~$1,200
Entregable: Beta pública activa
```

**Marzo Total**: 40h | ~$2,000

---

### 📌 Abril 2026

**Semana 17-18** (Abr 1-11): Launch
```
□ Performance tuning           [8h]
□ SEO optimization             [6h]
□ Marketing site               [8h]
□ Launch prep                  [4h]
─────────────────────────────────────────────────
Total: 26h                     ~$1,300
Entregable: PRODUCTION LAUNCH 🚀
```

**Target End of April**:
- 500 MAU
- $700 MRR
- 60% test coverage
- 99.5% uptime

---

## 💰 Resumen Financiero

### Por Fase

| Fase | Semanas | Inversión | ROI |
|------|---------|-----------|-----|
| **🔴 Urgencias** | 1 | $500 | Quick wins inmediatos |
| **🟡 Foundations** | 3 | $1,900 | Debugging 5x faster |
| **💳 Freemium** | 6 | $6,000 | Monetización activa |
| **🚀 Scale** | 8 | $4,500 | Production ready |
| **TOTAL** | **18** | **$12,900** | Payback: 11 meses |

---

### Proyección Ingresos vs Costos

```
        Nov    Dec    Jan    Feb    Mar    Apr
Costos  $500  $1,900 $1,900 $2,900 $2,000 $1,300
MRR     $0    $0     $25    $150   $350   $700
────────────────────────────────────────────────
Net    -$500 -$1,900 -$1,875 -$2,750 -$1,650 -$600

Break-even operacional: Mes 3 (Marzo)
Break-even total: Mes 14-15
```

---

## 📊 Evolución de Métricas

### Tests
```
Sem 1:   5%  ▓░░░░░░░░░
Sem 2:  15%  ▓▓▓░░░░░░░
Sem 4:  25%  ▓▓▓▓▓░░░░░  ← Target Fase 2
Sem 10: 40%  ▓▓▓▓▓▓▓▓░░  ← Target Fase 3
Sem 18: 60%  ▓▓▓▓▓▓▓▓▓▓  ← Target Fase 4
```

### MTTR (Mean Time to Resolve)
```
Sem 1:  2 horas  ▓▓▓▓▓▓▓▓▓▓
Sem 4:  30 min   ▓▓▓░░░░░░░  ← Logging activo
Sem 10: 15 min   ▓▓░░░░░░░░  ← Monitoring completo
Sem 18: 10 min   ▓░░░░░░░░░  ← Production ready
```

### MAU (Monthly Active Users)
```
Ene:    0
Feb:   50       ▓░░░░░░░░░  ← Beta cerrada
Mar:  200       ▓▓▓▓░░░░░░  ← Beta pública
Abr:  500       ▓▓▓▓▓▓▓▓▓▓  ← Launch
```

### MRR (Monthly Recurring Revenue)
```
Ene:   $0
Feb:  $25       ▓░░░░░░░░░  ← Primeros paying users
Mar: $350       ▓▓▓▓▓░░░░░  ← Beta expansion
Abr: $700       ▓▓▓▓▓▓▓▓▓▓  ← Launch target
```

---

## ⚡ Quick Reference

### 🔴 Crítico (Hacer Ahora)
- Email domain verification (45 min)
- Prisma generation fix (1h)
- Performance +36% (2h)

### 🟡 Próximo Mes
- Testing >25% coverage (18h)
- Logging + Sentry (10h)
- Security headers (10h)

### 💳 Q1 2026
- Freemium completo (60h)
- Stripe integration (22h)
- Beta cerrada (32h)

### 🚀 Q2 2026
- E2E tests (16h)
- Beta pública (24h)
- Launch (26h)

---

## 📞 Contactos y Recursos

### Servicios a Configurar

| Servicio | Cuándo | URL | Notas |
|----------|--------|-----|-------|
| **Resend** | Semana 1 | resend.com | Domain verification |
| **Sentry** | Semana 3 | sentry.io | Error tracking |
| **Upstash** | Semana 4 | upstash.com | Rate limiting |
| **Stripe** | Semana 7 | stripe.com | Ecuador account |
| **Vercel Analytics** | Semana 13 | vercel.com | Performance |

---

### Decisiones Críticas Tomadas

✅ **Modelo**: Freemium (FREE/BASIC/PRO)
✅ **Pricing**: $0, $4.99, $14.99/mes
✅ **Límites**: 1/3/10 propiedades
✅ **Mercado**: Ecuador (Cuenca/Azuay)
✅ **Expiración**: Ilimitada
✅ **No anual**: Solo mensual en MVP

Ver: `docs/business/DECISIONS_APPROVED.md`

---

### Documentación Clave

| Doc | Descripción | Cuándo Usar |
|-----|-------------|-------------|
| `ROADMAP.md` | Roadmap completo detallado | Planning sprints |
| `ROADMAP_VISUAL.md` | Este documento | Quick reference |
| `technical-debt/00-DEEP-ANALYSIS.md` | Análisis técnico completo | Deep dive |
| `business/TECHNICAL_SPEC.md` | Spec Freemium | Implementación |

---

**Última actualización**: Noviembre 23, 2025
**Próxima revisión**: Cada viernes (fin de sprint)
**Owner**: Product Team

---

## 🎯 Esta Semana (Dic 2-6)

### Lunes-Martes ✅
- [x] 🟢 Fix 17 failing tests → **COMPLETADO** (160/160 passing)

### Miércoles
- [ ] 🟡 Repository unit tests - FavoriteRepo (3h)

### Jueves
- [ ] 🟡 Repository unit tests - AppointmentRepo (3h)

### Viernes
- [ ] 🟡 CI/CD setup + review (4h)

**Meta semana**: Tests 100% + Coverage >25% + CI/CD
**Progreso**: 1/4 tareas completadas (25%)
