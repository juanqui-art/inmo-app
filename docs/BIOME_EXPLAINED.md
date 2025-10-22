# Biome Explained - InmoApp

> Complete guide to Biome, the unified toolchain for linting and formatting

---

## Table of Contents

1. [What is Biome?](#what-is-biome)
2. [Configuration Breakdown](#configuration-breakdown)
3. [How It Works](#how-it-works)
4. [Commands Reference](#commands-reference)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)
7. [Performance Tips](#performance-tips)

---

## What is Biome?

**Biome is a unified toolchain that replaces multiple tools:**

| Old Approach (Multiple Tools) | Biome (All-in-One) |
|------|---|
| ESLint for linting | ✅ Integrated linter (363 rules) |
| Prettier for formatting | ✅ Fast formatter (35x faster than Prettier) |
| TypeScript compiler for checking | ✅ Built-in type checking |
| Multiple config files | ✅ Single `biome.json` |
| Slow, fragmented workflow | ✅ Fast, unified workflow |

---

## Your Configuration Breakdown

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.0/schema.json",
  "vcs": { ... },
  "files": { ... },
  "formatter": { ... },
  "linter": { ... },
  "assist": { ... }
}
```

### **Section 1: VCS (Version Control System)**

```json
"vcs": {
  "enabled": true,
  "clientKind": "git",
  "useIgnoreFile": true
}
```

**What it does:**
- `enabled: true` → Biome respects version control
- `clientKind: "git"` → Works with Git (your VCS)
- `useIgnoreFile: true` → Respects `.gitignore` file

**Why it matters:**
- ✅ Doesn't lint/format files you've ignored in Git
- ✅ Excludes dependencies, build files automatically
- ✅ Faster: skips unnecessary files

**Example:**
```bash
# Your .gitignore has:
node_modules/
.next/
dist/

# Biome respects this:
bun run lint  # Skips node_modules, .next, dist
```

---

### **Section 2: Files**

```json
"files": {
  "ignoreUnknown": true,
  "includes": ["**", "!node_modules", "!.next", "!dist", "!build"]
}
```

**What it does:**
- `ignoreUnknown: true` → Ignores file types Biome doesn't understand
- `includes` → Explicitly defines which files to process

**Breaking down `includes`:**

| Pattern | Meaning |
|---------|---------|
| `**` | All files recursively |
| `!node_modules` | EXCEPT node_modules |
| `!.next` | EXCEPT .next (Next.js build) |
| `!dist` | EXCEPT dist (build output) |
| `!build` | EXCEPT build directory |

**Why it matters:**
- ✅ Prevents linting/formatting generated files
- ✅ Speeds up processing
- ✅ Avoids false positives from third-party code

**If you add a new folder to ignore:**
```json
"includes": [
  "**",
  "!node_modules",
  "!.next",
  "!dist",
  "!build",
  "!.turbo",  // ← Add new ignored folder
  "!coverage"
]
```

---

### **Section 3: Formatter**

```json
"formatter": {
  "enabled": true,
  "indentStyle": "space",
  "indentWidth": 2
}
```

**What it does:**
- `enabled: true` → Formatting is active
- `indentStyle: "space"` → Use spaces (not tabs)
- `indentWidth: 2` → 2 spaces per indent level

**Visual example:**

```typescript
// With indentWidth: 2
function hello() {
  return "world"  // 2 spaces
}

// With indentWidth: 4
function hello() {
    return "world"  // 4 spaces
}
```

**Why 2 spaces?**
- ✅ Standard in JavaScript/TypeScript community
- ✅ Matches your `.editorconfig` (if you have one)
- ✅ Consistent across your team

**How to use:**
```bash
# Auto-format all code
bun run format

# See formatting changes without applying
biome format .
```

---

### **Section 4: Linter**

```json
"linter": {
  "enabled": true,
  "rules": {
    "recommended": true,
    "suspicious": { ... },
    "style": { ... },
    "a11y": { ... }
  },
  "domains": {
    "next": "recommended",
    "react": "recommended"
  }
}
```

#### **4a: Rule Sets**

**`"recommended": true`**
- Enables all recommended Biome rules
- ~150 rules that catch real bugs
- Safe defaults for most projects

**`"suspicious"` category:**
```json
"suspicious": {
  "noUnknownAtRules": "off",           // CSS @rules
  "noFallthroughSwitchClause": "off",  // Switch fallthrough
  "noExplicitAny": "warn",             // Using `any` type
  "useIterableCallbackReturn": "warn"  // Callback returns
}
```

| Rule | Level | Meaning |
|------|-------|---------|
| `noUnknownAtRules` | `"off"` | ✅ Allow CSS `@supports`, `@media`, etc. |
| `noFallthroughSwitchClause` | `"off"` | ✅ Allow switch cases to fall through |
| `noExplicitAny` | `"warn"` | ⚠️ Warn if you use `any` type |
| `useIterableCallbackReturn` | `"warn"` | ⚠️ Warn about callback return issues |

**Levels explained:**

```
"off"   = ❌ Don't check (disabled)
"warn"  = ⚠️  Show warning (doesn't break build)
"error" = 🔴 Show error (breaks build)
```

**`"style"` category:**
```json
"style": {
  "noNonNullAssertion": "warn"  // Using ! operator
}
```

Example:
```typescript
// ❌ Warned by Biome
const value = data!.property

// ✅ Better approach
const value = data?.property
```

**`"a11y"` (Accessibility) category:**
```json
"a11y": {
  "useButtonType": "warn",              // <button> needs type
  "noSvgWithoutTitle": "warn",          // <svg> needs title
  "useAriaPropsSupportedByRole": "warn", // ARIA attributes
  "useKeyWithClickEvents": "warn"       // Click events need keyboard
}
```

Example:
```typescript
// ❌ Warned by Biome
<button onClick={handleClick}>Click me</button>

// ✅ Better (accessible)
<button type="button" onClick={handleClick}>Click me</button>
```

#### **4b: Domains (Framework-Specific Rules)**

```json
"domains": {
  "next": "recommended",
  "react": "recommended"
}
```

**What it does:**
- Enables Next.js-specific linting rules
- Enables React-specific linting rules

**Next.js rules check:**
- ✅ Proper use of `<Image>` component
- ✅ Correct meta tag configuration
- ✅ No unoptimized `<img>` tags
- ✅ Dynamic imports used correctly

**React rules check:**
- ✅ Dependencies in `useEffect`
- ✅ Hooks used only in React components
- ✅ Missing key in lists
- ✅ No setState in render

---

### **Section 5: Assist (IDE Features)**

```json
"assist": {
  "actions": {
    "source": {
      "organizeImports": "on"
    }
  }
}
```

**What it does:**
- Enables automatic import organization
- Available in editor as quick fix (Ctrl+. or Cmd+.)

**Example:**

```typescript
// Before (messy imports)
import { useState } from "react"
import { prisma } from "@repo/database"
import { Button } from "@repo/ui"
import { env } from "@repo/env"
import { clsx } from "clsx"

// After (organized by: modules, then alphabetical)
import { useState } from "react"

import { clsx } from "clsx"

import { env } from "@repo/env"
import { prisma } from "@repo/database"
import { Button } from "@repo/ui"
```

---

## How It Works

### **Linting Process (bun run lint)**

```
bun run lint
  ↓
Reads: biome.json configuration
  ↓
Respects: .gitignore (via VCS config)
  ↓
Processes: All matching files (from "files.includes")
  ↓
Checks: Against 363+ rules
  ↓
Reports: Issues with detailed explanations
  ↓
Suggests: Auto-fixable issues (--fix flag available)
```

**Example output:**
```bash
$ bun run lint
apps/web/components/Button.tsx:15:10
  suspicious/noExplicitAny ⚠️
  Unexpected 'any' type

  15 | const handleClick = (e: any) => {
     |                        ^^^
```

---

### **Formatting Process (bun run format)**

```
bun run format
  ↓
Reads: biome.json configuration
  ↓
Applies: Formatting rules (indent, spacing, etc.)
  ↓
Respects: Language-specific conventions
  ↓
Outputs: Consistent, well-formatted code
```

**Before:**
```typescript
const data={foo:"bar",baz:123,items:[1,2,3]}
function hello(){return"world"}
```

**After:**
```typescript
const data = { foo: "bar", baz: 123, items: [1, 2, 3] }
function hello() {
  return "world"
}
```

---

## Commands Reference

### **Linting**

```bash
# Check all files (report issues)
bun run lint

# Fix fixable issues automatically
biome check . --fix

# Fix with unsafe fixes (may change behavior)
biome check . --unsafe

# Verbose output
biome check . --verbose
```

### **Formatting**

```bash
# Format all files (interactive)
bun run format

# Format specific file
biome format apps/web/components/Button.tsx

# Check formatting without applying changes
biome format . --check
```

### **Combined (Check + Format)**

```bash
# Check both linting and formatting
biome check .

# Apply all fixes
biome check . --fix

# Format and lint in one go
bun run format && bun run lint
```

### **Specific Packages**

```bash
# Only lint @repo/ui
cd packages/ui && biome check .

# Only format apps/web
cd apps/web && biome format --write .
```

---

## Best Practices

### **1. Pre-Commit Hook**

Install a pre-commit hook to prevent committing bad code:

```bash
# Install Husky (if not already)
bun add -d husky

# Setup pre-commit hook
husky install

# Create pre-commit script
echo 'bun run format && bun run lint' > .husky/pre-commit
chmod +x .husky/pre-commit
```

Now Biome runs automatically before each commit.

---

### **2. CI/CD Integration**

In your CI pipeline (GitHub Actions, Vercel):

```yaml
# .github/workflows/lint.yml
name: Lint & Format

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run lint
      - run: biome format . --check  # Fails if unformatted
```

---

### **3. IDE Integration**

**VS Code (recommended):**
1. Install "Biome" extension (official)
2. It auto-detects `biome.json`
3. Format on save: Add to `.vscode/settings.json`

```json
{
  "[javascript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

---

### **4. Consistent Team Standards**

**Keep `biome.json` in Git:**
```bash
git add biome.json
git commit -m "chore: add Biome configuration"
```

**All team members get the same rules:**
- Everyone runs same linter rules
- Everyone formats the same way
- No debates about code style

---

### **5. Gradual Rule Introduction**

**Start strict, add rules gradually:**

```json
// Stage 1 (current)
"recommended": true,
"noExplicitAny": "warn"

// Stage 2 (next month)
"noExplicitAny": "error",
"noUnusedVariables": "warn"

// Stage 3 (later)
"noUnusedVariables": "error"
```

This allows time for team to adapt.

---

## Troubleshooting

### **Problem 1: "Format Not Applied"**

**Error:**
```bash
bun run format
# No changes
```

**Solutions:**
```bash
# Option 1: Check if files match pattern
cat biome.json | grep "includes"

# Option 2: Force reformat
biome format . --write

# Option 3: Check specific file
biome format apps/web/page.tsx --write
```

---

### **Problem 2: "Rule Too Strict"**

**Error:**
```bash
bun run lint
# 200 errors of same type
```

**Solution: Adjust rule level**

```json
"linter": {
  "rules": {
    "suspicious": {
      "noExplicitAny": "off"  // Change from "warn" to "off"
    }
  }
}
```

Then:
```bash
bun run lint  # Now passes
```

---

### **Problem 3: "File Not Linted"**

**Error:**
```bash
# Modified file, but Biome ignores it
bun run lint
# File not mentioned in output
```

**Solutions:**
1. **Check if in ignored folder:**
   ```bash
   cat biome.json | grep "includes"
   # If file is in !node_modules, !.next, etc., it's ignored
   ```

2. **Check file type:**
   - Biome supports: `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.css`, `.html`
   - If different extension, Biome skips it

3. **Manually check file:**
   ```bash
   biome check apps/web/utils/helper.ts
   ```

---

### **Problem 4: "Conflicting Rules"**

**Error:**
```bash
# Formatter wants one thing, linter wants another
```

**Solution: Review rule combination**

```json
"formatter": {
  "indentWidth": 2
},
"linter": {
  "rules": {
    "style": {
      // Make sure linter agrees with formatter
    }
  }
}
```

---

## Performance Tips

### **1. Only Lint Changed Files**

In CI (faster feedback):
```bash
# Use git diff to lint only changed files
git diff --name-only HEAD~1 | xargs biome check
```

---

### **2. Use Format Check First**

Format issues are simpler:
```bash
# Check formatting first (faster)
biome format . --check

# Then lint (slower, more comprehensive)
bun run lint
```

---

### **3. Exclude Large Directories**

```json
"files": {
  "includes": [
    "**",
    "!node_modules",
    "!.next",
    "!dist",
    "!build",
    "!coverage",    // ← Add if large
    "!.turbo"       // ← Add if large
  ]
}
```

---

### **4. Run in Parallel (Turborepo)**

In `turbo.json`:
```json
"lint": {
  "cache": true,
  "outputs": []
}
```

Then:
```bash
turbo run lint  # Runs in parallel across packages
```

---

## Configuration Recommendations

### **Current Config is Good, But Consider:**

**1. Add CSS Linting (if you care about styles):**
```json
"css": {
  "enabled": true
}
```

**2. Stricter Type Rules:**
```json
"suspicious": {
  "noExplicitAny": "error",  // Was "warn"
  "noUnusedVariables": "error"
}
```

**3. Accessibility Focus:**
```json
"a11y": {
  "useButtonType": "error",  // Was "warn"
  "useKeyWithClickEvents": "error"
}
```

**4. Ignore Coverage Reports:**
```json
"files": {
  "includes": [
    "**",
    "!node_modules",
    "!.next",
    "!dist",
    "!build",
    "!coverage"  // ← Add this
  ]
}
```

---

## Summary

| Aspect | What Biome Does |
|--------|---|
| **Linting** | 363+ rules checking code quality |
| **Formatting** | Makes code consistent (35x faster than Prettier) |
| **Speed** | Built in Rust, extremely fast |
| **Config** | Single `biome.json` file |
| **Workspace** | Works across monorepo automatically |
| **IDE Support** | VS Code extension available |
| **CI/CD** | Perfect for automated checks |

---

## Next Steps

1. **Use daily:**
   ```bash
   bun run format  # Format code
   bun run lint    # Check for issues
   ```

2. **Set up pre-commit hook** (prevents bad commits)

3. **Configure IDE** (format on save)

4. **Review output** (understand warnings)

5. **Adjust rules** (as team needs evolve)

---

## Quick Reference

```bash
# Format code
bun run format

# Check linting
bun run lint

# Both
bun run format && bun run lint

# Specific package
cd packages/ui && biome check .

# See what changed
biome format . --check

# Apply fixes
biome check . --fix
```

---

## Related Documentation

- `TURBOREPO_GUIDE.md` - How Biome integrates with Turborepo
- `DEVELOPMENT_SETUP.md` - Running Biome commands
- `CLAUDE.md` - Quick reference
- `biome.json` - Your actual configuration
