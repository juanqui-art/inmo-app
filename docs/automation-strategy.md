# InmoApp Automation Strategy 2026

> Documento de referencia para implementación de automatización con Activepieces.
> Creado: Diciembre 2025
> **Actualizado: 17 Diciembre 2025** - Investigación APIs Redes Sociales

> [!NOTE]
> **Documento completo disponible**: Para la guía de implementación detallada con todo el progreso,
> consulta [`docs/automation-complete-guide.md`](./automation-complete-guide.md)

---

## 1. Resumen Ejecutivo

### Herramienta Seleccionada: Activepieces
| Criterio | Activepieces | n8n |
|----------|-------------|-----|
| Costo Cloud | $0-10/mes | $24-60/mes |
| Tier Free | ✅ 1,000 ejecuciones | ❌ |
| Licencia | MIT (libre) | Fair-code |
| Supabase | ✅ Nativo | ✅ |

### Inversión Estimada (Actualizado 2025)
| Componente | Costo Original | Costo Actualizado |
|------------|----------------|-------------------|
| Activepieces | $10/mes | $10/mes |
| WhatsApp API | $50/mes | **$20/mes** |
| OpenAI | $10/mes | $10/mes |
| TikTok API | - | $0 (gratis) |
| **Total** | ~$70/mes | **~$40/mes** |

---

## 2. Casos de Uso Prioritarios

### 🔥 Prioridad Alta (Q1 2026)

| # | Automatización | Trigger | Acción |
|---|----------------|---------|--------|
| 1 | **Captura Facebook Lead Ads** | Nuevo lead en ad | → CRM + WhatsApp |
| 2 | **Post automático en redes** | Propiedad `isFeatured=true` | → Facebook Page |
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

- **TikTok Draft Upload** (nuevo)
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
│  │ Facebook    │  │ TikTok      │  │ Email (SMTP)    │  │
│  │ Graph API   │  │ Content API │  │ Piece           │  │
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
  videos      PropertyVideo[]  // Para TikTok
}
```

---

## 5. Social Media APIs - Especificaciones Técnicas (2025)

### 📘 Facebook Graph API

| Requisito | Descripción | Estado |
|-----------|-------------|--------|
| **App Type** | Business App | ⏳ Crear |
| **Page Token** | Acceso a Facebook Page | ⏳ Obtener |
| **Permisos** | `pages_manage_posts`, `pages_read_engagement` | ⏳ App Review |
| **API Version** | v24.0+ | ✅ Usar actual |

**Flujo de Publicación:**
```
POST /{page-id}/feed
  - message: "🏠 Nueva propiedad disponible..."
  - link: "https://vant.ec/propiedades/123?utm_source=facebook"
```

**Limitaciones:**
- ❌ Solo Facebook Pages (no perfiles personales)
- ❌ Groups API deprecada (abril 2024)
- ⚠️ Token expira cada 60 días (renovar automáticamente)

---

### 📗 WhatsApp Business Cloud API

**Cambios 2025:**
| Fecha | Cambio |
|-------|--------|
| Jul 1, 2025 | Pricing por mensaje (no conversación) |
| Oct 7, 2025 | Límites por portfolio |

**Costos Ecuador (estimado):**
| Tipo | Costo/msg | Ejemplo |
|------|-----------|---------|
| Utility | ~$0.01 | Notificación de cita |
| Marketing | ~$0.03 | Promo de propiedad |
| **Respuesta 24h** | **GRATIS** | Reply a cliente |

**Requisitos:**
- [ ] Facebook Business Manager verificado
- [ ] Número WhatsApp Business dedicado
- [ ] Templates pre-aprobados por Meta
- [ ] Opt-in del cliente (GDPR)

---

### 📕 TikTok Content Posting API (NUEVO 2025)

**Estado:** ✅ Ahora disponible para desarrolladores

**Modos:**
| Modo | Descripción | Uso recomendado |
|------|-------------|-----------------|
| Direct Post | Publica automáticamente | Apps aprobadas |
| **Draft Upload** | Sube borrador → usuario finaliza | ✅ Recomendado |

**Requisitos:**
- [ ] TikTok Developer Portal account
- [ ] Scope: `video.upload` o `video.publish`
- [ ] Videos: MP4/H.264, máx 500MB

**Flujo propuesto:**
```
Trigger: Property.isFeatured = true AND hasVideo
   ↓
Upload como Draft → Agent recibe notificación → Finaliza en app
```

---

## 6. Propuesta de Valor por Tier

| Feature | FREE | PLUS | AGENT |
|---------|:----:|:----:|:-----:|
| Propiedades | 1 | 3 | 10 |
| Captura Lead Ads | ❌ | ❌ | ✅ |
| WhatsApp automático | ❌ | ❌ | ✅ |
| Post en redes | ❌ | ❌ | ✅ |
| CRM + ROI | ❌ | ❌ | ✅ |
| **TikTok drafts** | ❌ | ❌ | ✅ |

### Mensaje para Tier AGENT
> "Automatiza tu negocio: leads de Facebook directo a WhatsApp, posts automáticos, y TikTok desde tu dashboard."

---

## 7. Roadmap 2026 (Actualizado)

| Trimestre | Milestone | Plataforma |
|-----------|-----------|------------|
| **Q1** | Activepieces setup + Supabase | - |
| **Q1** | Notificaciones WhatsApp (citas) | WhatsApp |
| **Q1** | Post automático propiedades | Facebook |
| **Q2** | Facebook Lead Ads → CRM | Facebook |
| **Q2** | Dashboard ROI por campaña | - |
| **Q3** | **TikTok Draft Upload** | TikTok |
| **Q3** | Video generation AI | - |
| **Q4** | AI Agent precalificación | - |

---

## 8. Tendencias 2026 a Considerar

1. **Agentic AI** — Agentes autónomos que ejecutan tareas completas
2. **Video corto** — TikTok + Reels dominan marketing inmobiliario
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
4. [ ] Crear Facebook Developer App
5. [ ] Obtener Page Access Token
6. [ ] Registrar en TikTok Developer Portal (para Q3)
7. [ ] Actualizar `tiers.ts` con nuevos features
8. [ ] Actualizar cards en `/vender`

---

> **Documento vivo.** Última actualización: 17 Diciembre 2025

