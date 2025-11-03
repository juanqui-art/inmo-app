# InmoApp Modes Plugin 🚀

Plugin de Claude Code con 3 modos de asistencia especializados para desarrollo de inmo-app.

**Versión 2.0** - Ahora con 2 formas de activar: Slash Commands + Agentes

## Cómo usar

### Opción 1: Slash Commands (Recomendado para uso rápido)

Los 5 modos están disponibles como comandos slash. Escribe en el terminal de Claude Code:

```bash
/efficiency [tu tarea aquí]   # Respuestas rápidas y directas
/educator [tu tarea aquí]     # Modo enseñanza
/debugger [tu tarea aquí]     # Modo diagnóstico
/conciso [tu pregunta]        # Respuestas breves
/detallado [tu pregunta]      # Respuestas completas
```

**Ventaja:** Directo, rápido, sin necesidad de búsqueda en menús. El comando aparece en autocompletado.

### Opción 2: Agentes (Para invocación programática)

Los 3 modos también están disponibles como **sub-agents**. Úsalos mediante el Skill tool:
- Nombre: `efficiency`, `educator`, o `debugger`
- Ubicación: `.claude/plugins/inmo-app-modes/agents/`

**Ventaja:** Puedo invocarlos automáticamente en contextos complejos, sin que necesites escribir el comando.

---

## Modos disponibles

### 1. **Efficiency Mode** ⚡
Respuestas directas, código limpio, sin distracciones.

**Cuándo usar:**
- Necesitas implementar algo rápido
- Sabes qué hacer pero quieres código limpio
- Quieres una solución sin explicaciones largas
- Tienes prisa (deadline)

**Ejemplo:**
```bash
/efficiency add a loading state to the property list component
```

**Qué esperar:**
- Código funcional inmediato
- Máximo 2-3 puntos de insight
- Enfoque en implementación

---

### 2. **Educator Mode** 📚
Modo colaborativo donde TÚ participas en el código.

**Cuándo usar:**
- Quieres aprender mientras desarrollas
- Es tu primera vez con un patrón
- Quieres entender POR QUÉ funcionan las cosas
- Tienes tiempo para explorar

**Ejemplo:**
```bash
/educator help me implement a caching strategy for the map
```

**Qué esperar:**
- Explicación clara del concepto
- Solicitud de tu contribución (2-10 líneas código)
- Insights educativos después
- Aprendizaje activo y colaborativo

---

### 3. **Debugger Mode** 🔍
Especialista en encontrar y resolver problemas complejos.

**Cuándo usar:**
- Hay un bug que no entiendes
- El comportamiento es inesperado
- Necesitas entender la causa raíz
- Quieres pasos de debugging específicos

**Ejemplo:**
```bash
/debugger why is the infinite loop happening in useMapViewport?
```

**Qué esperar:**
- Diagnóstico methodológico
- 2-3 hipótesis alternativas
- Pasos específicos de debugging
- Explicación de POR QUÉ ocurrió el problema

---

### 4. **Concise Mode** 📝
Respuestas breves y directas al punto.

**Cuándo usar:**
- Solo necesitas la respuesta, sin explicaciones
- Tienes prisa
- Sabes qué preguntarle a Claude
- Quieres respuestas cortas

**Ejemplo:**
```bash
/conciso What's wrong with this component?
/conciso How do I fix this error?
```

**Qué esperar:**
- Respuesta directa (1-2 párrafos máximo)
- Sin contexto innecesario
- Solo los hechos esenciales

---

### 5. **Detailed Mode** 📖
Respuestas completas y comprehensivas.

**Cuándo usar:**
- Quieres entender todo el contexto
- Es un tema nuevo para ti
- Necesitas múltiples perspectivas
- Quieres explorar a fondo

**Ejemplo:**
```bash
/detallado Explain how React.cache() works in this project
/detallado Tell me everything about the map caching strategy
```

**Qué esperar:**
- Explicación completa con contexto
- Múltiples enfoques y perspectivas
- Ejemplos detallados
- Razonamiento profundo

---

## Instalación/Activación

El plugin está incluido en el proyecto. Se activa automáticamente cuando:

1. Confías en la carpeta `.claude/` (Claude Code lo pide)
2. **Reinicias Claude Code** (Esto es crítico después de actualizar el plugin)

**Verificar que funciona:**

**Opción 1 - Slash Commands (escribe en terminal de Claude Code):**
```bash
/efficiency hello      # Debería responder en modo eficiente
/educator hello        # Debería responder en modo educativo
/debugger hello        # Debería responder en modo debugging
/conciso hello         # Debería responder de forma breve
/detallado hello       # Debería responder de forma completa
```

