# Testing Documentation - Index

> Índice de toda la documentación de testing y CI/CD para InmoApp

---

## 🎯 Quick Navigation

**¿Qué necesitas?**

| Necesidad | Documento |
|-----------|-----------|
| 🚀 Comandos rápidos | [QUICK_REFERENCE.md](#quick-reference) |
| 📚 Entender todo el sistema | [TESTING_AND_CI_CD.md](#testing-and-cicd) |
| ✅ Activar GitHub Actions | [CI_CD_SETUP_SUMMARY.md](#setup-summary) |
| 🧪 Escribir tests | [TESTING_GUIDE.md](#testing-guide) |
| 🔧 Configurar secretos | [.github/SETUP_SECRETS.md](../../.github/SETUP_SECRETS.md) |

---

## 📄 Documentos Disponibles

### QUICK_REFERENCE.md
**Cheat Sheet para día a día**

**Contenido:**
- Comandos de testing más usados
- Checklist pre-commit
- Patrones de testing (AAA)
- Troubleshooting rápido
- Links útiles

**Cuándo usar:** Referencia diaria durante desarrollo

**Audiencia:** Todos los desarrolladores

**Tiempo de lectura:** 2-3 minutos

[📖 Ver documento](./QUICK_REFERENCE.md)

---

### TESTING_AND_CI_CD.md
**Documentación completa y comprehensiva**

**Contenido:**
- Resumen ejecutivo (estado actual)
- Stack tecnológico detallado
- Infraestructura de testing actual
  - Configuración de Vitest
  - Setup global (mocks)
  - Test files por categoría
  - Helpers y utilidades
  - Métricas de testing
- Arquitectura de testing
  - Patrón de co-locación
  - Estrategia de mocking
  - Estructura de tests
  - Testing por capas
- **CI/CD con GitHub Actions**
  - Propuesta de workflows
  - Configuración completa
  - Integración con Vercel
- Guía de uso (comandos, workflows)
- Próximos pasos (roadmap)

**Cuándo usar:**
- Setup inicial de CI/CD
- Entender arquitectura completa
- Referencia técnica profunda
- Onboarding de nuevos developers

**Audiencia:** Tech leads, nuevos desarrolladores, setup de infraestructura

**Tiempo de lectura:** 20-30 minutos (completo)

[📖 Ver documento](./TESTING_AND_CI_CD.md)

---

### CI_CD_SETUP_SUMMARY.md
**Resumen ejecutivo de lo configurado**

**Contenido:**
- Archivos creados (lista completa)
- Estado actual (testing + CI/CD)
- **Próximos pasos para activar CI**
  - Configurar secretos
  - Branch protection
  - Probar workflow
  - Actualizar README
- Checklist de verificación
- Tips para desarrolladores

**Cuándo usar:**
- Activar CI/CD por primera vez
- Verificar que todo está configurado
- Ver roadmap de siguiente fase

**Audiencia:** DevOps, project managers, tech leads

**Tiempo de lectura:** 10 minutos

[📖 Ver documento](./CI_CD_SETUP_SUMMARY.md)

---

### TESTING_GUIDE.md
**Guía original de testing**

**Contenido:**
- Introducción a testing en InmoApp
- Cómo escribir tests
- Mejores prácticas
- Ejemplos

**Cuándo usar:** Escribir nuevos tests, entender patrones

**Audiencia:** Desarrolladores escribiendo tests

**Tiempo de lectura:** 10-15 minutos

[📖 Ver documento](./TESTING_GUIDE.md)

---

## 🔧 Documentos Relacionados (Fuera de testing/)

### .github/README.md
**Overview de configuración de GitHub**

**Ubicación:** `/.github/README.md`

**Contenido:**
- Descripción de workflows
- Setup inicial de CI/CD
- Configuración de branch protection
- Gestión de Dependabot
- Troubleshooting de CI

[📖 Ver documento](../../.github/README.md)

---

### .github/SETUP_SECRETS.md
**Guía paso a paso para secretos**

**Ubicación:** `/.github/SETUP_SECRETS.md`

**Contenido:**
- Lista de secretos requeridos
- Dónde encontrar cada secreto
- Instrucciones paso a paso
- Troubleshooting de secretos
- Buenas prácticas de seguridad

[📖 Ver documento](../../.github/SETUP_SECRETS.md)

---

### apps/web/__tests__/README.md
**Testing docs del workspace web**

**Ubicación:** `/apps/web/__tests__/README.md`

**Contenido:**
- Setup de tests en apps/web
- Helpers disponibles
- Ejemplos específicos

[📖 Ver documento](../../apps/web/__tests__/README.md)

---

### packages/database/src/__tests__/README.md
**Testing docs del workspace database**

**Ubicación:** `/packages/database/src/__tests__/README.md`

**Contenido:**
- Testing de repositorios
- Database mocking
- Fixtures

[📖 Ver documento](../../packages/database/src/__tests__/README.md)

---

## 🗺️ Roadmap de Lectura

### Para Developers Nuevos

**Día 1 - Setup:**
1. QUICK_REFERENCE.md (comandos básicos)
2. apps/web/__tests__/README.md (ver ejemplos)
3. Ejecutar: `bun run test -- --watch`

**Día 2 - Deep Dive:**
1. TESTING_GUIDE.md (patrones)
2. TESTING_AND_CI_CD.md → "Arquitectura de Testing"
3. Escribir tu primer test

**Semana 1 - Mastery:**
1. TESTING_AND_CI_CD.md (completo)
2. Explorar archivos .test.ts existentes
3. Contribuir con tests

---

### Para Tech Leads / DevOps

**Setup CI/CD (First Time):**
1. TESTING_AND_CI_CD.md → "CI/CD con GitHub Actions"
2. .github/SETUP_SECRETS.md (configurar secretos)
3. CI_CD_SETUP_SUMMARY.md → "Próximos Pasos"
4. .github/README.md (configurar branch protection)
5. Probar con PR de prueba

**Tiempo total:** 30-45 minutos

---

### Para Quick Reference (Diario)

**Antes de cada commit:**
1. QUICK_REFERENCE.md → "Checklist Pre-Commit"
2. Ejecutar: `bun run pre-commit`

**Cuando algo falla:**
1. QUICK_REFERENCE.md → "Troubleshooting"
2. Si no resuelve: TESTING_AND_CI_CD.md → "Troubleshooting"

---

## 📊 Métricas de Documentación

**Documentos totales:** 7

**Por tipo:**
- Quick Reference: 1
- Guías completas: 2
- Setup guides: 2
- Summaries: 1
- Workspace-specific: 2

**Cobertura:**
- ✅ Testing local
- ✅ CI/CD setup
- ✅ GitHub configuration
- ✅ Troubleshooting
- ✅ Best practices
- ✅ Examples

---

## 🔍 Búsqueda por Tema

### Commands & Scripts
- **QUICK_REFERENCE.md** → "Comandos Rápidos"
- **TESTING_AND_CI_CD.md** → "Guía de Uso"

### Writing Tests
- **TESTING_GUIDE.md** (completo)
- **apps/web/__tests__/README.md**
- **TESTING_AND_CI_CD.md** → "Arquitectura de Testing"

### CI/CD Setup
- **CI_CD_SETUP_SUMMARY.md** → "Próximos Pasos"
- **.github/SETUP_SECRETS.md**
- **.github/README.md**
- **TESTING_AND_CI_CD.md** → "CI/CD con GitHub Actions"

### Troubleshooting
- **QUICK_REFERENCE.md** → "Troubleshooting"
- **TESTING_AND_CI_CD.md** → "Troubleshooting"
- **.github/README.md** → "Troubleshooting"

### Architecture & Patterns
- **TESTING_AND_CI_CD.md** → "Arquitectura de Testing"
- **TESTING_GUIDE.md**

### Configuration
- **TESTING_AND_CI_CD.md** → "Infraestructura de Testing Actual"
- **.github/README.md**

---

## 🎓 Learning Path

### Beginner → Intermediate (Week 1)

```
Day 1: QUICK_REFERENCE.md + Ejecutar tests
Day 2: TESTING_GUIDE.md + Leer tests existentes
Day 3: Escribir primer test simple
Day 4: apps/web/__tests__/README.md + Test helpers
Day 5: TESTING_AND_CI_CD.md → "Testing por Capas"
```

### Intermediate → Advanced (Week 2)

```
Day 1: TESTING_AND_CI_CD.md → "Arquitectura completa"
Day 2: Mocking avanzado (vitest.setup.ts)
Day 3: Server Actions testing
Day 4: Repository testing
Day 5: Contribuir con tests complejos
```

### Advanced → CI/CD Master (Week 3)

```
Day 1: TESTING_AND_CI_CD.md → "CI/CD"
Day 2: .github/README.md + workflows
Day 3: CI_CD_SETUP_SUMMARY.md + Setup
Day 4: Configurar secretos + branch protection
Day 5: Monitorear CI, optimizar
```

---

## 📞 Support & Resources

### Internal Docs
- `docs/` (general documentation)
- `docs/AI_ASSISTANTS.md` (for AI context)
- `.claude/` (Claude-specific docs)

### External Links
- **Vitest:** https://vitest.dev/guide/
- **Testing Library:** https://testing-library.com/docs/react-testing-library/intro/
- **GitHub Actions:** https://docs.github.com/en/actions/quickstart
- **Turborepo CI:** https://turbo.build/repo/docs/ci

---

## ✅ Quick Start

**New to testing?** Start here:

```bash
# 1. Read the cheat sheet
cat docs/testing/QUICK_REFERENCE.md

# 2. Run tests
bun run test

# 3. Run in watch mode
cd apps/web && bun run test -- --watch

# 4. Explore existing tests
ls apps/web/**/__tests__/*.test.ts
```

**Setting up CI?** Start here:

```bash
# 1. Read setup summary
cat docs/testing/CI_CD_SETUP_SUMMARY.md

# 2. Configure secrets
open .github/SETUP_SECRETS.md

# 3. Test locally first
bun run ci

# 4. Follow steps in CI_CD_SETUP_SUMMARY.md
```

---

**Last Updated:** November 17, 2025
**Maintained by:** Engineering Team
**For updates:** See individual document headers
