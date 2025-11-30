#!/bin/bash

echo "🔍 Diagnóstico del Sistema InmoApp"
echo "===================================="
echo ""

# Versiones
echo "📦 Versiones:"
echo "  Node.js: $(node --version)"
echo "  Bun: $(bun --version)"
echo "  Git: $(git --version | head -1)"
echo ""

# Estado del repositorio
echo "📁 Estado del Repositorio:"
echo "  Branch: $(git branch --show-current)"
echo "  Último commit: $(git log -1 --oneline)"
echo ""

# Archivos de entorno
echo "🔐 Archivos de Entorno:"
[ -f ".env.local" ] && echo "  ✓ .env.local (root)" || echo "  ✗ .env.local (root) FALTANTE"
[ -f "apps/web/.env.local" ] && echo "  ✓ apps/web/.env.local" || echo "  ✗ apps/web/.env.local FALTANTE"
echo ""

# node_modules
echo "📦 node_modules:"
if [ -d "node_modules" ]; then
  PACKAGES=$(ls node_modules 2>/dev/null | wc -l | tr -d ' ')
  SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
  echo "  ✓ Instalado ($PACKAGES paquetes, $SIZE)"

  # Check corruptos
  CORRUPT=$(find node_modules -name "* [0-9]" -type d 2>/dev/null | wc -l | tr -d ' ')
  if [ "$CORRUPT" -gt 0 ]; then
    echo "  ✗ ADVERTENCIA: $CORRUPT archivos corruptos detectados"
  else
    echo "  ✓ Sin archivos corruptos"
  fi
else
  echo "  ✗ NO instalado"
fi
echo ""

# Prisma
echo "🗄️  Prisma:"
if [ -f "node_modules/.prisma/client/index.js" ]; then
  echo "  ✓ Cliente generado"
else
  echo "  ✗ Cliente NO generado"
fi
echo ""

# Cachés
echo "💾 Cachés:"
if [ -d "$HOME/.bun/install/cache" ]; then
  CACHE_SIZE=$(du -sh "$HOME/.bun/install/cache" 2>/dev/null | cut -f1)
  echo "  Bun cache: $CACHE_SIZE"
else
  echo "  Bun cache: vacío"
fi

if [ -d "apps/web/.next" ]; then
  NEXT_SIZE=$(du -sh apps/web/.next 2>/dev/null | cut -f1)
  echo "  Next.js cache: $NEXT_SIZE"
else
  echo "  Next.js cache: vacío"
fi
echo ""

echo "💡 Para más detalles, ejecuta: ./scripts/verify-install.sh"
