# InmoApp Documentation

Documentación completa del proyecto InmoApp - Plataforma de bienes raíces con exploración interactiva en mapa.

---

## 🚀 Inicio Rápido

### Para nuevos desarrolladores:
1. **[Quick Start](./QUICK_START.md)** - Comienza en 5 minutos
2. **[Setup](./technical/SETUP.md)** - Configuración inicial del proyecto
3. **[Architecture](./ARCHITECTURE.md)** - Entiende la estructura del proyecto

### Necesitas información específica:
- **Tengo un error** → [Common Errors](./troubleshooting/COMMON_ERRORS.md)
- **El mapa no funciona** → [Map Issues](./troubleshooting/MAP_ISSUES.md)
- **Quiero agregar una feature** → [Adding Features](./guides/ADDING_FEATURES.md)

---

## 📚 Documentación por Tema

### ✨ Features
Documentación detallada de cada feature implementado:
- **[Map Implementation](./features/MAP.md)** - Mapa interactivo con markers y clustering
  - ✅ Viewport synchronization a URL
  - ✅ Property markers con clustering
  - ✅ getBounds() para precisión
  - ⏳ Filter sidebar (en progreso)
  - ⏳ Search con geocoding

- **[Properties Management](./features/PROPERTIES.md)** - Gestión de propiedades
- **[Authentication](./features/AUTHENTICATION.md)** - Sistema de autenticación
- **[Filtering](./features/FILTERING.md)** - Sistema de filtros dinámicos
- **[Clustering](./features/CLUSTERING.md)** - Clustering de markers con Supercluster

### 🎨 Design
Guías de diseño y componentes:
- **[Color Palette](./design/COLOR_PALETTE.md)** - Colores del proyecto (Oslo Gray, etc)
- **[Dark Mode](./design/DARK_MODE.md)** - Implementación de dark mode
- **[Typography](./design/TYPOGRAPHY.md)** - Tipografía y estilos
- **[Components](./design/COMPONENTS.md)** - Componentes reutilizables

### 🔧 Technical
Guías técnicas y configuración:
- **[Setup](./technical/SETUP.md)** - Configuración inicial
- **[Database](./technical/DATABASE.md)** - Prisma, Supabase, migrations
- **[API Routes](./technical/API_ROUTES.md)** - Rutas API y Server Actions
- **[Hooks](./technical/HOOKS.md)** - Custom hooks del proyecto
- **[Performance](./technical/PERFORMANCE.md)** - Optimizaciones y tips
- **[Environment Variables](./technical/ENV_VARS.md)** - Variables de entorno

### 📖 Guides
Guías prácticas y workflows:
- **[Adding Features](./guides/ADDING_FEATURES.md)** - Cómo agregar una nueva feature
- **[Testing](./guides/TESTING.md)** - Testing y debugging
- **[Debugging](./guides/DEBUGGING.md)** - Técnicas de debugging
- **[Common Tasks](./guides/COMMON_TASKS.md)** - Tareas comunes (migrations, seeding, etc)

### 🎯 Decisions
Decision logs (Architecture Decision Records):
- **[Map Bounds Calculation](./decisions/MAP_BOUNDS_CALCULATION.md)** - Por qué usamos map.getBounds()
- **[Clustering Solution](./decisions/CLUSTERING_SOLUTION.md)** - Problema y solución del clustering
- **[Padding Implementation](./decisions/PADDING_IMPLEMENTATION.md)** - Por qué 80px padding en MapBox
- **[Architecture Choices](./decisions/ARCHITECTURE_CHOICES.md)** - Server + Client components, etc

### 🆘 Troubleshooting
Solución de problemas comunes:
- **[Common Errors](./troubleshooting/COMMON_ERRORS.md)** - Errores frecuentes y soluciones
- **[Performance Issues](./troubleshooting/PERFORMANCE_ISSUES.md)** - Problemas de performance
- **[Map Issues](./troubleshooting/MAP_ISSUES.md)** - Problemas específicos del mapa
  - Markers desapareciendo
  - Clustering no funciona
  - Bounds incorrectos

### 📊 Progress Tracking
Seguimiento del progreso del proyecto:
- **[Roadmap](./progress/ROADMAP.md)** - Qué viene (Next phases)
- **[Completed Features](./progress/COMPLETED_FEATURES.md)** - Features implementadas
- **[Changelog](./progress/CHANGELOG.md)** - Cambios recientes por fecha
- **[Known Issues](./progress/KNOWN_ISSUES.md)** - Issues conocidas

