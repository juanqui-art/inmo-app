# 💪 Ejercicios Prácticos - Clustering & Bounds

> **Propósito:** Solidificar comprensión con ejercicios hands-on
> **Dificultad:** ⭐ Básico a ⭐⭐⭐ Avanzado
> **Tiempo:** 30-90 minutos total

---

## ✅ Ejercicio 1: Cálculo Manual de Delta

**Dificultad:** ⭐ Básico | **Tiempo:** 5 minutos

### Problema

Dado un viewport, calcula el delta (rango de grados) que se vería en el mapa.

```typescript
// ENTRADA:
const viewport = {
  latitude: -2.90,
  longitude: -79.00,
  zoom: 8  // ← Focus aquí
};

// PREGUNTAS:
// 1. ¿Cuál es el delta de latitud?
// 2. ¿Cuál es el delta de longitud?
// 3. ¿Cuál es el rango de latitudes visible?
// 4. ¿Cuál es el rango de longitudes visible?
```

### Solución (Calcula primero, luego verifica)

<details>
<summary>Respuesta</summary>

```typescript
// Fórmula
const latDelta = (180 / Math.pow(2, 8)) * 1.2;
const lngDelta = (360 / Math.pow(2, 8)) * 1.2;

// Cálculo paso a paso
// 2^8 = 256
// latDelta = (180 / 256) * 1.2 = 0.703 * 1.2 = 0.844°
// lngDelta = (360 / 256) * 1.2 = 1.406 * 1.2 = 1.688°

// Rangos visible:
// Latitud: -2.90 ± 0.844 = [-3.744, -2.056]°
// Longitud: -79.00 ± 1.688 = [-80.688, -77.312]°

// RESPUESTAS:
// 1. latDelta = 0.844°
// 2. lngDelta = 1.688°
// 3. [-3.744°, -2.056°]
// 4. [-80.688°, -77.312°]

// Verificación:
console.log((180 / Math.pow(2, 8)) * 1.2);  // 0.844
console.log((360 / Math.pow(2, 8)) * 1.2);  // 1.688
```

</details>

### Extend This

Repite para estos zoom levels:
```typescript
zoom: 5   // Respuesta: latDelta ≈ 6.75°
zoom: 10  // Respuesta: latDelta ≈ 0.211°
zoom: 15  // Respuesta: latDelta ≈ 0.0066°
```

---

## ✅ Ejercicio 2: Construcción de Bounds

**Dificultad:** ⭐ Básico | **Tiempo:** 5 minutos

### Problema

Dado un viewport, construye los bounds del mapa.

```typescript
const viewport = {
  latitude: -2.90,
  longitude: -79.00,
  zoom: 10
};

// TODO: Calcula estos bounds
// Expected output:
// {
//   ne_lat: ?,
//   ne_lng: ?,
//   sw_lat: ?,
//   sw_lng: ?
// }
```

### Solución

<details>
<summary>Respuesta</summary>

```typescript
// Paso 1: Calcular deltas
const latDelta = (180 / Math.pow(2, 10)) * 1.2;  // 0.211°
const lngDelta = (360 / Math.pow(2, 10)) * 1.2;  // 0.422°

// Paso 2: Aplicar al centro
const bounds = {
  ne_lat: -2.90 + 0.211 = -2.689,
  ne_lng: -79.00 + 0.422 = -78.578,
  sw_lat: -2.90 - 0.211 = -3.111,
  sw_lng: -79.00 - 0.422 = -79.422
};

// RESPUESTA:
{
  ne_lat: -2.689,
  ne_lng: -78.578,
  sw_lat: -3.111,
  sw_lng: -79.422
}
```

</details>

---

## ✅ Ejercicio 3: Parsear URL Bounds

**Dificultad:** ⭐ Básico | **Tiempo:** 5 minutos

### Problema

Dada una URL, extrae los bounds.

```typescript
const url = new URL(
  "https://inmo.app/mapa?ne_lat=-2.689&ne_lng=-78.578&sw_lat=-3.111&sw_lng=-79.422"
);
const searchParams = url.searchParams;

// TODO: Extrae los 4 valores y crea un objeto bounds
const bounds = {
  ne_lat: ?,
  ne_lng: ?,
  sw_lat: ?,
  sw_lng: ?
};
```

### Solución

<details>
<summary>Respuesta</summary>

