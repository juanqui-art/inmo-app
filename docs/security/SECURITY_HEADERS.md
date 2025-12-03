# Security Headers Implementation

> **Status**: ✅ IMPLEMENTED (Dec 3, 2025)
> **Location**: `apps/web/proxy.ts`
> **Environment-Aware**: Development (permissive) | Production (strict)

---

## Overview

InmoApp implements 7 critical HTTP security headers via Next.js 16 proxy (middleware):

| Header | Purpose | Environment |
|--------|---------|-------------|
| **Content-Security-Policy** | Prevent XSS attacks | Dev: Permissive, Prod: Strict |
| **X-Frame-Options** | Prevent clickjacking | Both: DENY |
| **X-Content-Type-Options** | Prevent MIME sniffing | Both: nosniff |
| **Referrer-Policy** | Control referrer leaks | Both: origin-when-cross-origin |
| **Permissions-Policy** | Restrict browser features | Both: Restrictive |
| **X-DNS-Prefetch-Control** | Enable DNS prefetching | Both: on |
| **Strict-Transport-Security** | Force HTTPS | Production only |

---

## Implementation Details

### 1. Content Security Policy (CSP)

**Development CSP** (Permissive for Fast Refresh/HMR):
- 'unsafe-eval': Required for Next.js Fast Refresh
- 'unsafe-inline': Required for HMR style injection
- ws: wss:: Required for WebSocket connections (HMR)
- https://*: Allows all HTTPS images for easier development

**Production CSP** (Strict whitelist):
- Vercel Analytics, Supabase, Mapbox, OpenAI, Google OAuth whitelisted
- No 'unsafe-eval' (XSS risk removed)
- upgrade-insecure-requests added

### 2. X-Frame-Options: DENY

Prevents clickjacking attacks by disallowing site embedding in iframes.

### 3. X-Content-Type-Options: nosniff

Prevents browsers from MIME-sniffing responses away from declared content-type.

### 4. Referrer-Policy: origin-when-cross-origin

Controls referrer information sent with requests (full URL same-origin, origin only cross-origin).

### 5. Permissions-Policy

Restricts browser APIs: camera=(), microphone=(), geolocation=(self), interest-cohort=()

### 6. X-DNS-Prefetch-Control: on

Enables DNS prefetching for performance optimization.

### 7. Strict-Transport-Security (HSTS)

Production only: Forces HTTPS for 2 years with subdomains. Not applied in dev (localhost uses HTTP).

---

## Testing

### Automated Testing

**Script**: `apps/web/scripts/test-security-headers.sh`

```bash
# Test development
./scripts/test-security-headers.sh

# Test production
./scripts/test-security-headers.sh https://inmoapp.vercel.app
```

### Manual Testing

```bash
# Development
curl -I http://localhost:3000 | grep -i "content-security-policy\|x-frame-options"

# Production
curl -I https://inmoapp.vercel.app | grep -i "strict-transport"
```

---

## Troubleshooting

### CSP blocking resources

Add domain to appropriate directive in proxy.ts production CSP.

### Fast Refresh not working

Verify dev CSP includes 'unsafe-eval', 'unsafe-inline', and ws: wss:

### HSTS breaking localhost

Clear browser HSTS cache (chrome://net-internals/#hsts for Chrome).

---

## Maintenance

### Adding new third-party service

1. Identify required domains (script, API, frames)
2. Update production CSP in proxy.ts
3. Test in staging/preview deployment
4. Verify no CSP violations in console
5. Merge to main

---

## Security Audit Checklist

- [ ] Run test script on production URL
- [ ] Verify all 7 headers present
- [ ] Confirm no 'unsafe-eval' in production
- [ ] Test all user flows for CSP violations
- [ ] Run Lighthouse security audit
- [ ] Scan with securityheaders.com (target: A+)

---

**Last updated**: Dec 3, 2025
**Next review**: After production launch (Apr 2026)
**Owner**: Security Team
