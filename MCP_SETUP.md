# 🚀 Guía de Instalación - MCP Servers

Esta guía te ayudará a instalar y configurar los 6 MCP servers en tu entorno.

---

## 📋 Prerequisitos

- **Claude Desktop** o **Claude Code** instalado
- **Node.js** 18+ y npm instalado
- Acceso a tu proyecto de Supabase
- (Opcional) Token de GitHub para MCP de GitHub

---

## ⚡ Instalación Rápida (5 minutos)

### Paso 1: Ubicar archivo de configuración

**Para Claude Desktop:**

```bash
# macOS
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows
notepad %APPDATA%\Claude\claude_desktop_config.json

# Linux
nano ~/.config/Claude/claude_desktop_config.json
```

**Para Claude Code:**
La configuración se detecta automáticamente desde `MCP_CONFIG.json` en la raíz del proyecto.

### Paso 2: Copiar configuración

Copia el contenido del archivo `MCP_CONFIG.json` a tu archivo de configuración de Claude:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "YOUR_SUPABASE_ACCESS_TOKEN_HERE"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/juanquizhpi/Desktop/projects/inmo-app"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@github/github-mcp-server"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

### Paso 3: Configurar Tokens

#### 🔑 Token de Supabase (REQUERIDO)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Click en tu avatar (esquina superior derecha)
3. **Account** → **Access Tokens**
4. Click en **"Generate new token"**
5. Nombre: `Claude MCP`
6. Scopes: Selecciona los necesarios (recomendado: `all`)
7. Copia el token generado
8. Reemplaza `YOUR_SUPABASE_ACCESS_TOKEN_HERE` en la configuración

#### 🐙 Token de GitHub (OPCIONAL)

Si quieres usar GitHub MCP:

