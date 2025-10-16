# 📦 MCP Servers Setup - Proyecto Inmobiliario

Este directorio contiene la configuración y documentación para los **Model Context Protocol (MCP) servers** instalados en este proyecto.

---

## 📚 Archivos Incluidos

| Archivo | Descripción |
|---------|-------------|
| `MCP_CONFIG.json` | Configuración de los 6 MCP servers (🔴 NO subir a Git) |
| `MCP_SETUP.md` | Guía de instalación paso a paso |
| `GUIA_MCP.md` | Guía completa con ejemplos detallados |
| `MCP_QUICK_REFERENCE.md` | Referencia rápida de comandos |

---

## ⚡ Quick Start

### 1. Instalar (5 minutos)

```bash
# 1. Obtén token de Supabase
# https://supabase.com/dashboard/account/tokens

# 2. Copia MCP_CONFIG.json a la configuración de Claude
# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json

# 3. Reemplaza YOUR_SUPABASE_ACCESS_TOKEN_HERE con tu token

# 4. Ajusta el path del filesystem a tu proyecto

# 5. Reinicia Claude Desktop
```

### 2. Verificar

```
Tú: "Lista los MCP servers disponibles"
Claude: [Debería mostrar 6 servers]
```

### 3. Primer Comando

```
Tú: "(Supabase) Lista las tablas de mi base de datos"
Claude: [Lista: users, properties, property_images, ...]
```

---

## 🎯 Los 6 MCP Servers Instalados

### 1. 🗄️ Supabase MCP
**Para:** Gestión de base de datos con lenguaje natural
```
"Lista las 10 propiedades más caras"
"Crea tabla analytics con columnas..."
"Muestra propiedades sin imágenes"
```

### 2. 📁 Filesystem MCP
**Para:** Operaciones de archivos del proyecto
```
"Crea componente PropertyMap en components/properties/"
"Busca archivos que usan 'propertyRepository'"
"Lee el archivo schema.prisma"
```

### 3. 🐙 GitHub MCP
**Para:** Gestión de repositorio, issues, PRs
```
"Lista issues abiertos"
"Crea issue 'Implementar mapa de propiedades'"
"Revisa el código del PR #15"
```

### 4. 🧠 Memory MCP
**Para:** Memoria persistente entre sesiones
```
"Recuerda que usamos Prisma + Supabase"
"¿Dónde van las server actions?"
"Guarda: Patrón para crear repositories"
```

### 5. 🎭 Playwright MCP
**Para:** Testing E2E y automatización de browser
```
"Navega a localhost:3000 y toma screenshot"
"Genera test para el flujo de login"
"Valida que el formulario muestre errores"
```

### 6. 🌐 Fetch MCP
**Para:** HTTP requests y web scraping
```
"Obtén coordenadas de 'Av. Constitución, Monterrey'"
"Fetch API de Mapbox con [params]"
"Convierte URL a markdown"
```

---

## 💡 Ejemplos de Uso Real

### Crear Feature Completa
```
Tú: "Vamos a crear la feature de 'Propiedades Relacionadas':

1. (Memory) Recuerda que usamos algoritmo basado en:
   - Misma ciudad
   - Mismo tipo de transacción
   - Rango de precio ±20%

2. (Supabase) Crea query para obtener propiedades relacionadas

3. (Filesystem) Crea componente RelatedProperties.tsx

4. (GitHub) Crea issue para tracking

5. (Playwright) Genera test E2E"

Claude: [Ejecuta los 5 pasos y crea la feature completa]
```

### Debug Session
```
Tú: "La búsqueda de propiedades es lenta, ayúdame a debuggear:

1. (Supabase) Revisa índices de la tabla properties
2. (Filesystem) Muéstrame el código de búsqueda
3. (Playwright) Mide el tiempo de respuesta
4. (Memory) Guarda las optimizaciones"

Claude: [Análisis completo con recomendaciones]
```

### Code Review
```
Tú: "Revisa el PR #15:

1. (GitHub) Lee los cambios
2. (Memory) Compara con nuestros patrones
3. (Playwright) Test del cambio
4. (GitHub) Comenta feedback"

Claude: [Review completo]
```

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE

