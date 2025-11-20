# Prompt para Investigación: Validación de Estrategia de Pricing

> **Fecha**: Noviembre 20, 2025
> **Propósito**: Validar pricing propuesto para modelo Freemium de InmoApp
> **Para usar con**: ChatGPT, Gemini, Claude (otro modelo)

---

## 📋 Copia este prompt completo:

```
Soy el fundador de InmoApp, una plataforma inmobiliaria que está por implementar un modelo de monetización Freemium. Necesito ayuda para validar nuestra estrategia de pricing.

---

## CONTEXTO DEL PROYECTO

### ¿Qué es InmoApp?

InmoApp es una plataforma de búsqueda y publicación de propiedades inmobiliarias (compra/renta). Piénsalo como Zillow o Idealista, pero en fase inicial.

**Público objetivo**:
- Compradores/arrendatarios que buscan propiedades
- Particulares que quieren vender/rentar su propiedad (1-2 veces en su vida)
- Agentes inmobiliarios y pequeñas inmobiliarias (publican decenas de propiedades)

**Región**: Principalmente mercado hispano (España, México, Colombia, Argentina, USA hispano)

### Estado Actual

- **Fase**: MVP funcional, sin modelo de monetización implementado
- **Usuarios**: ~50-100 early adopters (beta)
- **Features actuales**:
  - Búsqueda de propiedades con filtros
  - Mapa interactivo con clustering
  - AI Search (búsqueda en lenguaje natural)
  - Sistema de favoritos
  - Agendamiento de citas
  - Autenticación (Supabase)

---

## STACK TECNOLÓGICO

**Frontend**:
- Next.js 16 (App Router, Server Components, Server Actions)
- React 19
- TypeScript
- Tailwind CSS v4
- GSAP (animaciones)

**Backend**:
- Supabase Auth + Storage
- Prisma ORM
- PostgreSQL (Supabase Database)
- Next.js Server Actions (no API REST separada)

**Infrastructure**:
- Turborepo (monorepo)
- Bun (runtime + package manager)
- Vercel (deployment)

**Pagos** (por implementar):
- Stripe (suscripciones y checkout)

---

## MODELO FREEMIUM PROPUESTO

### Fase 1: Freemium Clásico (Primeros 6-12 meses)

Eliminamos la distinción "cliente vs agente" y simplificamos a 3 tiers por nivel de uso:

#### FREE (Gratis)
- 1 publicación activa
- 3 imágenes por propiedad
- Publicación válida por 30 días
- Sin destacados en búsquedas
- Sin analytics
- Funciones básicas: buscar, favoritos, agendar citas

#### PREMIUM ($9.99/mes)
- 5 publicaciones activas
- 10 imágenes por propiedad
- Publicación válida por 60 días
- 3 destacados incluidos/mes
- Analytics básicos (vistas, favoritos)
- Soporte por email

#### PRO ($29.99/mes)
- Publicaciones ilimitadas
- 20 imágenes por propiedad
- Publicación sin límite de tiempo
- Destacados ilimitados
- Analytics avanzados (fuentes de tráfico, comparativas)
- Verificación de perfil (badge)
- Soporte prioritario (chat)

#### Add-ons
- Destacar propiedad por 7 días: $4.99 (usuarios FREE)
- Publicación adicional (30 días): $14.99 (usuarios FREE)

### Plan Anual (Opcional)
- PREMIUM: $99/año (ahorra $20 = 17% off)
- PRO: $299/año (ahorra $60 = 17% off)

---

## ANÁLISIS PRELIMINAR DE COMPETENCIA

### Zillow (USA)
- Modelo: Lead generation (gratis para usuarios, agentes pagan por leads)
- Ingresos 2024: $2.2 billones USD
- Premier Agent Program: $99/mes base + $10-50 por lead

### Idealista (España)
- Modelo: Freemium + planes profesionales
- Ingresos 2024: €300M EUR (+16% YoY)
- Pricing profesionales: €40-80/mes (estimado)

### Mercado LatAm
- Menor poder adquisitivo que USA/Europa
- Competencia: OLX, Properati, Mercado Libre (gratis o muy baratos)

---

## PREGUNTAS ESPECÍFICAS PARA TI

### 1. Validación de Pricing

¿El pricing propuesto ($9.99 PREMIUM, $29.99 PRO) es razonable comparado con:
- Competidores internacionales (Zillow, Idealista, Rightmove)
- Competidores regionales (por país: México, Colombia, Argentina, España)
- Poder adquisitivo de cada mercado

**Recomendación**: ¿Deberíamos ajustar precios por región (PPP-adjusted pricing)?

### 2. Límites del Plan FREE

¿Los límites propuestos son competitivos?
- 1 publicación vs competencia que da 2-3
- 3 imágenes vs competencia que permite 5-10
- 30 días vs competencia que da 60-90

**Análisis**: ¿Qué ofrecen plataformas similares en su plan gratuito?

### 3. Estrategia de Conversión

Según benchmarks de industria:
- ¿Qué tasa de conversión FREE → PREMIUM podemos esperar? (target: 3-5%)
- ¿Qué factores aumentan conversión en plataformas freemium?
- ¿Trial gratis aumenta o disminuye conversión? (14 días gratis vs pago inmediato)

### 4. Pricing Psicológico

- ¿$9.99 vs $10 hace diferencia en conversión?
- ¿$29.99 vs $25 o $30? (¿cuál convierte mejor?)
- ¿Mostrar "ahorro" en plan anual aumenta adopción?

### 5. Comparación con SaaS B2C

InmoApp es hybrid:
- B2C: Particulares que venden su casa (1 vez, bajo engagement)
- B2B: Agentes que publican decenas de propiedades (recurrente, alto engagement)

**Pregunta**: ¿Deberíamos desde el inicio diferenciar pricing para B2C vs B2B? O mejor empezar simple (freemium unificado) y evolucionar después?

### 6. Estrategia de Lanzamiento

¿Qué pricing de lanzamiento recomendarías?
- Early bird: $4.99/mes primeros 100 usuarios (lifetime)
- Trial: 14 días gratis de PREMIUM
- Freemium desde día 1 sin promociones

**Objetivo**: Maximizar early adoption vs maximizar ingresos iniciales

### 7. Add-ons

¿Es razonable cobrar $4.99 por destacar una propiedad por 7 días?
- Comparar con Google Ads CPC para "bienes raíces" ($2-5 por clic)
- Comparar con Facebook Ads para reach local
- Comparar con competencia (si tienen destacados pagos)

### 8. Churn y Retención

Según tu experiencia con modelos freemium inmobiliarios:
- ¿Qué churn mensual es aceptable? (target: <10%)
- ¿Cómo reducir churn en usuarios que publican 1 propiedad y ya no necesitan el servicio?
- ¿Contratos anuales reducen churn significativamente?

### 9. Pricing por Mercado

Si tuvieras que ajustar precios para estos mercados, ¿qué cobrarías?

| Mercado | PREMIUM | PRO | Moneda |
|---------|---------|-----|--------|
| USA | $9.99 | $29.99 | USD |
| España | ? | ? | EUR |
| México | ? | ? | MXN |
| Colombia | ? | ? | COP |
| Argentina | ? | ? | ARS |

**Consideración**: Poder adquisitivo + competencia local + costos de Stripe por región

### 10. Métricas de Éxito

¿Qué métricas deberíamos trackear para saber si el pricing es correcto?
- CAC (Customer Acquisition Cost) aceptable: <$20?
- LTV (Lifetime Value) target: >$100?
- LTV/CAC ratio: >3?
- Payback period: <12 meses?

---

## DATOS ADICIONALES

### Costos de Infraestructura (estimados)

- Supabase: $25/mes (plan Pro)
- Vercel: $20/mes (plan Pro)
- Stripe: 2.9% + $0.30 por transacción
- OpenAI API (AI search): $50-100/mes
- **Total fijo**: ~$100-150/mes
- **Total variable**: ~3% de ingresos

### Proyección de Usuarios (conservadora)

- Mes 3: 500 usuarios
- Mes 6: 5,000 usuarios
- Mes 12: 10,000 usuarios
- Conversión esperada: 3-5% (FREE → PREMIUM/PRO)

---

## ENTREGABLES ESPERADOS

Por favor, proporciona:

1. **Análisis de pricing competitivo**: Tabla comparativa con 5-10 plataformas similares
2. **Recomendación de pricing por región**: Ajustado por PPP si aplica
3. **Validación de límites FREE**: ¿Son muy restrictivos o muy generosos?
4. **Estrategia de lanzamiento**: ¿Trial, early bird, o freemium directo?
5. **Benchmarks de industria**: Conversión, churn, LTV/CAC para plataformas similares
6. **Red flags**: ¿Qué errores comunes evitar en pricing de plataformas inmobiliarias?

---

## FORMATO PREFERIDO

- Respuestas con datos concretos (números, porcentajes, fuentes)
- Ejemplos de competidores específicos
- Citas de estudios de pricing si existen
- Recomendaciones accionables (no solo teoría)

---

¡Gracias por tu ayuda! Estamos a punto de implementar esto en las próximas 12 semanas.
```

---

## 📝 NOTAS DE USO

### Dónde usar este prompt:
- ✅ ChatGPT (GPT-4 o GPT-4 Turbo)
- ✅ Gemini Advanced (Google)
- ✅ Claude (Anthropic) - otro proyecto
- ✅ Perplexity (con búsqueda web activa - recomendado)

### Tips para mejores resultados:

1. **Usa Perplexity si puedes**: Tiene acceso a datos actuales de 2024-2025
2. **Pide fuentes**: Agrega "incluye links a fuentes" al final
3. **Itera**: Después de la primera respuesta, haz follow-ups específicos
4. **Compara**: Usa el mismo prompt en 2-3 modelos y compara respuestas

### Follow-up prompts sugeridos:

```
Follow-up 1: "Profundiza en pricing para México específicamente"
Follow-up 2: "Dame 5 ejemplos de pricing pages exitosas de plataformas similares"
Follow-up 3: "¿Cómo implementar A/B testing de pricing con Stripe?"
```

---

**Creado**: Noviembre 20, 2025
**Para investigación**: Validación de pricing Freemium InmoApp
