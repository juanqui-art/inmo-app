/**
 * SERVER ACTIONS - Autenticación
 *
 * ¿Qué son Server Actions?
 * - Funciones que se ejecutan en el SERVIDOR
 * - Se marcan con 'use server'
 * - Puedes llamarlas desde componentes del cliente
 *
 * ¿Cómo funcionan?
 * 1. Usuario llena form en el navegador
 * 2. Form llama a la Server Action
 * 3. La función se ejecuta en el servidor (seguro)
 * 4. Hace operaciones con Supabase
 * 5. Retorna resultado al cliente
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * SIGNUP ACTION - Registrar nuevo usuario
 *
 * Flujo:
 * 1. Validar datos con Zod
 * 2. Crear cuenta en Supabase Auth
 * 3. Guardar metadata (name, role)
 * 4. Redirigir a dashboard
 */
export async function signupAction(_prevState: unknown, formData: FormData) {
  // 1. Extraer datos del formulario
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    redirect: formData.get("redirect") as string | null,
    plan: formData.get("plan") as string | null,
  };

  // 2. Validar con Zod schema (sin role)
  const validatedData = signupSchema.safeParse(rawData);

  if (!validatedData.success) {
    // Si la validación falla, retornar errores
    return {
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedData.data;

  // Todos los usuarios son AGENT por defecto (pueden publicar propiedades)
  const role = "AGENT";

  // 3. Crear cliente de Supabase
  const supabase = await createClient();

  // 4. Registrar usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Guardar metadata adicional (nombre y rol)
      // Esto se usará en el Database Trigger para crear el usuario en la tabla
      data: {
        name,
        role,
        plan: rawData.plan, // Guardar plan seleccionado en metadata
      },
    },
  });

  if (error) {
    logger.error({ err: error, email }, "Supabase signup error");
    return {
      error: { general: error.message },
    };
  }

  if (!data.user) {
    return {
      error: { general: "No se pudo crear el usuario" },
    };
  }

  // 5. Revalidar
  revalidatePath("/", "layout");

  // 6. Redirigir (todos los usuarios van a /dashboard por defecto)
  const redirectParam = rawData.redirect;
  if (redirectParam?.startsWith("/")) {
    return redirect(redirectParam);
  }

  // Lógica de redirección según plan
  if (rawData.plan && ["BASIC", "PRO"].includes(rawData.plan.toUpperCase())) {
    return redirect(`/dashboard?upgrade=${rawData.plan.toLowerCase()}`);
  }

  // Todos los usuarios son AGENT, van al dashboard
  return redirect("/dashboard");
}

/**
 * LOGIN ACTION - Iniciar sesión
 *
 * Flujo:
 * 1. Validar email y password
 * 2. Autenticar con Supabase
 * 3. Obtener rol del usuario desde DB
 * 4. Redirigir según rol (CLIENT → /perfil, AGENT/ADMIN → /dashboard)
 */
export async function loginAction(_prevState: unknown, formData: FormData) {
  // 1. Extraer datos
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // 2. Validar
  const validatedData = loginSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedData.data;

  // 3. Crear cliente de Supabase
  const supabase = await createClient();

  // 4. Iniciar sesión
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.error({ err: error, email }, "Supabase login error");
    return {
      error: { general: error.message || "Credenciales inválidas" },
    };
  }

  if (!authData.user) {
    return {
      error: { general: "No se pudo iniciar sesión" },
    };
  }

  // 5. Obtener rol del usuario desde DB para redirigir correctamente
  const { userRepository } = await import("@repo/database");
  const dbUser = await userRepository.findById(authData.user.id);

  if (!dbUser) {
    // Usuario en Auth pero no en DB (caso edge)
    await supabase.auth.signOut();
    return {
      error: { general: "Usuario no encontrado en la base de datos" },
    };
  }

  // 5.5 Sincronizar rol de metadata → DB si están desincronizados
  // El rol correcto está en user_metadata (del signup), la DB puede estar desactualizada
  // debido a un bug previo en el trigger que no incluía el rol
  const metadataRole = authData.user.user_metadata?.role as
    | "CLIENT"
    | "AGENT"
    | "ADMIN"
    | undefined;

  if (metadataRole && metadataRole !== dbUser.role) {
    // Actualizar el rol en la DB con el valor correcto de metadata
    await userRepository.update(dbUser.id, { role: metadataRole }, dbUser.id);
    // Actualizar dbUser local para la redirección correcta
    dbUser.role = metadataRole;

    logger.info(
      { userId: dbUser.id, role: metadataRole },
      "[AUTH] Synced role from metadata to DB",
    );
  } else if (!metadataRole && dbUser.role) {
    // Si no hay rol en metadata pero sí en DB, actualizar metadata (caso legacy)
    await supabase.auth.updateUser({
      data: {
        ...authData.user.user_metadata,
        role: dbUser.role,
        name: dbUser.name || authData.user.user_metadata?.name,
      },
    });

    logger.info(
      { userId: dbUser.id, role: dbUser.role },
      "[AUTH] Synced role from DB to metadata",
    );
  }

  // 6. Revalidar
  revalidatePath("/", "layout");

  // 7. Redirigir según parámetro redirect o rol
  const redirectParam = formData.get("redirect") as string | null;

  // Si viene un redirect explícito y es una ruta protegida, usarlo
  if (redirectParam?.startsWith("/")) {
    redirect(redirectParam);
  }

  // Si no, redirigir según rol
  if (dbUser.role === "ADMIN") {
    return redirect("/admin");
  }

  // Por defecto (AGENT), ir al dashboard
  return redirect("/dashboard");
}

/**
 * LOGOUT ACTION - Cerrar sesión
 *
 * Flujo:
 * 1. Llamar a Supabase para cerrar sesión
 * 2. Supabase borra las cookies automáticamente
 * 3. Redirigir a home
 */
export async function logoutAction() {
  const supabase = await createClient();

  // Cerrar sesión en Supabase
  await supabase.auth.signOut();

  // Revalidar y redirigir
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * GET USER - Obtener usuario actual (helper)
 *
 * Útil para:
 * - Mostrar nombre del usuario en el navbar
 * - Verificar rol para mostrar opciones
 */
export async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
