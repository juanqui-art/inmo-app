# 💰 Estrategia de Pricing v2: Incentivos de Valor

**Fecha:** 2025-12-09
**Estado:** Propuesta Estratégica
**Objetivo:** Resolver el "Middle Tier Trap" (Plan Básico inútil) y maximizar conversión de Dueños y Agentes.

---

## 1. Diagnóstico del Problema

El modelo actual (1 vs 3 vs 10 propiedades) falla porque **mezcla dos audiencias con necesidades opuestas**:

*   **El Dueño (B2C):** Tiene 1 casa. No necesita 3 cupos. Si paga, es por **velocidad y urgencia**.
*   **El Agente (B2B):** Tiene inventario. Necesita **volumen y herramientas de gestión**.

El plan "Basic" actual (3 propiedades) está en "tierra de nadie":
*   Al dueño le sobra (1 > 3 no aporta valor).
*   Al agente le falta (3 es muy poco).

---

## 2. Nueva Estructura Propuesta

Pivotamos de una escala puramente **Cuantitativa** (Número de casas) a una **Cualitativa** (Visibilidad vs. Herramientas).

### TIER 1: GRATIS (El Gancho)
*   **Para quién:** El curioso o el vendedor paciente.
*   **Filosofía:** "Entra y prueba, pero sin esteroides".
*   **Límites:**
    *   1 Propiedad Activa.
    *   5 Fotos (Calidad estándar).
    *   **Visibilidad:** Normal (Fondo de lista).
    *   **Soporte:** Básico.

### TIER 2: PLUS / DUEÑO (El Acelerador)
*   *Anteriormente "Basic"*
*   **Para quién:** El propietario que quiere vender su casa **YA**.
*   **Filosofía:** "No te doy más espacio, te doy más OJOS".
*   **Value Proposition:** Máxima exposición para tu única joya.
*   **Características Clave:**
    *   **1 Propiedad Activa** (Igual que Free, no necesitamos más).
    *   **🚀 ESTADO DESTACADO:** Aparece primero en búsquedas y Home.
    *   **📸 25 Fotos HD:** Galería completa para enamorar.
    *   **📢 Etiqueta "Oportunidad":** Badge visual en la tarjeta.
    *   **Soporte:** Prioritario (24h).
*   **Precio Sugerido:** $9.99 / mes (o pago único por 30 días).

### TIER 3: PRO / AGENTE (El Negocio)
*   *Anteriormente "Pro"*
*   **Para quién:** Agentes Inmobiliarios y Corredores.
*   **Filosofía:** "Tu oficina virtual".
*   **Value Proposition:** Volumen y Marca Personal.
*   **Características Clave:**
    *   **15+ Propiedades Activas.**
    *   **🤵 Perfil de Agente Verificado:** Página de perfil pública con todas sus propiedades, foto y bio.
    *   **📞 Botón de WhatsApp Directo:** Sin intermediarios.
    *   **📈 Smart Analytics:** "Quién vio tu propiedad", "Cuántos guardaron en favoritos".
    *   **IA Copilot:** Generador de descripciones automático.
*   **Precio Sugerido:** $29.99 / mes.

---

## 3. Tabla Comparativa (Para UI)

| Característica | **GRATUITO** | **PLUS (Dueño)** | **PRO (Agente)** |
| :--- | :---: | :---: | :---: |
| **Enfoque** | Probar | **Vender Rápido** | **Gestionar Negocio** |
| **Propiedades** | 1 | 1 | **15** |
| **Visibilidad** | Estándar | 🔥 **Alta (Destacado)** | Alta (Perfil Verificado) |
| **Fotos** | 5 | **25 HD** | 20 / propiedad |
| **IA Generator** | ❌ | ✅ (1 uso) | ✅ **Ilimitado** |
| **Soporte** | Email | Email Prioritario | WhatsApp |
| **Precio** | $0 | **$9.99** | **$29.99** |

---

## 4. Próximos Pasos (Implementación)

1.  **Actualizar `tiers.ts`:** Reflejar estos nuevos límites y descripciones.
2.  **Actualizar `property-limits.ts`:**
    *   Cambiar lógica de `getImageLimit`: Free=5, Plus=25, Pro=20.
    *   Cambiar lógica de `getFeaturedLimit`: Plus=1 (Autodestacado), Pro=5.
3.  **UI de Precios:** Actualizar las tarjetas de precios en `/vender` para comunicar la propuesta de valor "Velocidad" vs "Volumen".
