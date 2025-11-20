# Documentación de Estrategia de Negocio

> **Última actualización**: Noviembre 20, 2025
> **Status**: 📋 En Planificación

---

## 📚 Documentos en esta Carpeta

### 1. [BUSINESS_STRATEGY.md](./BUSINESS_STRATEGY.md) - Documento Principal

**Propósito**: Definición completa de la estrategia de negocio de InmoApp.

**Contenido**:
- Análisis de mercado (Zillow, Idealista)
- 4 opciones de monetización evaluadas
- Modelo recomendado: Freemium híbrido
- Proyecciones financieras
- Roadmap de implementación por fases

**Audiencia**: Product Managers, Founders, Inversores

**Leer si**: Necesitas entender la estrategia completa y el "por qué" de las decisiones.

---

### 2. [PERMISSIONS_FREEMIUM.md](./PERMISSIONS_FREEMIUM.md) - Documentación Técnica

**Propósito**: Matriz de permisos para el modelo Freemium (Fase 1).

**Contenido**:
- Estructura de roles (FREE, PREMIUM, PRO, ADMIN)
- Matriz completa de permisos
- Helpers de validación (código)
- Flujos de usuario actualizados
- Checklist de implementación

**Audiencia**: Desarrolladores, Tech Leads

**Leer si**: Vas a implementar el sistema de permisos o necesitas referencia técnica.

---

## 🎯 Resumen Ejecutivo de 2 Minutos

### Problema Actual

❌ La app tiene roles `CLIENT` vs `AGENT` pero:
- No está claro quién puede publicar propiedades
- La página `/vender` causa confusión
- No hay modelo de monetización definido

### Solución Propuesta

✅ **Modelo Freemium en 3 fases**:

1. **Fase 1 (Meses 1-6)**: Freemium clásico
   - Todos pueden publicar (sin distinción)
   - FREE: 1 publicación gratis
   - PREMIUM: $9.99/mes (5 publicaciones)
   - PRO: $29.99/mes (ilimitado)

2. **Fase 2 (Meses 7-18)**: Dual Model
   - SELLER (particulares): $19.99 por publicación
   - AGENT (profesionales): $49-99/mes

3. **Fase 3 (Meses 19+)**: Lead Generation
   - Solo si se alcanza 50k+ usuarios/mes
   - Modelo Zillow (agentes pagan por leads)

### Decisión Clave

**Empezar con Fase 1** porque:
- ✅ Simple de implementar (código casi listo)
- ✅ Menor fricción para usuarios
- ✅ Validación rápida de mercado
- ✅ Puede evolucionar a Dual Model después

---

## 💰 Proyecciones Financieras

### Fase 1 - Año 1

| Métrica | Mes 3 | Mes 6 | Mes 12 |
|---------|-------|-------|--------|
| Usuarios | 500 | 5,000 | 10,000 |
| Conversión | 3% | 5% | 5% |
| MRR | $500 | $3,500 | $7,000 |
| ARR | - | - | **$84,000** |

### Fase 2 - Año 2

| Métrica | Valor |
|---------|-------|
| Sellers | 10,000 |
| Agents | 500 |
| MRR | $35,000 |
| ARR | **$420,000** |

---

## 🚀 Próximos Pasos

### Decisiones Pendientes (urgentes)

1. **Pricing final**: ¿$9.99 o ajustar?
2. **Límites FREE**: ¿1 o 2 publicaciones?
3. **Plan anual**: ¿Ofrecer descuento? (ej: $99/año)
4. **Early bird**: ¿Pricing especial primeros 100 usuarios?

### Implementación (12 semanas)

**Semanas 1-2**: Schema + Backend
- [ ] Actualizar Prisma schema
- [ ] Crear helpers de validación
- [ ] Migración de datos

**Semanas 3-4**: Stripe
- [ ] Configurar productos
- [ ] Checkout flow
- [ ] Webhooks

**Semanas 5-6**: UI
- [ ] Página `/pricing`
- [ ] Upgrade prompts
- [ ] Dashboard updates

