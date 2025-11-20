# Decisiones Pendientes - Implementación Freemium

> **Última actualización**: Noviembre 20, 2025
> **Status**: ✅ RESUELTO - Ver `DECISIONS_APPROVED.md`
> **Decisiones críticas aprobadas**: 2025-11-20
>
> ⚠️ **Este documento es histórico** - Las decisiones finales están en `DECISIONS_APPROVED.md`

---

## 🚨 Decisiones Críticas (Bloqueantes)

Estas decisiones DEBEN tomarse antes de empezar a codificar.

### 1. Confirmar Modelo de Negocio

**Pregunta**: ¿Estamos de acuerdo en implementar el modelo Freemium (Fase 1)?

**Opciones**:
- [ ] ✅ **SÍ** - Proceder con Freemium (recomendado)
- [ ] ⏸️ **ESPERAR** - Necesito más tiempo para analizar
- [ ] ❌ **NO** - Prefiero otro modelo (especificar cuál)

**Si es NO**: ¿Cuál prefieres?
- [ ] Dual Model desde el inicio (SELLER vs AGENT)
- [ ] Commission-based (comisión al cerrar venta)
- [ ] Lead Generation (modelo Zillow)
- [ ] Otro: ___________________________

**Impacto si no se decide**: No se puede empezar schema de DB ni helpers.

---

### 2. Pricing de Planes

**Pregunta**: ¿Cuánto cobrar por cada tier?

**Propuesta inicial**:
```
FREE:     $0/mes      (1 publicación, 3 imágenes, sin destacados)
PREMIUM:  $9.99/mes   (5 publicaciones, 10 imágenes, 3 destacados/mes)
PRO:      $29.99/mes  (ilimitado, analytics, soporte prioritario)
```

**Decisión**:
- [ ] ✅ Aprobar pricing propuesto
- [ ] 🔧 Ajustar (llenar tabla abajo)

| Tier | Precio Propuesto | Tu Precio | Razón del Cambio |
|------|------------------|-----------|------------------|
| FREE | $0/mes | $ _____ | |
| PREMIUM | $9.99/mes | $ _____ | |
| PRO | $29.99/mes | $ _____ | |

**Consideraciones**:
- Mercado objetivo: ¿USA? ¿Latinoamérica? (afecta poder adquisitivo)
- Competencia: Idealista cobra €40-80/mes a profesionales
- Conversión: Pricing muy alto reduce conversión (<2%)

**Impacto si no se decide**: No se pueden crear productos en Stripe.

---

### 3. Límites de Plan FREE

**Pregunta**: ¿Cuánto dar gratis para atraer usuarios sin canibalizar ventas?

**Propuesta inicial**:
```
Publicaciones activas: 1
Imágenes por propiedad: 3
Duración publicación: 30 días
Destacados: $4.99 por 7 días (pago adicional)
Favoritos: 10 máximo
Analytics: Ninguno
```

**Decisión para cada límite**:

| Feature | Propuesto | Tu Decisión | Notas |
|---------|-----------|-------------|-------|
| Publicaciones activas | 1 | _____ | (1, 2, o 3) |
| Imágenes/propiedad | 3 | _____ | (3, 5, o 10) |
| Duración publicación | 30 días | _____ | (30, 60, o ilimitado) |
| Destacados | $4.99 c/u | _____ | (precio o "no permitir") |
| Favoritos | 10 | _____ | (10, 20, o ilimitado) |

**Consideraciones**:
- Muy generoso: Nadie paga (problema de Fase 1)
- Muy restrictivo: Nadie prueba (CAC alto)
- **Benchmark**: Idealista da 1 publicación gratis por 30 días

**Impacto si no se decide**: No se pueden crear helpers de validación.

---

## ⚙️ Decisiones Importantes (No Bloqueantes)

Estas pueden decidirse durante la implementación, pero es mejor definirlas ahora.

### 4. Plan Anual (Descuento)

**Pregunta**: ¿Ofrecer descuento si pagan anualmente?

**Propuesta**:
```
PREMIUM:
  - Mensual: $9.99/mes ($119.88/año)
  - Anual: $99/año (ahorra $20.88 = 17% off) ✅

PRO:
  - Mensual: $29.99/mes ($359.88/año)
  - Anual: $299/año (ahorra $60.88 = 17% off) ✅
```

