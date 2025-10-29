# WebStorm + Biome Setup Guide

> Configure Biome as your formatter and linter in WebStorm

---

## ⚠️ IMPORTANT: Manual Steps Required

**This setup requires manual configuration in WebStorm.** I've prepared the project with:
- ✅ `.editorconfig` file (baseline formatting)
- ✅ `test-biome-format.tsx` (test file)
- ✅ This guide

**You must do these 6 steps manually in WebStorm** (takes ~7 minutes):

1. Install Biome plugin (Plugins → Marketplace)
2. Set Biome as default formatter
3. Enable "Format on Save"
4. Verify with test file
5. Confirm `Option+Command+L` uses Biome
6. Delete test file

**👉 See "🚀 Quick Steps For You" section below after the Current Status.**

---

## 📊 Current Status

**Your WebStorm Configuration:**
```
✅ ESLint detected and enabled (inspection)
❌ Biome NOT configured as default formatter
❌ Biome NOT configured as linter
⚠️ Using WebStorm's built-in formatter instead
```

**Problem:** WebStorm is using its default formatter, not Biome. This means:
- ❌ Code formatted with WebStorm ≠ Code formatted with `bun run format`
- ❌ Conflicts between IDE and terminal formatting
- ❌ Team members get inconsistent results

---

## 🚀 Quick Steps For You

**What I prepared for you:**
- ✅ `.editorconfig` - Created (baseline formatting)
- ✅ `test-biome-format.tsx` - Created (in `apps/web/`)
- ✅ This guide - Updated with detailed instructions

**What you need to do:**

### **Step 1: Install Biome Plugin** (2 minutes)
```
WebStorm → Preferences (Cmd+,)
  → Plugins
    → Marketplace
      → Search: "Biome"
      → Install (official by Biomejs)
      → Restart WebStorm
```

### **Step 2: Set Biome as Default Formatter** (1 minute)
```
Preferences (Cmd+,)
  → Languages & Frameworks
    → JavaScript
      → Code Style
        → Formatter: [Dropdown]
          → Select: Biome
```

### **Step 3: Enable Format on Save** (1 minute)
```
Preferences (Cmd+,)
  → Tools
    → Actions on Save
      → Check: "Reformat code"
```

### **Step 4: Test with Test File** (2 minutes)
1. Open: `apps/web/test-biome-format.tsx`
2. Press: `Cmd+S` (save)
3. Check: Code should be formatted nicely
4. Run: `bun run format` in terminal
5. Verify: Output is identical to what WebStorm did

### **Step 5: Verify Option+Command+L Works** (1 minute)
1. Keep test file open
2. Press: `Option+Command+L` (format file)
3. Check: Uses Biome format (same as Cmd+S did)

### **Step 6: Cleanup** (30 seconds)
1. Delete: `apps/web/test-biome-format.tsx`
2. Done! 🎉

---

## ✅ Solution: Configure Biome in WebStorm

### **Step 1: Install Biome Extension**

1. **Open WebStorm**
2. **Go to:** WebStorm → Preferences (or Cmd+, on macOS)
3. **Navigate to:** Plugins → Marketplace
4. **Search for:** "Biome"
5. **Install** the official Biome extension
6. **Restart** WebStorm

**Screenshot reference:**
```
Preferences → Plugins → Marketplace
Search: "Biome" or "Biomejs"
Install official extension by Biomejs team
```

---

### **Step 2: Set Biome as Default Formatter**

1. **Open Preferences** (Cmd+, on macOS)
2. **Navigate to:** Languages & Frameworks → JavaScript → Code Style
3. **Look for:** "Formatter" or "Prettier" option
4. **Change from:** WebStorm's default → Biome

**Alternative Path:**
```
Preferences
  → Editor
    → Code Style
      → HTML/JavaScript/TypeScript
        → Set formatter: Biome
```

---

### **Step 3: Enable Format on Save**

1. **Open Preferences** (Cmd+,)
2. **Navigate to:** Tools → Actions on Save
3. **Enable:** "Reformat code"
4. **Formatter:** Biome (or "Default" if set)

**After this:**
- ✅ Every time you save, Biome formats automatically
- ✅ Consistent with `bun run format`
- ✅ No manual formatting needed

---

### **Step 4: Configure Biome as External Tool**

**Optional but recommended for access in context menu:**

1. **Open Preferences** (Cmd+,)
2. **Navigate to:** Tools → External Tools
3. **Click:** + to add new tool
4. **Fill in:**

