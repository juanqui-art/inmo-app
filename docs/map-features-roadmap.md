# 🗺️ Map Features & AI Roadmap - InmoApp

> **Fecha de creación:** 19 de Octubre, 2025
> **Propósito:** Documento de referencia para features de mapa con IA
> **Basado en:** Investigación de Zillow, Airbnb, PropStream, y tendencias AI 2025

---

## 📋 Tabla de Contenidos

1. [Features de UX/UI del Mapa](#features-de-uxui-del-mapa)
2. [Features de AI (Tendencias 2025)](#features-de-ai-tendencias-2025)
3. [Comparativa Rápida](#comparativa-rápida)
4. [Roadmap Sugerido](#roadmap-sugerido)
5. [Referencias](#referencias)

---

## 🎨 Features de UX/UI del Mapa

### 1. Map Bounds (Zillow/Airbnb Pattern)

**Estado actual:**
```
❌ Tu app: /mapa?lat=-2.90&lng=-79.00&zoom=12
```

**Mejora sugerida:**
```
✅ Zillow/Airbnb: /mapa?ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05
```

**Descripción:**
En vez de guardar el centro + zoom, guardar los bounds (límites) del viewport visible.

**Ventajas:**
- ✅ Captura exactamente el área visible
- ✅ Funciona en diferentes tamaños de pantalla
- ✅ Más preciso para filtrar propiedades server-side
- ✅ Permite búsquedas por área rectangular

**Implementación:**
```javascript
// Obtener bounds
const bounds = map.getBounds();
const ne = bounds.getNorthEast(); // { lat, lng }
const sw = bounds.getSouthWest(); // { lat, lng }

// Construir URL
const url = `/mapa?ne_lat=${ne.lat}&ne_lng=${ne.lng}&sw_lat=${sw.lat}&sw_lng=${sw.lng}`;

// Filtrar propiedades
properties.filter(p =>
  p.latitude >= sw.lat &&
  p.latitude <= ne.lat &&
  p.longitude >= sw.lng &&
  p.longitude <= ne.lng
);
```

**Complejidad:** 🟡 Media
**Impacto:** ⭐⭐⭐⭐ Alto
**Tiempo estimado:** 3-4 horas
**Prioridad:** 🟢 Alta

---

### 2. Dynamic Filtering por Map Movement (Airbnb Pattern)

**URL de referencia:**
```
https://www.airbnb.com.ec/s/homes?search_type=user_map_move&search_by_map=true
```

**Descripción:**
Detectar cuando el usuario mueve/arrastra el mapa y actualizar la lista de propiedades automáticamente.

**Comportamiento:**
```
Usuario arrastra mapa hacia norte
  → Detecta nuevo bounds
  → Actualiza URL (?search_type=user_map_move)
  → Filtra propiedades en nueva área
  → Actualiza drawer: "15 propiedades en esta área"
  → (Opcional) Muestra botón "Search this area"
```

**Implementación:**
```javascript
// Listener de movimiento
map.on('moveend', () => {
  const bounds = map.getBounds();

  // Filtrar propiedades visibles
  const visibleProperties = filterByBounds(allProperties, bounds);

  // Actualizar drawer
  setDrawerProperties(visibleProperties);

  // Actualizar URL
  updateURL({ ...bounds, search_type: 'user_map_move' });
});
```

**Variante: "Search this area" Button**
```
Cuando usuario mueve mapa:
  → Mostrar botón flotante: "🔍 Buscar en esta área"
  → Click → ejecuta búsqueda
  → Menos agresivo que auto-update
```

**Complejidad:** 🟡 Media
**Impacto:** ⭐⭐⭐⭐⭐ Muy Alto
**Tiempo estimado:** 1-2 días
**Prioridad:** 🟢 Alta

---

### 3. Connection Line (Google Maps Pattern)

**Descripción:**
Línea visual que conecta la card del drawer con su marker en el mapa al hacer hover.

**Visual:**
```
┌────────────────────────────────────┐
│              MAPA                  │
│                    ● Marker        │
│                   /                │
│                  /  ← Línea SVG    │
│                 /                  │
├────────────────/───────────────────┤
│  Drawer       /                    │
│  ┌──────────┐/ ← Hover             │
│  │  CARD   ←                       │
│  └──────────┘                      │
└────────────────────────────────────┘
```

**Implementación:**

**Opción A: SVG Overlay (Recomendado)**
```javascript
// 1. Obtener posición de la card (pixels)
const cardRect = cardElement.getBoundingClientRect();
const cardX = cardRect.left + cardRect.width / 2;
const cardY = cardRect.top;

// 2. Convertir marker lat/lng → pixels
const map = mapRef.current.getMap();
const markerScreen = map.project([property.lng, property.lat]);

// 3. Dibujar SVG path
<svg className="fixed inset-0 pointer-events-none z-50">
  <path
    d={`M ${cardX},${cardY} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${markerScreen.x},${markerScreen.y}`}
    stroke="rgba(59, 130, 246, 0.6)"
    strokeWidth="2"
    fill="none"
    strokeDasharray="4"
  />
</svg>

// 4. Actualizar cuando mapa se mueve
map.on('move', updateLinePosition);
map.on('zoom', updateLinePosition);
```

**Curva Bezier para línea suave:**
```javascript
const controlPoint1 = { x: cardX, y: cardY - 100 };
const controlPoint2 = { x: markerScreen.x, y: markerScreen.y + 50 };
```

**Complejidad:** 🟡 Media
**Impacto:** ⭐⭐⭐ Medio (wow factor)
**Tiempo estimado:** 4-6 horas
**Prioridad:** 🟡 Media (nice-to-have)

---

### 4. Property List Drawer (Implementado ✅)

**Descripción:**
Panel inferior deslizable estilo Airbnb con cards horizontales.

**Estados:**
- Collapsed: 80px (solo handle + counter)
- Peek: 200px (muestra cards)
- Expanded: 60vh (lista completa)

**Ya implementado en:**
- `components/map/property-list-drawer.tsx`
- `components/map/property-card-compact.tsx`

**Mejoras pendientes:**
- [ ] Scroll snap para cards
- [ ] Gestures drag para expandir/colapsar
- [ ] Animaciones con framer-motion
- [ ] Persistent state (localStorage)

**Complejidad:** ✅ Completado
**Impacto:** ⭐⭐⭐⭐⭐ Muy Alto

---

## 🤖 Features de AI (Tendencias 2025)

### 1. Natural Language Search (NLP) 🔥

**Ejemplo real (Zillow 2025):**
```
Usuario escribe: "$700K homes in Charlotte with a backyard"
→ AI interpreta → Filtra automáticamente
```

**Para InmoApp:**
```
Usuario escribe: "Casa moderna en Cuenca con 3 habitaciones cerca del centro"

AI extrae:
  ✓ Ubicación: Cuenca
  ✓ Estilo: Moderna (category)
  ✓ Habitaciones: 3
  ✓ Proximidad: Centro histórico

Sistema ejecuta:
  → Centra mapa en Cuenca centro
  → Filtra transactionType, bedrooms, category
  → Calcula distancia al centro
  → Actualiza resultados
```

**Implementación:**

**Option A: OpenAI API**
```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `Extract real estate search parameters from user query.
      Return JSON: { location, price, bedrooms, bathrooms, category, features }
      Categories: HOUSE, APARTMENT, VILLA, PENTHOUSE, SUITE, COMMERCIAL, FARM
      Features: pool, garage, garden, balcony, modern, colonial, etc.`
    },
    {
      role: "user",
      content: userQuery
    }
  ],
  response_format: { type: "json_object" }
});

const params = JSON.parse(response.choices[0].message.content);
// → { location: "Cuenca", bedrooms: 3, category: "HOUSE", features: ["modern", "near_center"] }
```

**Option B: Claude API (Anthropic)**
```javascript
const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: `Extract search params from: "${userQuery}"`
    }
  ]
});
```

**Flujo completo:**
```javascript
// 1. Usuario escribe búsqueda
const userQuery = "Casa moderna de 3 habitaciones cerca del parque Calderón";

// 2. Llamar AI
const params = await extractSearchParams(userQuery);

// 3. Construir query Prisma
const properties = await prisma.property.findMany({
  where: {
    city: params.location,
    bedrooms: params.bedrooms,
    category: params.category,
    // Calcular distancia a landmarks conocidos
  }
});

// 4. Centrar mapa
map.flyTo({
  center: [CUENCA_CENTER.lng, CUENCA_CENTER.lat],
  zoom: 14
});
```

**Complejidad:** 🔴 Alta
**Impacto:** ⭐⭐⭐⭐⭐ ALTÍSIMO (diferenciador competitivo)
**Costo:** ~$0.001-0.01 por búsqueda
**Tiempo estimado:** 1-2 semanas
**Prioridad:** 🔴 Crítica (early adopter advantage)

**Referencias:**
- [Zillow Natural Language Search](https://investors.zillowgroup.com/investors/news-and-events/news/news-details/2024/Zillows-AI-powered-home-search-gets-smarter-with-new-natural-language-features/)
- [PlanetRE + DeepSeek](https://www.planetre.com/blog/planetre-offers-natural-language-real-estate-property-search-with-deepseek/)

---

### 2. Price Heatmaps 🔥

**Descripción:**
Visualizar densidad de precios en el mapa con gradiente de colores.

**Visual:**
```
🟢 Verde: $50k-100k (económico)
🟡 Amarillo: $100k-200k (medio)
🟠 Naranja: $200k-300k (alto)
🔴 Rojo: $300k+ (premium)

Mapa muestra áreas coloreadas según precio promedio
```

**Casos de uso:**
- Inversores: "¿Qué zonas están subiendo de precio?"
- Compradores: "¿Dónde están las propiedades más baratas?"
- Agentes: Análisis de mercado instantáneo

**Implementación con MapBox:**
```javascript
map.addLayer({
  id: 'price-heatmap',
  type: 'heatmap',
  source: 'properties',
  paint: {
    // Color gradient based on price
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(0, 255, 0, 0)',
      0.25, 'rgba(0, 255, 0, 0.5)',
      0.5, 'rgba(255, 255, 0, 0.7)',
      0.75, 'rgba(255, 165, 0, 0.8)',
      1, 'rgba(255, 0, 0, 1)'
    ],
    // Weight by price
    'heatmap-weight': [
      'interpolate',
      ['linear'],
      ['get', 'price'],
      50000, 0,
      500000, 1
    ],
    'heatmap-intensity': 1,
    'heatmap-radius': 30
  }
});
```

**Toggle UI:**
```jsx
<button onClick={() => toggleLayer('price-heatmap')}>
  🔥 Ver mapa de precios
</button>
```

**Complejidad:** 🟢 Fácil (MapBox built-in)
**Impacto:** ⭐⭐⭐⭐⭐ Muy Alto
**Tiempo estimado:** 4-6 horas
**Prioridad:** 🔴 Alta (único en Ecuador)

**Referencias:**
- [Power BI Heatmaps for Real Estate](https://www.theknowledgeacademy.com/blog/how-to-create-power-bi-heatmap/)

---

### 3. Smart Clustering (Supercluster) 🔥

**Descripción:**
Agrupar markers cuando hay muchas propiedades cercanas para evitar saturación visual.

**Visual:**
```
Zoom alejado (zoom < 12):
  ● 25  ← Cluster con 25 propiedades
  ● 12

Zoom cercano (zoom > 14):
  ● ● ● ← Markers individuales
```

**Ventajas:**
- Performance con 1000+ propiedades
- UX limpia (sin overlapping markers)
- Click en cluster → zoom in automático

**Implementación con react-map-gl:**
```bash
npm install supercluster
```

```javascript
import Supercluster from 'supercluster';

const cluster = new Supercluster({
  radius: 40,
  maxZoom: 16
});

// Load properties
cluster.load(
  properties.map(p => ({
    type: 'Feature',
    properties: { ...p },
    geometry: {
      type: 'Point',
      coordinates: [p.longitude, p.latitude]
    }
  }))
);

// Get clusters for current viewport
const bounds = map.getBounds();
const zoom = map.getZoom();
const clusters = cluster.getClusters(
  [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
  Math.floor(zoom)
);

// Render
clusters.map(cluster => {
  if (cluster.properties.cluster) {
    return <ClusterMarker count={cluster.properties.point_count} />;
  }
  return <PropertyMarker property={cluster.properties} />;
});
```

**Complejidad:** 🟡 Media
**Impacto:** ⭐⭐⭐⭐ Alto (esencial para escala)
**Tiempo estimado:** 1-2 días
**Prioridad:** 🟢 Alta

**Referencias:**
- [MapBox Clustering Docs](https://docs.mapbox.com/mapbox-gl-js/example/cluster/)
- [Supercluster GitHub](https://github.com/mapbox/supercluster)

---

### 4. AI Chatbot en el Mapa 🔥

**Descripción:**
Asistente conversacional flotante que ayuda a buscar propiedades.

**Visual:**
```
┌────────────────────────────────┐
│  Mapa                    💬    │ ← Botón flotante
│                                │
└────────────────────────────────┘

Click → Abre chat:
┌─────────────────────────────────┐
│ 🤖 ¿En qué puedo ayudarte?     │
│                                 │
│ Usuario: ¿Hay casas baratas     │
│          cerca del río?         │
│                                 │
│ Bot: Encontré 8 casas entre     │
│      $85k-120k cerca del río    │
│      Tomás Ordóñez               │
│      [Ver en mapa]              │
└─────────────────────────────────┘
```

**Interacciones posibles:**
```
"¿Cuál es la casa más barata?"
"Muéstrame apartamentos modernos"
"¿Qué hay cerca de la Universidad de Cuenca?"
"Filtra por 3 habitaciones y garaje"
"¿En qué zona suben más los precios?"
```

**Implementación:**
```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: `You are a real estate assistant for InmoApp.
      Current context:
      - Properties visible: ${properties.length}
      - Current location: ${currentLocation}
      - Price range: $${minPrice}-$${maxPrice}

      You can execute these actions:
      - filter_properties(criteria)
      - move_map(location, zoom)
      - show_property(id)
      - apply_filters(filters)

      Respond in Spanish, be concise.`
    },
    ...conversationHistory,
    {
      role: "user",
      content: userMessage
    }
  ],
  tools: [
    {
      type: "function",
      function: {
        name: "filter_properties",
        description: "Filter properties by criteria",
        parameters: {
          type: "object",
          properties: {
            minPrice: { type: "number" },
            maxPrice: { type: "number" },
            bedrooms: { type: "number" },
            category: { type: "string" }
          }
        }
      }
    }
  ]
});

// Si AI llama función
if (response.choices[0].finish_reason === 'tool_calls') {
  const toolCall = response.choices[0].message.tool_calls[0];
  const args = JSON.parse(toolCall.function.arguments);

  // Ejecutar acción
  if (toolCall.function.name === 'filter_properties') {
    applyFilters(args);
    updateMap();
  }
}
```

**Complejidad:** 🔴 Alta
**Impacto:** ⭐⭐⭐⭐ Muy Alto (UX innovadora)
**Costo:** ~$0.01-0.05 por conversación
**Tiempo estimado:** 2-3 semanas
**Prioridad:** 🟡 Media (después de NLP search)

---

### 5. PropStream-style AI Metrics 🔥

**Descripción:**
Enriquecer property cards con métricas calculadas por IA.

**Métricas adicionales (2025):**
```
Card actual:
  ✓ Precio: $185,000
  ✓ Specs: 3 bed, 2 bath, 180m²

Card mejorada:
  ✓ Precio lista: $185,000
  ✓ Valor AI estimado: $195,000 (+5.4%) 🤖
  ✓ Renta estimada: $850/mes 🤖
  ✓ Tendencia: ↗️ Subiendo 3.2%/año 🤖
  ✓ ROI estimado: 5.5%/año 🤖
  ✓ Días en mercado: 23 días
  ✓ Equity promedio zona: 68%
```

**Implementación:**

**1. Valuation Model (Estimación de precio)**
```javascript
// Usar comparables (comps) + ML
const estimatedValue = await calculateAIValue(property, {
  recentSales: nearbyComparableSales,
  features: property.features,
  location: property.location,
  marketTrends: marketData
});

// Simple approach: Average de comps similares
const comps = await prisma.property.findMany({
  where: {
    city: property.city,
    category: property.category,
    bedrooms: property.bedrooms,
    soldAt: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
  }
});

const avgPricePerM2 = comps.reduce((sum, p) => sum + p.price / p.area, 0) / comps.length;
const estimatedValue = avgPricePerM2 * property.area;
```

**2. Rent Estimation**
```javascript
// Regla simple: 0.4-0.6% del valor por mes
const estimatedRent = estimatedValue * 0.005; // 0.5%

// O usar modelo ML entrenado con datos históricos
```

**3. Market Trends**
```javascript
// Comparar precios actuales vs 6-12 meses atrás
const trendPercentage = calculateYearOverYearGrowth(property.city, property.zone);
```

**Complejidad:** 🔴 Alta (requiere datos históricos)
**Impacto:** ⭐⭐⭐⭐⭐ Muy Alto (valor agregado masivo)
**Tiempo estimado:** 3-4 semanas
**Prioridad:** 🟡 Media-Alta (después de MVP)

**Referencias:**
- [PropStream 2025 Map Interface](https://www.ainvest.com/news/propstream-2025-map-search-interface-ai-data-visualization-reshaping-real-estate-competitive-edge-2507/)

---

### 6. Virtual Staging (AI-Powered) 🔥

**Descripción:**
IA que amuebla propiedades vacías o quita muebles de fotos.

**Ejemplo real (2025):**
- **Matterport Auto-Defurnish:** Quita muebles de 3D tours con 1 click
- **AI Virtual Staging:** Agrega muebles realistas

**Para InmoApp:**
```
Foto vacía → AI → Foto amueblada profesionalmente
O
Foto con muebles viejos → AI → Canvas limpio
```

**Implementación:**

**Option A: Replicate API**
```javascript
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const output = await replicate.run(
  "stability-ai/stable-diffusion-xl-refiner-1.0",
  {
    input: {
      image: propertyImageUrl,
      prompt: "modern furnished living room, professional real estate photo",
      negative_prompt: "empty room, clutter"
    }
  }
);
```

**Option B: AWS Rekognition + Custom Model**
```javascript
// 1. Detectar habitación vacía
const isEmpty = await detectEmptyRoom(imageUrl);

// 2. Si vacía, aplicar staging
if (isEmpty) {
  const stagedImage = await applyVirtualStaging(imageUrl, roomType);
}
```

**UI:**
```jsx
<div className="relative">
  <img src={originalImage} alt="Original" />

  <button onClick={toggleStaging}>
    {isStaged ? "Ver original" : "Ver amueblada"}
  </button>

  {isStaged && <img src={stagedImage} />}
</div>
```

**Complejidad:** 🔴 Muy Alta
**Impacto:** ⭐⭐⭐⭐⭐ ALTÍSIMO (wow factor)
**Costo:** ~$0.10-0.50 por imagen
**Tiempo estimado:** 4-6 semanas
**Prioridad:** 🟡 Baja (feature premium)

**Referencias:**
- [Matterport Auto-Defurnish](https://matterport.com/)
- [Replicate.com](https://replicate.com/)

---

### 7. Predictive Search (ML-based) 🔥

**Descripción:**
Sistema que aprende preferencias del usuario y sugiere propiedades proactivamente.

**Cómo funciona:**
```
Usuario interactúa:
  → Hace click en 5 casas modernas
  → Ignora todos los apartamentos
  → Pasa más tiempo en zona norte
  → Siempre filtra 3+ habitaciones

ML Model aprende:
  → user_preference = {
      category: "HOUSE" (90% confidence),
      style: "modern" (85% confidence),
      location: "norte" (75% confidence),
      bedrooms: >= 3 (100% confidence)
    }

Sistema sugiere:
  → "Basado en tu búsqueda, te pueden interesar estas casas modernas en el norte"
  → Auto-filtra en segundo plano
  → Badge: "Recomendado para ti"
```

**Tracking de interacciones:**
```javascript
// Track user behavior
const trackInteraction = async (userId, action, propertyId) => {
  await prisma.userInteraction.create({
    data: {
      userId,
      propertyId,
      action, // "view", "click", "favorite", "hover", "share"
      duration: timeSpent,
      timestamp: new Date()
    }
  });
};

// Analizar patrones
const userPreferences = await analyzeUserBehavior(userId);
```

**Simple recommendation algorithm:**
```javascript
// Collaborative filtering básico
const similarUsers = await findSimilarUsers(userId);
const likedByOthers = await getPropertiesLikedBySimilarUsers(similarUsers);

const recommendations = likedByOthers
  .filter(p => !userHasSeen(p.id))
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);
```

**Complejidad:** 🔴 Alta
**Impacto:** ⭐⭐⭐⭐ Alto (personalización avanzada)
**Tiempo estimado:** 3-4 semanas
**Prioridad:** 🟡 Baja (después de core features)

---

### 8. Multi-Layer Overlays

**Descripción:**
Capas adicionales de información contextual en el mapa.

**Layers útiles para Cuenca/Ecuador:**
```
Toggle controls:
  ☑️ Propiedades (siempre visible)
  ☐ Escuelas y universidades
  ☐ Hospitales y clínicas
  ☐ Transporte público (rutas de bus)
  ☐ Supermercados y comercio
  ☐ Parques y espacios verdes
  ☐ Zonas de riesgo (inundaciones, deslaves)
  ☐ Seguridad (opcional)
```

**Implementación:**
```javascript
// GeoJSON data sources
map.addSource('schools', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: schools.map(s => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [s.lng, s.lat]
      },
      properties: { name: s.name }
    }))
  }
});

map.addLayer({
  id: 'schools-layer',
  type: 'symbol',
  source: 'schools',
  layout: {
    'icon-image': 'school-icon',
    'icon-size': 0.5
  }
});

// Toggle visibility
const toggleLayer = (layerId, visible) => {
  map.setLayoutProperty(
    layerId,
    'visibility',
    visible ? 'visible' : 'none'
  );
};
```

**UI:**
```jsx
<div className="layers-control">
  <h3>Mostrar en el mapa:</h3>
  <label>
    <input type="checkbox" onChange={() => toggleLayer('schools')} />
    🏫 Escuelas
  </label>
  <label>
    <input type="checkbox" onChange={() => toggleLayer('hospitals')} />
    🏥 Hospitales
  </label>
  <label>
    <input type="checkbox" onChange={() => toggleLayer('transport')} />
    🚌 Transporte
  </label>
</div>
```

**Complejidad:** 🟡 Media (depende de data availability)
**Impacto:** ⭐⭐⭐ Medio (útil pero no crítico)
**Tiempo estimado:** 1-2 semanas
**Prioridad:** 🟡 Baja (nice-to-have)

---

## 📊 Comparativa Rápida

| Feature | Complejidad | Impacto | Tiempo | Prioridad | Diferenciador |
|---------|-------------|---------|--------|-----------|---------------|
| **Natural Language Search** | 🔴 Alta | ⭐⭐⭐⭐⭐ | 1-2 sem | 🔴 Crítica | ✅ Único en Ecuador |
| **Price Heatmaps** | 🟢 Fácil | ⭐⭐⭐⭐⭐ | 4-6 hrs | 🔴 Alta | ✅ Único en Ecuador |
| **Smart Clustering** | 🟡 Media | ⭐⭐⭐⭐ | 1-2 días | 🟢 Alta | ❌ Standard |
| **AI Chatbot** | 🔴 Alta | ⭐⭐⭐⭐ | 2-3 sem | 🟡 Media | ✅ Innovador |
| **PropStream Metrics** | 🔴 Alta | ⭐⭐⭐⭐⭐ | 3-4 sem | 🟡 Media | ✅ Valor agregado |
| **Virtual Staging** | 🔴 Muy Alta | ⭐⭐⭐⭐⭐ | 4-6 sem | 🟡 Baja | ✅ Premium feature |
| **Predictive Search** | 🔴 Alta | ⭐⭐⭐⭐ | 3-4 sem | 🟡 Baja | ❌ Avanzado |
| **Multi-Layer Overlays** | 🟡 Media | ⭐⭐⭐ | 1-2 sem | 🟡 Baja | ❌ Nice-to-have |
| **Map Bounds (URL)** | 🟡 Media | ⭐⭐⭐⭐ | 3-4 hrs | 🟢 Alta | ❌ Best practice |
| **Dynamic Filtering** | 🟡 Media | ⭐⭐⭐⭐⭐ | 1-2 días | 🟢 Alta | ❌ Standard |
| **Connection Line** | 🟡 Media | ⭐⭐⭐ | 4-6 hrs | 🟡 Media | ❌ Polish |

---

## 🗺️ Roadmap Sugerido

### **Fase 1: Foundation (Semana 1-2)** ✅ Completar primero

**Objetivo:** Mejorar UX base del mapa

- [x] Property List Drawer (completado)
- [ ] Smart Clustering (supercluster)
- [ ] Map Bounds en URL
- [ ] Dynamic Filtering por movimiento
- [ ] "Search this area" button

**Tiempo total:** 1-2 semanas
**Impacto:** Base sólida para features avanzadas

---

### **Fase 2: AI Layer - Quick Wins (Semana 3-4)** 🔥 Alto ROI

**Objetivo:** Agregar features AI de alto impacto/bajo esfuerzo

- [ ] Price Heatmaps (4-6 horas)
- [ ] Natural Language Search - MVP (1 semana)
  - Solo búsquedas simples
  - OpenAI/Claude API
  - Filtros básicos

**Tiempo total:** 1-2 semanas
**Impacto:** 🚀 Diferenciador competitivo masivo

---

### **Fase 3: Enhanced AI (Semana 5-8)** 🤖 Innovación

**Objetivo:** Features AI avanzadas

- [ ] AI Chatbot en mapa
- [ ] PropStream-style AI Metrics
  - Estimación de valor
  - Renta estimada
  - Tendencias de mercado
- [ ] Connection Line (polish)

**Tiempo total:** 3-4 semanas
**Impacto:** Experiencia premium

---

### **Fase 4: Premium Features (Mes 3+)** 💎 Opcional

**Objetivo:** Features premium para destacar

- [ ] Virtual Staging (AI-powered)
- [ ] Predictive Search (ML)
- [ ] Multi-Layer Overlays
- [ ] Advanced NLP (búsquedas complejas)

**Tiempo total:** 6-8 semanas
**Impacto:** Platform de clase mundial

---

## 📈 Priorización por Impacto/Esfuerzo

### **Quick Wins (Alto Impacto / Bajo Esfuerzo)** 🎯

1. ✅ **Price Heatmaps** (4-6 horas)
2. ✅ **Smart Clustering** (1-2 días)
3. ✅ **Map Bounds + Dynamic Filtering** (2-3 días)

### **Major Features (Alto Impacto / Alto Esfuerzo)** 🚀

1. ✅ **Natural Language Search** (1-2 semanas)
2. ✅ **PropStream AI Metrics** (3-4 semanas)
3. ✅ **AI Chatbot** (2-3 semanas)

### **Premium Features (Muy Alto Impacto / Muy Alto Esfuerzo)** 💎

1. ✅ **Virtual Staging** (4-6 semanas)
2. ✅ **Predictive Search** (3-4 semanas)

### **Nice-to-Have (Medio Impacto / Medio Esfuerzo)** ⭐

1. Connection Line (4-6 horas)
2. Multi-Layer Overlays (1-2 semanas)

---

## 🎯 Recomendación Final

### **Para MVP (Próximas 4 semanas):**

```
Semana 1-2:
  ✅ Clustering
  ✅ Map Bounds
  ✅ Dynamic Filtering

Semana 3:
  ✅ Price Heatmaps

Semana 4:
  ✅ Natural Language Search (MVP)
```

**Resultado:** Plataforma con features que nadie más tiene en Ecuador.

### **Para Producción (Mes 2-3):**

```
Mes 2:
  ✅ AI Chatbot
  ✅ PropStream Metrics (estimaciones)

Mes 3:
  ✅ Polish + UX improvements
  ✅ Virtual Staging (beta)
```

**Resultado:** Plataforma de clase mundial.

---

## 📚 Referencias

### **Investigación 2025:**
- [PropStream 2025 Map Interface](https://www.ainvest.com/news/propstream-2025-map-search-interface-ai-data-visualization-reshaping-real-estate-competitive-edge-2507/)
- [Zillow Natural Language Search](https://investors.zillowgroup.com/investors/news-and-events/news/news-details/2024/Zillows-AI-powered-home-search-gets-smarter-with-new-natural-language-features/)
- [PlanetRE + DeepSeek NLP](https://www.planetre.com/blog/planetre-offers-natural-language-real-estate-property-search-with-deepseek/)
- [AI in Real Estate 2025](https://www.softkraft.co/real-estate-ai/)

### **URLs Analizadas:**
- **Zillow:** [Search example](https://www.zillow.com/new-york-ny/?searchQueryState=...)
- **Airbnb:** [Map search](https://www.airbnb.com.ec/s/homes?search_by_map=true&search_type=user_map_move)

### **Tecnologías:**
- MapBox GL JS: [Docs](https://docs.mapbox.com/mapbox-gl-js/)
- Supercluster: [GitHub](https://github.com/mapbox/supercluster)
- OpenAI API: [Docs](https://platform.openai.com/docs)
- Claude API: [Docs](https://docs.anthropic.com/)
- Replicate: [Virtual Staging Models](https://replicate.com/)

---

## ✅ Tracking Progress

### Completadas:
- [x] Property List Drawer
- [x] Property Card Compact
- [x] Dark Mode optimizado

### En Progreso:
- [ ] (Seleccionar siguiente feature)

### Pendientes:
- [ ] Todas las features listadas arriba

---

**Última actualización:** 19 de Octubre, 2025
**Próxima revisión:** Después de completar Fase 1
