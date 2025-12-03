# Input Sanitization Implementation

> **Status**: ✅ IMPLEMENTED (Dec 3, 2025)
> **Location**: `packages/database/src/utils/sanitize.ts`
> **Coverage**: PropertyRepository, AppointmentRepository, UserRepository

---

## Overview

InmoApp implements comprehensive input sanitization using **DOMPurify** to prevent XSS (Cross-Site Scripting) attacks across all user-generated content.

**Defense in Depth Strategy:**
- **Layer 1**: Server Actions sanitize input before passing to repositories
- **Layer 2**: Repositories sanitize again before database insertion (implemented)
- **Layer 3**: Client-side sanitization on render (optional, for additional safety)

---

## Implementation

### Sanitization Helpers

**Location**: `packages/database/src/utils/sanitize.ts`

```typescript
// Plain text fields (no HTML allowed)
sanitizePlainText(text: string): string

// Rich text fields (safe HTML tags only)
sanitizeHTML(text: string): string

// Optional/nullable fields
sanitizeOptional(value: string | null, sanitizer): string | null

// Arrays of strings
sanitizeArray(values: string[], sanitizer): string[]

// Objects with multiple fields
sanitizeObject(obj, sanitizers): T
```

---

### Repository Integration

#### PropertyRepository

**Fields sanitized**:
- `title`: Plain text (no HTML)
- `description`: Rich text (allows <b>, <i>, <a>, <p>, <br>, <ul>, <ol>, <li>)
- `address`: Plain text
- `city`: Plain text
- `state`: Plain text
- `zipCode`: Plain text (optional)

**Methods**: `create()`, `update()`

**Example**:
```typescript
// User input (malicious)
const data = {
  title: "Casa hermosa <script>alert('XSS')</script>",
  description: "Con jardín <b>privado</b> <iframe src='evil.com'></iframe>",
  address: "Av. Ordoñez <img src=x onerror='alert(1)'>",
};

// After sanitization
{
  title: "Casa hermosa ",  // <script> removed
  description: "Con jardín <b>privado</b> ",  // <iframe> removed, <b> kept
  address: "Av. Ordoñez ",  // <img> removed
}
```

---

#### AppointmentRepository

**Fields sanitized**:
- `notes`: Plain text (optional)

**Methods**: `createAppointment()`

**Why plain text?**
- Appointment notes are internal messages between users and agents
- No need for rich formatting
- Plain text is safer and simpler

---

#### UserRepository

**Fields sanitized**:
- `name`: Plain text
- `phone`: Plain text (optional)

**Methods**: `update()`

**Note**: `avatar` is a URL and should be validated separately (not HTML sanitized)

---

## Allowed HTML Tags

### sanitizeHTML() - Rich Text Fields

**Allowed**:
- Text formatting: `<b>`, `<i>`, `<em>`, `<strong>`, `<u>`
- Paragraphs: `<p>`, `<br>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Links: `<a>` (with `href` and `target` attributes)

**Blocked**:
- Scripts: `<script>`, `<iframe>`, `<object>`, `<embed>`
- Events: `onclick`, `onerror`, `onload`, `onfocus`, etc.
- Styles: Inline styles with `javascript:` or `data:` URIs
- Forms: `<form>`, `<input>`, `<button>`, `<textarea>`
- Media: `<video>`, `<audio>` (can be added if needed)

**URI Validation**:
- Only allows `https://` and relative URLs (`/path`)
- Blocks `javascript:`, `data:`, `vbscript:`, etc.

---

### sanitizePlainText() - Plain Text Fields

**Behavior**: Removes ALL HTML tags and attributes

**Example**:
```typescript
sanitizePlainText("Cuenca <b>Ecuador</b>")
// Result: "Cuenca Ecuador"
```

---

## Attack Vectors Prevented

### 1. Script Injection
```html
<!-- Attack -->
<script>alert('XSS')</script>

<!-- Blocked -->
(empty string)
```

### 2. Event Handler Injection
```html
<!-- Attack -->
<img src=x onerror="alert(1)">

<!-- Blocked -->
<img src="x">  (sanitizeHTML)
or "" (sanitizePlainText)
```

### 3. CSS Injection
```html
<!-- Attack -->
<div style="background:url('javascript:alert(1)')">

<!-- Blocked -->
(style attribute removed)
```

### 4. iframe Embedding
```html
<!-- Attack -->
<iframe src="https://evil.com"></iframe>

<!-- Blocked -->
(empty string)
```

### 5. JavaScript Protocol
```html
<!-- Attack -->
<a href="javascript:alert(1)">Click</a>

<!-- Blocked -->
<a>Click</a>  (href removed)
```

### 6. Data URI XSS
```html
<!-- Attack -->
<a href="data:text/html,<script>alert(1)</script>">

<!-- Blocked -->
<a>text</a>  (href removed)
```

