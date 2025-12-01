# Tutorial Básico de GSAP

> **GSAP (GreenSock Animation Platform)** es la biblioteca de animación JavaScript más robusta y profesional. Se usa en sitios como Apple, Google, Nike, y más.

---

## 📚 Tabla de Contenidos

1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Métodos Básicos](#métodos-básicos)
3. [Timelines](#timelines)
4. [Plugins Esenciales](#plugins-esenciales)
5. [Ejemplos Prácticos](#ejemplos-prácticos)
6. [Mejores Prácticas](#mejores-prácticas)

---

## Conceptos Fundamentales

### ¿Qué es GSAP?

GSAP anima **propiedades CSS** y **objetos JavaScript** de forma fluida y eficiente (60fps garantizados).

```javascript
// Anima un elemento de A → B
gsap.to(".box", { x: 100, duration: 1 });
```

### Tres Métodos Core

| Método | Descripción | Uso |
|--------|-------------|-----|
| `gsap.to()` | Anima **desde el estado actual** hacia los valores especificados | Más común |
| `gsap.from()` | Anima **desde los valores especificados** hacia el estado actual | Entradas |
| `gsap.fromTo()` | Define **inicio Y fin** explícitamente | Control total |

---

## Métodos Básicos

### 1. `gsap.to()` - Animar hacia un estado

```javascript
// Mover un elemento 200px a la derecha en 1 segundo
gsap.to(".box", {
  x: 200,           // translateX(200px)
  duration: 1,      // Duración en segundos
  ease: "power2.out" // Curva de aceleración
});
```

**Propiedades animables comunes:**
```javascript
gsap.to(".element", {
  // Transformaciones
  x: 100,              // translateX
  y: 50,               // translateY
  rotation: 360,       // rotate
  scale: 1.5,          // scale
  
  // Opacidad y visibilidad
  opacity: 0,          // opacity
  autoAlpha: 0,        // opacity + visibility (mejor rendimiento)
  
  // Efectos CSS
  backgroundColor: "#ff0000",
  borderRadius: "50%",
  
  // Timing
  duration: 1,         // Duración
  delay: 0.5,          // Retraso antes de iniciar
  ease: "power2.out",  // Curva de aceleración
  
  // Callbacks
  onComplete: () => console.log("¡Terminó!"),
  onStart: () => console.log("Iniciando..."),
});
```

---

### 2. `gsap.from()` - Animar desde un estado

Útil para **entradas** (elementos que aparecen):

```javascript
// El elemento aparece desde abajo
gsap.from(".title", {
  y: 50,           // Comienza 50px abajo
  opacity: 0,      // Comienza invisible
  duration: 1,     // Toma 1 segundo
  ease: "power2.out"
});

// Estado inicial: y=50, opacity=0
// Estado final: y=0, opacity=1 (valores actuales del DOM)
```

---

### 3. `gsap.fromTo()` - Control total

Define **inicio Y fin** explícitamente:

```javascript
gsap.fromTo(".box", 
  // Estado inicial
  { 
    x: -100, 
    opacity: 0 
  },
  // Estado final
  { 
    x: 100, 
    opacity: 1, 
    duration: 1 
  }
);
```

---

### 4. `gsap.set()` - Establecer valores sin animar

```javascript
// Útil para configurar estado inicial
gsap.set(".element", {
  opacity: 0,
  y: 20,
  scale: 0.8
});
```

---

## Timelines

Los **Timelines** son la característica más poderosa de GSAP. Permiten **secuenciar animaciones** fácilmente.

### Timeline Básico

```javascript
const tl = gsap.timeline();

// Las animaciones se ejecutan en secuencia
tl.to(".box1", { x: 100, duration: 1 })
  .to(".box2", { y: 100, duration: 1 })
  .to(".box3", { rotation: 360, duration: 1 });
```

### Timeline con Posicionamiento

```javascript
const tl = gsap.timeline();

tl.to(".box1", { x: 100, duration: 1 })
  .to(".box2", { y: 100, duration: 1 }, "-=0.5")  // Inicia 0.5s antes de que termine la anterior
  .to(".box3", { rotation: 360, duration: 1 }, "+=0.5"); // Inicia 0.5s después de que termine
```

**Posicionamiento en Timelines:**

| Valor | Significado |
|-------|-------------|
| `0` | Al inicio del timeline |
| `1` | En el segundo 1 |
| `"-=0.5"` | 0.5s antes del final de la animación anterior |
| `"+=0.5"` | 0.5s después del final de la animación anterior |
| `"<"` | Al mismo tiempo que la animación anterior |

### Timeline con Defaults

```javascript
const tl = gsap.timeline({
  defaults: { 
    duration: 1, 
    ease: "power2.out" 
  }
});

// Todas heredan duration: 1 y ease: "power2.out"
tl.to(".box1", { x: 100 })
  .to(".box2", { y: 100 })
  .to(".box3", { rotation: 360, duration: 2 }); // Sobrescribe el default
```

---

## Plugins Esenciales

### 1. ScrollTrigger - Animaciones al hacer scroll

```javascript
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

gsap.to(".box", {
  x: 500,
  scrollTrigger: {
    trigger: ".box",      // Elemento que activa la animación
    start: "top center",  // Cuando el top del elemento llega al centro del viewport
    end: "bottom top",    // Cuando el bottom del elemento llega al top del viewport
    scrub: true,          // Vincula la animación al scroll (suave)
    markers: true         // Muestra marcadores de debug (quitar en producción)
  }
});
```

**Parallax con ScrollTrigger:**
```javascript
gsap.to(".background", {
  yPercent: 50,  // Mueve 50% de su altura
  ease: "none",
  scrollTrigger: {
    trigger: ".section",
    start: "top top",
    end: "bottom top",
    scrub: 1  // Suavidad (0-1)
  }
});
```

---

### 2. SplitText - Animar texto por caracteres/palabras

```javascript
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

// Divide el texto en caracteres
const split = new SplitText(".title", { 
  type: "chars",
  charsClass: "char" 
});

// Anima cada carácter
gsap.from(split.chars, {
  opacity: 0,
  y: 50,
  stagger: 0.05,  // 0.05s entre cada carácter
  duration: 0.8
});

// IMPORTANTE: Limpia al desmontar
split.revert();
```

---

## Ejemplos Prácticos

### Ejemplo 1: Fade In Simple

```javascript
gsap.from(".hero-title", {
  opacity: 0,
  y: 30,
  duration: 1,
  ease: "power2.out"
});
```

---

### Ejemplo 2: Stagger (Animación Escalonada)

```javascript
// Anima múltiples elementos con retraso entre cada uno
gsap.from(".card", {
  opacity: 0,
  y: 50,
  duration: 0.8,
  stagger: 0.2,  // 0.2s entre cada card
  ease: "power2.out"
});
```

---

### Ejemplo 3: Secuencia Completa (como en HeroSection)

```javascript
const tl = gsap.timeline({
  defaults: { ease: "power3.out" }
});

// 1. Background fade in
tl.to(".background", {
  opacity: 1,
  duration: 0.8
}, 0);

// 2. Título con efecto blur
const split = new SplitText(".title", { type: "chars" });
gsap.set(split.chars, { filter: "blur(10px)", opacity: 0 });

tl.to(split.chars, {
  filter: "blur(0px)",
  opacity: 1,
  stagger: 0.03,
  duration: 0.9
}, 0.3);

// 3. Subtítulo
tl.from(".subtitle", {
  opacity: 0,
  y: 20,
  duration: 0.8
}, "-=0.4");

// 4. Botón
tl.from(".button", {
  opacity: 0,
  y: 40,
  duration: 0.8
}, "-=0.5");
```

---

### Ejemplo 4: Hover Interactivo

```javascript
const button = document.querySelector(".button");

button.addEventListener("mouseenter", () => {
  gsap.to(button, {
    scale: 1.1,
    duration: 0.3,
    ease: "power2.out"
  });
});

button.addEventListener("mouseleave", () => {
  gsap.to(button, {
    scale: 1,
    duration: 0.3,
    ease: "power2.out"
  });
});
```

---

## Mejores Prácticas

### 1. ✅ Usa `autoAlpha` en lugar de `opacity`

```javascript
// ❌ Malo
gsap.to(".element", { opacity: 0 });

// ✅ Bueno - También maneja visibility
gsap.to(".element", { autoAlpha: 0 });
```

`autoAlpha` combina `opacity` y `visibility`, mejorando el rendimiento.

---

### 2. ✅ Limpia las animaciones en React

```javascript
useGSAP(() => {
  const tl = gsap.timeline();
  const split = new SplitText(".title", { type: "chars" });
  
  // ... animaciones
  
  // CLEANUP
  return () => {
    tl.kill();
    split.revert();
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };
}, { scope: containerRef });
```

---

### 3. ✅ Usa refs en React (no selectores CSS)

```javascript
// ❌ Malo - Frágil
gsap.to(".my-element", { x: 100 });

// ✅ Bueno - Robusto
const elementRef = useRef(null);
gsap.to(elementRef.current, { x: 100 });
```

---

### 4. ✅ Respeta `prefers-reduced-motion`

```javascript
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
  // Salta animaciones o hazlas instantáneas
  gsap.set(".element", { opacity: 1, y: 0 });
} else {
  // Animaciones normales
  gsap.from(".element", { opacity: 0, y: 50, duration: 1 });
}
```

---

### 5. ✅ Usa `ease` apropiadas

```javascript
// Entradas suaves
ease: "power2.out"

// Salidas suaves
ease: "power2.in"

// Movimiento natural
ease: "power3.inOut"

// Rebote
ease: "back.out(1.7)"

// Elástico
ease: "elastic.out(1, 0.3)"
```

**Visualizador de eases:** https://gsap.com/docs/v3/Eases/

---

## Recursos Adicionales

- 📖 **Documentación oficial:** https://gsap.com/docs/v3/
- 🎓 **Tutoriales gratuitos:** https://gsap.com/resources/get-started/
- 🎮 **Playground interactivo:** https://codepen.io/GreenSock
- 📺 **Canal de YouTube:** https://www.youtube.com/c/GreenSockLearning

---

## Ejemplo Completo: Tu HeroSection Simplificado

```javascript
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export function SimpleHero() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" }
    });

    // Secuencia de entrada
    tl.from(titleRef.current, {
      opacity: 0,
      y: 30,
      duration: 1
    })
    .from(subtitleRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8
    }, "-=0.5")  // Empieza 0.5s antes de que termine el título
    .from(buttonRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6
    }, "-=0.4");

    // Cleanup
    return () => tl.kill();
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="hero">
      <h1 ref={titleRef}>Bienvenido</h1>
      <p ref={subtitleRef}>Tu nuevo hogar te espera</p>
      <button ref={buttonRef}>Explorar</button>
    </div>
  );
}
```

---

## 🎯 Próximos Pasos

1. **Practica** con ejemplos simples en CodePen
2. **Experimenta** con diferentes `ease` y `duration`
3. **Explora** ScrollTrigger para animaciones al scroll
4. **Lee** el código de tu `HeroSection` con este conocimiento

¡Ahora tienes las bases para crear animaciones profesionales con GSAP! 🚀