1. Ve a [GitHub Settings](https://github.com/settings/tokens)
2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. Scopes necesarios:
   - ✅ `repo` (acceso completo a repositorios)
   - ✅ `workflow` (si quieres gestionar Actions)
   - ✅ `admin:org` (solo si trabajas con organizaciones)
5. Copia el token
6. Agrégalo a la configuración de GitHub MCP:

```json
"github": {
  "command": "npx",
  "args": [
    "-y",
    "@github/github-mcp-server"
  ],
  "env": {
    "GITHUB_TOKEN": "ghp_tu_token_aqui"
  }
}
```

### Paso 4: Ajustar Paths

#### Filesystem Path

Cambia el path del filesystem MCP a la ubicación de tu proyecto:

```json
"filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "/ruta/absoluta/a/tu/proyecto"  // ← Cambiar aquí
  ]
}
```

**Tips para obtener la ruta:**
```bash
# Desde la raíz de tu proyecto
pwd
# Output: /Users/usuario/proyectos/inmo-app
```

#### Memory Path (opcional)

Si quieres especificar dónde guardar la memoria:

```json
"memory": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"],
  "env": {
    "MEMORY_FILE_PATH": "/ruta/a/tu/proyecto/.mcp-memory.json"
  }
}
```

### Paso 5: Reiniciar Claude

**Claude Desktop:**
```bash
# macOS: Cmd + Q y reabrir
# Windows/Linux: Cerrar completamente y reabrir
```

**Claude Code:**
```bash
# Recargar ventana o reiniciar VS Code
```

### Paso 6: Verificar Instalación

Prueba cada MCP con un comando simple:

```
Tú: "Lista los MCP servers disponibles"
Claude: Debería mostrar los 6 servers instalados

Tú: "(Supabase) Lista las tablas de mi base de datos"
Claude: [Lista de tablas]

Tú: "(Filesystem) Lista archivos en la raíz del proyecto"
Claude: [Archivos del proyecto]

Tú: "(Memory) ¿Qué recuerdas?"
Claude: [Memoria vacía inicialmente]
```

---

## 🔧 Configuración Avanzada

### Modo Read-Only para Supabase

Para prevenir cambios accidentales en producción:

```json
"supabase": {
  "command": "npx",
  "args": [
    "-y",
    "@supabase/mcp-server-supabase@latest",
    "--access-token",
    "YOUR_TOKEN",
    "--read-only"
  ]
}
```

### Limitar Supabase a un Proyecto Específico

```json
"supabase": {
  "command": "npx",
  "args": [
    "-y",
    "@supabase/mcp-server-supabase@latest",
    "--access-token",
    "YOUR_TOKEN",
    "--project-ref",
    "your-project-ref"
  ]
}
```

### Múltiples Directorios para Filesystem

```json
"filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "/ruta/proyecto1",
    "/ruta/proyecto2",
    "/ruta/docs"
  ]
}
```

### Configurar Playwright con Browser Específico

```json
"playwright": {
  "command": "npx",
  "args": ["-y", "@executeautomation/playwright-mcp-server"],
  "env": {
    "BROWSER": "chromium"  // o "firefox", "webkit"
  }
}
```

---

## 🐛 Troubleshooting

### Error: "MCP server not responding"

**Solución 1:** Verifica que npx esté en tu PATH
```bash
which npx
# Debería mostrar: /usr/local/bin/npx o similar
```

**Solución 2:** Instala los paquetes globalmente
```bash
npm install -g @supabase/mcp-server-supabase
npm install -g @modelcontextprotocol/server-filesystem
# etc...
```

Luego cambia la configuración:
```json
"supabase": {
  "command": "mcp-server-supabase",
  "args": ["--access-token", "YOUR_TOKEN"]
}
```

### Error: "Permission denied" (Filesystem)

```bash
# Verifica permisos del directorio
ls -la /ruta/a/tu/proyecto

# Dale permisos de lectura/escritura si es necesario
chmod -R u+rw /ruta/a/tu/proyecto
```

### Error: "Invalid Supabase token"

1. Verifica que el token sea correcto (sin espacios extra)
2. Verifica que el token no haya expirado
3. Genera un nuevo token si es necesario

### Error: "GitHub authentication failed"

```bash
# Verifica que el token tenga los scopes necesarios
# Regenera el token con los scopes correctos
```

### Playwright: "Browser not found"

```bash
# Instala los browsers de Playwright
npx playwright install
```

### Memory: "Cannot write to file"

```bash
# Verifica que el directorio exista
mkdir -p $(dirname /ruta/a/.mcp-memory.json)

# Verifica permisos
chmod u+w /ruta/a/.mcp-memory.json
```

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE

1. **NUNCA** subas tokens a Git
2. Usa archivo `.env` para tokens sensibles
3. Limita scopes de tokens al mínimo necesario
4. Usa read-only mode en producción (Supabase)
5. Revoca tokens si los comprometes

### Variables de Entorno (Recomendado)

En lugar de hardcodear tokens, usa variables de entorno:

**1. Crea archivo `.env.local`:**
```bash
SUPABASE_MCP_TOKEN=tu_token_aqui
GITHUB_MCP_TOKEN=tu_token_aqui
```

**2. Modifica configuración para usar variables:**
```json
"supabase": {
  "command": "npx",
  "args": [
    "-y",
    "@supabase/mcp-server-supabase@latest",
    "--access-token",
    "${SUPABASE_MCP_TOKEN}"
  ]
}
```

**3. Carga variables antes de iniciar Claude:**
```bash
# macOS/Linux
export $(cat .env.local | xargs)
open -a "Claude"

# O agrega a ~/.zshrc o ~/.bashrc
```

---

## 📊 Verificación Completa

Ejecuta estos comandos para verificar que todo funciona:

### Checklist de Verificación

```
✅ Supabase MCP
   "Lista las tablas" → Debe mostrar: users, properties, etc.

✅ Filesystem MCP
   "Lista archivos en la raíz" → Debe mostrar: package.json, etc.

✅ GitHub MCP
   "Lista issues abiertos" → Debe mostrar tus issues

✅ Memory MCP
   "Recuerda: Test de instalación" → Debe confirmar

✅ Playwright MCP
   "Navega a https://google.com y toma screenshot" → Debe funcionar

✅ Fetch MCP
   "Fetch https://api.github.com" → Debe retornar JSON
```

---

## 🎓 Próximos Pasos

1. ✅ Lee la **Guía Completa**: `GUIA_MCP.md`
2. ✅ Consulta **Quick Reference**: `MCP_QUICK_REFERENCE.md`
3. ✅ Guarda convenciones de tu proyecto en Memory:
   ```
   "Recuerda que este proyecto usa:
   - Next.js 15 con App Router
   - Prisma + Supabase
   - Server Actions en app/actions/
   - Repository pattern"
   ```
4. ✅ Crea tu primer test con Playwright
5. ✅ Usa Supabase MCP para explorar tu DB

---

## 📚 Recursos

- [Documentación oficial MCP](https://modelcontextprotocol.io/)
- [Supabase MCP Docs](https://supabase.com/docs/guides/getting-started/mcp)
- [GitHub MCP Repo](https://github.com/github/github-mcp-server)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)

---

## 💬 Soporte

Si tienes problemas:

1. Revisa la sección de Troubleshooting
2. Consulta logs de Claude Desktop/Code
3. Verifica que los servers estén actualizados:
   ```bash
   npx @supabase/mcp-server-supabase@latest --version
   ```

---

**¡Listo! Ahora puedes usar los 6 MCP servers para potenciar tu desarrollo 🚀**
