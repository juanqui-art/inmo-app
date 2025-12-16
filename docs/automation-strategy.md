# InmoApp Automation Strategy 2026

> Documento de referencia para implementación de automatización con Activepieces.
> Creado: Diciembre 2025

---

## 1. Resumen Ejecutivo

### Herramienta Seleccionada: Activepieces
| Criterio | Activepieces | n8n |
|----------|-------------|-----|
| Costo Cloud | $0-10/mes | $24-60/mes |
| Tier Free | ✅ 1,000 ejecuciones | ❌ |
| Licencia | MIT (libre) | Fair-code |
| Supabase | ✅ Nativo | ✅ |

### Inversión Estimada
- Activepieces: $0-10/mes
- WhatsApp API: ~$30-50/mes
- OpenAI: ~$5-10/mes
- **Total: ~$50-70/mes**

---

## 2. Casos de Uso Prioritarios

### 🔥 Prioridad Alta (Q1 2026)

| # | Automatización | Trigger | Acción |
|---|----------------|---------|--------|
| 1 | **Captura Facebook Lead Ads** | Nuevo lead en ad | → CRM + WhatsApp |
| 2 | **Post automático en redes** | Propiedad `isFeatured=true` | → Facebook/Instagram |
| 3 | **Notificación cita nueva** | Nuevo `Appointment` | → WhatsApp al agente |
| 4 | **Recordatorio 24h** | Cron diario | → WhatsApp al cliente |

### ⭐ Prioridad Media (Q2 2026)

| # | Automatización | Descripción |
|---|----------------|-------------|
| 5 | Bienvenida AI | Mensaje personalizado con OpenAI |
| 6 | Dashboard ROI | Stats semanales por campaña |
| 7 | Email drip campaigns | Secuencia de nurturing |
| 8 | Follow-up inactivos | Leads sin actividad 7+ días |

### 🔷 Prioridad Baja (Q3-Q4 2026)

- Sync Facebook Custom Audiences
- Video generation con AI
- Chatbot precalificación
- Predictive analytics

---

## 3. Arquitectura de Integración

```
┌─────────────────────────────────────────────────────────┐
│                    INMOAPP (Next.js)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Server      │  │ Supabase    │  │ OpenAI          │  │
│  │ Actions     │  │ (PostgreSQL)│  │ (AI Copy)       │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │
                           ▼ DB Triggers / Webhooks
┌─────────────────────────────────────────────────────────┐
│                    ACTIVEPIECES                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Supabase    │  │ OpenAI      │  │ WhatsApp API    │  │
│  │ Piece       │  │ Piece       │  │ Piece           │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Facebook    │  │ Instagram   │  │ Email (SMTP)    │  │
│  │ Piece       │  │ Piece       │  │ Piece           │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Modelos de Datos Relevantes

### AgentClient (CRM Lite)
```prisma
model AgentClient {
  id         String     @id
  agentId    String
  clientId   String
  status     LeadStatus @default(NEW)
  source     String?    // "facebook_ad", "appointment", etc.
  propertyId String?
  
  // UTM Tracking
  utmSource   String?   // facebook, google
  utmMedium   String?   // cpc, organic
  utmCampaign String?   // campaign name
}
```

### Property (para post automation)
```prisma
model Property {
  isFeatured  Boolean  // Trigger para post automático
  images      PropertyImage[]
}
```

---

## 5. Propuesta de Valor por Tier

| Feature | FREE | PLUS | AGENT |
|---------|:----:|:----:|:-----:|
| Propiedades | 1 | 3 | 10 |
| Captura Lead Ads | ❌ | ❌ | ✅ |
| WhatsApp automático | ❌ | ❌ | ✅ |
| Post en redes | ❌ | ❌ | ✅ |
| CRM + ROI | ❌ | ❌ | ✅ |

### Mensaje para Tier AGENT
> "Automatiza tu negocio: leads de Facebook directo a WhatsApp, posts automáticos, y analytics de ROI."

---

## 6. Pricing Cards UX (Best Practices)

### Principios
1. **Máximo 6 features** visibles en card principal
2. **"Todo de X, más:"** para no repetir features
3. **Badge "NUEVO"** para automatización
4. **Link a comparativa** detallada en `/pricing`

### Estructura Recomendada
```
AGENT - $29.99/mes
"Automatiza tu negocio"

Todo de PLUS, más:
✓ 10 propiedades activas
✓ CRM Lite con leads

🆕 AUTOMATIZACIÓN
✓ Leads de Facebook → WhatsApp
✓ Posts automáticos en redes

[Comenzar]
↓ Ver todos los beneficios
```

---

## 7. Roadmap 2026

| Trimestre | Milestone |
|-----------|-----------|
| **Q1** | Activepieces setup + Facebook Ads + WhatsApp |
| **Q1** | Post automático en redes |
| **Q2** | Dashboard ROI por campaña |
| **Q2** | Email drip campaigns |
| **Q3** | Video generation AI |
| **Q3** | AI Agent precalificación |
| **Q4** | Predictive analytics |

---

## 8. Tendencias 2026 a Considerar

1. **Agentic AI** — Agentes autónomos que ejecutan tareas completas
2. **Video corto** — Reels/TikTok dominan marketing inmobiliario
3. **Hyper-automatización** — Procesos completos, no tareas aisladas
4. **Personalización extrema** — AI conoce al cliente mejor que el agente

---

## 9. Validación de Mercado

- **Real Estate SaaS 2025:** $6.27B (CAGR 42%)
- **PropTech LatAm 2025:** $2.87B (CAGR 13.6%)
- **75%** de firmas inmobiliarias usan algún SaaS
- **26.4%** aumento productividad con CRM
- **53%** más conversiones con automatización

---

## 10. Próximos Pasos Inmediatos

1. [ ] Crear cuenta Activepieces Cloud (free trial)
2. [ ] Conectar Supabase con Activepieces
3. [ ] Configurar primer flow: `Appointment` → WhatsApp
4. [ ] Obtener WhatsApp Business API
5. [ ] Actualizar `tiers.ts` con nuevos features
6. [ ] Actualizar cards en `/vender`

---

> **Documento vivo.** Actualizar conforme se implemente.
