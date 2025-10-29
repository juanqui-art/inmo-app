# WebStorm Format Issue - ¿Por Qué Cambia el Formato?

> Por qué `Option+Command+L` formatea diferente a `bun run format`

---

## El Problema

```
Tu código original:
const user = { name: "John", age: 30, email: "john@example.com" }

Cuando presionas: Option+Command+L
WebStorm cambia a:
const user = {
  name: "John",
  age: 30,
  email: "john@example.com"
}

Pero cuando corres: bun run format
Biome lo deja como:
const user = { name: "John", age: 30, email: "john@example.com" }

❌ PROBLEMA: Dos formatos diferentes
```

---

## ¿Por Qué Pasa?

### **Razón Principal: WebStorm NO está usando Biome**

Cuando presionas `Option+Command+L`:
1. WebStorm abre el diálogo "Reformat Code"
2. WebStorm usa su **formatter built-in** (no Biome)
3. WebStorm tiene **diferentes reglas** que Biome
4. Resultado: Formato diferente

---

## 🔍 Las Diferencias

### **WebStorm's Default Formatter:**
- Rompe líneas largas automáticamente
- Expande objetos/arrays a múltiples líneas
- Sigue configuración de WebStorm (no Biome)

```javascript
// WebStorm expande esto:
const user = { name: "John", age: 30, email: "john@example.com" }

// A esto (si línea > 80 caracteres):
const user = {
  name: "John",
  age: 30,
  email: "john@example.com"
}
```

### **Biome's Formatter:**
- Respeta configuración en `biome.json`
- No expande innecesariamente
- Mantiene código compacto si cabe

```javascript
// Biome mantiene compacto:
const user = { name: "John", age: 30, email: "john@example.com" }

// Solo si está en biome.json:
"formatter": {
  "lineWidth": 80  // Si excede, ENTONCES expande
}
```

---

## 🎯 La Solución

### **Opción 1: Desactivar WebStorm Default Formatter (Recomendado)**

**Paso 1: Ir a Preferences**
```
WebStorm → Preferences (Cmd+,)
```

**Paso 2: Buscar formatter**
```
Languages & Frameworks
  → JavaScript
    → Code Style
```

**Paso 3: Buscar la opción "Formatter"**
```
Formatter dropdown: [WebStorm] → Cambiar a [Biome]
```

O si no aparece Biome, desactiva el formatter default:
```
Editor
  → General
    → Code Style
      → Uncheck: "Reformat code on save"
```

**Paso 4: Restart WebStorm**
```
WebStorm → Quit WebStorm
Reabre WebStorm
```

**Después:**
```
Option+Command+L usará Biome (consistente)
```

---

### **Opción 2: Usar Biome desde Terminal**

Si WebStorm sigue formateando diferente:

```bash
# En vez de usar Option+Command+L
# Usa terminal:

bun run format

# Biome formatea correctamente
```

**Ventaja:** Garantizado que usa Biome
**Desventaja:** Manual (tienes que correr comando)

---

### **Opción 3: Crear Custom Keyboard Shortcut**

Si instalaste la **extensión Biome** en WebStorm:

**Paso 1: Preferences**
```
WebStorm → Preferences (Cmd+,)
```

**Paso 2: Keymap**
```
Keymap
```

**Paso 3: Search "format"**
```
Search: "format"
```

**Paso 4: Add keyboard shortcut**
```
Right-click → Add Keyboard Shortcut
Set: Option+Command+L
```

**Paso 5: Restart WebStorm**

**Ahora:**
```
Option+Command+L usa Biome (no WebStorm)
```

---

## 📊 Comparación Completa

| Acción | Formatter | Resultado |
|--------|-----------|-----------|
| `Cmd+S` (save sin config) | WebStorm | Diferente a Biome ❌ |
| `Option+Command+L` (actual) | WebStorm | Diferente a Biome ❌ |
| `bun run format` | Biome | Consistente ✅ |
| `Cmd+S` (con Biome extension) | Biome | Consistente ✅ |
| `Option+Command+L` (con Biome config) | Biome | Consistente ✅ |

---

## 🔧 Paso a Paso: Solución Completa

### **Paso 1: Install Biome Extension**