---

## Testing

### Unit Tests

**Location**: `packages/database/src/__tests__/utils/sanitize.test.ts`

**Coverage**: 32 tests covering:
- Script tag removal
- Event handler removal
- Allowed tag preservation
- JavaScript protocol blocking
- CSS injection prevention
- XSS attack vectors (9 common patterns)
- Optional field handling
- Array and object sanitization

**Run tests**:
```bash
cd packages/database
bunx vitest run src/__tests__/utils/sanitize.test.ts
```

**Expected**: 32/32 tests passing ✅

---

### Integration Tests

Integration tests are included in repository tests:

**PropertyRepository**:
```bash
cd packages/database
bunx vitest run src/__tests__/repositories/properties.test.ts
```

**AppointmentRepository**:
```bash
bunx vitest run src/__tests__/repositories/appointments.test.ts
```

**UserRepository**:
```bash
bunx vitest run src/__tests__/repositories/users.test.ts
```

---

## Manual Testing

### Test Script Injection

1. Go to `/dashboard/nueva-propiedad`
2. Create property with malicious input:
   ```
   Title: Casa hermosa <script>alert('XSS')</script>
   Description: Con jardín <b>privado</b> <img src=x onerror="alert(1)">
   ```
3. Submit form
4. Check database:
   ```sql
   SELECT title, description FROM properties ORDER BY created_at DESC LIMIT 1;
   ```
5. **Expected result**:
   ```
   title: "Casa hermosa "
   description: "Con jardín <b>privado</b> "
   ```

### Test Event Handlers

1. Try creating property with:
   ```
   Description: <div onclick="alert(1)">Click me</div>
   ```
2. **Expected**: `onclick` removed, only `<div>Click me</div>` saved

---

## Maintenance

### Adding New User Input Fields

When adding new user-input fields to the schema:

1. **Identify field type**:
   - Plain text? Use `sanitizePlainText`
   - Rich text (needs formatting)? Use `sanitizeHTML`
   - Optional? Use `sanitizeOptional`

2. **Add to repository**:
   ```typescript
   // In Repository create/update methods
   const sanitizedData = {
     ...data,
     newField: sanitizePlainText(data.newField),
   };
   ```

3. **Add tests**:
   ```typescript
   it('should sanitize newField on create', () => {
     const dirty = { newField: 'Value <script>alert(1)</script>' };
     const clean = await repo.create(dirty);
     expect(clean.newField).toBe('Value ');
   });
   ```

---

### Modifying Allowed HTML Tags

To allow additional HTML tags (e.g., `<video>` for property videos):

1. **Edit** `packages/database/src/utils/sanitize.ts`:
   ```typescript
   export function sanitizeHTML(dirty: string): string {
     return DOMPurify.sanitize(dirty, {
       ALLOWED_TAGS: [
         'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
         'video',  // ← Add new tag
       ],
       ALLOWED_ATTR: [
         'href', 'target',
         'src', 'controls',  // ← Add video attributes
       ],
     });
   }
   ```

2. **Add tests**:
   ```typescript
   it('should allow video tags', () => {
     const dirty = '<video src="video.mp4" controls></video>';
     const clean = sanitizeHTML(dirty);
     expect(clean).toContain('<video');
   });
   ```

3. **Document change** in this file

---

## Security Considerations

### What Sanitization Does

✅ **Protects against**:
- XSS attacks via user input
- Script injection
- Event handler injection
- CSS injection
- iframe embedding
- JavaScript protocol abuse

### What Sanitization Does NOT Do

❌ **Does not protect against**:
- SQL injection (use Prisma parameterized queries)
- CSRF attacks (use Task 4.4 implementation)
- Server-side template injection
- Command injection
- Path traversal

**Note**: Sanitization is ONE layer of defense. Always combine with:
- Input validation (Zod schemas)
- Output encoding
- Content Security Policy (Task 4.1)
- Rate limiting (Task 4.3)
- CSRF protection (Task 4.4)

---

## Related Documentation

- **Implementation**: `packages/database/src/utils/sanitize.ts`
- **Tests**: `packages/database/src/__tests__/utils/sanitize.test.ts`
- **Security Headers**: `docs/security/SECURITY_HEADERS.md`
- **Technical Debt**: `docs/technical-debt/01-INFRASTRUCTURE.md`
- **Roadmap**: `docs/ROADMAP.md` (Phase 2, Week 4, Task 4.2)

---

## References

- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP Top 10 - A03:2021 Injection](https://owasp.org/Top10/A03_2021-Injection/)
- [MDN: XSS Attacks](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting)

---

**Last updated**: Dec 3, 2025
**Next review**: After production launch (Apr 2026)
**Owner**: Security Team
