# InmoApp - Automatización Completa

> **Documento maestro para implementación de automatización**
> Creado: 17 Diciembre 2025
> Estado: En progreso (multi-sesión)

---

## 📋 Tabla de Contenidos

1. [Tendencias 2026](#tendencias-2026-investigación)
2. [Resumen del Proyecto](#1-resumen-del-proyecto)
3. [Estado Actual](#2-estado-actual)
4. [Arquitectura General](#3-arquitectura-general)
5. [Fase 1: Setup Activepieces](#fase-1-setup-activepieces-completada)
6. [Fase 2: Social Media por Agente](#fase-2-social-media-por-agente-pendiente)
7. [Fase 3: WhatsApp Business](#fase-3-whatsapp-business-pendiente)
8. [Checklist de Implementación](#7-checklist-de-implementación)
9. [Referencias Técnicas](#8-referencias-técnicas)

---

## 🔮 Tendencias 2026 (Investigación)

> Última investigación: 17 Diciembre 2025

### PropTech y Real Estate

| Tendencia | Descripción | Oportunidad para InmoApp |
|-----------|-------------|--------------------------|
| **Agentic AI** | IA que ejecuta tareas autónomamente (no solo sugiere) | Flows que actúan sin intervención humana |
| **IA como ROI medible** | De "nice to have" a "business critical" | Analytics de conversión por automatización |
| **Valuación AI en tiempo real** | Reemplaza valuaciones trimestrales | Feature premium: estimados de precio |
| **Inversión >€10B en PropTech AI** | 68% inversores usan plataformas AI | Diferenciador competitivo clave |
| **Adopción AI +40%** | Crecimiento masivo en sector | El mercado está listo |

### Marketing Automation

| Tendencia | Descripción | Oportunidad para InmoApp |
|-----------|-------------|--------------------------|
| **Chatbots 24/7 inteligentes** | Califican leads por intención, presupuesto, timeline | CRM Lite mejorado con bot |
| **Hyper-personalización** | Mensajes 1:1 basados en comportamiento | Emails/WhatsApp personalizados |
| **Generative AI para contenido** | Copy, imágenes, videos automáticos | Post en redes con IA |
| **Human + AI collaboration** | IA augmenta, no reemplaza agentes | Agente supervisa, IA ejecuta |

### Social Media 2026

| Tendencia | Descripción | Oportunidad para InmoApp |
|-----------|-------------|--------------------------|
| **Video corto = #1 ROI** | TikTok, Reels, Shorts dominan | Priorizar TikTok drafts |
| **AI genera posts completos** | Texto, hashtags, incluso videos | OpenAI + DALL-E integration |
| **Autenticidad crítica** | Usuarios rechazan contenido 100% AI | AI genera, humano aprueba |
| **Social Search** | Redes = motores de búsqueda | Optimizar para discovery |
| **Shoppable video** | Compra desde el video | Link directo a propiedad |

### Tecnologías Específicas Emergentes

| Tecnología | Estado 2026 | Aplicación |
|------------|-------------|------------|
| **Agentic AI** | Mainstream | Flows autónomos completos |
| **AI-UGC Hybrid** | Emergente | IA optimiza contenido del agente |
| **Predictive Analytics** | Maduro | Predecir demanda por zona |
| **Virtual Tours AI** | Común | Tours 360° desde fotos |
| **Voice AI** | Creciendo | Bots de voz para consultas |

---

### 🎯 Implicaciones para InmoApp

#### Prioridades Estratégicas 2026

1. **Agentic AI como diferenciador**
   - Flows que actúan SIN intervención humana
   - "Publica tu propiedad y nosotros hacemos el resto"

2. **Video corto es obligatorio**
   - TikTok drafts como feature premium
   - Generación de videos desde fotos de propiedad

3. **Hyper-personalización**
   - Mensajes diferentes por tipo de lead
   - WhatsApp bots con contexto

4. **Equilibrio AI + Humano**
   - AI genera borrador → Agente aprueba
   - Nunca publicar sin revisión humana

#### Features Diferenciadores Sugeridos

| Feature | Tier | Descripción |
|---------|------|-------------|
| AI Auto-Post | AGENT | IA genera y publica (con aprobación) |
| Video Generator | AGENT | Crear video tour desde fotos |
| Smart Lead Scoring | PRO | IA califica leads automáticamente |
| Predictive Pricing | PRO | Estimados de precio por zona |
| 24/7 WhatsApp Bot | PRO | Bot responde consultas básicas |

---

## 1. Resumen del Proyecto

### Objetivo
Implementar automatización para agentes inmobiliarios que incluye:
- **Notificaciones automáticas** de citas (email/WhatsApp)
- **Publicación en redes sociales** desde el dashboard
- **Generación de contenido con IA** para posts
- **Analytics y ROI** por campaña

### Propuesta de Valor por Tier

| Feature | FREE | PLUS | AGENT | PRO |
|---------|:----:|:----:|:-----:|:---:|
| Notificaciones email citas | ❌ | ❌ | ✅ | ✅ |
| WhatsApp automático | ❌ | ❌ | ✅ | ✅ |
| Post en redes sociales | ❌ | ❌ | ✅ | ✅ |
| TikTok drafts | ❌ | ❌ | ✅ | ✅ |
| Facebook Lead Ads → CRM | ❌ | ❌ | ❌ | ✅ |
| Dashboard ROI | ❌ | ❌ | ❌ | ✅ |

---

## 2. Estado Actual

### ✅ Completado

| Item | Fecha | Notas |
|------|-------|-------|
| UI Tiers actualizada | 17 Dic 2025 | Features de automatización en `tiers.ts` |
| Categoría Automatización en `/pricing` | 17 Dic 2025 | Tabla comparativa actualizada |
| Cuenta Activepieces | 17 Dic 2025 | Cloud gratuito |
| Conexión Supabase → Activepieces | 17 Dic 2025 | Service Role Key configurado |
| Webhook `appointments` → INSERT | 17 Dic 2025 | Funcionando |
| Flow: Nueva cita → Email | 17 Dic 2025 | Gmail conectado, probado |

### ⏳ En Progreso

| Item | Estado | Siguiente acción |
|------|--------|------------------|
| Documentación completa | 🟡 | Este documento |
| Social Media por agente | 🔴 | Crear tabla `agent_social_connections` |

### 🔜 Pendiente

- Implementar OAuth para Facebook/Instagram
- UI Dashboard: Configuración de redes sociales
- Integración WhatsApp Business API
- Generación de contenido con OpenAI
- TikTok Draft Upload

---

## 3. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INMOAPP (Next.js)                               │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ Dashboard Agente │  │ API Routes       │  │ Server Actions           │  │
│  │ /dashboard/*     │  │ /api/oauth/*     │  │ Publicar propiedad       │  │
│  └────────▲─────────┘  └────────▲─────────┘  └──────────▲───────────────┘  │
│           │                     │                       │                   │
└───────────┼─────────────────────┼───────────────────────┼───────────────────┘
            │                     │                       │
            ▼                     ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE (PostgreSQL)                           │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ users            │  │ agent_social_    │  │ properties               │  │
│  │ appointments     │  │ connections      │  │ property_images          │  │
│  │ agent_clients    │  │ (tokens OAuth)   │  │ property_videos          │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
│                                                                              │
│  Webhooks configurados:                                                      │
│  - appointments INSERT → Activepieces (notificación email)                  │
│  - properties UPDATE (isFeatured) → Activepieces (post en redes)            │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ACTIVEPIECES                                    │
│                                                                              │
│  Flows configurados:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Flow 1: Nueva Cita → Email                                              ││
│  │ Trigger: Webhook (appointments INSERT)                                   ││
│  │ Action: Gmail → Enviar notificación                                      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Flow 2: Propiedad Destacada → Post (PENDIENTE)                          ││
│  │ Trigger: Webhook (properties UPDATE isFeatured=true)                     ││
│  │ Actions: OpenAI (generar copy) → Facebook/Instagram (publicar)          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVICIOS EXTERNOS                                   │
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐│
│  │ Gmail API  │  │ Meta Graph │  │ TikTok API │  │ OpenAI API             ││
│  │ (emails)   │  │ (FB + IG)  │  │ (drafts)   │  │ (content generation)   ││
│  └────────────┘  └────────────┘  └────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Setup Activepieces (✅ COMPLETADA)

### 1.1 Cuenta Activepieces
- **URL**: cloud.activepieces.com
- **Plan**: Standard (gratuito, 10 flows, runs ilimitados)
- **Estado**: ✅ Configurado

### 1.2 Conexión Supabase
- **Tipo**: Connection con Service Role Key
- **Credenciales usadas**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Estado**: ✅ Funcionando

### 1.3 Webhook en Supabase
```
Nombre: Activepieces New Row
Tabla: appointments
Evento: INSERT
URL: https://cloud.activepieces.com/api/v1/webhooks/[TU_WEBHOOK_ID]
```
- **Estado**: ✅ Funcionando

### 1.4 Flow: Nueva Cita → Email
```
Trigger: Webhook (recibe datos de appointment)
    ↓
Action: Gmail → Send Email
    To: email configurado
    Subject: "Nueva cita agendada - InmoApp"
    Body: Incluye scheduled_at, notes del appointment
```
- **Estado**: ✅ Probado y funcionando

### Cómo probar
```sql
-- Ejecutar en Supabase SQL Editor
INSERT INTO appointments (
  id, user_id, property_id, agent_id, 
  scheduled_at, status, notes, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM users LIMIT 1),
  (SELECT id FROM properties LIMIT 1),
  (SELECT id FROM users WHERE role = 'AGENT' LIMIT 1),
  NOW() + INTERVAL '7 days',
  'PENDING',
  'Test de automatización',
  NOW(),
  NOW();
```

---

## Fase 2: Social Media por Agente (⏳ PENDIENTE)

### 2.1 Objetivo
Cada agente tier AGENT/PRO puede conectar SUS propias redes sociales y publicar propiedades directamente.

### 2.2 Modelo de Datos

```sql
-- Nueva tabla para tokens OAuth de agentes
CREATE TABLE agent_social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'facebook', 'instagram', 'tiktok', 'twitter'
  
  -- Tokens (ENCRIPTADOS en producción)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata de la conexión
  platform_user_id VARCHAR(255),  -- ID del usuario en la plataforma
  platform_username VARCHAR(255), -- Username visible
  page_id VARCHAR(255),           -- Para Facebook/Instagram Pages
  page_name VARCHAR(255),
  
  -- Permisos otorgados
  scopes TEXT[],
  
  -- Auditoría
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(agent_id, platform)
);

-- Índices
CREATE INDEX idx_agent_social_agent ON agent_social_connections(agent_id);
CREATE INDEX idx_agent_social_platform ON agent_social_connections(platform);

-- RLS para que cada agente solo vea sus propias conexiones
ALTER TABLE agent_social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own connections"
  ON agent_social_connections FOR SELECT
  USING (agent_id = auth.uid());

CREATE POLICY "Agents can insert own connections"
  ON agent_social_connections FOR INSERT
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can update own connections"
  ON agent_social_connections FOR UPDATE
  USING (agent_id = auth.uid());

CREATE POLICY "Agents can delete own connections"
  ON agent_social_connections FOR DELETE
  USING (agent_id = auth.uid());
```

### 2.3 OAuth Flow (Facebook/Instagram)

```
┌─────────────────────────────────────────────────────────────────┐
│ PASO 1: Agente click "Conectar Facebook"                        │
│         Dashboard → /dashboard/configuracion/redes-sociales    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PASO 2: Redirect a Meta OAuth                                   │
│ URL: https://www.facebook.com/v18.0/dialog/oauth               │
│ Params:                                                         │
│   - client_id: TU_APP_ID                                       │
│   - redirect_uri: https://tuapp.com/api/oauth/facebook/callback│
│   - scope: pages_manage_posts,instagram_basic,                 │
│            instagram_content_publish                           │
│   - state: agent_id encriptado                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PASO 3: Usuario autoriza en Facebook                            │
│         (selecciona página, acepta permisos)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PASO 4: Callback a tu API                                       │
│ /api/oauth/facebook/callback?code=xxx&state=xxx                │
│                                                                 │
│ Tu backend:                                                     │
│ 1. Valida state (agentId)                                      │
│ 2. Exchange code → access_token                                │
│ 3. Obtiene long-lived token (60 días)                          │
│ 4. Obtiene page_access_token                                   │
│ 5. Guarda en agent_social_connections                          │
│ 6. Redirect a dashboard con success                            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 API Endpoints Necesarios

```typescript
// apps/web/app/api/oauth/facebook/route.ts
// Inicia el OAuth flow

// apps/web/app/api/oauth/facebook/callback/route.ts
// Recibe callback, guarda tokens

// apps/web/app/api/oauth/facebook/disconnect/route.ts
// Elimina conexión

// apps/web/app/api/social/publish/route.ts
// Publica en redes usando token del agente
```

### 2.5 UI Dashboard

```
/dashboard/configuracion/redes-sociales

┌─────────────────────────────────────────────────────────────────┐
│ Conecta tus Redes Sociales                                      │
│                                                                 │
│ Publica tus propiedades directamente en tus redes personales.  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 📘 Facebook                                                  ││
│ │ Conectado: Mi Página de Bienes Raíces                       ││
│ │ [Desconectar]                                               ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 📸 Instagram                                                 ││
│ │ No conectado                                                 ││
│ │ [Conectar Instagram]                                         ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 🎵 TikTok                                                    ││
│ │ No conectado                                                 ││
│ │ [Conectar TikTok] (Próximamente)                            ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 2.6 Permisos Meta API Requeridos

| Permiso | Uso |
|---------|-----|
| `pages_show_list` | Listar páginas del usuario |
| `pages_read_engagement` | Leer métricas |
| `pages_manage_posts` | Publicar en Facebook Page |
| `instagram_basic` | Acceso básico a Instagram Business |
| `instagram_content_publish` | Publicar en Instagram |

### 2.7 Crear Facebook Developer App

1. Ir a **developers.facebook.com**
2. **My Apps** → **Create App**
3. Tipo: **Business**
4. Agregar productos:
   - Facebook Login for Business
   - Instagram Graph API
5. Configurar OAuth:
   - Valid OAuth Redirect URIs: `https://tudominio.com/api/oauth/facebook/callback`
6. Pasar **App Review** para permisos avanzados

---

## Fase 3: WhatsApp Business (⏳ PENDIENTE)

### 3.1 Opciones

| Opción | Costo | Complejidad |
|--------|-------|-------------|
| Meta WhatsApp Cloud API | ~$20/mes | Media |
| Twilio | ~$20/mes | Baja |
| 360dialog | ~$20/mes | Baja |

### 3.2 Flujo

```
Nueva cita → Activepieces → WhatsApp API → Mensaje al agente
```

### 3.3 Templates de Mensaje

Los templates deben ser pre-aprobados por Meta:

```
appointment_notification:
"Hola {{1}}, tienes una nueva cita programada para el {{2}} a las {{3}}. 
Propiedad: {{4}}
Cliente: {{5}}"

reminder_24h:
"Recordatorio: Mañana {{1}} a las {{2}} tienes una visita programada."
```

---

## 7. Checklist de Implementación

### Fase 1: Activepieces (✅ Completado)
- [x] Crear cuenta Activepieces Cloud
- [x] Conectar Supabase
- [x] Configurar webhook appointments
- [x] Flow: Nueva cita → Email
- [x] Probar funcionamiento

### Fase 2: Social Media por Agente
- [ ] Crear tabla `agent_social_connections` en Supabase
- [ ] Crear modelo Prisma y generar cliente
- [ ] Crear Facebook Developer App
- [ ] Implementar OAuth flow (`/api/oauth/facebook/*`)
- [ ] UI: `/dashboard/configuracion/redes-sociales`
- [ ] Implementar publicación en Facebook
- [ ] Agregar Instagram (misma app)
- [ ] Agregar generación de copy con OpenAI
- [ ] Probar end-to-end

### Fase 3: WhatsApp Business
- [ ] Elegir proveedor (Meta Cloud / Twilio / 360dialog)
- [ ] Configurar cuenta y templates
- [ ] Integrar en Activepieces
- [ ] Flow: Nueva cita → WhatsApp agente
- [ ] Flow: Recordatorio 24h
- [ ] Probar end-to-end

### Fase 4: Analytics y ROI
- [ ] Tracking de posts publicados
- [ ] Métricas de engagement por plataforma
- [ ] Dashboard de ROI por campaña
- [ ] Reportes semanales automatizados

---

## 8. Referencias Técnicas

### Documentación Oficial

| Recurso | URL |
|---------|-----|
| Activepieces Docs | https://www.activepieces.com/docs |
| Meta Graph API | https://developers.facebook.com/docs/graph-api |
| Instagram Graph API | https://developers.facebook.com/docs/instagram-api |
| TikTok Content API | https://developers.tiktok.com/doc/content-posting-api |
| WhatsApp Cloud API | https://developers.facebook.com/docs/whatsapp/cloud-api |

### Archivos del Proyecto Relacionados

| Archivo | Propósito |
|---------|-----------|
| `apps/web/lib/pricing/tiers.ts` | Definición de features por tier |
| `apps/web/app/(public)/pricing/page.tsx` | Tabla comparativa |
| `packages/database/prisma/schema.prisma` | Modelos de datos |
| `docs/automation-strategy.md` | Estrategia original |
| `docs/automation-implementation-checklist.md` | Checklist original |

### Credenciales Necesarias (.env)

```env
# Ya configurados
NEXT_PUBLIC_SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
OPENAI_API_KEY=xxx

# Para Facebook/Instagram (pendiente)
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx

# Para WhatsApp (pendiente)
WHATSAPP_API_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx

# Para TikTok (Q3 2026)
TIKTOK_CLIENT_KEY=xxx
TIKTOK_CLIENT_SECRET=xxx
```

---

## Próxima Sesión

Al comenzar la próxima sesión, menciona:
> "Continuemos con la implementación de automatización. Revisa `/docs/automation-complete-guide.md`"

El siguiente paso es:
1. Crear la tabla `agent_social_connections`
2. Crear Facebook Developer App
3. Implementar OAuth flow

---

> **Documento vivo** - Actualizar después de cada sesión
> Última actualización: 17 Diciembre 2025, 20:00