```
WebStorm → Preferences (Cmd+,)
  → Plugins → Marketplace
  → Search: "Biome"
  → Install (oficial extension)
  → Restart WebStorm
```

**Tiempo:** 2-3 minutos

---

### **Paso 2: Set Biome as Default**

```
Preferences (Cmd+,)
  → Languages & Frameworks
    → JavaScript
      → Code Style
        → Formatter: [Dropdown]
          → Select: Biome
```

**Tiempo:** 30 segundos

---

### **Paso 3: Disable WebStorm's Formatter**

```
Preferences (Cmd+,)
  → Editor
    → Code Style
      → Provider: [Dropdown]
        → Select: Project (or Biome if available)
```

```
Preferences (Cmd+,)
  → Tools
    → Actions on Save
      → Uncheck: "Reformat code"
      → (We'll let Biome do it instead)
```

**Tiempo:** 1 minuto

---

### **Paso 4: Test It**

**Test 1: Format on Save**
```typescript
// Create messy code
const x={a:1,b:2}

// Save (Cmd+S)
// Should become:
const x = { a: 1, b: 2 }

✅ If formatted like Biome: SUCCESS
❌ If different: Need to check config
```

**Test 2: Manual Format**
```
Option+Command+L
Should use Biome format (consistent)
```

**Test 3: Terminal Consistency**
```bash
bun run format
# Should match what WebStorm did

✅ If identical: PERFECT
❌ If different: Biome extension not working
```

---

## 🚨 Why This Matters

### **Without Biome in WebStorm:**
```
You:           Formatting with Option+Command+L
Teammate 1:    Formatting with terminal (bun run format)
Teammate 2:    Formatting with VS Code (different formatter)
Teammate 3:    Using default WebStorm

Result: 4 different formats for same code ❌
```

### **With Biome in WebStorm:**
```
Everyone: Using Biome (same formatter)

Result: Same format everywhere ✅
No merge conflicts from formatting
No "why did my code change?" confusion
```

---

## 💡 Key Understanding

**WebStorm has its own formatter** built-in:
- Follows WebStorm's code style settings
- Independent from Biome
- `Option+Command+L` uses WebStorm's formatter

**Biome has its own formatter**:
- Follows `biome.json` configuration
- Independent from WebStorm
- `bun run format` uses Biome's formatter

**The Gap:**
```
WebStorm formatter ≠ Biome formatter

Solution:
Make Option+Command+L use Biome
(not WebStorm's built-in)
```

---

## ✅ Verification Checklist

After setup, verify with this checklist:

```
File: apps/web/test-format.tsx

Original:
const obj={name:"John",age:30,active:true}
function hello(){return "world"}

After Option+Command+L:
const obj = { name: "John", age: 30, active: true }
function hello() {
  return "world"
}

After bun run format:
const obj = { name: "John", age: 30, active: true }
function hello() {
  return "world"
}

✅ Both IDENTICAL = Setup correct
❌ Different = Need to reconfigure
```

---

## 🔗 Related Documentation

- `WEBSTORM_BIOME_SETUP.md` - Full setup guide
- `BIOME_EXPLAINED.md` - What is Biome
- `biome.json` - Your formatter configuration

---

## 📝 Quick Fix Summary

| Problem | Solution | Time |
|---------|----------|------|
| `Option+Command+L` uses WebStorm | Install Biome extension | 2 min |
| Set Biome as default formatter | 1 step in Preferences | 1 min |
| Disable WebStorm's formatter | Actions on Save settings | 1 min |
| Verify it works | Run test file | 2 min |

**Total Time: 6 minutes**
**Benefit: Consistent formatting forever**

---

## 🎯 Bottom Line

```
Problem: Option+Command+L ≠ bun run format

Cause: WebStorm uses its formatter, not Biome

Solution:
1. Install Biome extension
2. Set as default formatter
3. Test

Result:
✅ Option+Command+L uses Biome
✅ bun run format uses Biome
✅ Team uses Biome
✅ Everything consistent
```

---

**Status:** This is why your format changes when using `Option+Command+L`
**Next Step:** Follow WEBSTORM_BIOME_SETUP.md to configure properly
