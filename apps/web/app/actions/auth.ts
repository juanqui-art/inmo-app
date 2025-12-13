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

import { enforceRateLimit, isRateLimitError } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * SIGNUP ACTION - Registrar nuevo usuario
 *
 * Flujo de roles (Principio de mínimo privilegio):
 * - Signup normal → CLIENT → /perfil (navegación, favoritos, citas)
 * - Signup desde /vender con plan → AGENT → /dashboard (publicar propiedades)
 *
 * Pasos:
 * 1. Validar datos con Zod
 * 2. Determinar rol según origen (plan = AGENT, sin plan = CLIENT)
 * 3. Crear cuenta en Supabase Auth con metadata
 * 4. Redirigir según rol
 */
export async function signupAction(_prevState: unknown, formData: FormData) {
  // 0. Rate limiting (IP-based to prevent brute force)
  try {
    await enforceRateLimit({ tier: "auth" });
  } catch (error) {
    if (isRateLimitError(error)) {
      return { error: { general: error.message } };
    }
    throw error;
  }

  // 1. Extraer datos del formulario
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    redirect: formData.get("redirect") as string | null,
    plan: formData.get("plan") as string | null,
  };

  // 2. Validar con Zod schema
  const validatedData = signupSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedData.data;

  // 3. Determinar rol según origen del signup
  // - Si viene con plan (desde /vender) → AGENT (puede publicar propiedades)
  // - Si viene sin plan (signup normal) → CLIENT (solo navegar, favoritos, citas)
  const validPlans = ["FREE", "PLUS", "AGENT", "PRO"];
  const hasPlan = rawData.plan && validPlans.includes(rawData.plan.toUpperCase());
  const role = hasPlan ? "AGENT" : "CLIENT";

  // 4. Crear cliente de Supabase
  const supabase = await createClient();

  // 5. Registrar usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Guardar metadata (nombre, rol, plan)
      // El Database Trigger usa esto para crear el usuario en la tabla
      data: {
        name,
        role,
        plan: rawData.plan,
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

  logger.info({ userId: data.user.id, role, plan: rawData.plan }, "[AUTH] User registered");

  // 6. Revalidar
  revalidatePath("/", "layout");

  // 7. Redirigir según parámetro explícito o rol
  // 7. Esperar a que el trigger de base de datos cree el usuario (Poll DB)
  // Fixes race condition: Redirecting to dashboard before DB user exists logs them out
  const { userRepository } = await import("@repo/database");
  let retries = 0;
  let dbUser = null;
  
  while (retries < 6) { // 3 seconds max (6 * 500ms)
    dbUser = await userRepository.findById(data.user.id);
    if (dbUser) break;
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    retries++;
  }

  // 8. Redirigir según parámetro explícito o rol
  const redirectParam = rawData.redirect;
  if (redirectParam?.startsWith("/")) {
    return redirect(redirectParam);
  }

  // Redirigir según rol asignado (usando el de DB si existe, o fallback al calculado)
  const finalRole = dbUser?.role || role;

  if (finalRole === "AGENT") {
    // AGENT con plan pago → dashboard con modal de upgrade
    const paidPlans = ["PLUS", "AGENT", "PRO"];
    if (rawData.plan && paidPlans.includes(rawData.plan.toUpperCase())) {
      return redirect(`/dashboard?upgrade=${rawData.plan.toLowerCase()}`);
    }
    // AGENT con plan FREE → directo a crear propiedad
    return redirect("/dashboard/propiedades/nueva");
  }

  // CLIENT → perfil (favoritos, citas)
  return redirect("/perfil");
}

/**
 * LOGIN ACTION - Iniciar sesión
 *
 * Flujo:
 * 1. Validar email y password
 * 2. Autenticar con Supabase
 * 3. Obtener rol del usuario desde DB
 * 4. Redirigir según rol:
 *    - CLIENT → /perfil (favoritos, citas)
 *    - AGENT → /dashboard (gestión de propiedades)
 *    - ADMIN → /admin (administración)
 */
export async function loginAction(_prevState: unknown, formData: FormData) {
  // 0. Rate limiting (IP-based to prevent brute force)
  try {
    await enforceRateLimit({ tier: "auth" });
  } catch (error) {
    if (isRateLimitError(error)) {
      return { error: { general: error.message } };
    }
    throw error;
  }

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

  // 5.6 UPGRADE ROLE if plan selected (e.g. CLIENT logging in from /vender)
  const selectedPlan = formData.get("plan") as string | null;
  const validLoginPlans = ["FREE", "PLUS", "AGENT", "PRO"];
  if (
    selectedPlan &&
    validLoginPlans.includes(selectedPlan.toUpperCase()) &&
    dbUser.role === "CLIENT"
  ) {
    // Upgrade to AGENT
    const newRole = "AGENT";
    
    // 1. Update DB
    await userRepository.update(dbUser.id, { role: newRole }, dbUser.id);
    dbUser.role = newRole; // Update local for redirect

    // 2. Update Supabase Metadata
    await supabase.auth.updateUser({
      data: {
        ...authData.user.user_metadata,
        role: newRole,
        plan: selectedPlan,
      },
    });

    logger.info(
      { userId: dbUser.id, oldRole: "CLIENT", newRole, plan: selectedPlan },
      "[AUTH] Upgraded user role on login",
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

  // Redirigir según rol del usuario
  switch (dbUser.role) {
    case "ADMIN":
      return redirect("/admin");
    case "AGENT":
      return redirect("/dashboard");
    case "CLIENT":
    default:
      return redirect("/perfil");
  }
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

/**
 * CHECK AUTH STATUS - Verificar si el usuario está autenticado
 *
 * @returns { isAuthenticated: boolean }
 *
 * @example
 * const { isAuthenticated } = await checkAuthStatusAction();
 */
export async function checkAuthStatusAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    isAuthenticated: !!user,
  };
}
