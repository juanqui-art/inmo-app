# 📚 InmoApp Documentation Index

> **Navegación completa de documentación** | Última actualización: Octubre 29, 2025 (Phase 3 - Reorganización)

---

## 🚀 Quick Navigation

**Nuevo en el proyecto?**
→ Comienza aquí: `getting-started/DEVELOPMENT_SETUP.md`

**¿Algo específico?**
→ Usa la tabla de búsqueda rápida abajo ⬇️

---

## 📦 Archivos Archivados

Si buscas **notas de sesiones anteriores** o **documentos de investigación**, mira en:
- **[archive/sessions/](../archive/sessions/)** - Notas de desarrollo previas (AI Search, feature builds)
- **[archive/research/](../archive/research/)** - Materiales de investigación y exploración

---

## 🗂️ Estructura de Documentación (Oct 29, 2025)

```
docs/
├── 📘 CORE (En raíz)
│   ├── INDEX.md                    ← Este archivo
│   ├── README.md                   (Resumen general)
│   └── DOCUMENTATION.md            (Guía para escribir docs)
│
├── 🚀 getting-started/             (Onboarding rápido)
│   ├── DEVELOPMENT_SETUP.md        ⭐ Comienza aquí
│   ├── QUICK_REFERENCE.md          (Comandos esenciales)
│   ├── ENV_QUICK_START.md          (Variables de entorno)
│   └── project-structure.md        (Arquitectura del proyecto)
│
├── 🏗️ architecture/                (Diseño de sistema)
│   ├── ENVIRONMENT_VARIABLES.md    (Variables en profundidad)
│   ├── ENV_ARCHITECTURE.md         (Configuración detallada)
│   ├── RLS_POLICIES.md             (Políticas de acceso DB)
│   └── node-modules-explained.md   (Estructura de módulos)
│
├── 🛠️ tools/                       (Herramientas de desarrollo)
│   ├── turborepo/
│   │   ├── TURBOREPO_GUIDE.md      (Turborepo/Turbopack/Bun)
│   │   └── TURBOREPO_CHEATSHEET.md (Referencia rápida)
│   ├── biome/
│   │   ├── BIOME_EXPLAINED.md      (Qué es Biome)
│   │   ├── BIOME_IMPROVEMENTS.md   (Mejoras recomendadas)
│   │   └── WEBSTORM_FORMAT_ISSUE.md
│   └── webstorm/
│       ├── WEBSTORM_BIOME_SETUP.md (Configuración en IDE)
│       └── WEBSTORM_BIOME_QUICKSTART.md (Setup rápido)
│
├── 🎨 design/                      (UI/UX & Temas)
│   ├── COLOR_PALETTE.md
│   ├── DARK_MODE.md
│   └── GLASSMORPHISM_IMPLEMENTATION_SUMMARY.md
│
├── ✨ features/                    (Features en desarrollo)
│   ├── MAP.md
│   ├── map-features-roadmap.md
│   ├── CLUSTERING_GUIDE.md
│   ├── CLUSTERING_AND_BOUNDS_QUICK_REFERENCE.md
│   ├── CLUSTERING_EXERCISES.md
│   ├── GLASSMORPHISM_CLUSTERING_GUIDE.md
│   ├── MAP_BOUNDS_URL_GUIDE.md
│   ├── ai-search-implementation.md
│   ├── ai-search-sesion-1-completed.md
│   ├── ai-search-testing-guide.md
│   ├── PROPERTY_SHARE_MENU.md
│   └── EMAIL_SENDING_TODO.md
│
├── 💾 caching/                     (Caching & Performance)
│   ├── CACHE_STRATEGY.md
│   ├── CACHE_COMPONENTS_GUIDE.md
│   ├── CACHE_IMPLEMENTATION_REVISED.md
│   ├── CACHE_IMPLEMENTATION_SUMMARY.md
│   ├── CACHE_QUICK_START.md
│   └── NEXTJS_CACHING_EXPLAINED.md
│
├── 🧠 learning/                    (Learning materials)
│   ├── debugging/
│   │   ├── DEBUGGING_HOOKS_GUIDE.md
│   │   └── REACT_HOOKS_ANTIPATTERNS.md
│   └── hooks/
│       ├── INFINITE_LOOP_DEEP_DIVE.md
│       ├── INFINITE_LOOP_QUICK_REFERENCE.md
│       ├── INFINITE_LOOP_VISUAL_GUIDE.md
│       ├── INFINITE_LOOP_DOCS_INDEX.md
│       └── UNDERSTANDING_THE_INFINITE_LOOP.md
│
├── 📖 reference/                   (Referencia general)
│   ├── NEXTJS_2025_UPDATES.md
│   ├── development-tasks-guide.md
│   └── git-worktrees-guide.md
│
├── 🤖 ai/                          (AI & Contexto)
│   ├── AI_ASSISTANTS.md            (Guía Claude/Gemini)
│   └── TOKEN_OPTIMIZATION.md       (Optimizar contexto)
│
├── 🔧 git/                         (Version control)
│   └── WORKTREES_CHEATSHEET.md
│
├── 💡 decisions/                   (Decisiones técnicas)
│   ├── CLUSTERING_SOLUTION.md
│   └── MAP_BOUNDS_CALCULATION.md
│
├── 📊 progress/                    (Estado del proyecto)
│   └── ROADMAP.md
│
├── 🔌 mcp/                         (Model Context Protocol)
│   ├── README.md
│   ├── GUIDE.md
│   ├── SETUP.md
│   └── QUICK_REFERENCE.md
│
├── 🎓 guides-web/                  (Guías específicas web)
│   ├── ADDING_FEATURES.md
│   └── TESTING.md
│
├── ⚙️ setup/                       (Setup & Instalación)
│   ├── PRISMA_POOLER.md
│   └── RESTART_SERVER.md
│
└── 🐛 troubleshooting/             (Solución de problemas)
    └── MAP_ISSUES.md
```