```
Name:          Biome Format
Description:   Format with Biome
Program:       bun
Arguments:     run format
Working dir:   $ProjectFileDir$
```

5. **Click:** OK

**Now you can:**
- Right-click file → External Tools → Biome Format
- Or use keyboard shortcut (set in Preferences)

---

### **Step 5: Disable WebStorm's Default Formatter**

To avoid conflicts:

1. **Open Preferences**
2. **Navigate to:** Languages & Frameworks → JavaScript → Code Style
3. **Set:** Formatter → Biome
4. **Disable:** WebStorm's Prettier if enabled

---

## 🔍 Verify Configuration is Working

### **Test 1: Format a File**

1. **Create/open** a messy TypeScript file:
```typescript
const data={foo:"bar",items:[1,2,3]}
function hello(){return"world"}
```

2. **Save the file** (Cmd+S)
3. **Check if formatted:** Should now be:
```typescript
const data = { foo: "bar", items: [1, 2, 3] }
function hello() {
  return "world"
}
```

✅ **Success** if formatted correctly
❌ **Failed** if not formatted

---

### **Test 2: Linting Errors Appear**

1. **Open a file** with an accessibility issue:
```typescript
<button onClick={handleClick}>Click me</button>
```

2. **Check sidebar:** Should show warning:
```
⚠️ a11y/useButtonType
   <button> should have a type attribute
```

✅ **Success** if warning appears
❌ **Failed** if no warning

---

### **Test 3: Run Terminal Command**

```bash
bun run format
# Should format identically to WebStorm
```

✅ **Success** if same as WebStorm formatting
❌ **Different** if WebStorm formatter doesn't match

---

## 📋 Complete Setup Checklist

- [ ] Biome extension installed in WebStorm
- [ ] Biome set as default formatter
- [ ] "Format on Save" enabled
- [ ] Biome external tool configured
- [ ] WebStorm default formatter disabled
- [ ] Test file formatted correctly
- [ ] Linting warnings appear
- [ ] `bun run format` produces same result as IDE

---

## 🚀 Usage After Setup

### **Automatic (After Every Save)**
```
Cmd+S (save)
  ↓
WebStorm detects change
  ↓
Biome formats automatically
  ↓
✅ Code is formatted
```

### **Manual Format**
```
Cmd+Option+L (format file)
  OR
Cmd+Shift+Option+L (format selection)
  OR
Right-click → Reformat Code
```

### **Lint Check**
```
Terminal:
$ bun run lint

Or in WebStorm sidebar:
- Errors/warnings appear automatically
- Click to jump to issue
```

---

## ⚠️ Common Issues & Solutions

### **Issue 1: Biome Doesn't Format on Save**

**Problem:** Saved file but not formatted

**Solutions:**
1. **Check extension installed:**
   ```
   Preferences → Plugins → Search "Biome"
   ```

2. **Check formatter is set:**
   ```
   Preferences → Languages & Frameworks → JavaScript
   → Formatter: should be "Biome"
   ```

3. **Check "Format on Save" is enabled:**
   ```
   Preferences → Tools → Actions on Save
   → "Reformat code" should be checked
   ```

4. **Restart WebStorm:**
   ```
   WebStorm → Quit WebStorm
   → Reopen WebStorm
   ```

---

### **Issue 2: Biome Format ≠ Terminal Format**

**Problem:** WebStorm formats differently than `bun run format`

**Solutions:**
1. **Check `biome.json` is the same**
   - WebStorm should read from `biome.json` in project root
   - If different config, Biome works differently

2. **Verify Biome version matches:**
   ```bash
   # In terminal
   bunx biome --version

   # In WebStorm Preferences → Biome
   Should show same version
   ```

3. **Force sync:**
   ```bash
   # Clear WebStorm cache
   Preferences → Tools → WebStorm
   → Clear Cache and Restart
   ```

---

### **Issue 3: No Linting Errors Showing**

**Problem:** Expected warnings don't appear

**Solutions:**
1. **Check ESLint is enabled:**
   ```
   Preferences → Languages & Frameworks
   → JavaScript → ESLint
   → Enable ESLint integration
   ```

2. **Check inspection profile:**
   ```
   Preferences → Editor → Inspections
   → Look for "Biome" or "ESLint"
   → Should be enabled
   ```

3. **Restart IDE:**
   ```
   WebStorm → Quit WebStorm
   → Reopen
   ```

---

### **Issue 4: Slow Performance**

**Problem:** WebStorm is slow after enabling Biome

