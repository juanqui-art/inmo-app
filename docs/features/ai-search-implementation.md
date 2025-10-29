# 🤖 AI Search Implementation Guide - InmoApp

> **Fecha de creación:** 19 de Octubre, 2025
> **Propósito:** Guía paso a paso para implementar búsqueda con IA y modal de onboarding
> **Prioridad:** Alta - Feature diferenciador único en Ecuador

---

## 📋 Tabla de Contenidos

1. [Overview del Feature](#overview-del-feature)
2. [Arquitectura Técnica](#arquitectura-técnica)
3. [Implementación por Sesiones](#implementación-por-sesiones)
4. [Componentes Detallados](#componentes-detallados)
5. [Integración con OpenAI/Claude](#integración-con-openaiClaude)
6. [Testing & Edge Cases](#testing--edge-cases)
7. [Costos y Consideraciones](#costos-y-consideraciones)

---

## 🎯 Overview del Feature

### **¿Qué es?**
Búsqueda inteligente que entiende lenguaje natural y filtra propiedades automáticamente.

### **Ejemplo de uso:**
```
Usuario escribe: "Casa moderna en Cuenca con 3 habitaciones cerca del centro"

AI interpreta:
  ✓ Ubicación: Cuenca
  ✓ Tipo: Casa (HOUSE)
  ✓ Estilo: Moderna
  ✓ Habitaciones: 3
  ✓ Proximidad: Centro histórico

Sistema ejecuta:
  → Centra mapa en Cuenca centro
  → Filtra: category=HOUSE, bedrooms=3
  → Calcula distancia al centro
  → Actualiza mapa + drawer
```

### **Por qué modal con onboarding:**
✅ **Espacio:** Suficiente para explicar el feature
✅ **Guía:** Ejemplos interactivos clickeables
✅ **Educación:** Tips de cómo usar la búsqueda
✅ **Novedad:** Feature único requiere introducción
✅ **Foco:** Usuario se concentra en la búsqueda

---

## 🏗️ Arquitectura Técnica

### **Stack:**
```
Frontend (Next.js):
  → AISearchButton (trigger)
  → AISearchModal (UI + ejemplos)
  → AISearchInput (input component)

Backend (Server Action):
  → aiSearchAction(query: string)
  → Llama OpenAI/Claude API
  → Retorna filtros estructurados

AI Service:
  → OpenAI GPT-4o-mini (recomendado)
  → O Claude 3.5 Sonnet (alternativa)
  → Extrae entities del query

Database (Prisma):
  → Aplica filtros extraídos
  → Retorna propiedades filtradas
```

### **Flujo de datos:**
```
1. Usuario: "Casa moderna 3 hab"
2. Modal → Server Action → AI API
3. AI responde: { category: "HOUSE", bedrooms: 3, style: "modern" }
4. Server Action → Prisma query
5. Prisma → Propiedades filtradas
6. Frontend → Actualiza mapa + drawer
```

---

## 📅 Implementación por Sesiones

### **Sesión 1: Setup + Modal UI (2-3 horas)** ✅ Primera prioridad

**Objetivo:** Crear modal de onboarding funcional (sin AI todavía)

**Tasks:**
- [ ] Crear `AISearchButton` component
  - Botón trigger en navbar o flotante
  - Badge "Nuevo" opcional
  - Animación hover

- [ ] Crear `AISearchModal` component
  - Layout espacioso (600px desktop)
  - Backdrop con blur
  - Animaciones de entrada/salida
  - Botón close (X)

- [ ] Diseñar sección de ejemplos
  - 4-6 ejemplos clickeables
  - Diseño tipo "pills" o cards
  - Hover effects

- [ ] Crear `AISearchInput` component
  - Input grande con placeholder
  - Loading state
  - Clear button
  - Counter de caracteres (opcional)

**Resultado esperado:**
- Modal funcional que se abre/cierra
- UI completa con ejemplos
- Input funcionando (sin AI)
- Animaciones suaves

**Siguiente sesión:** Integración con AI

---

### **Sesión 2: Integración AI API (2-3 horas)** 🤖

**Objetivo:** Conectar con OpenAI/Claude y extraer parámetros

**Tasks:**
- [ ] Setup OpenAI API
  - Instalar: `npm install openai`
  - Configurar API key en `.env.local`
  - Crear cliente en `lib/ai/client.ts`

- [ ] Crear `lib/ai/search-parser.ts`
  - Función `parseSearchQuery(query: string)`
  - Prompt engineering para extraer entities
  - Retornar objeto estructurado

- [ ] Crear `app/actions/ai-search.ts`
  - Server Action `aiSearchAction(query: string)`
  - Llamar parseSearchQuery()
  - Validar respuesta AI
  - Error handling

- [ ] Testing básico
  - Probar con queries reales
  - Verificar respuestas AI
  - Logs para debugging

**Resultado esperado:**
- AI extrae correctamente parámetros
- Server Action funciona
- Logs muestran respuestas AI

**Siguiente sesión:** Aplicar filtros al mapa

---

### **Sesión 3: Aplicar Filtros + Update Mapa (2-3 horas)** 🗺️

**Objetivo:** Conectar resultados AI con filtrado de propiedades y mapa

**Tasks:**
- [ ] Crear hook `useAISearch`
  - Estado para query y resultados
  - Función para ejecutar búsqueda
  - Loading states

- [ ] Modificar `MapView` o `MapContainer`
  - Recibir filtros desde AI
  - Aplicar filtros a propiedades
  - Actualizar markers visibles

- [ ] Implementar `flyTo` en el mapa
  - Si AI detecta ubicación → centrar mapa
  - Zoom apropiado según área
  - Animación suave

- [ ] Actualizar drawer
  - Mostrar propiedades filtradas
  - Badge: "X resultados de búsqueda IA"
  - Botón "Limpiar filtros"

**Resultado esperado:**
- Búsqueda AI filtra propiedades
- Mapa se actualiza automáticamente
- Drawer muestra resultados
- UX completa funcionando

**Siguiente sesión:** Polish y mejoras

---

### **Sesión 4: Polish + UX Improvements (1-2 horas)** ✨

**Objetivo:** Mejorar experiencia y agregar features secundarias

**Tasks:**
- [ ] Historial de búsquedas
  - Guardar últimas 3-5 búsquedas
  - Mostrar en modal
  - localStorage

- [ ] Sugerencias inteligentes
  - Mientras escribe, mostrar sugerencias
  - Basadas en búsquedas comunes
  - Autocomplete

- [ ] Feedback visual
  - Toast notification: "Encontramos X propiedades"
  - Highlight en mapa de resultados
  - Badge en search button con count

- [ ] Analytics tracking
  - Track queries de usuarios
  - Tasa de éxito de búsquedas
  - Queries fallidas para mejorar

**Resultado esperado:**
- UX pulida y profesional
- Features secundarias funcionando
- Analytics para iterar

**Siguiente sesión:** Testing y launch

---

### **Sesión 5: Testing + Edge Cases (1-2 horas)** 🧪

**Objetivo:** Asegurar calidad y manejar casos especiales

**Tasks:**
- [ ] Testing de queries
  - Queries simples: "Casa en Cuenca"
  - Queries complejas: "Apartamento moderno 3 hab con garaje bajo $150k"
  - Queries ambiguas: "Algo bonito cerca del río"
  - Queries inválidas: "asdfasdf"

- [ ] Error handling
  - AI no responde → Fallback message
  - AI responde mal → Validación
  - Sin resultados → Empty state friendly
  - Rate limits → Queue o mensaje

- [ ] Performance
  - Debounce de búsquedas
  - Cache de resultados similares
  - Optimizar llamadas API

- [ ] Mobile testing
  - Modal responsive
  - Input keyboard behavior
  - Touch interactions

**Resultado esperado:**
- Feature robusto y confiable
- Edge cases manejados
- Performance optimizada

---

## 🎨 Componentes Detallados

### **1. AISearchButton Component**

**Ubicación:** Navbar (top-right) o Floating (top-center mapa)

**Props:**
```typescript
interface AISearchButtonProps {
  variant?: "navbar" | "floating";
  showBadge?: boolean; // "Nuevo" badge
  onClick: () => void;
}
```

**Diseño:**
```jsx
// Navbar variant
<button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all">
  <Sparkles className="w-5 h-5" />
  <span className="font-semibold">Buscar con IA</span>
  {showBadge && (
    <span className="px-2 py-0.5 bg-white text-blue-600 text-xs rounded-full">
      Nuevo
    </span>
  )}
</button>

// Floating variant
<button className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-white dark:bg-oslo-gray-900 shadow-2xl rounded-full border border-oslo-gray-200 dark:border-oslo-gray-700">
  🤖 Buscar con IA
</button>
```

**Animación hover:**
```css
hover:scale-105
hover:shadow-xl
transition-transform duration-200
```

---

### **2. AISearchModal Component**

**Props:**
```typescript
interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}
```

**Estructura:**
```jsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-oslo-gray-900 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Búsqueda Inteligente</h2>
              <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
                Describe lo que buscas en lenguaje natural
              </p>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <AISearchInput
          autoFocus
          placeholder="Ej: Casa moderna con 3 habitaciones cerca del centro"
          onSearch={onSearch}
          isLoading={isLoading}
        />

        {/* Examples Section */}
        <div className="mt-6">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            💡 Prueba con estos ejemplos:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => onSearch(example)}
                className="text-left p-3 rounded-lg border border-oslo-gray-200 dark:border-oslo-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
              >
                <p className="text-sm">{example}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold mb-2">🎯 Tips para mejores resultados:</p>
          <ul className="text-sm space-y-1 text-oslo-gray-700 dark:text-oslo-gray-300">
            <li>• Menciona la ubicación específica (Ej: "en El Ejido")</li>
            <li>• Incluye características importantes (garaje, jardín, etc.)</li>
            <li>• Especifica tu presupuesto si lo tienes claro</li>
            <li>• Describe el estilo o tipo de propiedad</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

**Ejemplos sugeridos:**
```typescript
const EXAMPLES = [
  "Casa moderna en Cuenca con 3 habitaciones",
  "Apartamento cerca de la universidad bajo $120k",
  "Propiedad con jardín y garaje en el norte",
  "Suite amueblada para arriendo en el centro",
  "Casa colonial con patio en Gualaceo",
  "Penthouse con vista panorámica"
];
```

---

### **3. AISearchInput Component**

**Props:**
```typescript
interface AISearchInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}
```

**Diseño:**
```jsx
<div className="relative">
  <textarea
    autoFocus={autoFocus}
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
      }
    }}
    placeholder={placeholder}
    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-oslo-gray-200 dark:border-oslo-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
    rows={3}
    maxLength={200}
  />

  {/* Loading Spinner */}
  {isLoading && (
    <div className="absolute right-4 top-4">
      <Loader className="w-5 h-5 animate-spin text-blue-500" />
    </div>
  )}

  {/* Clear Button */}
  {!isLoading && query && (
    <button
      onClick={() => setQuery("")}
      className="absolute right-4 top-4 text-oslo-gray-400 hover:text-oslo-gray-600"
    >
      <X className="w-5 h-5" />
    </button>
  )}

  {/* Character Count */}
  <div className="mt-2 flex items-center justify-between">
    <span className="text-xs text-oslo-gray-500">
      {query.length}/200 caracteres
    </span>
    <button
      onClick={handleSearch}
      disabled={!query || isLoading}
      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {isLoading ? "Buscando..." : "Buscar"}
    </button>
  </div>
</div>
```

---

## 🤖 Integración con OpenAI/Claude

### **Opción A: OpenAI GPT-4o-mini (Recomendado)**

**Setup:**
```bash
npm install openai
```

```typescript
// lib/ai/client.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

**Search Parser:**
```typescript
// lib/ai/search-parser.ts
import { openai } from "./client";

interface SearchParams {
  location?: string;
  category?: "HOUSE" | "APARTMENT" | "VILLA" | "PENTHOUSE" | "SUITE" | "COMMERCIAL" | "FARM";
  transactionType?: "SALE" | "RENT";
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[]; // ["garage", "garden", "pool", "modern", etc.]
  proximity?: string; // "centro", "universidad", etc.
}

export async function parseSearchQuery(query: string): Promise<SearchParams> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Eres un asistente de búsqueda de propiedades inmobiliarias en Ecuador.
Extrae parámetros de búsqueda del query del usuario y retorna un JSON estructurado.

Categorías válidas: HOUSE, APARTMENT, VILLA, PENTHOUSE, SUITE, COMMERCIAL, FARM
Tipos de transacción: SALE, RENT
Ubicaciones comunes en Cuenca: Centro, El Ejido, Yanuncay, Monay, Gualaceo, etc.
Features comunes: garage, garden, pool, balcony, modern, colonial, furnished, etc.

Si el query menciona "cerca de" o "junto a", extrae en proximity.
Si menciona rango de precio, extrae minPrice y maxPrice.

Retorna solo JSON válido, sin explicaciones adicionales.`
      },
      {
        role: "user",
        content: query
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3, // Más determinístico
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from AI");

  const params = JSON.parse(content) as SearchParams;
  return params;
}
```

**Ejemplos de respuestas esperadas:**
```typescript
// Query: "Casa moderna en Cuenca con 3 habitaciones"
{
  location: "Cuenca",
  category: "HOUSE",
  bedrooms: 3,
  features: ["modern"]
}

// Query: "Apartamento cerca de la universidad bajo $120k"
{
  location: "Cuenca",
  category: "APARTMENT",
  maxPrice: 120000,
  proximity: "universidad"
}

// Query: "Propiedad con jardín y garaje para arriendo"
{
  transactionType: "RENT",
  features: ["garden", "garage"]
}
```

**Server Action:**
```typescript
// app/actions/ai-search.ts
"use server";

import { parseSearchQuery } from "@/lib/ai/search-parser";
import { prisma } from "@repo/database";

export async function aiSearchAction(query: string) {
  try {
    // 1. Parse query con AI
    const params = await parseSearchQuery(query);

    // 2. Construir query Prisma
    const where: any = {};

    if (params.location) {
      where.city = {
        contains: params.location,
        mode: "insensitive"
      };
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.transactionType) {
      where.transactionType = params.transactionType;
    }

    if (params.bedrooms) {
      where.bedrooms = { gte: params.bedrooms };
    }

    if (params.bathrooms) {
      where.bathrooms = { gte: params.bathrooms };
    }

    if (params.minPrice || params.maxPrice) {
      where.price = {};
      if (params.minPrice) where.price.gte = params.minPrice;
      if (params.maxPrice) where.price.lte = params.maxPrice;
    }

    // 3. Ejecutar query
    const properties = await prisma.property.findMany({
      where,
      include: {
        images: {
          take: 1
        }
      },
      take: 50 // Límite razonable
    });

    // 4. Si hay proximity, calcular distancia (futuro)
    // TODO: Filtrar por proximidad a landmarks conocidos

    return {
      success: true,
      properties,
      params, // Retornar para mostrar filtros aplicados
      query
    };

  } catch (error) {
    console.error("AI Search Error:", error);
    return {
      success: false,
      error: "No pudimos procesar tu búsqueda. Intenta reformularla.",
      properties: [],
      params: null,
      query
    };
  }
}
```

---

### **Opción B: Claude API (Alternativa)**

**Setup:**
```bash
npm install @anthropic-ai/sdk
```

```typescript
// lib/ai/client.ts
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

**Search Parser con Claude:**
```typescript
// lib/ai/search-parser.ts
import { anthropic } from "./client";

export async function parseSearchQuery(query: string): Promise<SearchParams> {
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Extrae parámetros de búsqueda inmobiliaria del siguiente query:
"${query}"

Retorna SOLO un objeto JSON con esta estructura:
{
  "location": string | undefined,
  "category": "HOUSE" | "APARTMENT" | "VILLA" | "PENTHOUSE" | "SUITE" | "COMMERCIAL" | "FARM" | undefined,
  "transactionType": "SALE" | "RENT" | undefined,
  "minPrice": number | undefined,
  "maxPrice": number | undefined,
  "bedrooms": number | undefined,
  "bathrooms": number | undefined,
  "features": string[] | undefined,
  "proximity": string | undefined
}

Sin explicaciones adicionales, solo JSON.`
      }
    ]
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Invalid response");

  // Claude puede envolver JSON en backticks, limpiar
  const jsonText = content.text.replace(/```json\n?|\n?```/g, "").trim();
  const params = JSON.parse(jsonText) as SearchParams;
  return params;
}
```

---

## 🧪 Testing & Edge Cases

### **Test Cases:**

**1. Queries Simples:**
```typescript
const simpleTests = [
  { query: "Casa en Cuenca", expected: { location: "Cuenca", category: "HOUSE" } },
  { query: "Apartamento", expected: { category: "APARTMENT" } },
  { query: "3 habitaciones", expected: { bedrooms: 3 } },
];
```

**2. Queries Complejas:**
```typescript
const complexTests = [
  {
    query: "Casa moderna en El Ejido con 3 habitaciones, garaje y jardín bajo $200k",
    expected: {
      location: "El Ejido",
      category: "HOUSE",
      bedrooms: 3,
      maxPrice: 200000,
      features: ["modern", "garage", "garden"]
    }
  },
  {
    query: "Apartamento para arriendo cerca de la universidad con 2 baños",
    expected: {
      category: "APARTMENT",
      transactionType: "RENT",
      bathrooms: 2,
      proximity: "universidad"
    }
  }
];
```

**3. Queries Ambiguas:**
```typescript
const ambiguousTests = [
  { query: "Algo bonito cerca del río", note: "Debe manejar 'bonito' y 'río'" },
  { query: "Busco casa", note: "Muy vago, debe buscar solo casas" },
  { query: "Propiedad económica", note: "¿Qué es económico? < $100k?" }
];
```

**4. Queries Inválidas:**
```typescript
const invalidTests = [
  { query: "asdfasdf", expected: "error" },
  { query: "", expected: "error" },
  { query: "12345", expected: "error" }
];
```

### **Error Handling:**

```typescript
// Empty results
if (properties.length === 0) {
  return {
    success: true,
    properties: [],
    message: "No encontramos propiedades con esos criterios. Intenta ampliar tu búsqueda."
  };
}

