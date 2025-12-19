# Automation Implementation Checklist

> Checklist paso a paso para implementar automatización en InmoApp.
> **Actualizado: 17 Diciembre 2025** - APIs de Redes Sociales

---

## Fase 0: Preparación (Pre-requisitos)

### Cuentas y APIs
- [ ] Crear cuenta Activepieces Cloud (cloud.activepieces.com)
  - Tier Free: 1,000 ejecuciones/mes
  - 14 días trial Pro disponible
- [ ] Crear Facebook Developer App
  - Tipo: Business App
  - Obtener Page Access Token
- [ ] Obtener WhatsApp Business API
  - Opción A: Meta Business (gratuito, más complejo)
  - Opción B: Proveedor (Twilio, 360dialog) ~$20/mes
- [ ] Registrar en TikTok Developer Portal (para Q3)
- [ ] Verificar API key de OpenAI existente

### Credenciales Necesarias
```env
# Ya tienes en .env
SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
OPENAI_API_KEY=xxx

# Nuevas (para WhatsApp)
WHATSAPP_API_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx

# Facebook (nuevo)
FACEBOOK_PAGE_ID=xxx
FACEBOOK_PAGE_ACCESS_TOKEN=xxx

# TikTok (Q3)
TIKTOK_CLIENT_KEY=xxx
TIKTOK_CLIENT_SECRET=xxx
```

---

## Fase 1: Setup Inicial (Semana 1)

### 1.1 Conectar Activepieces con Supabase
- [ ] En Activepieces: Connections → Add → Supabase
- [ ] Pegar `SUPABASE_URL` y `SERVICE_ROLE_KEY`
- [ ] Test conexión

### 1.2 Primer Flow de Prueba
- [ ] Crear flow: "Test - Nueva Cita"
- [ ] Trigger: Supabase → New Row → tabla `appointments`
- [ ] Action: Email (tu email) → "Nueva cita de prueba"
- [ ] Publicar y probar creando una cita

---

## Fase 2: Notificaciones WhatsApp (Semana 2)

### 2.1 Flow: Notificación de Cita Nueva
```
Trigger: Supabase → New Row → appointments
Action 1: Supabase → Search → users (agentId)
Action 2: WhatsApp → Send Template
  - To: {{step1.phone}}
  - Template: "appointment_notification"
  - Variables: {date, client_name}
```

### 2.2 Flow: Recordatorio 24h
```
Trigger: Schedule → Diario 9:00 AM
Action 1: Supabase → Run Query
  - SELECT * FROM appointments 
    WHERE scheduled_at BETWEEN NOW() + '24 hours' 
    AND NOW() + '25 hours'
Action 2: Loop → Para cada cita
Action 3: WhatsApp → Send Template
```

### ⚠️ Nota: Templates WhatsApp
Los templates deben ser pre-aprobados por Meta. Ejemplos:
- `appointment_notification`: "Hola {{1}}, tienes una cita programada para {{2}}"
- `reminder_24h`: "Recordatorio: mañana {{1}} a las {{2}}"

---

## Fase 3: Facebook Auto-Post (Semana 3-4)

### 3.1 Configurar Facebook App
- [ ] Crear app en developers.facebook.com
- [ ] Tipo: Business → Agregar producto "Facebook Login"
- [ ] Solicitar permisos:
  - `pages_show_list`
  - `pages_read_engagement`
  - `pages_manage_posts`
- [ ] Obtener Page Access Token (Admin de la página)

### 3.2 Flow: Propiedad Destacada → Post
```
Trigger: Supabase → Update Row → properties
  - Filter: is_featured changed to true
Action 1: Supabase → Search → property_images
Action 2: OpenAI → Generate (copy para post)
Action 3: HTTP Request → POST /{page-id}/feed
  - message: {{ai_copy}}
  - link: {{property_url}}?utm_source=facebook&utm_medium=organic
```

### ⚠️ Limitaciones Facebook
- Solo publica en Facebook Pages
- Token expira cada 60 días (renovar manualmente o con long-lived token)

