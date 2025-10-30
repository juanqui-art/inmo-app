# AI Search v2 - Mejoras de Validación de Ubicación

**Fecha:** 29 de Octubre, 2025
**Versión:** 2.0
**Estado:** ✅ Implementado y Probado

---

## 🎯 Problema Identificado

**Reporte del usuario:**
> "Casa 3 habitaciones Quito Norte" devuelve 4 propiedades, pero no tengo propiedades en Quito (Ecuador)

**Causa raíz:**
- El sistema no validaba ubicaciones contra el inventario real
- El LLM podía "alucinar" propiedades en ciudades inexistentes
- Falta de feedback al usuario sobre scope geográfico limitado
- Confidence scoring no penalizaba ubicaciones inválidas

**Inventario actual:**
- 50 propiedades en 4 ciudades: Cuenca (32), Gualaceo (8), Azogues (6), Paute (4)
- Todas en Ecuador, provincia de Azuay
- **Scope geográfico limitado** - no cubre todo Ecuador

---

## 📚 Investigación de Mejores Prácticas

### Fuentes de información:
1. **Zillow Natural Language Search (2023)**
   - Escanean millones de listados antes de mostrar resultados
   - Validación estricta de ubicación contra inventario
   - Sugerencias de ubicaciones cercanas cuando no existe match

2. **AWS QnA LLM-as-a-Judge Framework**
   - 90% de precisión en evaluación semántica
   - Chain-of-Thought reasoning para mejor accuracy
   - Contextual Evaluation Prompt Routing para reducir alucinaciones

3. **Natural Language Search Best Practices (2025)**
   - Lenguaje conversacional natural
   - Tolerancia a typos y sinónimos
   - Fuzzy matching para desambiguación
   - Monitoreo de performance con telemetría

---

## 🛠️ Mejoras Implementadas

### 1. **Sistema de Validación de Ubicación** (location-validator.ts)

Nuevo módulo que valida ubicaciones contra inventario real:

```typescript
interface LocationValidationResult {
  isValid: boolean;
  requestedLocation: string;
  matchedCity?: string;
  suggestedCities?: string[];
  confidence: number; // 0-100
  message?: string;
}
```

**Características:**
- ✅ **Cache de ciudades disponibles** (TTL 5 min) - evita queries DB constantes
- ✅ **Fuzzy matching** (Levenshtein distance) - maneja typos ("Cueca" → "Cuenca")
- ✅ **Normalización de texto** - ignora acentos y capitalización
- ✅ **Sistema de sugerencias** - muestra ciudades disponibles cuando no hay match
- ✅ **Confidence scoring** - 0-100 basado en similitud de strings

**Ejemplo de uso:**
```typescript
const validation = await validateLocation("Quito");
// {
//   isValid: false,
//   requestedLocation: "Quito",
//   suggestedCities: ["Cuenca", "Gualaceo", "Azogues"],
//   confidence: 0,
//   message: "Location 'Quito' not found. Available: Cuenca, Gualaceo, Azogues, Paute"
// }
```

---

### 2. **Prompt Dinámico con Inyección de Ciudades** (search-parser.ts)

**Antes (v1):**
```typescript
const SYSTEM_PROMPT = `...`; // Prompt estático, menciona "Cuenca y alrededores"
```

**Después (v2):**
```typescript
function generateSystemPrompt(availableCities: string): string {
  return `You are an expert real estate search assistant...

**CRITICAL: LOCATION SCOPE VALIDATION**
You have access to properties ONLY in these cities:
${availableCities}  // <- Lista dinámica desde DB

If a user requests a location NOT in this list, you MUST:
1. Set confidence to 0-20 (very low)
2. Include a "locationError" field in reasoning
3. Do NOT hallucinate properties in unavailable locations
4. Suggest the closest available city if possible
...`;
}
```

**Mejoras en el prompt:**
- ✅ **Lista explícita de ciudades disponibles** - previene alucinaciones
- ✅ **Instrucciones estrictas de validación** - confidence 0-20 si ubicación inválida
- ✅ **Manejo de ubicaciones fuera de scope** - explica por qué no hay resultados
- ✅ **Chain-of-Thought mejorado** - pasos de validación explícitos

---