**Opción 2 - Agentes (invocación automática):**
Los agentes se cargan automáticamente. Yo puedo invocarlos cuando necesito cambiar de modo.

---

## Estructura del Plugin

```
.claude/plugins/inmo-app-modes/
├── plugin.json              # Configuración (v2.1: referencia a directorios)
├── README.md                # Este archivo
├── agents/                  # Agentes especializados
│   ├── efficiency.md        # Modo rápido
│   ├── educator.md          # Modo enseñanza
│   └── debugger.md          # Modo diagnóstico
└── commands/                # Slash commands (5 comandos)
    ├── efficiency.md        # /efficiency
    ├── educator.md          # /educator
    ├── debugger.md          # /debugger
    ├── conciso.md           # /conciso
    └── detallado.md         # /detallado
```

---

## Ejemplo de flujo típico

### Usando Efficiency Mode:
```bash
# Tarea: Agregar un botón de reset al filtro de precio
/efficiency add a reset button to the price filter component

# Respuesta esperada:
# - Código funcional del botón
# - Dónde integrarlo
# - 1-2 puntos clave (si es necesario)
```

### Usando Educator Mode:
```bash
# Tarea: Implementar caché de búsquedas
/educator help me implement search result caching

# Respuesta esperada:
# - Explicación de qué es caching y por qué es útil
# - "Tu tarea: escribe la función que guarda resultados en caché"
# - [Esperas a que contribuyas con 5-10 líneas]
# - Explicación de por qué ese patrón es efectivo
```

### Usando Debugger Mode:
```bash
# Tarea: Entender un bug complejo
/debugger the price filter is showing stale data after updates

# Respuesta esperada:
# - "Posible causa: state no está sincronizado"
# - "Hipótesis 1: useEffect dependency array está incompleto"
# - "Pasos de debug: 1) console.log en cada setter, 2) inspecciona dependencias..."
# - "La causa raíz probablemente es..."
```

---

## Cuándo usar cada modo (Decision Tree)

```
¿Necesitas...?
│
├─ Código rápido y limpio? → /efficiency
├─ Aprender mientras haces? → /educator
├─ Entender un error? → /debugger
├─ Respuesta breve? → /conciso
└─ Respuesta completa? → /detallado
```

---

## Notas técnicas

- **Ubicación:** `.claude/plugins/inmo-app-modes/`
- **Configuración:** `.claude/settings.json`
- **Versión:** 2.0.0
- **Actualización:** Ahora usa formato correcto de agentes/comandos (v1.0 tenía formato incorrecto)

### Modelos por Agente

- **efficiency** → `haiku` (rápido, cost-effective)
- **educator** → `sonnet` (mejor para explicaciones)
- **debugger** → `opus` (máxima capacidad para debugging complejo)

### Archivos de Configuración

```
plugin.json          # Define nombre, versión, referencias a agents/ y commands/
agents/              # YAML frontmatter + system prompts de agentes
commands/            # Markdown con documentación de slash commands
```

---

## Troubleshooting

### Los slash commands no aparecen en autocompletado

**Solución:**
1. Asegúrate de que confías en `.claude/`
2. **Reinicia Claude Code completamente** (Cmd+Q en Mac, cierra la ventana)
3. Espera a que se recargue el plugin (puede tomar unos segundos)

### Los agentes no se invocan automáticamente

**Verificar:**
1. Los archivos existen en `.claude/plugins/inmo-app-modes/agents/`
2. El `plugin.json` tiene `"agents": "./agents/"`
3. Reiniciaste Claude Code

### ¿Cuál es la diferencia entre v1 y v2?

| Aspecto | v1 (Incorrecto) | v2 (Correcto) |
|---------|-----------------|---------------|
| Formato | Objeto inline en plugin.json | Archivos markdown con YAML |
| Agentes | No funcionaban | Funcionan con formato correcto |
| Comandos | No existían | 3 slash commands funcionales |
| Ubicación | Datos en plugin.json | Separados en agents/ y commands/ |

---

## Feedback y mejoras

Si algún modo no funciona como esperas:
1. Reinicia Claude Code completamente
2. Prueba con un ejemplo simple primero: `/efficiency hello`
3. Verifica que los archivos existen en `agents/` y `commands/`
4. Si hay inconsistencias, documenta el comportamiento

---

**Última actualización:** Noviembre 2, 2025
**Plugin versión:** 2.1.0
**Status:** ✅ Completamente funcional (5 slash commands + 3 agentes)
**Nuevas características (v2.1):** Comandos /conciso y /detallado para control granular del nivel de respuesta