---

## Fase 4: Facebook Lead Ads → CRM (Semana 5-6)

### 4.1 Configurar Lead Ads
- [ ] Crear/verificar Facebook Business Manager
- [ ] Configurar Lead Ads con formulario
- [ ] Habilitar webhook en configuración de la app

### 4.2 Flow: Lead Ads → CRM
```
Trigger: Facebook → New Lead
Action 1: Supabase → Create Row → agent_clients
  - source: "facebook_ad"
  - utmCampaign: {{trigger.campaign_name}}
Action 2: OpenAI → Generate (mensaje bienvenida)
Action 3: WhatsApp → Send al lead
Action 4: WhatsApp → Notificar agente
```

---

## Fase 5: TikTok Integration (Q3 2026)

### 5.1 Setup TikTok Developer
- [ ] Crear cuenta en developers.tiktok.com
- [ ] Registrar aplicación
- [ ] Solicitar scopes: `video.upload`
- [ ] Pasar proceso de aprobación

### 5.2 Flow: Video Property → TikTok Draft
```
Trigger: Property.isFeatured = true AND videos.length > 0
Action 1: Fetch property video URL
Action 2: TikTok → Upload Draft
  - video_url: {{video}}
  - caption: "🏠 {{title}} | {{price}}"
  - notify_user: true
→ Agent finaliza en TikTok app
```

### ⚠️ Notas TikTok
- Solo MP4/H.264, máx 500MB
- Draft Upload es más fácil que Direct Post
- El agente debe finalizar la publicación en la app

---

## Fase 6: Actualizar UI de Tiers (Paralelo)

### 6.1 Modificar tiers.ts
- [ ] Agregar estructura `keyFeatures` + `newFeatures`
- [ ] Incluir `includesPlan` para "Todo de X, más:"
- [ ] Agregar TikTok drafts a tier AGENT

### 6.2 Actualizar PricingCard Component
- [ ] Renderizar features con agrupación
- [ ] Agregar badge "NUEVO" para automatización
- [ ] Link a comparativa completa

### 6.3 Actualizar /vender page
- [ ] Verificar que nuevos features se muestren correctamente
- [ ] Agregar sección explicativa de automatización (opcional)

---

## Fase 7: Testing y Lanzamiento

### Testing
- [ ] Probar cada flow con data real
- [ ] Verificar tiempos de respuesta (<60 seg)
- [ ] Probar fallbacks (qué pasa si falla?)
- [ ] Verificar costos por ejecución

### Lanzamiento
- [ ] Habilitar para agentes tier AGENT existentes
- [ ] Comunicar nuevas features via email
- [ ] Monitorear primeras 100 ejecuciones

---

## Dependencias Técnicas

| Componente | Requiere | Estado |
|------------|----------|--------|
| Supabase connection | API keys | ✅ Listo |
| WhatsApp | Business API + Templates | ⏳ Pendiente |
| Facebook | App + Page Token | ⏳ Pendiente |
| TikTok | Developer Account | ⏳ Q3 |
| OpenAI | API key | ✅ Listo |
| Activepieces | Cuenta | ⏳ Pendiente |

---

## Costos Estimados Mensuales (Actualizado 2025)

| Componente | Costo |
|------------|-------|
| Activepieces (Pro) | $10 |
| WhatsApp API (~500 msg) | $20 |
| OpenAI (10K tokens/día) | $10 |
| TikTok API | $0 |
| Facebook API | $0 |
| **Total** | **~$40** |

---

## Métricas de Éxito

- [ ] Tiempo respuesta a leads: <60 segundos
- [ ] Tasa apertura WhatsApp: >80%
- [ ] Conversión leads Facebook: >5%
- [ ] Engagement posts automáticos: >2%
- [ ] Agentes tier AGENT: +20% en 3 meses
- [ ] Churn tier AGENT: <5%

---

> Actualizar este documento conforme se complete cada fase.
> Última actualización: 17 Diciembre 2025
