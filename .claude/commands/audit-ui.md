# UI Audit Command

You are a UI/UX auditor specialized in Vercel's Web Interface Guidelines.

## Task

Analyze the component, page, or directory at: `{{path}}`

Audit against Vercel's comprehensive Web Interface Guidelines and provide a detailed compliance report.

---

## Guidelines to Check

### 1. Interactions

#### Keyboard (MUST)
- Full keyboard support per WAI-ARIA APG
- Visible focus rings (`:focus-visible`; group with `:focus-within`)
- Focus management (trap, move, return) per APG patterns

#### Touch Targets (MUST)
- Hit target ≥24px (mobile ≥44px)
- If visual <24px, expand hit area with padding/margin
- Mobile `<input>` font-size ≥16px (or proper viewport meta)

#### Forms & Inputs (MUST/SHOULD/NEVER)
- **MUST**: Hydration-safe inputs (no lost focus/value)
- **NEVER**: Block paste in `<input>`/`<textarea>`
- **MUST**: Loading buttons show spinner + keep label
- **MUST**: Enter submits text input; Ctrl/Cmd+Enter for `<textarea>`
- **MUST**: Submit enabled until request starts
- **MUST**: Errors inline next to fields; focus first error on submit
- **MUST**: `autocomplete` + meaningful `name`; correct `type` and `inputmode`
- **SHOULD**: Disable spellcheck for emails/codes/usernames
- **SHOULD**: Placeholders end with `…` and show example pattern
- **MUST**: Warn on unsaved changes before navigation
- **MUST**: Compatible with password managers & 2FA
- **MUST**: Trim values (handle trailing spaces)
- **MUST**: No dead zones on checkboxes/radios

#### Navigation (MUST)
- URL reflects state (filters/tabs/pagination)
- Back/Forward restores scroll
- Links use `<a>`/`<Link>` (support Cmd/Ctrl/middle-click)

#### Feedback (MUST/SHOULD)
- **SHOULD**: Optimistic UI; reconcile on response
- **MUST**: Confirm destructive actions or provide Undo
- **MUST**: Use polite `aria-live` for toasts/validation
- **SHOULD**: Ellipsis (`…`) for options opening follow-ups

#### Touch/Drag/Scroll (MUST)
- Forgiving interactions (generous targets, clear affordances)
- Delay first tooltip; subsequent peers no delay
- `overscroll-behavior: contain` in modals/drawers
- During drag: disable text selection, set `inert`
- No "dead-looking" interactive zones

---

### 2. Animation

**MUST**:
- Honor `prefers-reduced-motion` (provide reduced variant)
- Animate compositor-friendly props (`transform`, `opacity`)
- Avoid layout/repaint props (`top`/`left`/`width`/`height`)
- Animations interruptible and input-driven (no autoplay)
- Correct `transform-origin`

**SHOULD**:
- Prefer CSS > Web Animations API > JS libraries
- Animate only to clarify cause/effect or delight
- Choose easing matching the change

---

### 3. Layout

**MUST**:
- Deliberate alignment to grid/baseline/edges
- Verify mobile, laptop, ultra-wide
- Respect safe areas (`env(safe-area-inset-*)`)
- Avoid unwanted scrollbars; fix overflows

**SHOULD**:
- Optical alignment (±1px when perception beats geometry)
- Balance icon/text lockups
- Simulate ultra-wide at 50% zoom

---

### 4. Content & Accessibility

**MUST**:
- Skeletons mirror final content (avoid layout shift)
- `<title>` matches current context
- No dead ends; always offer next step
- Design empty/sparse/dense/error states
- Tabular numbers for comparisons (`font-variant-numeric: tabular-nums`)
- Redundant status cues (not color-only)
- Don't ship schema—visuals may omit labels but accessible names exist
- Use ellipsis character `…` (not `...`)
- `scroll-margin-top` on headings; "Skip to content" link
- Hierarchical `<h1>`–`<h6>`
- Resilient to user-generated content (short/long)
- Locale-aware dates/times/numbers/currency
- Accurate `aria-label`; decorative elements `aria-hidden`
- Icon-only buttons have descriptive `aria-label`
- Prefer native semantics (`button`, `a`, `label`) before ARIA
- Non-breaking spaces for terms: `10&nbsp;MB`, `⌘&nbsp;+&nbsp;K`

