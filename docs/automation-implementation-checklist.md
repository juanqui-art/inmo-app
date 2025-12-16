# Automation Implementation Checklist

> Checklist paso a paso para implementar automatización en InmoApp.

---

## Fase 0: Preparación (Pre-requisitos)

### Cuentas y APIs
- [ ] Crear cuenta Activepieces Cloud (cloud.activepieces.com)
  - Tier Free: 1,000 ejecuciones/mes
  - 14 días trial Pro disponible
- [ ] Obtener WhatsApp Business API
  - Opción A: Meta Business (gratuito, más complejo)
  - Opción B: Proveedor (Twilio, 360dialog) ~$30-50/mes
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
Action 2: WhatsApp → Send Message
  - To: {{step1.phone}}
  - Message: "🏠 Nueva cita para {{trigger.scheduledAt}}"
```

### 2.2 Flow: Recordatorio 24h
```
Trigger: Schedule → Diario 9:00 AM
Action 1: Supabase → Run Query
  - SELECT * FROM appointments 
    WHERE scheduled_at BETWEEN NOW() + '24 hours' 
    AND NOW() + '25 hours'
Action 2: Loop → Para cada cita
Action 3: WhatsApp → Send Message
```

---

## Fase 3: Captura Facebook Lead Ads (Semana 3-4)

### 3.1 Configurar Facebook
- [ ] Crear/verificar Facebook Business Manager
- [ ] Configurar Lead Ads con formulario
- [ ] Habilitar webhook en configuración de la app

### 3.2 Flow: Lead Ads → CRM
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

## Fase 4: Post Automático en Redes (Semana 4-5)

### 4.1 Conectar Facebook/Instagram
- [ ] En Activepieces: Connections → Add → Facebook Pages
- [ ] Autorizar con cuenta de agente o página de prueba

### 4.2 Flow: Propiedad Destacada → Post
```
Trigger: Supabase → Update Row → properties
  - Filter: is_featured changed to true
Action 1: Supabase → Search → property_images
Action 2: OpenAI → Generate (copy para post)
Action 3: Facebook → Create Post
Action 4: Instagram → Create Post (opcional)
```

---

## Fase 5: Actualizar UI de Tiers (Paralelo)

### 5.1 Modificar tiers.ts
- [ ] Agregar estructura `keyFeatures` + `newFeatures`
- [ ] Incluir `includesPlan` para "Todo de X, más:"

### 5.2 Actualizar PricingCard Component
- [ ] Renderizar features con agrupación
- [ ] Agregar badge "NUEVO" para automatización
- [ ] Link a comparativa completa

### 5.3 Actualizar /vender page
- [ ] Verificar que nuevos features se muestren correctamente
- [ ] Agregar sección explicativa de automatización (opcional)

---

## Fase 6: Testing y Lanzamiento

### Testing
- [ ] Probar cada flow con data real
- [ ] Verificar tiempos de respuesta (< 60 seg)
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
| WhatsApp | Business API | ⏳ Pendiente |
| Facebook | Business Manager | ⏳ Pendiente |
| OpenAI | API key | ✅ Listo |
| Activepieces | Cuenta | ⏳ Pendiente |

---

## Costos Estimados Mensuales

| Componente | Costo |
|------------|-------|
| Activepieces (Pro) | $10 |
| WhatsApp API (1000 msg) | $50 |
| OpenAI (10K tokens/día) | $10 |
| **Total** | **~$70** |

---

## Métricas de Éxito

- [ ] Tiempo respuesta a leads: < 60 segundos
- [ ] Tasa apertura WhatsApp: > 80%
- [ ] Conversión leads Facebook: > 5%
- [ ] Agentes tier AGENT: +20% en 3 meses
- [ ] Churn tier AGENT: < 5%

---

> Actualizar este documento conforme se complete cada fase.
