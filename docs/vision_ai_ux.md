# Visión de Producto: InmoApp "Premium AI"

Este documento define la dirección de diseño y tecnología para transformar InmoApp en una plataforma inmobiliaria de vanguardia, combinando una estética de lujo con utilidades de IA invisibles pero potentes.

## 1. Filosofía de Diseño: "Lujo Invisible"

El objetivo no es gritar "TENEMOS IA", sino usar la IA para eliminar fricción. El diseño debe sentirse "caro" y fluido.

### Pilares UX/UI
*   **Glassmorphism 2.0**: Uso de capas semitransparentes con desenfoques de fondo (backdrop-blur) para crear profundidad sin ensuciar la interfaz. Ideal para tarjetas de propiedades sobre mapas o fotos.
*   **Micro-interacciones Fluidas**:
    *   *Hover*: Las tarjetas no solo cambian de color; se "elevan" suavemente (`framer-motion`).
    *   *Transiciones*: Navegación entre páginas sin cortes bruscos.
    *   *Scroll*: Efectos parallax sutiles en las imágenes de cabecera (`gsap`).
*   **Tipografía Editorial**: Uso de fuentes grandes y con alto contraste para titulares, inspiradas en revistas de arquitectura (Architectural Digest).

## 2. Hoja de Ruta de Características AI

Implementación gradual para aportar valor inmediato.

### Fase 1: Captación Inteligente (El "Gancho")
*   **Widget de Valoración IA**: En lugar de "Contáctanos", un input simple: *"Ingresa tu dirección para una valoración preliminar"*.
    *   *Valor*: Captura leads de alta intención.
    *   *UX*: Un "Wizard" paso a paso suave, no un formulario largo y aburrido.

### Fase 2: Búsqueda Conversacional
*   **Barra de Búsqueda Natural**: Reemplazar los filtros complejos con un campo de texto simple.
    *   *Input*: "Apartamento en Cumbayá con vista y balcón por menos de $1500".
    *   *Tech*: OpenAI transforma esto en filtros de base de datos (PostgreSQL/Supabase).

### Fase 3: Asistente de Listado (Generativo)
*   **Redactor IA**: El agente sube fotos y datos básicos (3 dorm, 2 baños), y la IA escribe una descripción vendedora y emocionante ("Luminoso apartamento ideal para...") en tono premium.
*   **Mejora de Imágenes**: Ajuste automático de brillo/contraste para fotos oscuras subidas desde el móvil.

---

## 3. Plan de Acción Inmediato (Fase 1)

Transformar la página `/vender` en la primera experiencia "Premium AI".

1.  **Rediseño Visual**: Aplicar el nuevo lenguaje visual (Glassmorphism + GSAP) a la landing page de vendedores.
2.  **Desarrollo del Widget "Smart Valuation"**:
    *   Crear el componente interactivo de valoración.
    *   Conectar con Supabase para guardar el lead.
    *   (Inicialmente) Dar una estimación de rango basada en m2 del sector (lógica simple) mientras se entrena el modelo de IA real.