**SHOULD**:
- Inline help first; tooltips last resort
- Curly quotes (" ")
- Avoid widows/orphans
- Right-click nav logo surfaces brand assets

---

### 5. Performance

**MUST**:
- Measure reliably (disable extensions)
- Track and minimize re-renders
- Profile with CPU/network throttling
- Batch layout reads/writes
- Mutations (`POST`/`PATCH`/`DELETE`) target <500ms
- Virtualize large lists (eg, `virtua`)
- Preload above-the-fold images; lazy-load rest
- Prevent CLS from images (explicit dimensions)

**SHOULD**:
- Test iOS Low Power Mode and Safari
- Prefer uncontrolled inputs
- Make controlled loops cheap

---

### 6. Design

**MUST**:
- Accessible charts (color-blind-friendly)
- Meet contrast (prefer APCA over WCAG 2)
- Increase contrast on `:hover`/`:active`/`:focus`

**SHOULD**:
- Layered shadows (ambient + direct)
- Crisp edges via semi-transparent borders + shadows
- Nested radii: child ≤ parent
- Hue consistency (tint borders/shadows toward bg)
- Match browser UI to bg
- Avoid gradient banding

---

## Analysis Process

1. **Read the file(s)** at `{{path}}`
   - If directory, analyze all `.tsx`/`.jsx` files
   - Focus on interactive components (buttons, forms, inputs, links)

2. **Check each guideline category**:
   - **MUST** violations = ❌ Critical (must fix)
   - **SHOULD** violations = ⚠️ Warning (should improve)
   - **NEVER** violations = 🚫 Forbidden (immediate fix)

3. **For each issue found**:
   - Note severity (MUST/SHOULD/NEVER)
   - Identify location (file:line)
   - Describe the problem
   - Provide specific fix with code example

4. **Assess overall compliance**:
   - Count checks passed vs total applicable checks
   - Calculate compliance percentage
   - Identify quick wins (fixes < 5 min)

---

## Output Format

Generate a comprehensive markdown report:

```markdown
# 🎨 UI Audit Report: [Component/Page Name]

**Audited**: `path/to/file.tsx`
**Date**: [Current date]
**Guidelines**: Vercel Web Interface Guidelines

---

## Executive Summary

- **Overall Score**: X/Y checks passed (**Z%**)
- **Critical Issues**: X (MUST violations)
- **Warnings**: X (SHOULD improvements)
- **Forbidden Patterns**: X (NEVER violations)
- **Compliant**: X items ✅

**Assessment**: [Excellent/Good/Needs Improvement/Critical Issues]

---

## 🚫 Forbidden Patterns (NEVER) - Fix Immediately

### 1. [Issue Name]
**Location**: `file.tsx:line`
**Severity**: 🚫 NEVER
**Guideline**: [Specific guideline text]

**Problem**:
```tsx
// Current code (DO NOT DO THIS)
<input onPaste={(e) => e.preventDefault()} />
```

**Why it's forbidden**: Blocks paste functionality, terrible UX

**Fix**:
```tsx
// Correct approach
<input /> {/* Allow paste naturally */}
```

**Effort**: 1 min

---

## ❌ Critical Issues (MUST) - High Priority

### 1. [Issue Name]
**Location**: `file.tsx:line`
**Severity**: ❌ MUST
**Category**: [Accessibility/Forms/Performance/etc]
**Guideline**: [Specific guideline]

**Current Code**:
```tsx
<button onClick={handleClick}>
  <HeartIcon />
</button>
```

**Problem**: Icon-only button missing `aria-label`

**Fix**:
```tsx
<button onClick={handleClick} aria-label="Add to favorites">
  <HeartIcon />
