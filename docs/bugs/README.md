# 🐛 Bug Tracking - InmoApp

Este directorio contiene documentación formal de bugs conocidos, con sus respectivas soluciones y estado de tracking.

---

## 📋 Bug Registry

| ID | Title | Priority | Status | Reported | Fixed |
|----|-------|----------|--------|----------|-------|
| BUG-001 | [Subscription Tier Not Set on Signup](./SUBSCRIPTION_TIER_SIGNUP_BUG.md) | 🔴 CRITICAL | 🟡 OPEN | Dec 9, 2025 | - |

---

## 🏷️ Priority Levels

- 🔴 **CRITICAL**: Blocks launch, revenue impact, data corruption
- 🟠 **HIGH**: Major feature broken, significant UX impact
- 🟡 **MEDIUM**: Minor feature issue, workaround available
- 🟢 **LOW**: Cosmetic issue, no functional impact

---

## 📊 Status Definitions

- 🔴 **OPEN**: Bug identified, not yet started
- 🟡 **IN PROGRESS**: Fix in development
- 🟢 **FIXED**: Fix deployed to production
- ⚫ **CLOSED**: Verified fixed and closed

---

## 📝 Bug Report Template

When creating a new bug report, use this structure:

```markdown
# 🐛 BUG REPORT: [Title]

**Issue ID:** BUG-XXX
**Reported:** [Date]
**Priority:** [Level]
**Status:** [Status]
**Estimated Fix Time:** [Hours/Days]

## 📋 Summary
[Brief description]

## 🎯 Impact
[User, business, technical impact]

## 🔍 Root Cause Analysis
[What's causing the bug]

## 🧪 How to Reproduce
[Step-by-step reproduction]

## ✅ Proposed Solution
[How to fix it]

## 🔧 Implementation Steps
[Concrete steps to implement fix]

## 🧪 Testing Checklist
[How to verify fix works]

## 🚨 Rollback Plan
[How to undo if needed]
```

---

## 🔗 Quick Links

- [Bug-001: Subscription Tier Issue](./SUBSCRIPTION_TIER_SIGNUP_BUG.md)
- [Migration SQL: Tier Fix](../../packages/database/migrations/fix-subscription-tier-sync.sql)

---

## 📞 Reporting New Bugs

1. Create new file: `docs/bugs/[DESCRIPTIVE-NAME].md`
2. Assign next BUG-XXX ID
3. Follow template structure
4. Add entry to registry above
5. Link related migration/fix files

---

**Last Updated:** December 9, 2025
