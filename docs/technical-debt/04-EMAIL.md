# 📧 Email Delivery

> **2 tareas identificadas** | Estimado: 45 min + DNS propagation
> Status: 🔴 BLOQUEADO - Usuarios no reciben confirmaciones

---

## 📋 Resumen

**Estado Actual:** ⚠️ **Emails NO se entregan a direcciones reales**

**Problema:**
- Usando `test@resend.dev` como sender
- Resend solo entrega a emails `@resend.dev` en modo test
- Emails a Gmail, Outlook, etc. **fallan silenciosamente**

**Impacto:**
- ❌ Usuarios no reciben confirmación de citas
- ❌ Agentes no reciben notificación de citas nuevas
- ❌ Funcionalidad de negocio bloqueada

**Root Cause:** Domain verification pendiente en Resend

---

## 🔴 El Problema

### Current Flow (Silently Failing)

```
┌─────────────────────────────────────────┐
│ 1. User Creates Appointment             │
│    Via property detail page             │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 2. Server Action: createAppointment()   │
│    ├─ Saves to database ✅              │
│    └─ Calls sendAppointmentCreatedEmail │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 3. Email Service                         │
│    from: "test@resend.dev"              │ ← PROBLEM
│    to: "user@gmail.com"                 │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 4. Resend API Response                   │
│    ❌ Rejected (domain not verified)    │
│    ⚠️ BUT: No error thrown to action    │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 5. UI Shows Success ✅                   │
│    "Cita creada exitosamente"           │
│    ⚠️ User thinks email was sent        │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 6. Reality                               │
│    ❌ Email never arrives                │
│    ❌ User confused                      │
│    ❌ No fallback mechanism              │
└─────────────────────────────────────────┘
```

### Archivos Involucrados

**Email sending logic:**
```typescript
// apps/web/lib/email/appointment-emails.ts:97-117
export async function sendAppointmentCreatedEmail(params) {
  try {
    await resend.emails.send({
      from: 'test@resend.dev',  // ← PROBLEM: Only works with @resend.dev
      to: clientEmail,            // ← e.g., user@gmail.com
      subject: 'Cita confirmada',
      react: AppointmentCreatedEmail(data)
    })
  } catch (error) {
    console.error('[sendAppointmentCreatedEmail] Error:', error)
    return { success: false, error: 'Failed to send...' }
    // ⚠️ Returns error object, doesn't throw
  }
}
```

**Server Action (ignores email result):**
```typescript
// apps/web/app/actions/appointments.ts:125-134
export async function createAppointmentAction(data) {
  // ... create appointment ...

  // Send email
  await sendAppointmentCreatedEmail({ ... })
  // ⚠️ Does NOT check result

  return { success: true }  // Returns success regardless
}
```

---

## ✅ Solución en 2 Fases

### Fase 1: Enhanced Error Handling (QUICK FIX)

**Objetivo:** Visibilidad de qué está fallando

**Tiempo:** 30 minutos

**Impacto:** Better debugging, no silent failures

#### Paso 1: Check Email Result in Server Action

```typescript
// apps/web/app/actions/appointments.ts
export async function createAppointmentAction(data) {
  // ... create appointment ...

  // ✅ Check email result
  const emailResult = await sendAppointmentCreatedEmail({ ... })

  if (!emailResult.success) {
    // Option A: Log warning but don't fail appointment
    logger.warn('[Appointment] Email failed:', {
      appointmentId: appointment.id,
      error: emailResult.error
    })
    // Appointment created, email failed (acceptable)
    return {
      success: true,
      warning: 'Cita creada, pero no se pudo enviar email de confirmación'
    }

    // Option B: Fail appointment if email fails (strict)
    // throw new Error('No se pudo enviar email de confirmación')
  }

  return { success: true }
}
```

#### Paso 2: Enhanced Logging in Email Service

```typescript
// apps/web/lib/email/appointment-emails.ts
export async function sendAppointmentCreatedEmail(params) {
  try {
    logger.info('[Email] Sending appointment email:', {
      to: clientEmail,
      from: 'test@resend.dev',
      appointmentId: params.appointmentId
    })

    const result = await resend.emails.send({ ... })

    // ✅ Log Resend API response
    logger.info('[Email] Resend API response:', {
      id: result.id,
      success: true
    })

    return { success: true, emailId: result.id }
  } catch (error) {
    // ✅ Log full error object
    logger.error('[Email] Resend API error:', {
      error: error.message,
      stack: error.stack,
      details: error  // Full error object
    })

    return {
      success: false,
      error: error.message || 'Failed to send email'
    }
  }
}
```