```typescript
const bounds = {
  ne_lat: Number(searchParams.get("ne_lat")),   // -2.689
  ne_lng: Number(searchParams.get("ne_lng")),   // -78.578
  sw_lat: Number(searchParams.get("sw_lat")),   // -3.111
  sw_lng: Number(searchParams.get("sw_lng"))    // -79.422
};
```

</details>

---

## ✅ Ejercicio 4: Invertir Bounds → Viewport

**Dificultad:** ⭐⭐ Intermedio | **Tiempo:** 10 minutos

### Problema

Dado bounds, recupera el viewport (especialmente el zoom).

```typescript
const bounds = {
  ne_lat: -2.689,
  ne_lng: -78.578,
  sw_lat: -3.111,
  sw_lng: -79.422
};

// TODO: Calcula
// 1. latitude (centro)
// 2. longitude (centro)
// 3. zoom (DIFÍCIL)

const viewport = {
  latitude: ?,
  longitude: ?,
  zoom: ?
};
```

### Solución

<details>
<summary>Respuesta</summary>

```typescript
// Paso 1: Centro
const latitude = (bounds.ne_lat + bounds.sw_lat) / 2;
// = (-2.689 + -3.111) / 2 = -2.90 ✓

const longitude = (bounds.ne_lng + bounds.sw_lng) / 2;
// = (-78.578 + -79.422) / 2 = -79.00 ✓

// Paso 2: Zoom (la parte difícil)
// Fórmula: latDelta = (180 / 2^zoom) * 1.2
// Despejar zoom:

const latDelta = Math.abs(bounds.ne_lat - bounds.sw_lat);
// = |-2.689 - (-3.111)| = 0.422°

// latDelta = (180 / 2^zoom) * 1.2
// 0.422 = (180 / 2^zoom) * 1.2
// 0.422 / 1.2 = 180 / 2^zoom
// 0.352 = 180 / 2^zoom
// 2^zoom = 180 / 0.352
// 2^zoom = 511.4
// zoom = log₂(511.4) = 9.0

const zoomFloat = Math.log2(180 / latDelta) - Math.log2(1.2);
const zoom = Math.round(zoomFloat);  // 9 o 10

// RESPUESTA:
const viewport = {
  latitude: -2.90,
  longitude: -79.00,
  zoom: 10  // (puede ser 9 o 10 por el rounding)
};

// ⚠️ NOTA: Perderemos precisión en zoom (±1)
// Esto es ESPERADO y ACEPTABLE
```

</details>

---

## ✅ Ejercicio 5: Validación de Bounds

**Dificultad:** ⭐⭐ Intermedio | **Tiempo:** 10 minutos

### Problema

Determina cuál es válido y cuál inválido. Explica por qué.

```typescript
// Test 1
const bounds1 = {
  ne_lat: -2.689,
  ne_lng: -78.578,
  sw_lat: -3.111,
  sw_lng: -79.422
};
// ¿Válido? SÍ / NO

// Test 2
const bounds2 = {
  ne_lat: -3.111,  // ← Invertido
  ne_lng: -79.422,
  sw_lat: -2.689,
  sw_lng: -78.578
};
// ¿Válido? SÍ / NO

// Test 3
const bounds3 = {
  ne_lat: 95,       // ← Fuera de rango
  ne_lng: -78.578,
  sw_lat: -3.111,
  sw_lng: -79.422
};
// ¿Válido? SÍ / NO

// Test 4
const bounds4 = {
  ne_lat: -2.689,
  ne_lng: 200,      // ← Fuera de rango
  sw_lat: -3.111,
  sw_lng: -79.422
};
// ¿Válido? SÍ / NO

// Test 5
const bounds5 = {
  ne_lat: -2.90,
  ne_lng: -79.00,
  sw_lat: -2.90,    // ← Sin altura
  sw_lng: -79.00    // ← Sin ancho
};
// ¿Válido? SÍ / NO
```

### Solución

<details>
<summary>Respuesta</summary>