// AI API error
try {
  const params = await parseSearchQuery(query);
} catch (error) {
  return {
    success: false,
    error: "Hubo un problema procesando tu búsqueda. Por favor intenta nuevamente.",
    fallback: "search_traditional" // Trigger búsqueda tradicional
  };
}

// Rate limit
if (error.code === "rate_limit_exceeded") {
  return {
    success: false,
    error: "Demasiadas búsquedas. Espera un momento e intenta nuevamente."
  };
}
```

---

## 💰 Costos y Consideraciones

### **Costos de API (OpenAI):**

**GPT-4o-mini:**
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens

**Estimación por búsqueda:**
```
Prompt system: ~200 tokens
Query usuario: ~50 tokens
Respuesta AI: ~100 tokens
Total: ~350 tokens

Costo por búsqueda: ~$0.0003 (0.03 centavos)
```

**Presupuesto mensual:**
```
100 búsquedas/día = 3,000/mes
Costo: 3,000 * $0.0003 = $0.90/mes

1,000 búsquedas/día = 30,000/mes
Costo: 30,000 * $0.0003 = $9/mes

10,000 búsquedas/día = 300,000/mes
Costo: 300,000 * $0.0003 = $90/mes
```

**Conclusión:** Extremadamente económico en fase inicial

---

### **Optimizaciones de Costos:**

**1. Cache de queries similares:**
```typescript
// Si query es similar a una anterior (Levenshtein distance)
// Retornar resultado cacheado
const cachedResult = await redis.get(`ai_search:${normalizedQuery}`);
if (cachedResult) return JSON.parse(cachedResult);
```

**2. Rate limiting por usuario:**
```typescript
// Máximo 10 búsquedas por usuario por hora
const userSearchCount = await redis.incr(`user_searches:${userId}`);
if (userSearchCount > 10) {
  return { error: "Rate limit exceeded" };
}
```

**3. Usar modelo más barato para queries simples:**
```typescript
// Si query es < 10 palabras y solo tiene ubicación + tipo
// Usar GPT-3.5-turbo (más barato) en vez de GPT-4o
```

---

## 📊 Analytics & Métricas

### **Eventos a trackear:**

```typescript
// Track búsqueda
analytics.track("ai_search_performed", {
  query,
  resultCount: properties.length,
  params: JSON.stringify(params),
  timestamp: new Date(),
  userId
});