#### Paso 3: Test and Verify

```bash
# 1. Create test appointment via UI
# 2. Check server logs for:
#    - "[Email] Sending appointment email"
#    - "[Email] Resend API response" or "[Email] Resend API error"
# 3. Go to Resend Dashboard → Activity tab
# 4. See actual error: "Domain not verified"
```

**Archivos a modificar:**
- [ ] `apps/web/app/actions/appointments.ts`
- [ ] `apps/web/lib/email/appointment-emails.ts`

**Commit message:**
```
fix(email): add error handling for Resend email notifications

- Check email result in Server Actions
- Log Resend API responses for debugging
- See actual reasons why emails fail

Related: EMAIL_SENDING_TODO.md
```

---

### Fase 2: Domain Verification (PROPER SOLUTION)

**Objetivo:** Emails actually delivered to users

**Tiempo:** 15 min setup + 5-30 min DNS propagation

**Impacto:** 🎯 CRÍTICO - Fixes business functionality

#### Paso 1: Verify Domain in Resend

```bash
# 1. Go to https://resend.com/domains
# 2. Click "Add Domain"
# 3. Enter your domain:
#    - Production: inmoapp.com (or your actual domain)
#    - Staging: staging.inmoapp.com
#    - Dev: Skip (use test mode)
```

#### Paso 2: Add DNS Records

**Resend will provide records like:**

```
Type: CNAME
Name: resend._domainkey.inmoapp.com
Value: resend1234567890.resend.com
TTL: 3600

Type: MX
Name: inmoapp.com
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: 3600
```

**Add to your DNS provider:**
- Cloudflare
- Route53
- Namecheap
- Vercel DNS
- etc.

**Wait 5-30 minutes for propagation**

#### Paso 3: Verify Domain

```bash
# In Resend Dashboard:
# - Click "Verify DNS Records"
# - Should show: ✅ Verified
```

#### Paso 4: Update Code

```typescript
// apps/web/lib/email/appointment-emails.ts

// ✅ Update sender address
export async function sendAppointmentCreatedEmail(params) {
  await resend.emails.send({
    from: 'noreply@inmoapp.com',  // ← Your verified domain
    // OR
    from: 'InmoApp <noreply@inmoapp.com>',  // With name
    to: clientEmail,
    subject: 'Cita confirmada - InmoApp',
    react: AppointmentCreatedEmail(data)
  })
}
```

#### Paso 5: Update Environment Docs

```bash
# apps/web/.env.example
RESEND_API_KEY=re_xxxxx
# Domain verified in Resend: inmoapp.com
```

```markdown
<!-- CLAUDE.md -->
## Email Configuration

**Resend:**
- Verified domain: `inmoapp.com`
- Sender: `noreply@inmoapp.com`
- DNS configured: ✅ CNAME + MX records
```

#### Paso 6: Test

```bash
# 1. Create appointment via UI
# 2. Check email inbox (Gmail, Outlook, etc.)
# 3. Email should arrive within 30 seconds
# 4. Verify:
#    - Sender appears as "noreply@inmoapp.com"
#    - Email not in spam
#    - All links work
#    - Both client AND agent emails arrived
```

**Archivos a modificar:**
- [ ] `apps/web/lib/email/appointment-emails.ts`
- [ ] `apps/web/.env.example`
- [ ] `CLAUDE.md`

**Commit message:**
```
feat(email): add domain verification support for Resend

- Update sender from test@resend.dev to noreply@inmoapp.com
- Domain verification completed in Resend Dashboard
- Emails now delivered to real user addresses
- Updated documentation with DNS configuration

Fixes: EMAIL_SENDING_TODO.md
```

---

## 🧪 Testing Checklist

### After Phase 1 (Error Handling):

- [ ] Create appointment via web UI
- [ ] Check browser console for logs
- [ ] Check server logs for `[sendAppointmentCreatedEmail]` messages
- [ ] Go to Resend Dashboard → Activity
- [ ] Look for the email attempts
- [ ] Identify the actual Resend API error
- [ ] Verify error is logged (not silent)

### After Phase 2 (Domain Verification):

- [ ] Create appointment via web UI
- [ ] Check email inbox (wait 30 seconds)
- [ ] Email should be there with appointment details
- [ ] Verify sender is `noreply@inmoapp.com` (not test@resend.dev)
- [ ] Click any links in email - verify they work
- [ ] Check that both client AND agent emails arrived
- [ ] Verify email not in spam folder
- [ ] Test with multiple email providers (Gmail, Outlook, Yahoo)

---

## 📊 Resend API Response Examples