### 3. **Validación en Dos Capas** (Defense in Depth)

#### **Capa 1: LLM (GPT-4o-mini)**
- Revisa si ciudad está en la lista disponible
- Set `city: null` si no está
- Reduce confidence a 0-20
- Explica error en `reasoning`

#### **Capa 2: Backend Validation**
```typescript
// En parseSearchQuery después de LLM response
if (filters.city) {
  locationValidation = await validateLocation(filters.city);

  if (!locationValidation.isValid) {
    finalConfidence = Math.min(confidence, 20); // Penalización severa
  } else if (locationValidation.matchedCity !== filters.city) {
    finalConfidence = Math.min(confidence, locationValidation.confidence);
    filters.city = locationValidation.matchedCity; // Auto-corrección
  }
}
```

---

## 🧪 Resultados de Pruebas

### Test 1: Ubicación Inválida (Problema reportado)
```
Query: "Casa 3 habitaciones Quito Norte"
✅ Confidence: 15% (rechazado)
✅ City: null (no devuelve ubicación falsa)
✅ Reasoning: "City 'Quito' is not in the available cities list"
```

### Test 2: Ubicación Válida
```
Query: "Apartamento 2 habitaciones en Cuenca bajo $150k"
✅ Confidence: 95%
✅ Location Validation: { isValid: true, matchedCity: "Cuenca" }
```

### Test 3: Fuzzy Matching (Typo)
```
Query: "Apartamento en Cueca"
✅ LLM corrigió typo: "Cueca" → "Cuenca"
✅ Location Validation: { isValid: true }
```

---

## 📈 Beneficios

### **Para Usuarios:**
- ✅ **No más resultados falsos** para ubicaciones inexistentes
- ✅ **Feedback claro** cuando buscan fuera del scope geográfico
- ✅ **Sugerencias útiles** de ubicaciones disponibles
- ✅ **Tolerancia a typos** - corrección automática

### **Para el Sistema:**
- ✅ **Reduced hallucination rate** - dos capas de validación
- ✅ **Better UX** - claridad sobre qué está/no está disponible
- ✅ **Performance monitoring** - logs de validación para debugging
- ✅ **Scalable** - cache + validación dinámica

---

## 🚀 Próximos Pasos (Opcional)

1. **UI Feedback Mejorado:**
   - Mostrar mensaje cuando ubicación no existe
   - Botones de "Ver en [Ciudad Sugerida]" para alternativas

2. **Telemetría:**
   - Trackear queries con ubicaciones inválidas
   - Identificar ciudades más buscadas para expansión

3. **Expansión Geográfica:**
   - Cuando se agreguen propiedades en nuevas ciudades, el sistema se actualiza automáticamente (cache TTL 5 min)

4. **Mejoras de Fuzzy Matching:**
   - Considerar distancia geográfica real para sugerencias
   - Mapear neighborhoods a ciudades principales

---

## 🔗 Referencias

- **Best Practices Research:**
  - Zillow Natural Language Search (2023)
  - AWS QnA LLM-as-a-Judge Framework
  - Natural Language Search Engines (2025)

- **Código:**
  - `apps/web/lib/ai/location-validator.ts` - Validación de ubicación
  - `apps/web/lib/ai/search-parser.ts` - Parser mejorado con validación
  - `scripts/check-locations.ts` - Script para verificar inventario
  - `scripts/test-ai-search-quick.ts` - Tests críticos

---

## ✅ Checklist de Implementación

- [x] Investigar mejores prácticas (Zillow, AWS QnA)
- [x] Analizar inventario de ubicaciones en DB
- [x] Crear módulo de validación de ubicación
- [x] Implementar fuzzy matching (Levenshtein)
- [x] Implementar cache de ciudades disponibles
- [x] Actualizar prompt con inyección dinámica de ciudades
- [x] Integrar validación en dos capas (LLM + Backend)
- [x] Arreglar errores de TypeScript en archivos relacionados
- [x] Crear scripts de prueba
- [x] Ejecutar pruebas con casos críticos
- [x] Documentar mejoras y resultados

---

**Implementado por:** Claude Code
**Basado en:** Investigación de mejores prácticas de la industria
**Estado:** ✅ Production-ready