### 📖 References
Información de referencia:
- **[External APIs](./references/EXTERNAL_APIS.md)** - MapBox, Supabase, etc
- **[Dependencies](./references/DEPENDENCIES.md)** - Librerías importantes
- **[Glossary](./references/GLOSSARY.md)** - Términos del proyecto

---

## 🎓 Aprendizaje Estructurado

### Soy nuevo en el proyecto
Sigue este orden:
1. [Quick Start](./QUICK_START.md) - Entiende cómo iniciar
2. [Architecture](./ARCHITECTURE.md) - Entiende la estructura
3. [Features](./features/MAP.md) - Entiende qué se ha hecho
4. [Adding Features](./guides/ADDING_FEATURES.md) - Comienza a contribuir

### Necesito arreglar algo
1. Busca en [Common Errors](./troubleshooting/COMMON_ERRORS.md)
2. Si es del mapa → [Map Issues](./troubleshooting/MAP_ISSUES.md)
3. Si es de performance → [Performance Issues](./troubleshooting/PERFORMANCE_ISSUES.md)
4. Revisa [Debugging Guide](./guides/DEBUGGING.md)

### Quiero agregar una feature
1. Lee [Adding Features](./guides/ADDING_FEATURES.md)
2. Revisa [Architecture](./ARCHITECTURE.md) para entender dónde encaja
3. Ve a [Common Tasks](./guides/COMMON_TASKS.md) para patterns específicos
4. Revisa la feature similar en [features/](./features/)

---

## 📋 Información de Proyecto

**Stack:**
- Next.js 16 + React 19
- TypeScript
- Tailwind CSS v4
- MapBox GL
- Prisma + PostgreSQL (Supabase)
- Turborepo (monorepo)

**Fases:**
- ✅ **Fase 1**: Mapa interactivo con markers y clustering
- ⏳ **Fase 1.5**: Filtros dinámicos y búsqueda
- 📅 **Fase 2**: Multi-tenant (agentes inmobiliarios)
- 📅 **Fase 3**: Analytics y reportes

**Repositorio:**
```bash
inmo-app/
├── apps/web/          # Aplicación principal (Next.js)
├── packages/
│   ├── database/      # Prisma + Supabase
│   ├── env/          # Variables de entorno
│   ├── supabase/     # Cliente Supabase
│   ├── ui/           # Componentes compartidos
│   └── typescript-config/
└── docs/             # Esta documentación ← TÚ ESTÁS AQUÍ
```

---

## 🤝 Contribuir

Cuando agregues una feature o arregles un bug:

1. **Documenta en code**: Comentarios claros
2. **Crea un documento**: Agrega info en [features/](./features/) o [decisions/](./decisions/)
3. **Actualiza Changelog**: Agrega entrada en [CHANGELOG.md](./progress/CHANGELOG.md)
4. **Actualiza Roadmap**: Si cambia el plan, actualiza [ROADMAP.md](./progress/ROADMAP.md)

---

## ❓ FAQ

**P: ¿Dónde está la documentación de X?**
R: Usa Ctrl+F en este archivo para buscar palabras clave.

**P: ¿Cómo agrego una página de documentación?**
R: Ver [Adding Features](./guides/ADDING_FEATURES.md) - mismo proceso se aplica a docs.

**P: El mapa no funciona correctamente**
R: Ver [Map Issues](./troubleshooting/MAP_ISSUES.md) - cubre 90% de problemas.

**P: ¿Qué tecnologías se usan?**
R: Ver [Technical](./technical/) folder y [External APIs](./references/EXTERNAL_APIS.md).

---

## 📞 Contacto

Para preguntas sobre la documentación:
- Revisar [Glossary](./references/GLOSSARY.md) para términos
- Revisar [Common Errors](./troubleshooting/COMMON_ERRORS.md)
- Revisar [Debugging Guide](./guides/DEBUGGING.md)

---

**Última actualización:** Oct 24, 2025
**Documentación versión:** 1.0
**Status:** ✅ Completa y actualizada

*Mantén esta documentación actualizada mientras trabajas en el proyecto. Código sin documentación es código difícil de mantener.*
