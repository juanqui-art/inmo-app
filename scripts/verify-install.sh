#!/bin/bash

echo "🔍 Verificando integridad de node_modules..."
echo ""

# Check for corrupt files
CORRUPT=$(find node_modules -name "* [0-9]" -type d 2>/dev/null | wc -l | tr -d ' ')
if [ "$CORRUPT" -gt 0 ]; then
  echo "❌ Archivos corruptos detectados:"
  find node_modules -name "* [0-9]" -type d
  echo ""
  echo "Ejecuta: bun run fresh"
  exit 1
fi

echo "✅ Sin archivos corruptos"

# Check Prisma Client
if [ ! -f "node_modules/.prisma/client/index.js" ]; then
  echo "❌ Prisma Client no generado"
  echo "Ejecuta: cd packages/database && bunx prisma generate"
  exit 1
fi

echo "✅ Prisma Client generado"

# Check critical deps
DEPS=("jiti" "effect/dist/cjs/MergeStrategy.js" "c12")
for dep in "${DEPS[@]}"; do
  if [ ! -e "node_modules/$dep" ]; then
    echo "❌ Dependencia crítica faltante: $dep"
    echo "Ejecuta: bun run fresh"
    exit 1
  fi
done

echo "✅ Dependencias críticas presentes"
echo ""
echo "🎉 Instalación verificada correctamente"
