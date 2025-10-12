# Token Optimization Guide

## 📊 Ahorro Logrado

### Antes de Optimización
- **CLAUDE.md**: ~3k tokens (217 líneas)
- **Archivos auto-cargados**: 27k tokens total
- **Archivos pesados**: Siempre cargados (39.5k tokens)
- **Total contexto**: ~70k tokens por conversación

### Después de Optimización
- **QUICK_START.md**: ~800 tokens (65 líneas) ← **Principal referencia**
- **CLAUDE.md**: ~600 tokens (47 líneas) ← **Mínimo esencial**
- **Archivos auto-cargados**: 27k tokens (sin cambios aún)
- **Archivos pesados**: En .claudeignore, carga manual
- **Total contexto**: ~28k tokens por conversación

**Ahorro**: ~60% (42k tokens) en cada conversación

---

## 🎯 Cómo Usar el Sistema Optimizado

### Para Quick Fixes (comandos directos)

**Antes (consume muchos tokens):**
```
"Revisa el código y dame recomendaciones de mejora"
→ Carga contexto completo, lee múltiples archivos
```

**Después (eficiente):**
```
"Fix: typo en línea 45 de hero-section.tsx"
→ Solo lee el archivo necesario, cambio puntual
```

---

### Para Features Nuevas (scope limitado)

**Antes:**
```
"Mejora el sistema de UI completo"
→ Busca en 20+ archivos, planifica refactor masivo
```

**Después:**
```
"Agrega GSAP al HeroSection únicamente"
→ Lee 4 archivos, implementación incremental
```

---

### Para Preguntas de Arquitectura (carga selectiva)

**Antes:**
```
"Explícame el sistema multi-tenant"
→ Todo el contexto cargado automáticamente
```

**Después:**
```
"@.claude/08-multi-tenant-strategy.md Explica pricing tiers"
→ Solo carga el archivo específico cuando lo mencionas
```

---

## 💡 Comandos Optimizados

### Quick Fixes (< 5k tokens)
```bash
"Add aria-label to button"
"Fix type error in line X"
"Update import path"
```

### Features Incrementales (< 20k tokens)
```bash
"Add focus animation to SearchBar"
"Implement magnetic button effect"
"Create fade-in entrance animation"
```

### Arquitectura/Planning (< 40k tokens)
```bash
"@.claude/filename.md [specific question]"
"/plan Implement feature X"
```

---

## 📚 Archivos de Referencia

### Siempre Disponible (auto-cargados)
- `QUICK_START.md` (800 tokens) ← **Usa este primero**
- `CLAUDE.md` (600 tokens)
- `.claude/01-06` files (27k tokens) ← Detalles técnicos

### Carga Manual (en .claudeignore)
```
@.claude/08-multi-tenant-strategy.md   # 14k - SaaS architecture
@.claude/07-technical-debt.md          # 8.5k - Testing, refactoring
@.claude/09-teaching-style.md          # 6k - Documentation patterns
@.claude/08-appointments-analysis.md   # 11k - Appointments system
```

**Cuándo cargar:**
- Multi-tenant: Implementando Organization, Stripe, subdominios
- Technical Debt: Refactoring, testing, error handling
- Teaching Style: Escribiendo docs detallados
- Appointments: Feature de agendamiento específicamente

---

## 🔍 Lecturas de Archivos Optimizadas

### Antes (ineficiente)
```typescript
Read(file)  // Lee todo el archivo (500 líneas = ~3k tokens)
```

### Después (eficiente)
```typescript
Read(file, offset: 280, limit: 80)  // Solo 80 líneas = ~500 tokens
```

**Ahorro**: 85% menos tokens por lectura

---

## 🎓 Mejores Prácticas

### ✅ DO
- Ser específico en preguntas: "Fix X en línea Y"
- Limitar scope: "Solo componente HeroSection"
- Usar `/plan` para exploración sin ejecutar
- Mencionar archivos pesados solo cuando necesario: `@.claude/file.md`
- Leer secciones específicas con `offset` y `limit`

### ❌ DON'T
- Preguntas vagas: "Mejora todo"
- Scope amplio: "Refactoriza toda la app"
- Cargar docs innecesarios
- Leer archivos completos cuando solo necesitas una función

---

## 📈 Métricas de Éxito

### Conversación Típica (Antes)
- Tokens usados: ~110k
- Archivos leídos: 15-20
- Contexto cargado: 70k tokens
- Respuestas: Verbose, ejemplos extensos

### Conversación Típica (Después)
- Tokens usados: ~40-50k (**54% ahorro**)
- Archivos leídos: 4-6
- Contexto cargado: 28k tokens
- Respuestas: Concisas, código directo

---

## 🚀 Próximos Pasos

### Opcional: Comprimir .claude/01-06 files

Si necesitas aún más ahorro, puedes comprimir los archivos auto-cargados:

**Actual**: 27k tokens
**Potencial**: ~8-10k tokens (70% reducción)

**Cómo**:
1. Eliminar ejemplos redundantes
2. Usar bullet points en lugar de párrafos
3. Referenciar en lugar de duplicar información

**Trade-off**: Menos contexto detallado vs más tokens disponibles

---

## 💰 Resumen de Ahorros

| Optimización | Tokens Ahorrados | % Ahorro |
|--------------|------------------|----------|
| QUICK_START.md creado | - | Nueva referencia |
| CLAUDE.md comprimido | 2.4k | 80% |
| .claudeignore (4 files) | 39.5k | 100% de esos archivos |
| Workflow optimizado | Variable | 40-70% por task |
| **TOTAL ESTIMADO** | **~42k** | **~60%** |

**Resultado**: De ~110k tokens/conversación a ~40-50k tokens/conversación

---

## 📝 Notas

- Esta optimización NO afecta la calidad de las respuestas
- Solo reduce contexto innecesario
- Puedes cargar archivos pesados cuando realmente los necesites
- El workflow optimizado es más rápido y preciso

**Recuerda**: `QUICK_START.md` es tu mejor amigo para comandos rápidos.