---

## ⚡ Búsqueda Rápida por Tarea

| Necesito... | Ir a... |
|---|---|
| 📋 Instalar proyecto | `getting-started/DEVELOPMENT_SETUP.md` |
| 💻 Comandos esenciales | `getting-started/QUICK_REFERENCE.md` |
| 🏗️ Entender arquitectura | `architecture/` |
| ⚙️ Configurar Biome | `tools/biome/BIOME_EXPLAINED.md` |
| 🚀 Aprender Turborepo | `tools/turborepo/TURBOREPO_GUIDE.md` |
| 💾 Implementar cacheo | `caching/` |
| 🗺️ Trabajo con mapa | `features/MAP.md` |
| 🤖 AI Search | `features/ai-search-implementation.md` |
| 🐛 Debug React hooks | `learning/debugging/` |
| ♾️ Infinite loops | `learning/hooks/INFINITE_LOOP_QUICK_REFERENCE.md` |
| 🤖 Usar Claude/Gemini | `ai/AI_ASSISTANTS.md` |
| 🔧 Git worktrees | `reference/git-worktrees-guide.md` |
| 📖 Agregar features | `guides-web/ADDING_FEATURES.md` |

---

## 🎓 Learning Paths (Rutas por Rol)

### Nuevo en el proyecto (1-2 horas)
1. `getting-started/DEVELOPMENT_SETUP.md` (instalación)
2. `getting-started/project-structure.md` (arquitectura)
3. `tools/turborepo/TURBOREPO_GUIDE.md` (build tools)
4. `getting-started/QUICK_REFERENCE.md` (comandos)

### Profundizar en Next.js (1-2 horas)
1. `reference/NEXTJS_2025_UPDATES.md`
2. `caching/NEXTJS_CACHING_EXPLAINED.md`
3. `caching/CACHE_STRATEGY.md`

### Dominar el mapeo (2-3 horas)
1. `features/MAP.md`
2. `features/CLUSTERING_GUIDE.md`
3. `features/MAP_BOUNDS_URL_GUIDE.md`
4. `features/CLUSTERING_EXERCISES.md`

### Debugging y React (2-3 horas)
1. `learning/debugging/DEBUGGING_HOOKS_GUIDE.md`
2. `learning/hooks/INFINITE_LOOP_DEEP_DIVE.md`
3. `learning/debugging/REACT_HOOKS_ANTIPATTERNS.md`

---

## 📊 Estadísticas de Documentación

```
Estructura: 16 categorías principales
Total docs:  ~55 documentos markdown
Total texto: ~130,000+ palabras
Organización: Plana → Jerárquica (Oct 29, 2025)
Estado: ✅ Completamente reorganizado
```

### Mejoras (Phase 3 - Oct 29)
✅ Creados 9 nuevos subdirectorios lógicos
✅ Movidos ~50 archivos de raíz a carpetas categorizadas
✅ Actualizado INDEX.md con navegación
✅ Archivos de raíz reducidos a 3 (INDEX, README, DOCUMENTATION)

---

## 🔄 Cambios Recientes

### Oct 29, 2025 - Phase 3: Reorganización
- ✅ Creada estructura lógica de 16 subdirectorios
- ✅ Movidos archivos from flat to organized
- ✅ getting-started/ para onboarding
- ✅ tools/ con turborepo/, biome/, webstorm/
- ✅ learning/ con debugging/ y hooks/
- ✅ ai/ para Claude/Gemini context
- ✅ reference/ para guías generales

### Oct 29, 2025 - Phase 2: CLAUDE.md
- ✅ Optimizado CLAUDE.md: 433 → 230 líneas (-48%)
- ✅ Agregado AI Search status
- ✅ Links a docs en lugar de duplicar contenido

### Oct 29, 2025 - Phase 1: Cleanup
- ✅ Archivados 6 archivos de sesión
- ✅ Archivados 3 archivos de investigación
- ✅ Root reducido: 11 → 5 archivos

---

## ✨ Filosofía de Organización

**Principio:** Una carpeta = Un tema | Cada tema es independiente pero linked

**Ventajas:**
- 🧭 Fácil navegación (16 categorías claras)
- 📖 Lectura enfocada (no 80 archivos en raíz)
- 🔗 Referencias cruzadas inteligentes
- 📚 Escalable (fácil agregar nuevas categorías)

---

## 🆘 ¿Necesitas ayuda?

1. **¿No sabes por dónde empezar?** → `getting-started/DEVELOPMENT_SETUP.md`
2. **¿Buscas algo específico?** → USA tabla "Búsqueda Rápida" arriba
3. **¿Vienes de una sesión anterior?** → Revisa `archive/sessions/`
4. **¿Pregunta sobre documentación?** → Ver `DOCUMENTATION.md`

---

**Estado:** ✅ COMPLETAMENTE REORGANIZADO (Phase 3, Oct 29, 2025)

**Próximas actualizaciones:**
- [ ] README.md para cada subdirectorio
- [ ] Cross-references actualizadas
- [ ] Búsqueda full-text en sitio (futuro)