```typescript
// Test 1: VÁLIDO ✓
// - ne_lat (-2.689) > sw_lat (-3.111) ✓
// - ne_lng (-78.578) > sw_lng (-79.422) ✓
// - Ambos en rango [-90, 90] y [-180, 180] ✓

// Test 2: INVÁLIDO ✗
// - ne_lat (-3.111) < sw_lat (-2.689) ✗
// - Las esquinas están invertidas
// - Debería ser: ne_lat > sw_lat siempre

// Test 3: INVÁLIDO ✗
// - ne_lat (95) > 90° ✗
// - Fuera del rango válido de latitud [-90, 90]

// Test 4: INVÁLIDO ✗
// - ne_lng (200) > 180° ✗
// - Fuera del rango válido de longitud [-180, 180]

// Test 5: INVÁLIDO ✗
// - ne_lat (−2.90) == sw_lat (−2.90) ✗
// - ne_lng (−79.00) == sw_lng (−79.00) ✗
// - Bounds es un punto, no un rectángulo
// - Necesita area real: ne != sw

// Función validadora:
function isValidBounds(bounds) {
  return (
    bounds.ne_lat > bounds.sw_lat &&       // NE arriba de SW
    bounds.ne_lng > bounds.sw_lng &&       // NE derecha de SW
    bounds.ne_lat >= -90 && bounds.ne_lat <= 90 &&  // Lat en rango
    bounds.sw_lat >= -90 && bounds.sw_lat <= 90 &&
    bounds.ne_lng >= -180 && bounds.ne_lng <= 180 && // Lng en rango
    bounds.sw_lng >= -180 && bounds.sw_lng <= 180
  );
}
```

</details>

---

## ✅ Ejercicio 6: Timezone Antimeridiano (Edge Case)

**Dificultad:** ⭐⭐⭐ Avanzado | **Tiempo:** 15 minutos

### Problema

Usuario está viendo un mapa cerca del antimeridiano (180°/-180°). El cálculo de bounds produce lng > 180, que es inválido.

```typescript
const viewport = {
  latitude: -17.5,
  longitude: 179.5,  // ← Muy cerca del límite
  zoom: 8
};

// Sin normalización:
const lngDelta = (360 / Math.pow(2, 8)) * 1.2;  // 1.688°
const ne_lng = 179.5 + 1.688 = 181.188  // ❌ > 180

// TODO: Normaliza ne_lng y sw_lng al rango [-180, 180]
// Hint: Si > 180, restar 360
//       Si < -180, sumar 360
```

### Solución

<details>
<summary>Respuesta</summary>

```typescript
const viewport = {
  latitude: -17.5,
  longitude: 179.5,
  zoom: 8
};

const latDelta = (180 / Math.pow(2, 8)) * 1.2;  // 0.844°
const lngDelta = (360 / Math.pow(2, 8)) * 1.2;  // 1.688°

let ne_lat = -17.5 + 0.844 = -16.656;
let ne_lng = 179.5 + 1.688 = 181.188;  // ❌ Inválido
let sw_lat = -17.5 - 0.844 = -18.344;
let sw_lng = 179.5 - 1.688 = 177.812;

// NORMALIZAR LONGITUD
if (ne_lng > 180) {
  ne_lng -= 360;  // 181.188 - 360 = -178.812 ✓
}
if (sw_lng > 180) {
  sw_lng -= 360;
}
if (ne_lng < -180) {
  ne_lng += 360;
}
if (sw_lng < -180) {
  sw_lng += 360;
}

const bounds = {
  ne_lat: -16.656,
  ne_lng: -178.812,  // ✓ Normalizado
  sw_lat: -18.344,
  sw_lng: 177.812    // ✓ En rango
};

// Verificación:
console.log(bounds.ne_lng >= -180 && bounds.ne_lng <= 180);  // true
console.log(bounds.sw_lng >= -180 && bounds.sw_lng <= 180);  // true
```

</details>

### Challenge Extend

¿Qué pasa si el usuario está en el polo norte (latitude = 85) y hace zoom out?

```typescript
const viewport = {
  latitude: 85,
  longitude: 0,
  zoom: 3
};

const latDelta = (180 / Math.pow(2, 3)) * 1.2;  // 27°
let ne_lat = 85 + 27 = 112;  // ❌ > 90

// TODO: Clampea ne_lat y sw_lat al rango [-90, 90]
// Hint: Math.min() y Math.max()
```

<details>
<summary>Respuesta Challenge</summary>

```typescript
// CLAMPEAR LATITUD
ne_lat = Math.max(-90, Math.min(90, ne_lat));
// = Math.max(-90, Math.min(90, 112))
// = Math.max(-90, 90)
// = 90 ✓

sw_lat = Math.max(-90, Math.min(90, sw_lat));
// = Math.max(-90, Math.min(90, 58))
// = Math.max(-90, 58)
// = 58 ✓

const bounds = {
  ne_lat: 90,   // ✓ Clamped
  ne_lng: 0,
  sw_lat: 58,   // ✓ Válido
  sw_lng: 0
};
```

</details>

