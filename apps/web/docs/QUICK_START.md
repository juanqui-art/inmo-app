# Quick Start - InmoApp

Empieza a trabajar en InmoApp en menos de 5 minutos.

---

## 1️⃣ Instalar Dependencias (1 min)

```bash
# En la raíz del proyecto
bun install
```

## 2️⃣ Configurar Variables de Entorno (2 min)

```bash
cd apps/web
cp .env.example .env.local
```

Edita `.env.local` con:
- `NEXT_PUBLIC_SUPABASE_URL` - Tu URL de Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Tu clave pública
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Tu token de MapBox

Ver [Environment Variables](./technical/ENV_VARS.md) para más detalles.

## 3️⃣ Configurar Base de Datos (1 min)

```bash
# En packages/database
bunx prisma generate
bunx prisma db push  # Crea/sincroniza schema con Supabase
```

## 4️⃣ Iniciar el Servidor (1 min)

```bash
# En la raíz del proyecto
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## ✅ Está funcionando si:

- ✅ Ves la página de inicio
- ✅ El navegador no muestra errores (consola)
- ✅ Puedes navegar a `/mapa`
- ✅ El mapa carga correctamente
- ✅ Ves properties markers en el mapa

---

## 🆘 Si algo falla

| Problema | Solución |
|----------|----------|
| `Prisma client not found` | `cd packages/database && bunx prisma generate` |
| `SUPABASE_URL undefined` | Verifica `.env.local` tiene todas las variables |
| `MapBox token invalid` | Verifica `NEXT_PUBLIC_MAPBOX_TOKEN` en `.env.local` |
| `Module not found` | `rm -rf apps/web/.next && bun run dev` |

Ver [Common Errors](./troubleshooting/COMMON_ERRORS.md) para más.

---

## 📚 Próximos Pasos

Ahora que tienes todo funcionando:

1. **Entiende la arquitectura** → [Architecture](./ARCHITECTURE.md)
2. **Aprende el mapa** → [Map Features](./features/MAP.md)
3. **Empieza a contribuir** → [Adding Features](./guides/ADDING_FEATURES.md)

---

## 💡 Tips Útiles

### Ejecutar TypeScript check
```bash
bun run type-check
```

### Ver la base de datos
```bash
cd packages/database
bunx prisma studio  # Abre UI visual de DB
```

### Limpiar cache
```bash
rm -rf apps/web/.next
rm -rf .turbo
bun run dev
```

### Ejecutar tests
```bash
bun run test
```

---

**Ready?** Ve a [Architecture](./ARCHITECTURE.md) para entender cómo funciona todo.
