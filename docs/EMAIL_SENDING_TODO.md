# Email Sending Implementation TODO

**Status:** ⚠️ In Progress - Emails not being delivered to real addresses
**Priority:** High (users need confirmation emails)
**Created:** Oct 27, 2025

---

## Problem Summary

Currently using `test@resend.dev` as sender, which:
- ✅ Doesn't crash the Server Actions
- ✅ Module loads without errors
- ❌ **Does NOT deliver emails to real addresses** (gmail, outlook, etc.)
- ❌ No error messages (fails silently)

**Evidence:**
- Web UI shows success notification for appointment creation
- BUT: No emails arrive in user inboxes
- Resend Dashboard shows activity but emails may be bouncing/rejected

---

## Root Causes

### 1. Sender Address Limitation
```typescript
// Current (WRONG)
from: "test@resend.dev"  // ← Only works with other @resend.dev addresses

// Needed
from: "noreply@yourdomain.com"  // ← Requires domain verification in Resend
```

### 2. No Error Handling in Server Actions
```typescript
// apps/web/app/actions/appointments.ts:125-134
await sendAppointmentCreatedEmail({...});
// Returns success: true WITHOUT checking if email actually sent!

// Need to add:
const emailResult = await sendAppointmentCreatedEmail({...});
if (!emailResult.success) {
  console.warn("Email failed:", emailResult.error);
}
```

### 3. Silent Failures in Email Service
```typescript
// apps/web/lib/email/appointment-emails.ts:97-117
catch (error) {
  console.error("[sendAppointmentCreatedEmail] Error:", error);
  return { success: false, error: "Failed to send..." };
  // Returns object, not thrown - Server Action doesn't know about it
}
```

---

## Implementation Plan

### Phase 1: Enhanced Error Handling (QUICK - Do First)
**Time:** 30 mins | **Impact:** Better visibility into what's failing

**Tasks:**
1. [ ] Modify `apps/web/app/actions/appointments.ts`:
   - Check result of `sendAppointmentCreatedEmail()`
   - Log warnings if email fails
   - Consider: Should we fail the appointment creation if email fails?
     - Option A: Don't fail (cita created, email is just notification)
     - Option B: Fail (user knows something is wrong)

2. [ ] Enhance `apps/web/lib/email/appointment-emails.ts`:
   - Add detailed logging of Resend API responses
   - Log full error objects, not just messages
   - Track email IDs when successful

3. [ ] Test and verify:
   - Create test appointment
   - Check console logs for what Resend returns
   - Go to Resend Dashboard → Activity tab to see actual status

**Files to Update:**
- `apps/web/app/actions/appointments.ts`
- `apps/web/lib/email/appointment-emails.ts`

**Commit Message:**
```
fix(email): add error handling for Resend email notifications

- Check email result in Server Actions
- Log Resend API responses for debugging
- See actual reasons why emails fail
```

---

### Phase 2: Verify Domain in Resend (PROPER SOLUTION)
**Time:** 15 mins setup + wait for DNS propagation
**Impact:** Emails actually delivered to users

**Steps:**
1. [ ] Go to https://resend.com/emails (Resend Dashboard)
2. [ ] Click "Domains" or "Add Domain"
3. [ ] Enter your domain:
   - For local dev: Skip (test with Phase 3)
   - For production: Use actual domain (e.g., `inmoapp.com`)
   - For staging: Can use subdomain (e.g., `staging.inmoapp.com`)

4. [ ] Add DNS records (CNAME + MX):
   - Copy values from Resend Dashboard
   - Add to your DNS provider (Cloudflare, Route53, etc.)
   - Wait 5-30 mins for propagation

5. [ ] Update code:
   ```typescript
   // apps/web/lib/email/appointment-emails.ts
   from: "noreply@inmoapp.com"  // or noreply@yourdomain.com
   ```

6. [ ] Test:
   - Create appointment
   - Check inbox for actual email
   - Should arrive within 30 seconds

**Files to Update:**
- `apps/web/lib/email/appointment-emails.ts` (from field)
- `apps/web/.env.example` (add RESEND_FROM_DOMAIN note)
- `CLAUDE.md` (document which domain is verified)

**Commit Message:**
```
feat(email): add domain verification support for Resend

- Update sender from test@resend.dev to noreply@yourdomain.com
- Domain verification completed in Resend Dashboard
- Emails now delivered to real user addresses
- Updated documentation with DNS configuration
```

---

### Phase 3: Alternative - Resend Test Tenants
**Time:** 5 mins
**Impact:** Can test with temporary verified addresses

If you don't have a domain ready:
1. Go to https://resend.com/emails
2. Look for "Test Email" or "Preview Mode"
3. Get temporary test addresses to send to
4. Use in development only

**Not recommended for production**

---

## Testing Checklist

After implementing Phase 1:
- [ ] Create appointment via web UI
- [ ] Check browser console for logs
- [ ] Check server logs for `[sendAppointmentCreatedEmail]` messages
- [ ] Go to Resend Dashboard → Activity
- [ ] Look for the email attempts
- [ ] Identify the actual Resend API error

After implementing Phase 2:
- [ ] Create appointment via web UI
- [ ] Check email inbox (wait 30 seconds)
- [ ] Email should be there with appointment details
- [ ] Verify sender is `noreply@yourdomain.com`
- [ ] Click any links in email - verify they work
- [ ] Check that both client and agent emails arrived

---

## Resend API Response Example

When Resend successfully sends:
```typescript
{
  id: "mail_xyz123",
  from: "noreply@inmoapp.com",
  to: "user@gmail.com",
  created_at: "2025-10-27T20:00:00.000Z"
}
```

When it fails (what we need to see):
```typescript
{
  error: "Invalid 'from' address",
  // or
  error: "Domain not verified",
  // or
  error: "Invalid email format"
}
```

---

## Related Files

- `apps/web/lib/email/appointment-emails.ts` - Email sending logic
- `apps/web/app/actions/appointments.ts` - Server action that calls email
- `apps/web/.env.local` - Contains RESEND_API_KEY
- `packages/env/src/index.ts` - Env validation schema

---

## Timeline

- **Phase 1 (Error Handling):** Do this week to understand the problem
- **Phase 2 (Domain Verify):** Do before launch to production
- **Phase 3 (Alternative):** Only if Phase 2 is blocked

---

## Questions to Answer

- [ ] What error is Resend actually returning?
- [ ] Should appointment creation fail if email fails?
- [ ] What domain should be used for production?
- [ ] Should we add email bounce handling?
- [ ] Do we need SMS fallback?

---

## Success Criteria

✅ Error messages visible in logs
✅ Resend API responses logged with full details
✅ Can see why emails are failing (or succeeding)
✅ Emails arrive in user inboxes
✅ Sender appears as recognizable name (not test@resend.dev)
✅ No silent failures - all email issues visible