---

## ✅ Ejercicio 7: Debounce Timing

**Dificultad:** ⭐⭐ Intermedio | **Tiempo:** 10 minutos

### Problema

Usuario arrastra el mapa. Calcula cuándo se actualiza la URL.

```typescript
Timeline:
t=0ms:    User mouse down, comienza a arrastrar
t=100ms:  Move event #1, ViewState = A
t=150ms:  Move event #2, ViewState = B
t=200ms:  Move event #3, ViewState = C
t=250ms:  Move event #4, ViewState = D
t=300ms:  User suelta mouse (mouse up)
t=300ms:  ViewState se estabiliza en D
t=???ms:  ¿Cuándo se actualiza la URL?

Hint: useDebounce tiene un retraso de 500ms
```

### Solución

<details>
<summary>Respuesta</summary>

```typescript
// Explicación del debounce:
// useDebounce(value, 500) significa:
// "Dame el valor, pero espera 500ms después del último cambio"

Timeline detallado:
t=0ms:    mouseDown
t=100ms:  evento move, ViewState = A
         timer inicia: 500ms countdown
t=150ms:  evento move, ViewState = B
         timer RESETEADO: nuevo countdown de 500ms
t=200ms:  evento move, ViewState = C
         timer RESETEADO: nuevo countdown de 500ms
t=250ms:  evento move, ViewState = D
         timer RESETEADO: nuevo countdown de 500ms
t=300ms:  mouseUp, ViewState = D (sin más cambios)
         timer SIGUE corriendo (último cambio fue en t=250ms)
t=300-800ms: ViewState no cambia
         timer cuenta atrás...
t=800ms:  ⏰ TIMER TERMINA
         debouncedViewport se actualiza a D
         useEffect en useMapViewport corre
         buildBoundsUrl() genera nueva URL
         router.replace() es llamado

// RESPUESTA: t = 800ms (500ms después del último cambio en t=300ms)

// Escenario alternativo: Si user sigue moviendo
t=500ms:  User mueve NUEVAMENTE
         timer RESETEADO NUEVAMENTE
t=1000ms: ⏰ Timer termina
         URL actualiza

// Conclusión:
// URL actualiza 500ms DESPUÉS de que deja de moverse
// No importa cuántas veces mueva durante esos 500ms
// Siempre espera al último movimiento + 500ms
```

</details>

---

## ✅ Ejercicio 8: URL Sharing Scenario

**Dificultad:** ⭐⭐ Intermedio | **Tiempo:** 15 minutos

### Problema

Simula el escenario completo de compartir una URL.

```
Usuario A (Desktop):
  - Abre /mapa
  - Ve Cuenca centro (zoom 12)
  - Hace click en botón "Share"
  - Copia URL: /mapa?ne_lat=-2.847&ne_lng=-78.950&sw_lat=-2.953&sw_lng=-79.050

Usuario B (Mobile):
  - Recibe URL en WhatsApp
  - Abre en teléfono (375x667)
  - Pregunta: ¿Ve la MISMA área que Usuario A?
```

### Solución

<details>
<summary>Respuesta Completa</summary>

```typescript
// USUARIO A (Desktop 1920x1080)
// Abre /mapa, zoom 12 (automático de defaults)
// Viewport: { latitude: -2.90, longitude: -79.00, zoom: 12 }
// buildBoundsUrl() genera:
//   /mapa?ne_lat=-2.847&ne_lng=-78.950&sw_lat=-2.953&sw_lng=-79.050
// Vista: Cuenca centro + alrededores (área = 0.106° × 0.100°)

// USUARIO B (Mobile 375x667)
// Recibe URL: /mapa?ne_lat=-2.847&ne_lng=-78.950&sw_lat=-2.953&sw_lng=-79.050
// Server parsea: parseBoundsParams()
// Convierte a viewport: boundsToViewport()
//   latitude: (-2.847 + -2.953) / 2 = -2.90 ✓
//   longitude: (-78.950 + -79.050) / 2 = -79.00 ✓
//   zoom: log₂(216 / 0.106) ≈ 11
// Cliente renderiza: { latitude: -2.90, longitude: -79.00, zoom: 11 }
// Vista: Misma área geográfica (puede ser zoom 11 en lugar de 12)
//        Pero el bounds es igual, así que area visible ES LA MISMA

// RESPUESTA: SÍ, ve la misma área
// La ventaja de bounds vs zoom:
// - Desktop zoom 12: 100 km²
// - Mobile zoom 11: 100 km² (no zoom 12 de 200 km²)
// - Ambos ven el MISMO área geográfico

// Sin bounds (solo lat/lng/zoom):
// - Desktop zoom 12: 100 km²
// - Mobile zoom 12: 200 km² (pantalla más pequeña = más área)
// - DIFERENTE experiencia ❌

// CON BOUNDS:
// - Desktop: área exacta ✓
// - Mobile: área EXACTA ✓
// - Ambos ven lo MISMO ✓✓
```

