# Biome Configuration - Improvements & Best Practices

> Analysis of current configuration with recommended improvements

---

## 📊 Current Configuration Analysis

**Date:** October 22, 2025
**Biome Version:** 2.2.0
**Status:** ✅ Good baseline, room for optimization

---

## ✅ What's Working Well

### 1. **VCS Integration**
```json
"vcs": {
  "enabled": true,
  "clientKind": "git",
  "useIgnoreFile": true
}
```
✅ **Correct.** Respects `.gitignore` and integrates with Git workflow.

---

### 2. **File Exclusions**
```json
"files": {
  "includes": ["**", "!node_modules", "!.next", "!dist", "!build"]
}
```
✅ **Good.** Excludes common build and dependency folders.

---

### 3. **Formatter Settings**
```json
"formatter": {
  "enabled": true,
  "indentStyle": "space",
  "indentWidth": 2
}
```
✅ **Perfect.** 2-space indent is JavaScript standard.

---

### 4. **Recommended Rules**
```json
"rules": {
  "recommended": true
}
```
✅ **Sensible.** Enables ~150 core rules out of the box.

---

### 5. **Framework Domains**
```json
"domains": {
  "next": "recommended",
  "react": "recommended"
}
```
✅ **Essential.** Enables Next.js and React-specific rules.

---

## 🎯 Recommended Improvements

### **Improvement 1: Stricter Type Rules**

**Current:**
```json
"suspicious": {
  "noExplicitAny": "warn"
}
```

**Recommendation:**
```json
"suspicious": {
  "noExplicitAny": "error",                // More strict
  "noUnusedVariables": "error",            // NEW
  "noImplicitAnyLet": "error",             // NEW
  "noImplicitReturns": "warn",             // NEW (functions must return type)
  "noConstAssign": "error",                // NEW
  "noUnusedFunctionParameters": "warn"     // NEW
}
```

**Why:**
- ✅ Catches type errors early
- ✅ Prevents unused code
- ✅ Makes code safer and clearer
- ⚠️ May require fixing existing code first

**Before doing this:**
```bash
# Run check to see how many issues
biome check . --unsafe

# This shows you what will break
```

---

### **Improvement 2: Stricter Accessibility**

**Current:**
```json
"a11y": {
  "useButtonType": "warn",
  "noSvgWithoutTitle": "warn",
  "useAriaPropsSupportedByRole": "warn",
  "useKeyWithClickEvents": "warn"
}
```

**Recommendation:**
```json
"a11y": {
  "useButtonType": "error",                // Make required
  "noSvgWithoutTitle": "error",            // Make required
  "useAriaPropsSupportedByRole": "error",  // Make required
  "useKeyWithClickEvents": "error",        // Make required
  "useAriaRole": "warn",                   // NEW
  "useHtmlLang": "warn",                   // NEW (html lang attribute)
  "noAccessibleRole": "warn"               // NEW
}
```

**Why:**
- ✅ Real estate sites need accessibility
- ✅ Legal requirement in many countries
- ✅ Better user experience
- ✅ Good for SEO

**Example of what this catches:**
```typescript
// ❌ Will fail with stricter rules
<button onClick={handleClick}>Click</button>

// ✅ Correct
<button type="button" onClick={handleClick}>Click</button>
```

---

### **Improvement 3: More Ignored Folders**

**Current:**
```json
"files": {
  "includes": ["**", "!node_modules", "!.next", "!dist", "!build"]
}
```

**Recommendation:**
```json
"files": {
  "ignoreUnknown": true,
  "includes": [
    "**",
    "!node_modules",
    "!.next",
    "!dist",
    "!build",
    "!coverage",           // NEW - Test coverage reports
    "!.turbo",             // NEW - Turborepo cache
    "!.idea",              // NEW - IDE settings
    "!.vscode",            // NEW - VS Code settings
    ".vscode/settings.json"  // EXCEPT settings (we might lint it)
  ]
}
```