**Decisión**:
- [ ] ✅ SÍ - Ofrecer descuento anual (recomendado)
- [ ] ❌ NO - Solo mensual
- [ ] 🤔 Decidir después (implementar mensual primero)

**Beneficios de plan anual**:
- ✅ Cash flow anticipado
- ✅ Reduce churn (comprometido por 1 año)
- ✅ LTV más alto

**Impacto si no se decide**: No bloquea implementación inicial.

---

### 5. Early Bird Pricing

**Pregunta**: ¿Ofrecer precio especial a primeros usuarios?

**Propuesta**:
```
Primeros 100 usuarios que upgraden:
  PREMIUM: $4.99/mes (de por vida)
  PRO: $19.99/mes (de por vida)
```

**Decisión**:
- [ ] ✅ SÍ - Early bird pricing (marketing inicial)
- [ ] ❌ NO - Precio estándar desde día 1
- [ ] 🔧 Ajustar (especificar):
  - Número de usuarios: _____
  - Descuento: _____% off
  - Duración: _____ (lifetime o X meses)

**Consideraciones**:
- Pro: Incentiva early adoption, genera buzz
- Contra: Reduce ingresos iniciales, complica pricing

**Impacto si no se decide**: No bloquea implementación.

---

### 6. Programa de Referidos

**Pregunta**: ¿Ofrecer incentivo por referir amigos?

**Propuesta**:
```
Invita un amigo → Ambos reciben:
  - 1 mes gratis de PREMIUM
  - O: $5 de crédito para destacar propiedades
```

**Decisión**:
- [ ] ✅ SÍ - Implementar programa de referidos
- [ ] ❌ NO - Solo para Fase 2
- [ ] 🤔 Decidir después

**Impacto si no se decide**: No bloquea Fase 1, puede agregarse después.

---

### 7. Período de Prueba (Trial)

**Pregunta**: ¿Ofrecer trial gratis de PREMIUM/PRO?

**Propuesta**:
```
FREE → PREMIUM: 14 días gratis (luego $9.99/mes)
FREE → PRO: 7 días gratis (luego $29.99/mes)
```

**Decisión**:
- [ ] ✅ SÍ - Con trial (aumenta conversión)
- [ ] ❌ NO - Pago desde día 1
- [ ] 🔧 Ajustar duración: _____ días

**Consideraciones**:
- Pro: Reduce fricción, permite probar features premium
- Contra: Requiere capturar tarjeta, más churn si olvidan cancelar

**Impacto si no se decide**: Puede implementarse después vía Stripe.

---

### 8. Grandfathering (Early Adopters)

**Pregunta**: ¿Qué hacer con usuarios existentes que tienen rol AGENT?

**Contexto**: Actualmente hay usuarios registrados como AGENT que pueden publicar ilimitado.

**Propuesta**:
```
Migración automática:
  AGENT actual → PREMIUM (1 año gratis)
  CLIENT actual → FREE

Beneficio: Los early adopters no pagan por 1 año
Después del año: Deben elegir plan
```

**Decisión**:
- [ ] ✅ SÍ - Grandfathering (1 año gratis)
- [ ] 🔧 Ajustar: _____ meses gratis
- [ ] ❌ NO - Migrar a FREE y que paguen si quieren

**Consideraciones**:
- Pro: Goodwill con early adopters, evita backlash
- Contra: Reduce ingresos Año 1

**Impacto si no se decide**: Bloquea migración de datos.

---

## 📋 Decisiones de UX/Features

### 9. Analytics - ¿Qué mostrar en cada tier?

**Pregunta**: ¿Qué métricas compartir con usuarios?

| Métrica | FREE | PREMIUM | PRO |
|---------|------|---------|-----|
| Vistas totales | ❌ | ✅ | ✅ |
| Vistas últimos 7 días | ❌ | ✅ | ✅ |
| Favoritos agregados | ❌ | ✅ | ✅ |
| Clics en teléfono/email | ❌ | ❌ | ✅ |
| Fuente de tráfico | ❌ | ❌ | ✅ |
| Comparativa con similares | ❌ | ❌ | ✅ |

