# Mejores Prácticas de CSS con Tailwind y Next.js

Este documento resume los mejores enfoques para organizar estilos en nuestro proyecto, basado en la investigación realizada.

## 1. Enfoque "Tailwind First"
La regla de oro es usar clases de utilidad de Tailwind para el 95% de los estilos. Evita crear archivos CSS personalizados a menos que sea estrictamente necesario.

- **Bien:** `<div className="bg-blue-500 rounded-lg p-4">`
- **Evitar:** `.mi-tarjeta { ... }` en un archivo CSS separado.

## 2. Archivos Globales (`globals.css`)
Mantén un único punto de entrada para estilos globales.
- Aquí van las directivas `@tailwind`.
- Variables CSS (Custom Properties) para el tema (ej. colores, fuentes).
- Estilos base para etiquetas HTML (`html`, `body`).

## 3. Manejo de Animaciones Complejas
Para animaciones `@keyframes` largas o complejas que ensucian el código JSX:
- **Opción A (Recomendada):** Usar animaciones de Tailwind en `tailwind.config.js` (`theme.extend.keyframes`).
- **Opción B (Actual):** Archivos CSS separados importados en el componente o layout.
  - *Ejemplo:* `navbar-scroll-animations.css`.
  - Si usas esta opción, asegúrate de importar el archivo explícitamente.

## 4. CSS Modules (Para componentes específicos)
Si necesitas estilos CSS "tradicionales" pero solo para un componente, usa **CSS Modules**.
- Nombre: `Componente.module.css`
- Uso: `import styles from './Componente.module.css'`
- Ventaja: Las clases son locales y no chocan con otras.

## 5. Estructura Recomendada
```
apps/web/
├── app/
│   ├── globals.css          # Estilos globales y tokens
│   ├── layout.tsx           # Importaciones globales
│   └── ...
├── styles/                  # (Opcional) Carpeta para animaciones/hacks específicos
│   └── animations.css
└── ...
```

## Resumen de la Limpieza Realizada (Dic 2025)
- Se eliminaron archivos duplicados y no utilizados (`parallax-animations`).
- Se mantuvo `navbar-scroll-animations.css` ya que contiene lógica compleja de scroll-driven animations que es difícil de replicar solo con utilidades.