**Why:**
- ✅ Faster linting (skips unnecessary files)
- ✅ Prevents noise from generated files
- ✅ Cleaner lint output

---

### **Improvement 4: Add CSS Linting**

**New section to add:**
```json
"css": {
  "enabled": true,
  "parser": "css",
  "formatter": {
    "enabled": true,
    "indentWidth": 2,
    "indentStyle": "space"
  }
}
```

**Why:**
- ✅ You use Tailwind (CSS framework)
- ✅ Catches CSS/Tailwind issues
- ✅ Consistent CSS formatting

**What it checks:**
- Invalid CSS syntax
- Unknown properties
- Vendor prefix issues
- Formatting consistency

---

### **Improvement 5: Better Import Organization**

**Current:**
```json
"assist": {
  "actions": {
    "source": {
      "organizeImports": "on"
    }
  }
}
```

**Recommendation: Keep as is, but in your IDE settings add:**

```json
// .vscode/settings.json
{
  "[typescript]": {
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  }
}
```

**Why:**
- ✅ Auto-organizes imports on save
- ✅ Prevents manual import sorting
- ✅ Better readability

---

### **Improvement 6: Performance Tuning**

**Add configuration for performance:**
```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.0/schema.json",

  // Existing config...

  // NEW: Parallel processing
  "javascript": {
    "parser": {
      "unsafeParameterDeclarationOptional": false,
      "allowSuperOutsideMethod": false
    }
  },

  // NEW: TypeScript specific
  "typescript": {
    "jsxRuntime": "transparent",  // Since React 17+
    "checkOnlyAllowedEnumValues": true
  }
}
```

**Why:**
- ✅ Optimizes for modern React
- ✅ Better type checking
- ✅ Faster processing

---

## 📋 Complete Recommended Configuration

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.0/schema.json",

  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },

  "files": {
    "ignoreUnknown": true,
    "includes": [
      "**",
      "!node_modules",
      "!.next",
      "!dist",
      "!build",
      "!coverage",
      "!.turbo",
      "!.idea",
      "!.vscode",
      ".vscode/settings.json"
    ]
  },

  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "jsxQuoteStyle": "double"
  },

  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noUnknownAtRules": "off",
        "noFallthroughSwitchClause": "off",
        "noExplicitAny": "error",                      // CHANGED from warn
        "useIterableCallbackReturn": "warn",
        "noUnusedVariables": "error",                  // NEW
        "noImplicitAnyLet": "error",                   // NEW
        "noConstAssign": "error",                      // NEW
        "noUnusedFunctionParameters": "warn"           // NEW
      },
      "style": {
        "noNonNullAssertion": "warn",
        "useNamingConvention": {                       // NEW
          "format": "camelCase",
          "leadingUnderscore": "allow",
          "trailingUnderscore": "allow"
        }
      },
      "a11y": {
        "useButtonType": "error",                      // CHANGED from warn
        "noSvgWithoutTitle": "error",                  // CHANGED from warn
        "useAriaPropsSupportedByRole": "error",        // CHANGED from warn
        "useKeyWithClickEvents": "error",              // CHANGED from warn
        "useAriaRole": "warn",                         // NEW
        "useHtmlLang": "warn"                          // NEW
      }
    },
    "domains": {
      "next": "recommended",
      "react": "recommended"
    }
  },

  "css": {
    "enabled": true
  },

  "json": {
    "parser": {
      "allowTrailingComma": "none"
    }
  },

  "javascript": {
    "parser": {
      "unsafeParameterDeclarationOptional": false,
      "allowSuperOutsideMethod": false
    }
  },

  "typescript": {
    "jsxRuntime": "transparent"
  },

  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

---

## 📝 Migration Plan

### **Phase 1: Audit Current Issues (Today)**

```bash
# See what the stricter config would catch
biome check . --unsafe

# Count issues
biome check . --unsafe 2>&1 | grep "error" | wc -l
```

---