**Decisión**:
- [ ] ✅ Aprobar tabla
- [ ] 🔧 Ajustar (marcar cambios arriba)

**Impacto si no se decide**: No bloquea Fase 1 (analytics es feature secundaria).

---

### 10. Destacados - ¿Cómo funcionan?

**Pregunta**: Cuando un usuario destaca una propiedad, ¿dónde aparece?

**Propuesta**:
```
Destacado = aparece en:
  1. Parte superior de resultados de búsqueda (badge "Destacado")
  2. Home page (sección "Propiedades Destacadas")
  3. Mapa (pin de color diferente)

Duración: 7 días
Rotación: Aleatorio entre destacados (no siempre el mismo primero)
```

**Decisión**:
- [ ] ✅ Aprobar propuesta
- [ ] 🔧 Ajustar (especificar):

**Impacto si no se decide**: No bloquea backend, afecta UX.

---

## 🌍 Decisiones de Mercado

### 11. Moneda y Región

**Pregunta**: ¿En qué moneda cobrar?

**Contexto**: Tu código tiene precios en USD pero la app parece estar en español.

**Decisión**:
- [ ] USD (Estados Unidos)
- [ ] EUR (Europa)
- [ ] MXN (México)
- [ ] COP (Colombia)
- [ ] ARS (Argentina)
- [ ] Otra: _____

**Pregunta relacionada**: ¿Ajustar precios según país?

**Ejemplo**:
```
USA:       $9.99/mes
México:    $149 MXN/mes (~$9 USD PPP-adjusted)
Colombia:  $39,000 COP/mes (~$10 USD)
```

**Decisión**:
- [ ] Mismo precio global (USD)
- [ ] PPP-adjusted por país (recomendado para LatAm)

**Impacto**: Afecta conversión en países con menor poder adquisitivo.

---

### 12. Idioma

**Pregunta**: ¿Solo español o también inglés?

**Decisión**:
- [ ] Solo español
- [ ] Solo inglés
- [ ] Ambos (i18n)

**Impacto si no se decide**: No bloquea Fase 1.

---

## ✅ Checklist de Aprobación

Antes de empezar implementación, marcar:

### Críticas (DEBEN estar aprobadas)
- [ ] 1. Modelo de negocio confirmado (Freemium)
- [ ] 2. Pricing de planes definido ($9.99, $29.99)
- [ ] 3. Límites de FREE definidos (1 pub, 3 imgs, 30 días)
- [ ] 8. Estrategia de migración de usuarios actuales

### Importantes (Recomendado decidir)
- [ ] 4. Plan anual (sí/no)
- [ ] 5. Early bird pricing (sí/no)
- [ ] 7. Trial period (sí/no)
- [ ] 11. Moneda y región

### Opcionales (Pueden decidirse después)
- [ ] 6. Programa de referidos
- [ ] 9. Analytics por tier
- [ ] 10. Mecánica de destacados
- [ ] 12. Idioma

---

## 📝 Formato de Aprobación

**Para aprobar**, copia esta plantilla y llénala:

```markdown
# Decisiones Aprobadas - [Fecha]

## Críticas
1. Modelo: Freemium Fase 1 ✅
2. Pricing: PREMIUM $9.99/mes, PRO $29.99/mes ✅
3. Límites FREE: 1 pub, 3 imgs, 30 días ✅
8. Migración: AGENT → PREMIUM (1 año gratis) ✅

## Importantes
4. Plan anual: SÍ, 17% descuento ✅
5. Early bird: NO ❌
7. Trial: NO ❌
11. Moneda: USD 💵

## Opcionales
6. Referidos: Fase 2 ⏳
9. Analytics: Aprobar tabla ✅
10. Destacados: Aprobar propuesta ✅
12. Idioma: Solo español 🇪🇸

---
Aprobado por: [Nombre]
Fecha: [YYYY-MM-DD]
```

---

## 📞 Contacto

Si tienes dudas sobre alguna decisión, revisar:
- `BUSINESS_STRATEGY.md` - Contexto completo
- `PERMISSIONS_FREEMIUM.md` - Detalles técnicos

---

**Última actualización**: Noviembre 20, 2025
**Deadline para decisiones**: Antes de Semana 1 de implementación
