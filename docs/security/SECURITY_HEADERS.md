# Security Headers

**Status:** ✅ **IMPLEMENTED** (Noviembre 16, 2025)

**Related:** `apps/web/next.config.ts` | `docs/technical-debt/01-INFRASTRUCTURE.md` (Section 1.3)

---

## Overview

Comprehensive security headers implemented to protect against common web vulnerabilities including XSS, clickjacking, MIME sniffing, and other OWASP Top 10 threats.

---

## Headers Implemented

### 1. Content-Security-Policy (CSP)

**Purpose:** Prevents XSS attacks by controlling which resources can be loaded

**Configuration:**

```typescript
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com https://accounts.google.com https://www.googletagmanager.com;
style-src 'self' 'unsafe-inline' https://api.mapbox.com;
img-src 'self' data: blob: https://*.supabase.co https://*.tiles.mapbox.com https://api.mapbox.com;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co https://api.mapbox.com https://events.mapbox.com https://accounts.google.com wss://*.supabase.co;
frame-src 'self' https://accounts.google.com;
worker-src 'self' blob:;
child-src 'self' blob:;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests; // (production only)
```

**Allowed Domains:**
- **Supabase** (`*.supabase.co`): Storage for property images
- **Mapbox** (`api.mapbox.com`, `*.tiles.mapbox.com`): Map rendering and tiles
- **Google** (`accounts.google.com`): OAuth authentication
- **Self**: Same-origin resources

**Notes:**
- `unsafe-eval` and `unsafe-inline` allowed for:
  - Next.js HMR (development)
  - Tailwind CSS inline styles
  - Mapbox GL JS runtime code execution
- `upgrade-insecure-requests` only in production (forces HTTPS)

---

### 2. X-Frame-Options: DENY

**Purpose:** Prevents clickjacking attacks by blocking iframe embedding

**Value:** `DENY`

**Effect:** Page cannot be embedded in any iframe, even from same origin

---

### 3. X-Content-Type-Options: nosniff

**Purpose:** Prevents MIME type sniffing

**Value:** `nosniff`

**Effect:** Browser respects declared Content-Type, prevents executing non-executable files

---

### 4. Strict-Transport-Security (HSTS)

**Purpose:** Forces HTTPS connections

**Value:** `max-age=63072000; includeSubDomains; preload`

**Effect:**
- All requests forced to HTTPS for 2 years (63072000 seconds)
- Applies to all subdomains
- Eligible for browser HSTS preload list

---

### 5. Referrer-Policy

**Purpose:** Controls referrer information sent with requests

**Value:** `origin-when-cross-origin`

**Effect:**
- Same-origin: Full URL sent as referrer
- Cross-origin: Only origin sent (no path/query)

---

### 6. Permissions-Policy

**Purpose:** Restricts browser features

**Value:** `camera=(), microphone=(), geolocation=(self), interest-cohort=()`

**Effect:**
- Camera: Blocked
- Microphone: Blocked
- Geolocation: Allowed only for same-origin
- FLoC (interest-cohort): Blocked (privacy)

---

### 7. X-DNS-Prefetch-Control

**Purpose:** Enables DNS prefetching for faster navigation

**Value:** `on`

**Effect:** Browser can preemptively resolve domain names

---

## Testing Security Headers

### Method 1: Browser DevTools

1. Open browser DevTools (F12)
2. Navigate to Network tab
3. Load any page
4. Click on the document request
5. Check "Response Headers" section

**Expected headers:**
```
Content-Security-Policy: default-src 'self'; script-src ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Referrer-Policy: origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self), interest-cohort=()
X-DNS-Prefetch-Control: on
```

---

### Method 2: curl Command

```bash
# Local development
curl -I http://localhost:3000 | grep -E "Content-Security-Policy|X-Frame-Options|X-Content-Type|Strict-Transport|Referrer-Policy|Permissions-Policy"

# Production
curl -I https://yourdomain.com | grep -E "Content-Security-Policy|X-Frame-Options|X-Content-Type|Strict-Transport|Referrer-Policy|Permissions-Policy"
```

