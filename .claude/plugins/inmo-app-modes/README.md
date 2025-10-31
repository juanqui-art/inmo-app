# InmoApp Modes Plugin 🚀

Plugin de Claude Code con 3 modos de asistencia especializados para desarrollo de inmo-app.

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

## Instalación/Activación

El plugin está incluido en el proyecto. Se activa automáticamente cuando:

1. Confías en la carpeta `.claude/` (Claude Code lo pide)
2. Reinicias Claude Code (o esperas a que se recargue)

**Verificar que funciona:**
```bash
/efficiency hello      # Debería responder en modo eficiente
/educator hello        # Debería responder en modo educativo
/debugger hello        # Debería responder en modo debugging
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
└─ Entender un error? → /debugger
```

---

## Notas técnicas

- **Ubicación:** `.claude/plugins/inmo-app-modes/`
- **Configuración:** `.claude/settings.json`
- **Modelo:** Claude Haiku 4.5 (optimizado para cost-effectiveness)
- **Versión:** 1.0.0

### System Prompts (qué controla cada modo)

Ver `.claude-plugin/plugin.json` para los system prompts completos de cada agente.

---

## Feedback y mejoras

Si algún modo no funciona como esperas:
1. Verifica que el plugin esté activado (reinicia Claude Code)
2. Prueba con un ejemplo simple primero
3. Si hay inconsistencias, documenta el comportamiento

---

**Última actualización:** Octubre 31, 2025
**Plugin versión:** 1.0.0