</details>

---

## ✅ Ejercicio 9: Backward Compatibility Check

**Dificultad:** ⭐⭐⭐ Avanzado | **Tiempo:** 20 minutos

### Problema

Dada una URL antigua, simula el parseo y conversión.

```typescript
// URL antigua guardada en bookmark hace 6 meses
const oldUrl = "/mapa?lat=-2.90&lng=-79.00&zoom=12";
const searchParams = new URLSearchParams("lat=-2.90&lng=-79.00&zoom=12");

// TODO: Simula paso a paso lo que hace parseBoundsParams()
// 1. ¿Detecta formato nuevo (bounds)?
// 2. ¿Detecta formato antiguo (viewport)?
// 3. ¿Convierte correctamente?
// 4. ¿Retorna bounds válidos?
```

### Solución

<details>
<summary>Respuesta Paso a Paso</summary>

```typescript
// PASO 1: Intentar parsear formato nuevo (bounds)
const ne_lat = searchParams.get("ne_lat");      // null
const ne_lng = searchParams.get("ne_lng");      // null
const sw_lat = searchParams.get("sw_lat");      // null
const sw_lng = searchParams.get("sw_lng");      // null

// Todos null, así que saltamos formato nuevo

// PASO 2: Intentar formato antiguo (viewport)
const lat = searchParams.get("lat");            // "-2.90"
const lng = searchParams.get("lng");            // "-79.00"
const zoom = searchParams.get("zoom");          // "12"

const viewport = parseMapParams(searchParams, fallback);
// Retorna: { latitude: -2.90, longitude: -79.00, zoom: 12 }

// PASO 3: Convertir viewport a bounds
const bounds = viewportToBounds(viewport);
// Calcula:
const latDelta = (180 / Math.pow(2, 12)) * 1.2;  // 0.053°
const lngDelta = (360 / Math.pow(2, 12)) * 1.2;  // 0.105°

// Retorna:
{
  ne_lat: -2.90 + 0.053 = -2.847,
  ne_lng: -79.00 + 0.105 = -78.895,
  sw_lat: -2.90 - 0.053 = -2.953,
  sw_lng: -79.00 - 0.105 = -79.105
}

// PASO 4: Validar
// - ne_lat (-2.847) > sw_lat (-2.953) ✓
// - ne_lng (-78.895) > sw_lng (-79.105) ✓
// - Todos en rango [-90, 90] y [-180, 180] ✓

// RESULTADO: Bounds válidos
// La URL antigua se convierte automáticamente
// useMapViewport detecta que son diferentes y hace router.replace()
// URL se actualiza a: /mapa?ne_lat=-2.847&ne_lng=-78.895&sw_lat=-2.953&sw_lng=-79.105
// User NO ve nada diferente, pero la URL está actualizada ✓
```

</details>

---

## 📋 Checklist: Todos Completados?

- [ ] Ejercicio 1: Cálculo manual de delta
- [ ] Ejercicio 2: Construcción de bounds
- [ ] Ejercicio 3: Parsear URL bounds
- [ ] Ejercicio 4: Invertir bounds → viewport
- [ ] Ejercicio 5: Validación de bounds
- [ ] Ejercicio 6: Edge case antimeridiano
- [ ] Ejercicio 7: Debounce timing
- [ ] Ejercicio 8: URL sharing scenario
- [ ] Ejercicio 9: Backward compatibility

---

## 🎓 Reflexión Final

Después de completar todos los ejercicios, puedes responder:

```
❓ ¿Por qué usamos bounds en lugar de viewport params?
❓ ¿Qué es el padding (1.2) y por qué existe?
❓ ¿Cómo normaliza el código el antimeridiano?
❓ ¿Qué es debouncing y por qué es importante?
❓ ¿Cómo maneja backward compatibility?
```

Si puedes explicar cada una de estas preguntas sin mirar documentación, **¡HAS DOMINADO EL TEMA!** 🎉

---

**Éxito en tus ejercicios** 💪