// Track éxito
if (properties.length > 0) {
  analytics.track("ai_search_success", { query, resultCount });
} else {
  analytics.track("ai_search_no_results", { query, params });
}

// Track click en resultado
analytics.track("ai_search_result_clicked", {
  query,
  propertyId,
  position: index
});
```

### **Dashboard de métricas:**
- Total de búsquedas AI
- Tasa de éxito (con resultados vs sin resultados)
- Queries más comunes
- Queries que fallan (para mejorar)
- Tiempo promedio de respuesta
- Costo acumulado de API

---

## 🚀 Roadmap de Mejoras Futuras

### **Post-MVP (después de lanzamiento):**

**1. Búsqueda conversacional:**
```
Usuario: "Casa en Cuenca"
Bot: "Encontré 15 casas. ¿Cuántas habitaciones necesitas?"
Usuario: "3 habitaciones"
Bot: "Quedan 8 casas con 3 habitaciones. ¿Cuál es tu presupuesto?"
```

**2. Búsqueda por imagen:**
```
Usuario sube foto de una casa que le gusta
AI: "Veo una casa estilo colonial con jardín. Te muestro similares..."
```

**3. Recomendaciones proactivas:**
```
Basado en tu búsqueda de "Casa moderna 3 hab":
→ "También te pueden interesar estas casas con 4 habitaciones en la misma zona"
```

**4. Filtros negativos:**
```
Usuario: "Casa en Cuenca pero NO en el centro"
AI: Filtra excluyendo zona centro
```

**5. Comparables automáticos:**
```
"Encontramos esta casa a $185k. El precio promedio en la zona es $195k.
¡Esta propiedad está 5% por debajo del mercado!"
```

---

## ✅ Checklist de Implementación

### **Setup Inicial:**
- [ ] Crear cuenta OpenAI o Anthropic
- [ ] Obtener API key
- [ ] Configurar `.env.local` con API_KEY
- [ ] Instalar dependencias (`openai` o `@anthropic-ai/sdk`)
- [ ] Configurar límites de rate (opcional)

### **Sesión 1 - UI:**
- [ ] AISearchButton component
- [ ] AISearchModal component
- [ ] AISearchInput component
- [ ] Ejemplos interactivos
- [ ] Animaciones
- [ ] Responsive design

### **Sesión 2 - AI:**
- [ ] Cliente AI (OpenAI/Claude)
- [ ] search-parser.ts function
- [ ] Server Action aiSearchAction
- [ ] Error handling
- [ ] Testing básico

### **Sesión 3 - Integración:**
- [ ] Hook useAISearch
- [ ] Aplicar filtros a propiedades
- [ ] Actualizar mapa (flyTo)
- [ ] Actualizar drawer
- [ ] Badge de resultados

### **Sesión 4 - Polish:**
- [ ] Historial de búsquedas
- [ ] Sugerencias inline
- [ ] Toast notifications
- [ ] Analytics tracking
- [ ] Loading skeletons

### **Sesión 5 - Testing:**
- [ ] Test queries simples
- [ ] Test queries complejas
- [ ] Test edge cases
- [ ] Performance optimization
- [ ] Mobile testing
- [ ] Error scenarios

---

## 📚 Referencias

### **APIs Documentation:**
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Claude API Docs](https://docs.anthropic.com/)
- [OpenAI Pricing](https://openai.com/api/pricing/)

### **Similar Implementations:**
- [Zillow Natural Language Search](https://investors.zillowgroup.com/investors/news-and-events/news/news-details/2024/Zillows-AI-powered-home-search-gets-smarter-with-new-natural-language-features/)
- [PlanetRE + DeepSeek](https://www.planetre.com/blog/planetre-offers-natural-language-real-estate-property-search-with-deepseek/)

### **UI/UX Inspiration:**
- Zillow search bar
- Airbnb modal patterns
- Google Maps search overlay

---

**Última actualización:** 19 de Octubre, 2025
**Próxima revisión:** Después de completar Sesión 1
**Status:** 🟡 Pendiente de implementación

---

## 🎯 Quick Start para Próxima Sesión

**Si quieres empezar rápido:**
1. Lee "Sesión 1" completa
2. Revisa diseño de AISearchModal
3. Prepara ejemplos que quieres usar
4. Decide ubicación del botón (navbar vs floating)
5. ¡Listo para implementar!

**Tiempo estimado total:** 8-12 horas distribuidas en 5 sesiones
**ROI esperado:** 🔥🔥🔥🔥🔥 Feature diferenciador único en Ecuador