### Success Response:
```json
{
  "id": "mail_xyz123abc456",
  "from": "noreply@inmoapp.com",
  "to": "user@gmail.com",
  "created_at": "2025-11-14T20:00:00.000Z"
}
```

### Error Response (Current State):
```json
{
  "error": {
    "message": "Domain not verified",
    "type": "invalid_sender"
  }
}
```

---

## 🎯 Decision: What if Email Fails?

### Option A: Don't Fail Appointment (Recommended)

**Pros:**
- ✅ Appointment created successfully
- ✅ Email is just notification (not critical)
- ✅ User can see appointment in dashboard
- ✅ Agent can see appointment in their dashboard

**Cons:**
- ⚠️ User might not know appointment was created
- ⚠️ Agent might miss notification

**Implementation:**
```typescript
const emailResult = await sendAppointmentCreatedEmail({ ... })

if (!emailResult.success) {
  logger.warn('Email failed, but appointment created:', {
    appointmentId,
    error: emailResult.error
  })
}

return { success: true, warning: emailResult.success ? null : 'Email notification failed' }
```

---

### Option B: Fail Appointment if Email Fails (Strict)

**Pros:**
- ✅ User knows immediately something went wrong
- ✅ No ambiguity about notification status

**Cons:**
- ❌ Appointment not created (bad UX)
- ❌ User needs to retry entire form

**Implementation:**
```typescript
const emailResult = await sendAppointmentCreatedEmail({ ... })

if (!emailResult.success) {
  // Rollback appointment creation
  await db.appointment.delete({ where: { id: appointment.id } })

  throw new Error('No se pudo enviar email de confirmación. Por favor intenta nuevamente.')
}

return { success: true }
```

---

### Recommendation: **Option A**

Email is a notification mechanism, not a core business requirement. It's better to create the appointment successfully and log a warning than to fail the entire operation.

**Future enhancement:** Add retry mechanism or queue for failed emails.

---

## 🔮 Future Enhancements

### 1. Email Queue with Retry

```typescript
// apps/web/lib/email/email-queue.ts
import { Queue } from 'bullmq'

const emailQueue = new Queue('emails', {
  connection: redisConnection
})

export async function queueEmail(params) {
  await emailQueue.add('send-appointment-email', params, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  })
}
```

### 2. SMS Fallback

```typescript
// If email fails, send SMS via Twilio
if (!emailResult.success) {
  await sendSMSNotification({
    to: user.phone,
    message: 'Tu cita fue confirmada. Revisa tu dashboard.'
  })
}
```

### 3. In-App Notifications

```typescript
// Always create in-app notification (as backup)
await db.notification.create({
  data: {
    userId: user.id,
    type: 'APPOINTMENT_CREATED',
    title: 'Cita confirmada',
    message: 'Tu cita fue creada exitosamente',
    read: false
  }
})
```

---

## 💰 Cost Considerations

**Resend Pricing:**
- Free tier: 100 emails/day
- Pro plan: $20/month for 50,000 emails
- Enterprise: Custom pricing

**Current usage:**
- ~10 appointments/day = 20 emails/day (client + agent)
- Well within free tier

**At scale:**
- 1,000 appointments/month = 2,000 emails/month
- Still within free tier

**Recommendation:** Free tier is sufficient for MVP phase

---

## 📚 References

**Archivos relacionados:**
- `apps/web/lib/email/appointment-emails.ts` - Email sending logic
- `apps/web/app/actions/appointments.ts` - Server Action
- `apps/web/.env.local` - Contains RESEND_API_KEY
- `packages/env/src/index.ts` - Env validation

**Documentación:**
- `docs/features/EMAIL_SENDING_TODO.md` - Análisis original del problema
- [Resend Docs](https://resend.com/docs)
- [Resend Domain Verification](https://resend.com/docs/dashboard/domains/introduction)

---

## ✅ Success Criteria

### Phase 1 Complete:
- [x] Error messages visible in logs
- [x] Resend API responses logged with full details
- [x] Can see why emails are failing (or succeeding)
- [x] No silent failures

### Phase 2 Complete:
- [x] Domain verified in Resend Dashboard
- [x] Emails arrive in user inboxes
- [x] Sender appears as recognizable name (not test@resend.dev)
- [x] Both client and agent receive emails
- [x] Emails not in spam
- [x] All links in email work

---

**Última actualización:** Noviembre 14, 2025
**Status:** Bloqueado - Domain verification pendiente
**Priority:** 🔴 CRÍTICA - Funcionalidad de negocio
**Next step:** Verify domain in Resend (15 min)