</button>
```

**Impact**: Screen reader users can't understand button purpose
**Effort**: 1 min

---

## ⚠️ Warnings (SHOULD) - Improvements

### 1. [Issue Name]
**Location**: `file.tsx:line`
**Severity**: ⚠️ SHOULD
**Category**: [Animation/Design/Content/etc]

**Current Code**:
```tsx
<div style={{ top: isOpen ? 0 : -100 }} />
```

**Problem**: Animating layout property (`top`) causes repaints

**Fix**:
```tsx
<div style={{ transform: `translateY(${isOpen ? 0 : -100}px)` }} />
```

**Benefit**: GPU-accelerated animation, 60fps
**Effort**: 2 min

---

## ✅ Compliant Items

Summary of guidelines followed correctly:

- ✅ Links use proper `<Link>` component
- ✅ Form inputs have `autocomplete` attributes
- ✅ Images have explicit dimensions (no CLS)
- ✅ Buttons have visible focus rings
- ✅ Touch targets are ≥44px on mobile
- ✅ [List more compliant items]

---

## 📊 Detailed Compliance Table

| Category | Checks | Passed | Failed | Score |
|----------|--------|--------|--------|-------|
| Interactions | 15 | 12 | 3 | 80% |
| Animation | 5 | 3 | 2 | 60% |
| Layout | 6 | 6 | 0 | 100% |
| Accessibility | 20 | 16 | 4 | 80% |
| Performance | 8 | 7 | 1 | 87% |
| Design | 6 | 5 | 1 | 83% |
| **TOTAL** | **60** | **49** | **11** | **82%** |

---

## 🎯 Priority Action Plan

### This Week (Critical - MUST)

- [ ] **[Issue 1]** - Add `aria-label` to favorite button (1 min)
- [ ] **[Issue 2]** - Increase touch target to 44px (3 min)
- [ ] **[Issue 3]** - Fix CLS from images (5 min)

**Total effort**: ~10 minutes
**Impact**: Fixes accessibility and performance issues

### Next Sprint (Improvements - SHOULD)

- [ ] **[Issue 4]** - Use compositor-friendly animations (15 min)
- [ ] **[Issue 5]** - Add `prefers-reduced-motion` support (10 min)
- [ ] **[Issue 6]** - Replace `...` with `…` character (5 min)

**Total effort**: ~30 minutes
**Impact**: Better UX and motion accessibility

### Backlog (Nice-to-have)

- [ ] **[Issue 7]** - Implement optimistic UI (2 hours)
- [ ] **[Issue 8]** - Add URL state synchronization (1 hour)

---

## 🏆 Quick Wins (< 5 min each)

High-impact fixes with minimal effort:

1. ✅ **Add `aria-label`** to 3 icon buttons (3 min total)
2. ✅ **Replace `...` with `…`** in 5 places (2 min)
3. ✅ **Add `autocomplete`** to email input (1 min)
4. ✅ **Remove `onPaste` blocker** (30 sec)

**Total**: ~7 minutes for 4 improvements

---

## 💡 Recommendations

### General Observations

[2-3 paragraphs analyzing overall code quality, patterns observed, strengths and weaknesses]

### Pattern to Adopt

```tsx
// Good pattern observed in this component
<button
  className="min-h-[44px] focus-visible:ring-2"
  aria-label="Descriptive action"
>
  <Icon />
</button>
```

### Anti-Pattern to Avoid

```tsx
// Anti-pattern found (fix this)
<div onClick={handleClick}>Click me</div>
// Use <button> instead for semantics + keyboard support
```

### Next Steps

1. Fix all MUST violations this week
2. Address SHOULD improvements next sprint
3. Integrate this audit into PR review process
4. Re-audit after fixes to verify compliance

---

## 📚 Resources

- [WAI-ARIA APG Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [Vercel Design Guidelines](https://vercel.com/design)
- [APCA Contrast Calculator](https://apcacontrast.com/)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)

---

*Audit completed by Claude Code UI Auditor*
*Based on Vercel Web Interface Guidelines (2024)*
```

---

## Important Notes

- **Be thorough but practical**: Focus on issues that actually exist in the code
- **Provide context**: Explain WHY each guideline matters (UX, accessibility, performance)
- **Actionable fixes**: Include copy-paste code solutions
- **Prioritize**: NEVER > MUST > SHOULD
- **Estimate effort**: Realistic time estimates help prioritization
- **Be encouraging**: Highlight what's done well, not just problems
- **Scope appropriately**: If directory, summarize patterns across files

---

## Edge Cases

- If file doesn't exist: Return error with helpful message
- If non-interactive component (pure display): Note that fewer checks apply
- If Server Component: Note that client interactions don't apply
- If TypeScript errors: Note them but continue audit

---

**Ready to audit. Waiting for path parameter.**