**Solutions:**
1. **Disable unnecessary inspections:**
   ```
   Preferences → Editor → Inspections
   → Uncheck tools you don't need
   ```

2. **Exclude node_modules:**
   ```
   Preferences → Project: InmoApp → Directories
   → Mark "node_modules" as "Excluded"
   ```

3. **Limit linting scope:**
   ```
   Preferences → Languages & Frameworks
   → JavaScript → ESLint
   → Only lint "Modified files"
   ```

---

## 📝 Biome Integration Methods

### **Method 1: Extension + Format on Save (Recommended)**
```
✅ Easy setup
✅ Works automatically
✅ No manual action needed
⚠️ Requires Biome extension installed
```

### **Method 2: External Tool**
```
✅ Manual control
✅ See output in console
✅ Can use keyboard shortcut
⚠️ Must run manually (no auto-save)
```

### **Method 3: Terminal Only**
```
✅ Simple (just run command)
✅ No IDE integration needed
❌ Manual, requires discipline
❌ Team members might forget
```

**Best practice:** Use Method 1 (extension) + Method 3 (terminal for verification).

---

## 🔧 Advanced Configuration

### **Custom Keyboard Shortcut**

1. **Open Preferences** (Cmd+,)
2. **Search:** "Keymap"
3. **Navigate to:** Keymap
4. **Search:** "format"
5. **Right-click** on "Reformat Code"
6. **Add Keyboard Shortcut:** e.g., Cmd+Shift+F

**Now you can format with:** Cmd+Shift+F

---

### **Biome Settings in WebStorm**

1. **Open Preferences**
2. **Search:** "Biome"
3. **Configure:**
   - Path to Biome executable
   - Config file location
   - Additional options

```
Preferences → Languages & Frameworks → Biome
  → Biome executable: bun (or full path)
  → Config file: ./biome.json
  → Additional options: (leave empty)
```

---

### **IDE Settings File (.editorconfig)**

Create `.editorconfig` in project root to sync with Biome:

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
max_line_length = off
```

This helps WebStorm's built-in editor respect same settings as Biome.

---

## 📊 Before vs After Setup

### **BEFORE (Current)**
```
Code in WebStorm:
const x={a:1}

Save (Cmd+S):
const x = { a: 1 }  ← WebStorm format

Run: bun run format
const x = { a: 1 }  ← Biome format (same)

BUT: Different tools = potential conflicts
```

### **AFTER (Configured)**
```
Code in WebStorm:
const x={a:1}

Save (Cmd+S):
↓ Biome runs automatically
const x = { a: 1 }  ← Biome format

Run: bun run format
const x = { a: 1 }  ← Biome format (identical)

✅ Always consistent
```

---

## 🎯 Why This Matters

### **Consistency**
```
Without setup:
Dev A: Formats with WebStorm
Dev B: Formats with terminal
Dev C: Uses default settings
→ Different code style for each! ❌

With setup:
Everyone: Uses Biome (same tool)
→ Identical formatting! ✅
```

### **Team Synchronization**
```
No setup:
"Why did my code change after push?"
"The CI auto-formats differently"
"Let me run format locally"
→ Waste of time ❌

With setup:
"Local IDE format = CI format = team format"
→ No surprises ✅
```

---

## 📚 Related Documentation

- `BIOME_EXPLAINED.md` - What is Biome
- `BIOME_IMPROVEMENTS.md` - Configuration recommendations
- `DEVELOPMENT_SETUP.md` - Development workflow
- `biome.json` - Your configuration

---

## ✨ Summary

| Step | Action | Why |
|------|--------|-----|
| 1 | Install Biome extension | Enable integration |
| 2 | Set as default formatter | Use Biome instead of WebStorm |
| 3 | Enable format on save | Automatic formatting |
| 4 | Create external tool | Quick access |
| 5 | Disable conflicts | Avoid double formatting |
| 6 | Test | Verify it works |

---

## 🚀 Next Steps

1. **Install** Biome extension in WebStorm
2. **Configure** as default formatter
3. **Enable** format on save
4. **Test** with a file
5. **Verify** it matches `bun run format`
6. **Share** this guide with team

---

**Once configured, WebStorm will:**
- ✅ Format on every save (Cmd+S)
- ✅ Show Biome linting errors/warnings
- ✅ Match `bun run format` results
- ✅ Keep your code consistent
- ✅ Prevent merge conflicts from formatting

---

**Last Updated:** October 22, 2025
**Status:** Ready for Implementation
