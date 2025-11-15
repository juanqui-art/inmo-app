# 🚀 Guía Completa de MCP Servers - Proyecto Inmobiliario

Esta guía proporciona ejemplos prácticos y sencillos para usar los 6 MCP servers instalados en este proyecto.

---

## 📑 Tabla de Contenidos

1. [Instalación](#instalación)
2. [Supabase MCP](#1-supabase-mcp)
3. [Filesystem MCP](#2-filesystem-mcp)
4. [GitHub MCP](#3-github-mcp)
5. [Memory MCP](#4-memory-mcp)
6. [Playwright MCP](#5-playwright-mcp)
7. [Fetch MCP](#6-fetch-mcp)
8. [Casos de Uso Combinados](#casos-de-uso-combinados)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Instalación

### Para Claude Desktop

1. **Ubicación del archivo de configuración:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **Copiar configuración:**
   ```bash
   # Copia el contenido de MCP_CONFIG.json al archivo de Claude Desktop
   ```

3. **Configurar tokens:**
   - Supabase: Obtener access token desde [Supabase Dashboard > Account](https://supabase.com/dashboard/account/tokens)
   - GitHub: Obtener token desde [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)

4. **Reiniciar Claude Desktop:**
   ```bash
   # macOS: Cmd+Q y reabrir
   # Windows/Linux: Cerrar y reabrir la aplicación
   ```

### Para Claude Code

La configuración se realiza automáticamente al detectar el archivo `MCP_CONFIG.json` en la raíz del proyecto.

---

## 1. 🗄️ Supabase MCP

### ¿Qué hace?
Conecta directamente con tu proyecto Supabase para gestionar base de datos con lenguaje natural.

### Ejemplos Básicos

#### Ejemplo 1: Listar todas las tablas
```
Tú: "Usa Supabase MCP para listar todas las tablas de mi base de datos"

Claude: [Ejecuta query y muestra]
- users
- properties
- property_images
- favorites
- appointments
- property_shares
- property_views
```

#### Ejemplo 2: Crear nueva tabla
```
Tú: "Crea una tabla llamada 'property_analytics' con las siguientes columnas:
- id (uuid, primary key)
- property_id (uuid, foreign key a properties)
- views_count (integer)
- shares_count (integer)
- favorites_count (integer)
- created_at (timestamp)
- updated_at (timestamp)"

Claude: [Genera y ejecuta la migración SQL]
✅ Tabla 'property_analytics' creada exitosamente
```

#### Ejemplo 3: Ejecutar query personalizado
```
Tú: "Muéstrame las 10 propiedades más caras en venta"

Claude: [Ejecuta]
SELECT title, price, city, state
FROM properties
WHERE transaction_type = 'SALE'
ORDER BY price DESC
LIMIT 10;

Resultados:
1. Penthouse Luxury - $2,500,000 - Miami, FL
2. Villa del Mar - $1,800,000 - Malibu, CA
...
```

#### Ejemplo 4: Generar migración
```
Tú: "Agrega una columna 'virtual_tour_url' (tipo text, nullable) a la tabla properties"

Claude: [Genera migración]
✅ Migración creada: 20250513_add_virtual_tour_url.sql
```

### Ejemplos Específicos del Proyecto

#### Query Analytics de Propiedades
```
Tú: "Muéstrame un reporte de las propiedades más populares basándote en views y favorites"

Claude: [Ejecuta query complejo con JOINs]
SELECT
  p.title,
  p.price,
  COUNT(DISTINCT pv.id) as views,
  COUNT(DISTINCT f.id) as favorites
FROM properties p
LEFT JOIN property_views pv ON p.id = pv.property_id
LEFT JOIN favorites f ON p.id = f.property_id
WHERE p.status = 'AVAILABLE'
GROUP BY p.id
ORDER BY views DESC, favorites DESC
LIMIT 20;
```

#### Verificar Integridad de Datos
```
Tú: "Verifica si hay propiedades sin imágenes"

Claude: [Ejecuta]
SELECT p.id, p.title, COUNT(pi.id) as image_count
FROM properties p
LEFT JOIN property_images pi ON p.id = pi.property_id
GROUP BY p.id
HAVING COUNT(pi.id) = 0;
```

### Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| "Describe la tabla X" | Muestra estructura de tabla |
| "Crea índice en columna X" | Crea índice para optimización |
| "Genera backup de tabla X" | Exporta datos de tabla |
| "Muestra logs recientes" | Ver logs de Supabase |

---

## 2. 📁 Filesystem MCP

### ¿Qué hace?
Permite leer, escribir, buscar y manipular archivos del proyecto de forma segura.

### Ejemplos Básicos

#### Ejemplo 1: Leer archivo
```
Tú: "Lee el contenido del archivo schema.prisma"

Claude: [Lee packages/database/prisma/schema.prisma]
```

#### Ejemplo 2: Crear nuevo componente
```
Tú: "Crea un componente React llamado PropertyFilters.tsx en apps/web/components/properties/ con:
- Un select para tipo de transacción (Venta/Renta)
- Un select para categoría de propiedad
- Input de rango de precio
- Botón de aplicar filtros"

Claude: [Crea el archivo con el código]
✅ Archivo creado: apps/web/components/properties/PropertyFilters.tsx
```

#### Ejemplo 3: Buscar en archivos
```
Tú: "Busca todos los archivos que usan 'propertyRepository'"

Claude: [Escanea el proyecto]
Archivos encontrados (8):
- apps/web/app/actions/properties.ts (5 usos)
- apps/web/app/dashboard/propiedades/page.tsx (2 usos)
- packages/database/repositories/property.ts (definición)
...
```

#### Ejemplo 4: Modificar archivo existente
```
Tú: "En el archivo PropertyCard.tsx, agrega un badge que muestre 'NUEVO' si la propiedad fue creada hace menos de 7 días"

Claude: [Lee archivo, modifica, y guarda]
✅ Archivo actualizado con lógica de badge "NUEVO"
```

### Ejemplos Específicos del Proyecto

#### Crear Server Action
```
Tú: "Crea un nuevo server action en apps/web/app/actions/analytics.ts para:
- Función getPropertyAnalytics(propertyId: string)
- Que retorne views, shares, y favorites count
- Con manejo de errores"

Claude: [Crea el archivo completo siguiendo patrones del proyecto]
```

#### Refactorizar Código
```
Tú: "En apps/web/components/home/featured-properties-carousel.tsx, extrae la lógica de renderizado de cada property card a un componente separado"

Claude:
1. Crea PropertyCarouselCard.tsx
2. Modifica featured-properties-carousel.tsx para usar el nuevo componente
✅ Refactorización completada
```

#### Listar Estructura
```
Tú: "Muéstrame la estructura de carpetas de apps/web/components/"

Claude:
apps/web/components/
├── home/
│   ├── hero-section.tsx
│   ├── featured-properties-carousel.tsx
│   └── ...
├── layout/
│   ├── public-header.tsx
│   └── public-footer.tsx
├── properties/
└── ui/
```

### Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| "Lista archivos en carpeta X" | Ver contenido de directorio |
| "Busca 'término' en todo el proyecto" | Búsqueda global |
| "Copia archivo X a Y" | Duplicar archivo |
| "Renombra archivo X a Y" | Cambiar nombre |
| "Elimina archivo X" | Borrar (con confirmación) |

---

## 3. 🐙 GitHub MCP

### ¿Qué hace?
Gestiona repositorio, issues, pull requests y workflows de GitHub.

### Ejemplos Básicos

#### Ejemplo 1: Listar Issues Abiertos
```
Tú: "Muéstrame los issues abiertos en este repositorio"

Claude: [Lista issues]
Issues abiertos (5):
#23 - [Bug] Error en búsqueda de propiedades
#22 - [Feature] Agregar filtro por precio
#21 - [Enhancement] Mejorar performance del carousel
...
```

#### Ejemplo 2: Crear Nuevo Issue
```
Tú: "Crea un issue llamado 'Implementar vista de mapa de propiedades' con la descripción:
- Integrar Mapbox GL
- Mostrar propiedades como markers
- Popup con info básica
- Filtros integrados"

Claude: [Crea issue]
✅ Issue #24 creado: "Implementar vista de mapa de propiedades"
URL: https://github.com/[user]/[repo]/issues/24
```

#### Ejemplo 3: Crear Pull Request
```
Tú: "Crea un PR desde la branch 'feature/property-filters' a 'main' con título:
'feat: Add property filters component'
y descripción de los cambios realizados"

Claude: [Crea PR]
✅ PR #15 creado
URL: https://github.com/[user]/[repo]/pull/15
```

#### Ejemplo 4: Ver Commits Recientes
```
Tú: "Muéstrame los últimos 10 commits en main"

Claude: [Lista commits con hash, autor, mensaje y fecha]
```

### Ejemplos Específicos del Proyecto

#### Analizar Código en PR
```
Tú: "Revisa el código del PR #15 y dame feedback sobre:
- Patrones de código
- Posibles bugs
- Mejoras de performance"

Claude: [Analiza archivos del PR y proporciona feedback detallado]
```

#### Gestionar Issues por Labels
```
Tú: "Lista todos los issues con label 'bug' y prioridad 'high'"

Claude: [Filtra y lista issues]
```

#### Monitorear CI/CD
```
Tú: "Verifica el estado de los GitHub Actions para el último commit"

Claude: [Muestra estado de workflows]
✅ Build: Passed
✅ Tests: Passed
✅ Lint: Passed
⚠️  Deploy: In Progress
```

### Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| "Crea branch feature/X" | Nueva branch |
| "Lista PRs abiertos" | Ver pull requests |
| "Cierra issue #X" | Cerrar issue |
| "Asigna issue #X a mí" | Asignar issue |
| "Agrega label 'bug' a issue #X" | Etiquetar |

---

## 4. 🧠 Memory MCP

### ¿Qué hace?
Sistema de memoria persistente que recuerda información del proyecto entre sesiones.

### Ejemplos Básicos

#### Ejemplo 1: Guardar Información
```
Tú: "Recuerda que en este proyecto:
- Usamos Prisma como ORM con Supabase
- Todas las server actions van en app/actions/
- Los componentes públicos usan el prefijo 'public-'
- Preferimos Tailwind CSS sobre CSS-in-JS"

Claude: [Guarda en knowledge graph]
✅ Información almacenada en memoria persistente
```

#### Ejemplo 2: Consultar Información
```
Tú: "¿Dónde debo crear nuevas server actions?"

Claude: [Consulta memoria]
Según tu configuración guardada, las server actions se crean en:
📁 apps/web/app/actions/

Ejemplos existentes:
- auth.ts (autenticación)
- properties.ts (CRUD de propiedades)
- social.ts (shares y analytics)
```

#### Ejemplo 3: Recordar Decisiones
```
Tú: "Guarda que decidimos usar React Hook Form con Zod para todos los formularios del proyecto"

Claude: ✅ Decisión guardada: Patrón de formularios (React Hook Form + Zod)
```

#### Ejemplo 4: Ver Todo lo Almacenado
```
Tú: "¿Qué información tienes guardada sobre este proyecto?"

Claude: [Lista knowledge graph]
📚 Memoria del Proyecto:

Arquitectura:
- Framework: Next.js 16
- ORM: Prisma con Supabase
- Monorepo: Turborepo

Convenciones:
- Server Actions: app/actions/
- Repository Pattern para DB
- Validación: Zod schemas

Decisiones:
- Formularios: React Hook Form + Zod
- Estilo: Tailwind CSS
...
```

### Ejemplos Específicos del Proyecto

#### Patrones de Código
```
Tú: "Recuerda el patrón para crear un nuevo repository:
1. Archivo en packages/database/repositories/
2. Exportar funciones CRUD básicas
3. Siempre incluir verificación de ownership
4. Usar Prisma client con tipos generados"

Claude: ✅ Patrón de Repository guardado
```

#### Convenciones de Naming
```
Tú: "Guarda las convenciones de nombres:
- Componentes: PascalCase (PropertyCard)
- Server Actions: camelCase con sufijo Action (createPropertyAction)
- Repositories: camelCase sin sufijo (propertyRepository)
- Types: PascalCase con prefijo (PropertyFormData)"

Claude: ✅ Convenciones de naming almacenadas
```

#### Relaciones de Entidades
```
Tú: "Recuerda las relaciones clave del modelo:
- User tiene muchas Properties (como agente)
- Property tiene muchas PropertyImages
- User tiene muchos Favorites (propiedades favoritas)
- Property tiene muchas PropertyViews y PropertyShares"

Claude: ✅ Relaciones del modelo guardadas en knowledge graph
```

### Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| "Recuerda que..." | Guardar información |
| "¿Qué recuerdas sobre X?" | Consultar memoria |
| "Olv ida información sobre X" | Eliminar de memoria |
| "Actualiza la info sobre X" | Modificar memoria |
| "Muestra toda tu memoria" | Ver knowledge graph completo |

---

## 5. 🎭 Playwright MCP

### ¿Qué hace?
Automatiza navegación web, testing E2E, screenshots y scraping.

### Ejemplos Básicos

#### Ejemplo 1: Navegar y Hacer Screenshot
```
Tú: "Navega a http://localhost:3000 y toma un screenshot de la homepage"

Claude: [Ejecuta Playwright]
✅ Screenshot guardado: homepage-screenshot.png
```

#### Ejemplo 2: Test de Login
```
Tú: "Genera un test de Playwright para validar el flujo de login:
1. Ir a /login
2. Llenar email y password
3. Click en 'Iniciar Sesión'
4. Verificar redirección a /dashboard"

Claude: [Genera código de test]
```typescript
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:3000/dashboard');
});
```
```

#### Ejemplo 3: Scraping de Datos
```
Tú: "Extrae los títulos de todas las propiedades en la página /propiedades"

Claude: [Navega y extrae]
Propiedades encontradas (12):
1. Casa Moderna en Residencial
2. Departamento Céntrico Amueblado
3. Oficina en Zona Comercial
...
```

#### Ejemplo 4: Test de Formulario
```
Tú: "Valida que el formulario de crear propiedad muestre errores cuando se envía vacío"

Claude: [Genera y ejecuta test]
✅ Test passed: Formulario muestra errores de validación
```

### Ejemplos Específicos del Proyecto

#### Test E2E Completo
```
Tú: "Crea un test E2E que:
1. Navegue a la homepage
2. Click en una propiedad del carousel
3. Verifique que se muestre el detalle
4. Click en 'Agregar a Favoritos'
5. Verifique que se agregue (requiere login)"

Claude: [Genera test completo con assertions]
```

#### Validar Accesibilidad
```
Tú: "Escanea la página /propiedades y reporta problemas de accesibilidad"

Claude: [Usa Playwright + axe-core]
⚠️  Problemas encontrados (3):
1. Imagen sin alt text en PropertyCard.tsx
2. Botón sin label accesible en FilterPanel
3. Contraste insuficiente en precio
```

#### Performance Testing
```
Tú: "Mide el tiempo de carga de la homepage y el FCP (First Contentful Paint)"

Claude: [Ejecuta performance test]
📊 Métricas:
- Load Time: 1.2s
- FCP: 0.8s
- LCP: 1.5s
✅ Dentro de los límites aceptables
```

### Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| "Navega a URL X" | Abrir página |
| "Click en selector X" | Interactuar |
| "Llena formulario con..." | Fill inputs |
| "Toma screenshot de..." | Captura |
| "Genera test para..." | Crear test |

---

## 6. 🌐 Fetch MCP

### ¿Qué hace?
Obtiene contenido web, consume APIs, y convierte a formatos útiles (JSON, Markdown).

### Ejemplos Básicos

#### Ejemplo 1: Fetch de API Externa
```
Tú: "Obtén información de la API de Mapbox para las coordenadas:
lat: 25.6866, lng: -100.3161"

Claude: [Hace request a Mapbox Geocoding API]
📍 Ubicación: Monterrey, Nuevo León, México
Dirección: Av. Constitución, Centro
```

#### Ejemplo 2: Convertir Página a Markdown
```
Tú: "Convierte la página https://supabase.com/docs/guides/database a markdown"

Claude: [Fetch y convierte]
✅ Contenido convertido a markdown
```

#### Ejemplo 3: Fetch JSON API
```
Tú: "Consulta la API de exchange rates:
https://api.exchangerate-api.com/v4/latest/USD"

Claude: [Fetch y parsea JSON]
💱 Tasas de cambio (USD):
- MXN: 17.85
- EUR: 0.92
- GBP: 0.79
```

#### Ejemplo 4: Validar Endpoint
```
Tú: "Verifica si la API de Mapbox responde correctamente con mi token"

Claude: [Hace health check]
✅ API Status: 200 OK
Token válido
```

### Ejemplos Específicos del Proyecto

#### Integrar Mapbox
```
Tú: "Usa Fetch MCP para obtener las coordenadas de la dirección:
'Av. Constitución 444, Centro, Monterrey, NL'"

Claude: [Geocoding request]
📍 Coordenadas obtenidas:
- Latitud: 25.6694
- Longitud: -100.3095

¿Quieres que actualice el campo en la base de datos?
```

#### Obtener Datos de Mercado
```
Tú: "Fetch data del API de Zillow (o similar) para comparar precios de propiedades en Monterrey"

Claude: [Hace request y analiza]
📊 Análisis de mercado:
- Precio promedio: $3,500,000 MXN
- Tendencia: +5% último trimestre
- Inventario: 1,200 propiedades
```

#### Validar URLs de Imágenes
```
Tú: "Verifica que todas las URLs de imágenes en property_images estén accesibles"

Claude: [Fetch cada URL]
Verificando 45 imágenes...
✅ 43 accesibles
❌ 2 retornan 404:
- property-img-123.jpg
- property-img-456.jpg
```

### Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| "Fetch URL X" | Obtener contenido |
| "Consulta API X con params..." | API request |
| "Convierte URL a markdown" | Parse HTML |
| "Verifica si URL es válida" | Health check |
| "Extrae datos de URL X" | Web scraping |

---

## 🔗 Casos de Uso Combinados

### Caso 1: Crear Feature Completa

```
Tú: "Vamos a implementar la feature de 'Propiedades Relacionadas':

1. (Memory) Recuerda que vamos a usar un algoritmo simple basado en:
   - Misma ciudad
   - Mismo tipo de transacción
   - Rango de precio ±20%
   - Máximo 4 propiedades

2. (Supabase) Crea una query para obtener propiedades relacionadas

3. (Filesystem) Crea el componente RelatedProperties.tsx en components/properties/

4. (GitHub) Crea issue para tracking"

Claude: [Ejecuta los 4 pasos secuencialmente]
✅ Feature completada e issue #25 creado
```

### Caso 2: Debugging Completo

```
Tú: "Investiga por qué la búsqueda de propiedades es lenta:

1. (Supabase) Revisa los índices de la tabla properties
2. (Filesystem) Busca el código de búsqueda
3. (Playwright) Mide el tiempo de respuesta
4. (Memory) Guarda las optimizaciones que hagamos"

Claude: [Análisis completo con recomendaciones]
```

### Caso 3: Deploy Checklist

```
Tú: "Prepara el proyecto para deploy:

1. (Filesystem) Verifica que no haya console.logs
2. (GitHub) Revisa que no haya issues críticos
3. (Supabase) Confirma que las migraciones están al día
4. (Playwright) Ejecuta suite de tests E2E
5. (Memory) Guarda la checklist de deploy"

Claude: [Ejecuta checklist completa]
```

---

## 🔧 Troubleshooting

### MCP Server No Responde

```bash
# Verificar que los servers estén instalados
npx @supabase/mcp-server-supabase@latest --version
npx @modelcontextprotocol/server-filesystem --version

# Reiniciar Claude Desktop/Code
```

### Error de Permisos (Filesystem)

```
Error: EACCES: permission denied

Solución:
1. Verifica que el path en MCP_CONFIG.json sea correcto
2. Asegúrate de tener permisos de lectura/escritura
```

### Supabase Token Inválido

```
Error: Invalid access token

Solución:
1. Genera nuevo token en: https://supabase.com/dashboard/account/tokens
2. Actualiza en MCP_CONFIG.json
3. Reinicia Claude
```

### Playwright Timeout

```
Error: Timeout exceeded

Solución:
1. Aumenta timeout en comandos (30s default)
2. Verifica que el servidor Next.js esté corriendo (localhost:3000)
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp)
- [GitHub MCP](https://github.com/github/github-mcp-server)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)

### Comunidad
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
- [MCP Registry](https://github.com/mcp)

---

## 🎯 Quick Reference

### Comandos Más Usados

```
# Supabase
"Lista las tablas de la base de datos"
"Ejecuta query: SELECT * FROM properties WHERE..."
"Crea tabla X con columnas..."

# Filesystem
"Lee el archivo X"
"Crea componente X en ruta Y"
"Busca 'término' en todo el proyecto"

# GitHub
"Lista issues abiertos"
"Crea issue 'título'"
"Crea PR desde branch X"

# Memory
"Recuerda que..."
"¿Qué sabes sobre X?"

# Playwright
"Navega a URL y toma screenshot"
"Genera test para feature X"

# Fetch
"Obtén datos de API X"
"Convierte URL a markdown"
```

---

## ✅ Checklist de Primeros Pasos

- [ ] Instalar configuración MCP
- [ ] Configurar tokens de Supabase y GitHub
- [ ] Reiniciar Claude Desktop/Code
- [ ] Probar cada MCP con comando simple
- [ ] Guardar convenciones del proyecto en Memory
- [ ] Crear primer test con Playwright
- [ ] Documentar casos de uso específicos de tu equipo

---

**¡Listo para empezar a usar los MCP servers! 🚀**

¿Necesitas ayuda con algún comando específico? Solo pregunta usando lenguaje natural.