**Semanas 7-8**: Testing
- [ ] Tests E2E
- [ ] Beta users
- [ ] Launch

---

## 📊 Comparación con Competencia

| Plataforma | Modelo | Ingresos 2024 | Estrategia |
|------------|--------|---------------|------------|
| **Zillow** | Lead Generation | $2.2B USD | Gratis para usuarios, agentes pagan por leads |
| **Idealista** | Freemium Premium | €300M EUR | Publicación limitada gratis, planes premium |
| **InmoApp** | Freemium → Dual | TBD | Fase 1: Freemium, Fase 2: Dual Model |

---

## 🔗 Documentos Relacionados

### Arquitectura y Permisos
- `docs/authorization/PERMISSIONS_MATRIX.md` - Permisos actuales (CLIENT/AGENT)
- `packages/database/prisma/schema.prisma` - Schema actual

### Features Relacionadas
- `apps/web/app/(public)/vender/page.tsx` - Landing de conversión
- `apps/web/components/auth/signup-form.tsx` - Formulario de registro

---

## 🤔 Preguntas Frecuentes

### ¿Por qué eliminar la distinción CLIENT vs AGENT?

**Razón**: Reduce fricción y confusión. Todos empiezan igual (FREE), y el sistema ajusta automáticamente según uso. Si alguien publica 1 propiedad → puede ser particular. Si publica 5+ → probablemente es profesional.

### ¿Qué pasa con usuarios actuales que son AGENT?

**Respuesta**: Grandfathering - se les migra a PREMIUM con 1 año gratis como agradecimiento por ser early adopters.

### ¿Cuándo implementar Fase 2 (Dual Model)?

**Respuesta**: Solo si Fase 1 es exitosa:
- ✅ >3% conversión FREE → PREMIUM
- ✅ <10% churn mensual
- ✅ >5,000 usuarios activos

### ¿Y si no alcanzamos las metas de Fase 1?

**Opciones**:
1. Ajustar pricing (probar $4.99/mes)
2. Cambiar límites (ofrecer 2 publicaciones gratis)
3. Pivotar a Dual Model antes (diferenciación más clara)

---

## 📈 Métricas a Trackear

### Conversión
- `free_to_premium_conversion_rate` (target: >3%)
- `time_to_upgrade` (cuántos días desde signup hasta pago)
- `upgrade_trigger` (¿por qué upgradean? límite, destacado, analytics)

### Retención
- `monthly_churn_rate` (target: <10%)
- `ltv` (lifetime value)
- `cac` (customer acquisition cost)
- `ltv_cac_ratio` (target: >3)

### Engagement
- `properties_per_user` (promedio)
- `images_per_property` (calidad de listados)
- `favorites_per_user` (engagement de buyers)
- `appointments_per_property` (conversión a leads)

---

## 🎓 Recursos de Aprendizaje

### Freemium Best Practices
- [Freemium Economics](https://www.lennysnewsletter.com/p/freemium-economics) - Lenny Rachitsky
- [The Freemium Model](https://www.sequoiacap.com/article/business-model-examples/) - Sequoia Capital

### SaaS Metrics
- [SaaS Metrics 2.0](https://www.forentrepreneurs.com/saas-metrics-2/) - David Skok
- [The Ultimate SaaS Metrics Guide](https://baremetrics.com/academy/saas-metrics) - Baremetrics

### Pricing Strategy
- [Don't Just Roll The Dice](https://neildavidson.com/downloads/dont-just-roll-the-dice-2.0.0-ebook.pdf) - Neil Davidson
- [Price Intelligently Blog](https://www.profitwell.com/recur/all/pricing-strategy) - ProfitWell

---

## 🔄 Historial de Cambios

| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2025-11-20 | Creación inicial | Definir estrategia de monetización |
| - | - | - |

---

**Mantenido por**: Equipo de Producto
**Revisión**: Mensual (durante Fase 1)
**Contacto**: Para preguntas, revisar `BUSINESS_STRATEGY.md` completo
