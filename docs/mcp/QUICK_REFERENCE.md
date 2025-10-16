# ⚡ MCP Quick Reference

Comandos rápidos para los 6 MCP servers instalados en el proyecto.

---

## 🗄️ Supabase MCP

```bash
# Database Operations
"Lista todas las tablas"
"Describe la tabla properties"
"SELECT * FROM properties WHERE status = 'AVAILABLE' LIMIT 10"
"Muéstrame las 5 propiedades más caras"

# Schema Management
"Crea tabla [nombre] con columnas [...]"
"Agrega columna [nombre] tipo [tipo] a tabla [tabla]"
"Crea índice en tabla [tabla] columna [columna]"

# Analytics
"Cuántas propiedades hay por ciudad?"
"Muestra propiedades sin imágenes"
"Reporte de propiedades más vistas esta semana"
```

---

## 📁 Filesystem MCP

```bash
# Read Operations
"Lee el archivo [path]"
"Muestra la estructura de carpetas de [path]"
"Lista archivos en [directorio]"

# Write Operations
"Crea componente [nombre] en [path] con [descripción]"
"Crea archivo [nombre] con contenido [...]"
"Modifica [archivo]: agrega [cambio]"

# Search
"Busca '[término]' en todo el proyecto"
"Busca archivos que usan '[función]'"
"Encuentra todos los componentes que importan '[módulo]'"

# Refactoring
"Extrae la lógica de [componente] a un hook separado"
"Refactoriza [archivo] para usar [patrón]"
```

---

## 🐙 GitHub MCP

```bash
# Issues
"Lista issues abiertos"
"Crea issue '[título]' con descripción [...]"
"Cierra issue #[número]"
"Agrega label '[label]' a issue #[número]"

# Pull Requests
"Lista PRs abiertos"
"Crea PR desde [branch] a [target] con título '[título]'"
"Revisa el código del PR #[número]"

# Repository
"Muestra últimos 10 commits"
"Lista branches"
"Verifica estado de GitHub Actions"

# Collaboration
"Asígnale issue #[número] a [usuario]"
"Comenta en PR #[número]: [comentario]"
```

---

## 🧠 Memory MCP

```bash
# Save Information
"Recuerda que [información]"
"Guarda: [decisión de arquitectura]"
"Anota: [convención de código]"

# Query Information
"¿Qué recuerdas sobre [tema]?"
"¿Dónde van los [tipo de archivo]?"
"¿Cuál es el patrón para [tarea]?"

# Manage Memory
"Actualiza la info sobre [tema] a [nueva info]"
"Olvida [información]"
"Muestra toda tu memoria sobre este proyecto"

# Relationships
"¿Cómo se relacionan [entidad1] y [entidad2]?"
"¿Qué decisiones hemos tomado sobre [tema]?"
```

---

## 🎭 Playwright MCP

```bash
# Navigation
"Navega a [URL]"
"Abre [URL] y toma screenshot"
"Visita [página] y verifica que contenga '[texto]'"

# Testing
"Genera test para validar [flujo]"
"Test de [feature]: [pasos]"
"Valida que [formulario] muestre errores si está vacío"

# Interaction
"Click en [selector]"
"Llena formulario con: [datos]"
"Scroll hasta [elemento]"

# Data Extraction
"Extrae [datos] de página [URL]"
"Lista todos los [elementos] en [página]"

# Performance
"Mide tiempo de carga de [página]"
"Reporta métricas de performance de [URL]"
```

---

## 🌐 Fetch MCP

```bash
# API Calls
"Fetch [URL]"
"Consulta API [nombre] con [parámetros]"
"GET [endpoint] con headers [...]"
"POST a [URL] con body [...]"

# Data Conversion
"Convierte [URL] a markdown"
"Obtén JSON de [API]"
"Parse HTML de [URL]"

# Validation
"Verifica que [URL] sea accesible"
"Valida respuesta de [API]"
"Health check de [endpoint]"

# Integration
"Obtén coordenadas de dirección '[dirección]' desde Mapbox"
"Consulta exchange rates de [moneda]"
```

