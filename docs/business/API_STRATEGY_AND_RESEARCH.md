# 🔌 Estrategia de Integración de APIs & Investigación

**Fecha:** 2025-12-09
**Estado:** Investigación Completada
**Objetivo:** Potenciar InmoApp con "Superpoderes" tecnológicos que justifiquen los planes de pago (PRO).

---

## 1. Ecosistema Google (PropTech Suite)

Google ofrece la suite más completa para Real Estate. Actualmente InmoApp ya usa Maps, pero hay APIs específicas sin explotar.

### A. Google Maps Platform

| API | Función | Value Proposition (El Gancho) | Precio Aprox. |
| :--- | :--- | :--- | :--- |
| **Places API** | Autocompletado & Amenities | "Publica en 10 segundos, no escribas la dirección a mano." | **$2.83** / 1k requests (Muy barato) |
| **Aerial View** | Video 3D Cinematográfico | "Dron virtual instantáneo por centavos". | **$16.00** / 1k videos ($0.016/video) |
| **Solar API** | Potencial Solar de Techos | "Vende sostenibilidad y ahorro energético". | **$0.075** / consulta |

### B. Vertex AI & Gemini (Inteligencia Artificial)

| Modelo / Servicio | Función | Value Proposition | Precio Aprox. |
| :--- | :--- | :--- | :--- |
| **Imagen 3 (Gemini)** | Upscaling & Inpainting | "Tus fotos de celular, ahora en HD profesional." | **$0.03** / imagen |
| **Vertex AI Vision** | Auto-tagging (Etiquetado) | "La IA rellena las características (Cocina, Piscina) por ti." | **$1.50** / 1k imágenes |
| **Gemini Pro** | Generador de Textos | "Descripciones persuasivas en 1 click." | ~$0.000125 / 1k caracteres |

---

## 2. Ecosistema de Terceros (La Capa de Negocio)

APIs esenciales para la operación diaria de una inmobiliaria moderna en LatAm.

### A. Comunicación & Ventas
*   **API:** **WhatsApp Business (vía Twilio o Meta)**
*   **Función:** Chatbots, notificaciones automáticas ("Tu visita es mañana"), lead capture.
*   **Costo:** ~$0.005 por mensaje (variable por país).
*   **Por qué:** En LatAm, el correo se ignora, el WhatsApp se lee.

### B. Productividad
*   **API:** **Cal.com (o Calendly)**
*   **Función:** Agendamiento de visitas sincronizado con Calendar.
*   **Costo:** Plan gratuito generoso / Planes desde $15/mes.
*   **Por qué:** Elimina el "ping-pong" de mensajes para coordinar una hora.

### C. Confianza (Trust)
*   **API:** **Veriff / Stripe Identity**
*   **Función:** KYC (Know Your Customer). Verificación de identidad con Cédula/Selfie.
*   **Costo:** ~$1.50 por verificación.
*   **Por qué:** Crea un entorno seguro. Badge "Agente Verificado" para el Plan PRO.

---

## 3. Análisis de Costos y Rentabilidad

Google ofrece **$200 USD mensuales de crédito gratuito**. Esto cambia la ecuación para una startup.

**Escenario Ejemplo (Startup Temprana):**
*   **Actividad Mes:** 100 Propiedades Nuevas x 20 Fotos c/u = 2,000 Fotos.

| Servicio | Volumen Estimado | Costo Bruto | Cubierto por Crédito? |
| :--- | :--- | :--- | :--- |
| **Places API** | 5,000 búsquedas | ~$14.00 | ✅ SÍ (Gratis) |
| **Aerial View** | 100 videos (1 por casa) | ~$1.60 | ✅ SÍ (Gratis) |
| **Imagen 3 (AI)** | 500 mejoras de foto | ~$15.00 | ⚠️ A veces (Depende SKU Cloud) |
| **Solar API** | 50 consultas VIP | ~$3.75 | ✅ SÍ (Gratis) |
| **TOTAL** | | **~$35.00** | **$0 (Cubierto por los $200)** |

**Conclusión:** Puedes ofrecer características "Premium" a tus primeros usuarios **prácticamente a coste cero** gracias al tier gratuito de Google.

---

## 4. Hoja de Ruta de Implementación (Recomendada)

### Fase 1: "The Smart Assistant" (Inmediato)
*   [x] **Places API:** Autocompletado (Ya implementado).
*   [ ] **Vertex AI Vision:** Auto-tagging de fotos al subir. (Ahorra tiempo).
*   [ ] **Gemini Text:** Generador de descripciones.

### Fase 2: "The Visual Upgrade" (Corto Plazo)
*   [ ] **Imagen 3:** Botón "Mejorar Calidad" (Upscaling).
*   [ ] **Aerial View:** Video aéreo automático para propiedades destacadas.

### Fase 3: "The Operating System" (Medio Plazo)
*   [ ] **WhatsApp:** Notificaciones de leads.
*   [ ] **Cal.com:** Botón "Agendar Visita".
