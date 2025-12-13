# Guía de Mantenimiento de Cachés

> Cómo evitar problemas de cachés corruptos y congelación del servidor de desarrollo

## 🚨 Síntomas de Problemas de Caché

Si experimentas alguno de estos síntomas, necesitas limpiar cachés:

- ❌ `bun run dev` se congela (no inicia después de 30+ segundos)
- ❌ `bun run build` falla con errores extraños
- ❌ TypeScript reporta errores que no existen en el código
- ❌ Cambios en el código no se reflejan en el navegador
- ❌ Hot reload / Fast Refresh deja de funcionar
- ❌ Errores sobre módulos no encontrados después de instalar paquetes
- ❌ Next.js reporta "Module not found" en archivos que existen

## 🛡️ Prevención - Mejores Prácticas

### 1. **Limpieza Regular de Cachés (Cada 2-3 Semanas)**

```bash
# Limpieza suave (solo cachés, mantiene node_modules)
bun run clean:cache

# Luego reinicia el servidor
bun run dev
```

**Frecuencia recomendada:**
- En desarrollo activo: Cada 2-3 semanas
- Después de cambios grandes en dependencias
- Después de actualizar Next.js o React
- Antes de un deploy importante

### 2. **Limpieza Después de Cambios en Dependencias**

```bash
# Después de bun add/remove
bun run clean:cache
bun run dev

# Si el problema persiste
bun run fresh  # Reinstala node_modules
```

### 3. **Limpieza en Casos Específicos**

| Situación | Comando |
|-----------|---------|
| Servidor congelado | `bun run clean:cache && bun run dev` |
| Errores de TypeScript extraños | `bun run clean:cache && bun run type-check` |
| Build falla | `bun run clean:cache && bun run build` |
| Node modules corruptos | `bun run fresh` |
| Reset completo | `bun run reset` |

## 📋 Scripts Disponibles

### Limpieza Granular

```bash
# 1. Solo cachés de compilación (RÁPIDO - 2 segundos)
bun run clean:cache
# Elimina: .next, .turbo, *.tsbuildinfo
# Útil: Cuando el servidor se congela o errores de build

# 2. Solo dependencias (LENTO - reinstala todo)
bun run clean:deps
# Elimina: node_modules, bun.lock
# Útil: Cuando hay conflictos de dependencias

# 3. TODO (RESET COMPLETO)
bun run clean:all
# Elimina: Cachés + Dependencias
# Útil: Cuando nada más funciona
```

### Workflows Comunes

```bash
# DESARROLLO DIARIO - Reinicio rápido
bun run clean:cache && bun run dev

# DESPUÉS DE INSTALAR PAQUETES
bun add <paquete>
bun run clean:cache
bun run dev

# RESET COMPLETO (como hoy)
bun run reset
# = clean:all + install + dev

# ANTES DE UN DEPLOY
bun run rebuild
# = clean:all + install + build
```

## ⚡ Rutina de Mantenimiento Semanal

Agrega esto a tu rutina cada viernes o antes de commits importantes:

```bash
# 1. Limpiar cachés
bun run clean:cache

# 2. Verificar que todo compila
bun run type-check

# 3. Correr tests
bun run test

# 4. Build de prueba
bun run build
```

## 🎯 Señales de que Necesitas Limpiar

### Inmediato (Limpiar AHORA)
- ✋ Servidor congelado más de 30 segundos
- ✋ Build falla con errores de módulos no encontrados
- ✋ Hot reload no funciona

### Preventivo (Limpiar esta semana)
- ⚠️ `.next/` más de 500MB (verifica con `du -sh apps/web/.next`)
- ⚠️ Han pasado 2+ semanas sin limpiar
- ⚠️ Acabas de actualizar Next.js/React/Prisma

### Opcional (Limpiar cuando tengas tiempo)
- 💡 Antes de un deploy importante
- 💡 Después de cambiar muchas dependencias
- 💡 Si notas que el servidor inicia más lento

## 📊 Verificar Tamaño de Cachés

```bash
# Ver tamaño de .next
du -sh apps/web/.next

# Ver tamaño de node_modules
du -sh node_modules

# Ver todos los cachés
du -sh apps/web/.next apps/web/.turbo node_modules

# Buscar archivos .tsbuildinfo
find . -name "*.tsbuildinfo" -type f
```

**Tamaños normales:**
- `.next/`: 50-200 MB (normal), 300-500 MB (grande), 500+ MB (limpiar)
- `node_modules/`: 800-900 MB (normal para este proyecto)
- `.turbo/`: < 50 MB cada uno

## 🔧 Automatización (Opcional)

### Git Hook - Limpieza Automática Post-Merge

Crea `.git/hooks/post-merge`:

```bash
#!/bin/bash
echo "🧹 Post-merge: Verificando si necesitas limpiar cachés..."

# Si package.json o bun.lock cambiaron
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -q -E 'package.json|bun.lock'; then
    echo "📦 Dependencias cambiaron - Limpiando cachés..."
    bun run clean:cache
    echo "✅ Cachés limpiados. Recuerda reiniciar el servidor."
fi
```

```bash
chmod +x .git/hooks/post-merge
```

### Cron Job - Limpieza Semanal Automática (macOS)

```bash
# Abre crontab
crontab -e

# Agrega esta línea (limpia cada lunes a las 9 AM)
0 9 * * 1 cd /Users/juanquizhpi/Desktop/projects/inmo-app && bun run clean:cache
```

## 🚑 Troubleshooting

### "bun run dev se congela"

```bash
# Solución rápida (90% de los casos)
bun run clean:cache
bun run dev

# Si no funciona (reset completo)
bun run reset
```

### "Module not found después de bun add"

```bash
# 1. Limpiar cachés
bun run clean:cache

# 2. Verificar que el paquete está en transpilePackages (next.config.ts)
# Si es un package del workspace (@repo/*), agrégalo a transpilePackages

# 3. Reiniciar
bun run dev
```

### "TypeScript reporta errores fantasma"

```bash
# 1. Eliminar archivos tsbuildinfo
bun run clean:cache

# 2. Verificar errores reales
bun run type-check

# 3. Si persiste, reiniciar VS Code
```

### "Build funciona pero dev se congela"

```bash
# Turbopack puede tener problemas - intenta sin él
cd apps/web
bunx next dev --no-turbo

# Si funciona, el problema es Turbopack cache
bun run clean:cache
```

## 📝 Notas Importantes

1. **`bun.lock` NO es un problema** - Solo eliminarlo en casos extremos
2. **`node_modules` solo en último caso** - Es lento reinstalar (2-3 minutos)
3. **`.next/` es seguro eliminar siempre** - Se regenera en 5-10 segundos
4. **`.turbo/` causa problemas** - Eliminar regularmente es buena práctica

## 🎓 Educación del Equipo

Si trabajas en equipo, comparte estas reglas:

1. **Antes de reportar un bug**: Limpia cachés (`bun run clean:cache`)
2. **Después de pull**: Si cambió package.json, limpia cachés
3. **Antes de commit importante**: Verifica que `bun run build` funciona
4. **Cada viernes**: Limpieza preventiva

## 📚 Referencias

- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Turbopack Issues](https://github.com/vercel/next.js/labels/Turbopack)
- Histórico en este proyecto:
  - Dic 13, 2025: Reset agresivo resolvió congelación
  - ~Nov 27, 2025: Mismo problema, mismo fix
  - Patrón: Ocurre cada ~2 semanas sin limpieza

---

**TL;DR: Ejecuta `bun run clean:cache` cada 2-3 semanas o cuando el servidor se congele. Problema resuelto en 5 segundos.**
