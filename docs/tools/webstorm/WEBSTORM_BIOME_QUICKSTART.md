# WebStorm + Biome - Quick Start (7 Minutes)

> Ultra-concise checklist to set up Biome in WebStorm. Print this or keep it in a tab while configuring.

---

## Before You Start

✅ `.editorconfig` created
✅ `test-biome-format.tsx` created in `apps/web/`
✅ Biome 2.2.0 installed and configured

---

## The 6-Step Setup

### **Step 1: Install Plugin** (2 min)

Open WebStorm:
```
Cmd+, → Plugins → Marketplace
Search: "Biome"
Install: Official plugin by Biomejs
Restart: WebStorm
```

✅ **Check:** Biome plugin shows in Plugins list

---

### **Step 2: Set Default Formatter** (1 min)

```
Cmd+, → Languages & Frameworks → JavaScript → Code Style
Formatter: [Dropdown] → Biome
```

✅ **Check:** Dropdown shows "Biome" selected

---

### **Step 3: Enable Format on Save** (1 min)

```
Cmd+, → Tools → Actions on Save
Check: "Reformat code"
```

✅ **Check:** Checkbox is marked

---

### **Step 4: Test It Works** (2 min)

Open test file:
```bash
apps/web/test-biome-format.tsx
```

Save it:
```
Cmd+S
```

Verify formatting happened automatically.

Compare with terminal:
```bash
bun run format
```

✅ **Check:** Both produce identical output

---

### **Step 5: Verify Format Command** (1 min)

With test file still open:
```
Option+Command+L (format file)
```

Should use Biome (same as Cmd+S).

✅ **Check:** Code is formatted identically to step 4

---

### **Step 6: Clean Up** (30 sec)

Delete test file:
```bash
rm apps/web/test-biome-format.tsx
```

---

## Done! ✅

Now when you work:

| Action | Result |
|--------|--------|
| `Cmd+S` | Biome formats automatically |
| `Option+Command+L` | Biome formats the file |
| `bun run format` | Terminal format matches IDE |
| `bun run lint` | Biome linting shows in sidebar |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Plugin won't install | Check WebStorm version (2024.2+) |
| Biome not in dropdown | Restart WebStorm after install |
| Doesn't format on save | Check Actions on Save is enabled |
| Different format than terminal | Check biome.json is same |
| Slow performance | See main guide "Issue 4: Slow Performance" |

---

## Next: Apply Biome Improvements (Optional)

Once this is working, optionally apply stricter rules:
- `docs/BIOME_IMPROVEMENTS.md` - Recommended config changes
- Phases: Accessibility → Type Safety → Performance

---

**Total time to complete: ~7 minutes**

See `WEBSTORM_BIOME_SETUP.md` for full details and troubleshooting.