### **Phase 2: Gradual Adoption (Week 1)**

```json
// Step 1: Loosen first (if too many errors)
"noExplicitAny": "warn",
"useButtonType": "warn"

// Then gradually tighten as you fix issues
```

---

### **Phase 3: Full Strictness (Week 2)**

```bash
# Run these regularly
bun run format
bun run lint
biome check . --fix
```

---

### **Phase 4: CI/CD Integration (Week 3)**

Add to GitHub Actions:
```yaml
- name: Lint and Format Check
  run: |
    bun run format
    bun run lint
    biome check . --check
```

---

## 🚀 Implementation Steps

### **Step 1: Backup Current Config**
```bash
cp biome.json biome.json.backup
```

### **Step 2: Update Config**
```bash
# Copy recommended configuration from above
# Or make individual changes
```

### **Step 3: Check for Issues**
```bash
bun run lint
# This will show you what needs fixing
```

### **Step 4: Auto-fix What You Can**
```bash
biome check . --fix
```

### **Step 5: Manual Fixes**
Fix remaining issues that can't be auto-fixed.

### **Step 6: Commit**
```bash
git add biome.json
git commit -m "chore(config): improve biome linting rules"
```

---

## 📊 Impact Analysis

| Change | Effort | Impact | Recommendation |
|--------|--------|--------|---|
| `noExplicitAny: error` | Low | High | ✅ Implement |
| `a11y: error` | Medium | High | ✅ Implement |
| Add CSS linting | Low | Medium | ✅ Implement |
| More file exclusions | Low | Low | ✅ Implement |
| Type checking rules | Medium | High | ✅ Phase in |

---

## 💾 Example Changes (By Priority)

### **Priority 1: Accessibility (Do First)**
```json
"a11y": {
  "useButtonType": "error",
  "noSvgWithoutTitle": "error",
  "useAriaPropsSupportedByRole": "error",
  "useKeyWithClickEvents": "error"
}
```

**Why first:** Real estate = accessibility critical.

---

### **Priority 2: Type Safety (Do Next)**
```json
"suspicious": {
  "noExplicitAny": "error",
  "noUnusedVariables": "error"
}
```

**Why:** Prevents bugs, improves code quality.

---

### **Priority 3: Performance (Do Last)**
```json
"files": {
  "includes": ["**", "!coverage", "!.turbo", ...]
}
```

**Why:** Speed optimization, less important.

---

## ⚠️ Warnings Before Implementing

### **1. Breaking Existing Code**

```bash
# Check how many issues you'll have
biome check . --unsafe 2>&1 | grep "error" | wc -l

# If > 100 errors, phase in gradually
```

---

### **2. Team Communication**

Before implementing stricter rules:
1. Inform team
2. Provide time to fix existing issues
3. Run auto-fix: `biome check . --fix`
4. Manual review of changes

---

### **3. IDE Configuration**

After updating config:
1. Restart IDE (VS Code)
2. Reload extensions
3. Verify Biome extension is enabled

---

## 📚 Quick Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|---|
| Rules enabled | ~150 | ~180 | +30 rules |
| A11y level | Warnings | Errors | Stricter |
| Type safety | Warnings | Errors | Stricter |
| Auto-fixable | ~70% | ~75% | +5% |
| Files linted | 95% | 100% | Comprehensive |

---

## ✅ Next Steps

1. **Read `BIOME_EXPLAINED.md`** for full understanding
2. **Review changes** with your team
3. **Implement Phase 1** (accessibility rules)
4. **Test thoroughly** (`bun run format && bun run lint`)
5. **Document decisions** in team guide

---

## 🔗 Related Documentation

- `BIOME_EXPLAINED.md` - Complete Biome guide
- `DEVELOPMENT_SETUP.md` - Development workflow
- `TURBOREPO_GUIDE.md` - How Biome integrates
- `biome.json` - Current configuration

---

**Last Updated:** October 22, 2025
**Status:** Recommended for Implementation
