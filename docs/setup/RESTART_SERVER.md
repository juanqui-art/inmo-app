# ⚠️ REINICIAR SERVIDOR COMPLETAMENTE

El error de prepared statements requiere limpiar el cache de Turbopack.

## Pasos:

1. **Detén el servidor** (Ctrl+C en la terminal donde está corriendo)

2. **Limpia el cache de Next.js:**
   ```bash
   rm -rf apps/web/.next
   ```

3. **Reinicia el servidor:**
   ```bash
   bun run dev
   ```

4. **Espera a que compile** (puede tomar 10-15 segundos)

5. **Recarga el navegador** (Cmd+R o F5)

6. **Intenta crear la propiedad de nuevo**

---

## ✅ Cambios aplicados:

- ✅ DATABASE_URL tiene `?pgbouncer=true&connection_limit=1`
- ✅ DIRECT_URL apunta a conexión directa (db.*.supabase.co)
- ✅ Prisma Client regenerado
- ✅ PrismaClient configurado con datasourceUrl

## Si el error persiste:

El problema puede ser que Supabase Pooler en modo "Transaction" sigue teniendo conflictos.

**Solución alternativa:** Cambiar a modo "Session" en el pooler:

1. Ve a Supabase Dashboard → Settings → Database
2. En "Connection pooling", cambia de "Transaction" a **"Session"**
3. Copia la nueva URL (puerto 5432 en el pooler)
4. Actualiza `.env`:
   ```bash
   DATABASE_URL="postgresql://...pooler.supabase.com:5432/postgres?pgbouncer=true"
   ```
5. Regenera: `bunx prisma generate`
6. Reinicia: `bun run dev`

**Diferencia:**
- Transaction mode: Más eficiente pero con limitaciones
- Session mode: Más compatible, funciona mejor con Prisma