**Expected output:**
```
Content-Security-Policy: default-src 'self'; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Referrer-Policy: origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self), interest-cohort=()
```

---

### Method 3: Online Security Scanner

Use https://securityheaders.com to get a comprehensive security rating:

1. Visit https://securityheaders.com
2. Enter your production URL
3. Click "Scan"

**Expected Grade:** A or A+

---

## CSP Violations Monitoring

### Development

CSP violations will appear in browser console:

```
[Report Only] Refused to load the script 'https://evil.com/malicious.js'
because it violates the following Content Security Policy directive: "script-src 'self' ..."
```

---

### Production (Future Enhancement)

Add CSP reporting endpoint:

```typescript
// In next.config.ts CSP
"report-uri /api/csp-report"
```

Then create `/api/csp-report/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const report = await request.json()

  // Log to monitoring service (Sentry, DataDog, etc.)
  console.error('CSP Violation:', report)

  return NextResponse.json({ received: true })
}
```

---

## Troubleshooting

### Issue: Map not loading

**Symptom:** Mapbox map shows blank screen

**Cause:** CSP blocking Mapbox resources

**Solution:** Verify these CSP directives:
```
script-src ... https://api.mapbox.com
style-src ... https://api.mapbox.com
img-src ... https://*.tiles.mapbox.com https://api.mapbox.com
connect-src ... https://api.mapbox.com https://events.mapbox.com
worker-src ... blob:
```

---

### Issue: Google OAuth not working

**Symptom:** "Refused to display in a frame" error

**Cause:** CSP blocking Google OAuth iframe

**Solution:** Verify these CSP directives:
```
script-src ... https://accounts.google.com
frame-src ... https://accounts.google.com
connect-src ... https://accounts.google.com
```

---

### Issue: Images not loading from Supabase

**Symptom:** Property images return 403 or don't display

**Cause:** CSP blocking Supabase storage

**Solution:** Verify these CSP directives:
```
img-src ... https://*.supabase.co
connect-src ... https://*.supabase.co wss://*.supabase.co
```

---

### Issue: Styles not applying

**Symptom:** Page appears unstyled

**Cause:** CSP blocking inline styles

**Solution:** `unsafe-inline` is already allowed for Tailwind. If issue persists:
1. Check browser console for CSP violations
2. Verify `style-src 'self' 'unsafe-inline'` is present
3. Consider using nonces for stricter CSP (advanced)

---

## Future Enhancements

### 1. CSP Nonces (Recommended)

Replace `unsafe-inline` with nonces for better security:

```typescript
// middleware.ts or layout.tsx
const nonce = crypto.randomBytes(16).toString('base64')

// In CSP
`script-src 'self' 'nonce-${nonce}'`

// In HTML
<script nonce={nonce}>...</script>
```

---

### 2. Report-Only Mode

Before enforcing strict CSP, test with Report-Only:

```typescript
{
  key: 'Content-Security-Policy-Report-Only',
  value: '...'
}
```

This logs violations without blocking resources.

---

### 3. Subresource Integrity (SRI)

Add integrity checks for external scripts:

```html
<script
  src="https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

---

### 4. Remove unsafe-eval in Production

Investigate removing `unsafe-eval` by:
1. Pre-compiling Mapbox workers
2. Using static imports where possible
3. Testing map functionality without `unsafe-eval`

---

## Security Checklist

After deploying to production, verify:

- [ ] All headers present in response (use curl or DevTools)
- [ ] CSP violations logged and monitored
- [ ] Map loads correctly (Mapbox)
- [ ] Google OAuth works
- [ ] Supabase images load
- [ ] No console errors related to CSP
- [ ] SecurityHeaders.com grade: A or A+
- [ ] Manual penetration test (try XSS, clickjacking)

---

## References

**OWASP:**
- [Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [HTTP Security Response Headers](https://owasp.org/www-project-secure-headers/)

**MDN:**
- [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
- [Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)

**Tools:**
- [SecurityHeaders.com](https://securityheaders.com) - Online scanner
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Google's CSP validator

---

**Last updated:** November 16, 2025
**Status:** Production-ready
**Maintainer:** See `docs/technical-debt/01-INFRASTRUCTURE.md`