```bash
# ❌ NUNCA hagas esto:
git add MCP_CONFIG.json  # Contiene tokens sensibles!

# ✅ Siempre verifica antes de commit:
git status
# Si ves MCP_CONFIG.json, NO lo agregues

# ✅ El .gitignore ya está configurado para ignorarlo
```

### Tokens Seguros

1. **Supabase:** Genera token con mínimos permisos necesarios
2. **GitHub:** Usa token con scopes limitados
3. **Producción:** Usa modo read-only para Supabase

---

## 📖 Documentación

### Para Comenzar
👉 **Lee primero:** `MCP_SETUP.md`

### Guía Completa
👉 **Referencia completa:** `GUIA_MCP.md` (incluye 30+ ejemplos)

### Comandos Rápidos
👉 **Cheat sheet:** `MCP_QUICK_REFERENCE.md`

---

## 🎓 Convenciones del Proyecto

Guarda estas convenciones en Memory al iniciar:

```
"Recuerda las convenciones de este proyecto:

Arquitectura:
- Framework: Next.js 15 (App Router)
- Base de datos: Supabase (PostgreSQL)
- ORM: Prisma
- Monorepo: Turborepo (apps/web, packages/database)

Estructura de carpetas:
- Server Actions: apps/web/app/actions/
- Repositories: packages/database/repositories/
- Componentes públicos: apps/web/components/ (sin prefijo)
- Componentes de layout: apps/web/components/layout/
- Validaciones Zod: apps/web/lib/validations/

Patrones de código:
- Repository Pattern para DB operations
- Server Actions para mutations
- Validación con Zod schemas
- Auth helpers en lib/auth.ts

Naming:
- Componentes: PascalCase (PropertyCard)
- Server Actions: camelCase + Action (createPropertyAction)
- Repositories: camelCase (propertyRepository)
- Types: PascalCase

Data Flow:
Component → Server Action → Repository → Prisma → DB"
```

---

## 🚀 Tips Pro

### 1. Combina múltiples MCPs en un solo prompt
```
"Usa Supabase para obtener las 10 propiedades más vistas,
crea con Filesystem un componente TrendingProperties,
y guarda en Memory que este componente se actualiza diariamente"
```

### 2. Usa Memory para contexto persistente
```
"Recuerda que las propiedades destacadas (featured) se determinan por:
- rating > 4.5
- views > 100
- created_at < 30 días"
```

### 3. Automatiza workflows con Playwright
```
"Genera suite de tests E2E para:
- Homepage
- Login/Signup
- Búsqueda de propiedades
- Crear propiedad (dashboard)"
```

---

## 🆘 Troubleshooting Rápido

### MCP no responde
```bash
# Verifica instalación
which npx

# Reinstala paquetes
npm install -g @supabase/mcp-server-supabase

# Reinicia Claude
```

### Token inválido
```
1. Genera nuevo token en Supabase Dashboard
2. Actualiza MCP_CONFIG.json
3. Reinicia Claude
```

### Filesystem: Permission denied
```bash
# Verifica permisos
ls -la /path/to/project

# Ajusta si es necesario
chmod -R u+rw /path/to/project
```

---

## 📊 Checklist de Setup

- [ ] Token de Supabase obtenido y configurado
- [ ] Path de Filesystem ajustado al proyecto
- [ ] Claude Desktop reiniciado
- [ ] Verificado: "Lista los MCP servers disponibles"
- [ ] Probado Supabase: "Lista las tablas"
- [ ] Probado Filesystem: "Lista archivos en la raíz"
- [ ] Guardado convenciones en Memory
- [ ] Leída guía completa (GUIA_MCP.md)

---

## 🎯 Próximos Pasos

1. **Día 1:** Familiarízate con cada MCP (usa ejemplos básicos)
2. **Día 2:** Guarda convenciones del proyecto en Memory
3. **Día 3:** Crea tu primer test E2E con Playwright
4. **Día 4:** Automatiza una tarea repetitiva
5. **Día 5:** Combina múltiples MCPs en workflows

---

## 💬 Feedback

¿Encontraste un problema o tienes una sugerencia?

1. Crea un issue en GitHub
2. Documenta el caso de uso
3. Comparte con el equipo

---

**¡Listo para usar MCP servers! 🚀**

**Comando de prueba:**
```
"(Memory) Recuerda que completé el setup de MCP el $(date)"
```
