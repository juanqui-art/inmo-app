# Appointments System: Custom vs External API Analysis

**Fecha de análisis**: 2025-01-05
**Estado**: Investigación completada, pendiente decisión final
**Contexto**: Plataforma inmobiliaria en Fase 1.5 (MVP funcional, agregando features públicas)

---

## 📋 Tabla de Contenidos

1. [Contexto del Proyecto](#contexto-del-proyecto)
2. [Opciones Evaluadas](#opciones-evaluadas)
3. [Comparativa Detallada](#comparativa-detallada)
4. [Recomendación Estratégica](#recomendación-estratégica)
5. [Plan de Implementación](#plan-de-implementación)
6. [Decisión y Próximos Pasos](#decisión-y-próximos-pasos)

---

## Contexto del Proyecto

### Situación Actual
- ✅ Modelo `Appointment` ya existe en Prisma schema
- ✅ RLS policies configuradas en Supabase
- ✅ Arquitectura establecida: Repository → Server Actions → Components
- ⏳ Sistema de citas pendiente de implementación

### Campos del Modelo Appointment
```prisma
model Appointment {
  id          String            @id @default(uuid())
  userId      String            @map("user_id")
  propertyId  String            @map("property_id")
  agentId     String            @map("agent_id")
  scheduledAt DateTime          @map("scheduled_at")
  status      AppointmentStatus @default(PENDING)
  notes       String?           @db.Text
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

### Consideraciones Clave
- **Objetivo**: Sistema para agendar visitas a propiedades
- **Usuarios**: CLIENTs (agendan) + AGENTs (confirman/rechazan)
- **Futuro**: Integración con AI/chatbot para automatización
- **Presupuesto**: Startup en fase temprana (costos recurrentes deben ser mínimos)

---

## Opciones Evaluadas

### 1. Sistema Custom (Usar modelo Appointment propio)
### 2. Google Calendar API
### 3. Cal.com (Open Source Scheduling)
### 4. Calendly API

---

## Comparativa Detallada

### Opción 1: Sistema Custom

#### ✅ Ventajas

1. **Control Total**
   - Modelo `Appointment` ya creado en Prisma
   - Lógica 100% personalizable según necesidades
   - Puedes agregar campos específicos (ej: tipo de visita, preferencias cliente)

2. **Sin Costos Externos**
   - $0 costo recurrente por usuarios/citas
   - Solo pagas infraestructura existente (Supabase + Vercel)
   - Email notifications: Resend free tier (100/día) o $20/mes para 50k

3. **Datos en tu Control**
   - Todo en Supabase PostgreSQL
   - Fácil acceso para AI/chatbot futuro
   - Cumplimiento GDPR/privacidad más sencillo

4. **Integración Nativa**
   - RLS policies ya configuradas
   - Repositorios, Server Actions, validaciones Zod establecidos
   - Mismo stack que resto de features

5. **Sin Límites**
   - No hay cuotas por mes, usuarios o features
   - Escala con tu infraestructura (no pagas por escalar)

#### ❌ Desventajas

1. **Tiempo de Desarrollo**
   - 2-3 días de trabajo completo
   - Necesitas implementar UI, lógica, notificaciones

2. **Features Básicas Inicialmente**
   - Sin sincronización automática con calendarios personales
   - Sin recordatorios automáticos por SMS (solo email)
   - Sin detección inteligente de conflictos de horario
   - Sin manejo automático de zonas horarias
   - Sin integración con Zoom/Google Meet

3. **Mantenimiento**
   - Tú eres responsable de:
     - Bugs y fixes
     - Nuevas features
     - Email delivery (monitoreo)
     - Performance optimization

4. **UX menos pulida (inicialmente)**
   - No tiene la experiencia refinada de Calendly
   - Necesitas diseñar flujos manualmente
   - Menos features de convenience

#### 🛠️ Stack Técnico

```typescript
// UI Components
- react-day-picker (date selection)
- Custom time picker (shadcn/ui)
- React Hook Form + Zod validation

// Backend
- Server Actions (appointments.ts)
- Prisma Repository (appointmentRepository)
- Zod schemas (appointment.ts)

// Notifications
- Resend (email notifications)
  - New appointment requested
  - Appointment confirmed
  - Appointment cancelled
  - Reminder 24h before

// Export/Sync
- Generate .ics files (users can add to their calendar manually)
```

#### 💰 Costo

**Desarrollo**: 2-3 días (~$0 si lo haces tú)

**Infraestructura recurrente**:
- Supabase: $0 (ya incluido en plan actual)
- Vercel: $0 (ya incluido)
- Email (Resend):
  - Free: 100 emails/día (3,000/mes)
  - Paid: $20/mes para 50,000 emails
  - Si tienes 100 agentes con 10 citas/mes = 1,000 emails/mes (dentro de free tier)

**Total recurrente**: $0-20/mes

---

### Opción 2: Google Calendar API

#### ✅ Ventajas

1. **Sincronización Real**
   - Citas se crean directamente en Google Calendar del agente
   - Cliente también puede recibir invite a su Google Calendar
   - Bi-directional sync (cambios en Google → tu app)

2. **Detección de Conflictos**
   - Google maneja availability automáticamente
   - No puedes agendar cuando el agente ya tiene algo
   - Free/busy information

3. **Google Meet Automático**
   - Links de videollamada generados automáticamente
   - Útil para visitas virtuales

4. **Familiar para Usuarios**
   - Los agentes ya usan Google Calendar diariamente
   - No necesitan aprender nueva herramienta

5. **API Gratuita**
   - $0 costo (sin límites para uso razonable)
   - Bien documentada
   - SDKs oficiales para Node.js

#### ❌ Desventajas

1. **Complejidad OAuth**
   - Cada agente debe autenticarse con Google
   - Manejo de tokens (refresh, expiration)
   - Scope permissions (calendar access)

2. **Dependencia Externa**
   - Si Google Calendar API cae, tu feature cae
   - Si Google cambia términos, puede afectar tu app
   - Latency adicional (API calls a Google servers)

3. **Datos Fragmentados**
   - Citas están en Google Calendar + tu DB
   - Sincronización bidireccional es compleja
   - Source of truth difuso (¿Google o tu DB?)

4. **Limitaciones**
   - Solo funciona si el agente usa Google Calendar
   - ¿Qué pasa si el agente usa Outlook o Apple Calendar?
   - Vendor lock-in sutil

5. **Privacidad**
   - Google tiene acceso a datos de tus citas
   - Algunos agentes pueden no querer compartir su calendario

#### 🛠️ Stack Técnico

```typescript
// Google OAuth 2.0
- @googleapis/calendar
- next-auth (para manejar OAuth flow)
- Token storage en DB (encrypted)

// Calendar API
- Create events
- Update events
- Delete events
- Watch for changes (webhooks)

// Sync Strategy
- Your DB = source of truth
- Google Calendar = mirror
- Webhook listener para cambios en Google
- Conflict resolution logic
```

#### 💰 Costo

**API**: $0 (gratis para uso normal)

**Desarrollo**: 3-4 días
- OAuth implementation: 1 día
- Calendar sync logic: 1 día
- Webhook handling: 1 día
- Error handling + fallbacks: 1 día

**Mantenimiento**:
- Token refresh automation
- Webhook endpoint monitoring
- Sync error recovery

**Total recurrente**: $0

---

### Opción 3: Cal.com (Open Source)

#### ✅ Ventajas

1. **Open Source + Self-Hosted**
   - AGPLv3 license
   - Puedes deployar tu propia instancia
   - No pagas por usuarios

2. **Features Completas Out-of-the-Box**
   - Scheduling UI profesional
   - Calendar sync (Google, Outlook, Apple)
   - Reminders automáticos (email, SMS)
   - Video conferencing (Zoom, Google Meet, Daily.co)
   - Payment integration (Stripe)
   - Team scheduling
   - Webhooks para eventos

3. **Customizable**
   - Código abierto → puedes modificar
   - Branding personalizado
   - Custom fields y workflows

4. **API First**
   - REST API bien documentada
   - Webhooks para todos los eventos
   - Fácil integración con tu app

5. **Activamente Mantenido**
   - Comunidad grande
   - Updates frecuentes
   - Bien documentado

#### ❌ Desventajas

1. **Infraestructura Adicional**
   - Necesitas otro servidor/servicio para Cal.com
   - Cal.com es una app completa (Next.js + PostgreSQL + Redis)
   - No es "solo una librería"

2. **Complejidad**
   - Es una plataforma completa, no solo scheduling
   - Overhead de features que quizá no necesites
   - Aprendizaje de su arquitectura

3. **Mantenimiento**
   - Responsable de:
     - Updates de Cal.com
     - Security patches
     - Backups de su DB separada
     - Monitoring de su instancia

4. **Licencia AGPLv3**
   - Si modificas el código, debes hacer tu código open source
   - Puede ser problema si planeas cerrar el código después

5. **Database Separada**
   - Cal.com usa su propia DB (PostgreSQL)
   - Tus citas están en otra DB, no en Supabase
   - Sincronización vía API/webhooks

#### 🛠️ Stack Técnico

```typescript
// Cal.com Instance
- Self-hosted en: Vercel, Railway, DigitalOcean, o Docker
- PostgreSQL (separada de tu Supabase)
- Redis (para queues)
- Next.js app completa

// Integration con tu app
- Cal.com API (crear bookings desde tu app)
- Webhooks (escuchar eventos: booking.created, booking.cancelled)
- Embed Cal.com UI en tu app (iframe)

// Sync Strategy
- Cal.com = scheduling logic
- Tu DB = metadata + user data
- API calls para crear/leer bookings
```

#### 💰 Costo

**Self-hosted**:
- Servidor: $0-20/mes (depende del hosting)
  - Vercel: $0 (free tier posiblemente suficiente)
  - Railway: $5-10/mes
  - DigitalOcean: $12/mes (Droplet básico)
- PostgreSQL: $0 (si usas la de Railway/Vercel) o $7-15/mes
- Redis: $0 (Upstash free tier) o $10/mes

**Cal.com Cloud** (no self-host):
- $12/usuario/mes
- Con 50 agentes = $600/mes

**Desarrollo**: 1-2 días
- Setup de Cal.com instance: 4-6 horas
- Integración API: 4-6 horas
- Webhooks + sync: 4 horas

**Total recurrente (self-hosted)**: $0-30/mes

---

### Opción 4: Calendly API

#### ✅ Ventajas

1. **UI Pulida**
   - La mejor experiencia de usuario del mercado
   - Mobile-optimized
   - Muy intuitiva

2. **Cero Mantenimiento**
   - Calendly se encarga de TODO
   - Updates automáticos
   - 99.9% uptime SLA
   - Soporte técnico

3. **Features Avanzadas**
   - Round-robin scheduling (múltiples agentes)
   - Team scheduling
   - Payment collection (Stripe, PayPal)
   - Workflow automation
   - Analytics y reporting
   - Integrations (1000+ apps via Zapier)

4. **Enterprise-Ready**
   - Usado por millones de usuarios
   - Muy confiable
   - GDPR compliant
   - SSO support

5. **Rápido de Implementar**
   - Embed en tu web en minutos
   - API bien documentada
   - SDKs oficiales

#### ❌ Desventajas

1. **Costo Alto**
   - Essentials: $10/usuario/mes
   - Professional: $16/usuario/mes
   - Teams: $16/usuario/mes (mínimo 2 usuarios)
   - Enterprise: Custom pricing

   **Ejemplo**: 50 agentes = $500-800/mes = $6,000-9,600/año

2. **Vendor Lock-in**
   - Difícil migrar si quieres cambiar después
   - Datos en plataforma de Calendly
   - Dependencia total de su servicio

3. **Datos en Calendly**
   - No tienes control total de los datos
   - Export limitado
   - AI/chatbot futuro debe consumir API de Calendly

4. **Customización Limitada**
   - No puedes cambiar lógica interna
   - Branding limitado (solo en planes pagos)
   - Campos custom limitados

5. **API Access**
   - Solo disponible en plan Teams ($16+)
   - Rate limits estrictos
   - No todos los features accesibles vía API

#### 🛠️ Stack Técnico

```typescript
// Embed en tu app
- Calendly Embed (iframe)
- Popup widget
- Inline embed

// API Integration
- Webhooks (escuchar eventos)
- REST API (leer bookings, usuarios)
- OAuth para autenticar agentes

// Sync Strategy
- Calendly = source of truth
- Webhooks → guardar metadata en tu DB
```

#### 💰 Costo

**Mensual** (para 50 agentes):
- Essentials: $500/mes ($6,000/año)
- Professional: $800/mes ($9,600/año)
- Teams: $800+/mes

**Setup**: 1 día (embed + webhooks)

**Total recurrente**: $500-800/mes (prohibitivo para startup temprana)

---

## Recomendación Estratégica

### Para tu caso: Startup Inmobiliaria + AI Futuro

**Recomendación: Híbrido - Opción 1 (Custom) + Opción 2 (Google Calendar API)**

### ¿Por qué híbrido?

#### Fase 1: MVP Custom (Prioridad ALTA)

**Implementar sistema básico con tu modelo Appointment**

**Justificación**:
1. ✅ **Control de datos** → Crítico para AI/chatbot futuro
2. ✅ **$0 costo recurrente** → Importante para startup
3. ✅ **Rápido** → 2-3 días (ya tienes el modelo)
4. ✅ **Flexible** → Puedes agregar features específicas
5. ✅ **No vendor lock-in** → Toda la lógica es tuya

**Features MVP**:
- UI simple: Lista de citas, crear cita, confirmar/rechazar
- Email notifications con Resend
- Export a .ics files (usuarios agregan a su calendario manualmente)
- Validación básica de horarios (no doble-booking)

**Costo**: $0-20/mes

---

#### Fase 2: Google Calendar Sync (Opcional, FUTURO)

**Agregar OAuth de Google como feature opcional**

**Justificación**:
1. ✅ **Best of both worlds** → Control + convenience
2. ✅ **Opcional** → Agentes tech-savvy conectan Google, otros usan UI básica
3. ✅ **No dependencia 100%** → Sistema funciona sin Google

**Cuándo implementar**:
- Después de validar que el sistema básico funciona
- Si agentes piden "quiero que aparezca en mi Google Calendar"
- Cuando tengas 1-2 semanas libres para feature no-crítica

**Costo adicional**: $0 (API gratis)

---

### ¿Por qué NO las otras opciones?

#### ❌ Cal.com (Self-hosted)
- **Complejidad innecesaria** → Es una app completa, no una librería
- **Otra DB que mantener** → Ya tienes Supabase
- **Overhead** → Features que no necesitas inicialmente
- **Mejor guardar para**: Si creces mucho y necesitas features enterprise

#### ❌ Calendly
- **Costo prohibitivo** → $6,000-9,600/año para 50 agentes
- **Vendor lock-in** → Difícil de migrar después
- **Mejor guardar para**: Si ya tienes revenue fuerte y quieres best UX posible

---

## Plan de Implementación

### Fase 1: Sistema Custom MVP (2-3 días) ⭐ RECOMENDADO

#### Backend (Día 1)

**1. Repository** (`packages/database/src/repositories/appointments.ts`)
```typescript
export const appointmentRepository = {
  // Create appointment
  async create(data: CreateAppointmentInput): Promise<Appointment>

  // Get appointments for user (CLIENT)
  async findByUser(userId: string, filters?: AppointmentFilters): Promise<Appointment[]>

  // Get appointments for agent
  async findByAgent(agentId: string, filters?: AppointmentFilters): Promise<Appointment[]>

  // Get appointments for property
  async findByProperty(propertyId: string): Promise<Appointment[]>

  // Update status
  async updateStatus(id: string, status: AppointmentStatus, userId: string): Promise<Appointment>

  // Cancel appointment
  async cancel(id: string, userId: string): Promise<Appointment>

  // Check availability (prevent double-booking)
  async checkAvailability(agentId: string, scheduledAt: Date): Promise<boolean>
}
```

**2. Server Actions** (`apps/web/app/actions/appointments.ts`)
```typescript
'use server'

export async function createAppointmentAction(formData: FormData)
export async function confirmAppointmentAction(id: string)
export async function rejectAppointmentAction(id: string)
export async function cancelAppointmentAction(id: string)
export async function completeAppointmentAction(id: string)
export async function getMyAppointmentsAction()
export async function getAgentAppointmentsAction()
```

**3. Validations** (`apps/web/lib/validations/appointment.ts`)
```typescript
export const createAppointmentSchema = z.object({
  propertyId: z.string().uuid(),
  scheduledAt: z.coerce.date().refine(
    (date) => date > new Date(),
    'La fecha debe ser futura'
  ),
  notes: z.string().max(500).optional(),
})
```

**4. Email Templates** (`apps/web/lib/email/templates/`)
- `appointment-new.tsx` (para agente: nueva solicitud)
- `appointment-confirmed.tsx` (para cliente: cita confirmada)
- `appointment-cancelled.tsx` (para ambos: cita cancelada)
- `appointment-reminder.tsx` (24h antes)

---

#### Frontend (Día 2)

**1. Components** (`apps/web/components/appointments/`)

```typescript
// appointment-form.tsx
// - Date picker (react-day-picker)
// - Time picker (custom select)
// - Notes textarea
// - Submit button

// appointment-card.tsx
// - Display: property, date/time, status, notes
// - Actions: confirm, reject, cancel (based on role + status)

// appointment-list.tsx
// - Filter: upcoming, past, all
// - Filter: status (pending, confirmed, completed)
// - Sort: by date
```

**2. Pages**

```typescript
// apps/web/app/dashboard/citas/page.tsx
// Dashboard de citas (CLIENT o AGENT según role)

// apps/web/app/propiedades/[id]/page.tsx (public)
// Agregar botón "Agendar Visita"
// Modal con AppointmentForm
```

---

#### Testing & Polish (Día 3)

**1. Testing Manual**
- [ ] CLIENT puede agendar cita
- [ ] AGENT recibe email notification
- [ ] AGENT puede confirmar/rechazar
- [ ] CLIENT recibe email cuando confirman
- [ ] Cancelación funciona (ambos lados)
- [ ] No se puede agendar en el pasado
- [ ] No se puede double-book al mismo agente

**2. UX Improvements**
- [ ] Loading states
- [ ] Error messages claros
- [ ] Success confirmations (toast)
- [ ] Empty states (no appointments yet)
- [ ] Responsive design (mobile)

**3. Email Testing**
- [ ] Emails llegan correctamente
- [ ] Templates se ven bien (desktop + mobile)
- [ ] Links funcionan
- [ ] Unsubscribe link

---

#### Archivos a Crear (Resumen)

```
packages/database/src/repositories/appointments.ts
apps/web/app/actions/appointments.ts
apps/web/lib/validations/appointment.ts
apps/web/lib/email/templates/appointment-new.tsx
apps/web/lib/email/templates/appointment-confirmed.tsx
apps/web/lib/email/templates/appointment-cancelled.tsx
apps/web/lib/email/templates/appointment-reminder.tsx
apps/web/components/appointments/appointment-form.tsx
apps/web/components/appointments/appointment-card.tsx
apps/web/components/appointments/appointment-list.tsx
apps/web/app/dashboard/citas/page.tsx
apps/web/app/propiedades/[id]/page.tsx (modificar)
```

**Total**: ~12 archivos (8 nuevos, 4 modificados)

---

### Fase 2: Google Calendar Sync (Opcional, +2 días)

**Cuándo**: Solo si hay demanda real de los agentes

#### Features
- [ ] OAuth con Google (agente conecta su cuenta)
- [ ] Crear evento en Google Calendar cuando se confirma cita
- [ ] Actualizar evento si cambia fecha/hora
- [ ] Eliminar evento si se cancela
- [ ] Webhook de Google para detectar cambios externos
- [ ] Manejo de conflictos (si agente ya tiene evento)

#### Archivos Adicionales
```
apps/web/app/api/auth/google/route.ts (OAuth callback)
apps/web/app/api/webhooks/google-calendar/route.ts
apps/web/lib/google/calendar.ts (helper functions)
apps/web/app/dashboard/ajustes/page.tsx (connect Google Calendar)
```

**Costo desarrollo**: 2 días adicionales
**Costo recurrente**: $0

---

## Decisión y Próximos Pasos

### ✅ Decisión Recomendada: Sistema Custom (Fase 1)

**Razones finales**:

1. **Ya tienes el 80% del trabajo conceptual hecho**
   - Modelo Appointment existe
   - RLS configurado
   - Arquitectura clara (repo → action → UI)

2. **Datos para AI/Chatbot**
   - Todo en Supabase PostgreSQL
   - Fácil query para entrenar modelos
   - Sin APIs externas que consultar

3. **$0 costo recurrente**
   - Crítico para startup temprana
   - Email gratis hasta 3,000/mes (suficiente para MVP)

4. **Tiempo razonable**
   - 2-3 días es comparable a otras features
   - No es significativamente más lento que integrar Calendly

5. **Flexibilidad futura**
   - Puedes agregar Google Calendar después
   - Puedes cambiar a Cal.com si creces mucho
   - No estás locked-in

---

### Evitar (al menos por ahora)

#### ❌ NO: Calendly
**Razón**: $500-800/mes es demasiado para startup temprana sin revenue comprobado

**Cuándo considerarlo**: Cuando tengas:
- Revenue > $50k/mes
- 100+ agentes activos
- Budget para herramientas enterprise

---

#### ❌ NO: Cal.com Self-hosted
**Razón**: Complejidad innecesaria (otra app, otra DB, otro deploy)

**Cuándo considerarlo**: Cuando necesites:
- Team scheduling complejo (round-robin, múltiples agentes por cita)
- Payment integration nativa
- 50+ features que no tienes tiempo de construir

---

### Siguiente Paso Concreto

**Comando para ejecutar**:
```
"Implementar sistema de citas custom (Fase 1 del plan de appointments)"
```

**O si prefieres primero validar con features públicas**:
```
"Construir Public Property Listings primero (homepage + search)"
```

---

## Apéndice: Research Links

### Google Calendar API
- [Google Calendar API Overview](https://developers.google.com/workspace/calendar/api/guides/overview)
- [Next.js + Google Calendar Tutorial](https://www.codu.co/articles/integrating-google-s-appointment-scheduler-into-your-nextjs-application-yb-p6qfu)
- [Build Calendly-like page with Google APIs](https://dev.to/timfee/build-and-host-your-own-calendy-like-scheduling-page-using-nextjs-and-google-apis-5ack)

### Cal.com
- [Cal.com GitHub](https://github.com/calcom/cal.com)
- [Cal.com Documentation](https://cal.com/docs/developing/introduction)
- [Cal.com Integrations Guide](https://cal.com/blog/enhance-your-scheduling-with-cal-com-s-open-source-integrations)

### Calendly Alternatives
- [Top 10 Real Estate Appointment Software](https://www.goodcall.com/post/real-estate-appointment-scheduling-software)
- [Best Calendly Alternatives 2025](https://www.zoho.com/bookings/buyers-guide/calendly-alternative.html)

### Market Trends
- Real estate appointment scheduling market: $546M (2025) → $1.5B (2032)
- CAGR: 15.7%