---

## 🔗 Combinaciones Poderosas

### Feature Completa
```
1. (Memory) "Recuerda el patrón para feature [X]"
2. (Supabase) "Crea tabla/query necesarios"
3. (Filesystem) "Crea componentes y actions"
4. (GitHub) "Crea issue para tracking"
5. (Playwright) "Genera tests E2E"
```

### Debug Session
```
1. (GitHub) "Muestra issue #[X] con el bug"
2. (Filesystem) "Busca archivos relacionados"
3. (Supabase) "Query para reproducir"
4. (Playwright) "Test para validar fix"
5. (Memory) "Guarda la solución para futura referencia"
```

### Code Review
```
1. (GitHub) "Lee código del PR #[X]"
2. (Memory) "Consulta convenciones del proyecto"
3. (Playwright) "Test del cambio"
4. (GitHub) "Comenta en PR con feedback"
```

---

## 💡 Tips Pro

### Combina comandos en una sola pregunta
```
"Usa Supabase para obtener las 10 propiedades más recientes,
luego con Filesystem crea un componente RecentProperties que las muestre,
y guarda en Memory que este componente se actualiza cada vez que hay nueva propiedad"
```

### Usa contexto del proyecto
```
"Siguiendo el patrón de createPropertyAction,
crea deletePropertyAction con validación de ownership"
```

### Pide explicaciones
```
"Explícame qué hace este query de Supabase:
[query SQL complejo]"
```

---

## 🚨 Comandos de Emergencia

```bash
# Backup rápido
"(Supabase) Exporta datos de tabla [tabla]"
"(Filesystem) Crea backup de archivo [crítico]"

# Rollback
"(GitHub) Muestra cómo revertir commit [hash]"
"(Supabase) Genera query para deshacer cambios en [tabla]"

# Debug urgente
"(Playwright) Test rápido de [feature crítica]"
"(Supabase) Muestra logs de errores recientes"
"(Filesystem) Busca todos los console.error en el proyecto"
```

---

## 📝 Plantillas Útiles

### Crear Feature
```
Vamos a crear la feature de [NOMBRE]:

1. (Memory) Recuerda que esta feature incluye [componentes]
2. (Supabase) [Cambios de DB necesarios]
3. (Filesystem) Crea:
   - Componente [X] en [path]
   - Server Action [Y] en [path]
   - Validación Zod en [path]
4. (Playwright) Test que valide [flujo]
5. (GitHub) Issue para tracking
```

### Code Review
```
Revisa [archivo/PR]:

1. (Filesystem) Lee el código
2. (Memory) Compara con nuestros patrones
3. Valida:
   - ✅ TypeScript types correctos
   - ✅ Manejo de errores
   - ✅ Sigue convenciones
   - ✅ Tests incluidos
4. Sugiere mejoras
```

### Deploy Checklist
```
Pre-deploy checklist:

1. (Filesystem) No console.logs en producción
2. (Supabase) Migraciones aplicadas
3. (GitHub) CI passing
4. (Playwright) Tests E2E passing
5. (Memory) Guarda versión deployada
```

---

## 🎯 Atajos por Rol

### Developer Frontend
```
- "Crea componente [X]" → Filesystem
- "Test de [componente]" → Playwright
- "Estilo responsive para [X]" → Filesystem + Playwright
```

### Developer Backend
```
- "Query para [caso]" → Supabase
- "Server Action para [operación]" → Filesystem + Supabase
- "Migración: [cambios]" → Supabase
```

### Tech Lead
```
- "Analiza rendimiento de [feature]" → Playwright + Supabase
- "Revisa arquitectura de [módulo]" → Memory + Filesystem
- "Estado del proyecto" → GitHub + Memory
```

---

**📖 Para guía completa ver: `GUIA_MCP.md`**
