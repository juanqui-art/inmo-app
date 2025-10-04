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

'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validations/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * SIGNUP ACTION - Registrar nuevo usuario
 *
 * Flujo:
 * 1. Validar datos con Zod
 * 2. Crear cuenta en Supabase Auth
 * 3. Guardar metadata (name, role)
 * 4. Redirigir a dashboard
 */
export async function signupAction(_prevState: any, formData: FormData) {
  // 1. Extraer datos del formulario
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    role: formData.get('role') as 'CLIENT' | 'AGENT' | 'ADMIN',
  }

  // 2. Validar con Zod schema
  const validatedData = signupSchema.safeParse(rawData)

  if (!validatedData.success) {
    // Si la validación falla, retornar errores
    return {
      error: validatedData.error.flatten().fieldErrors,
    }
  }

  const { name, email, password, role } = validatedData.data

  // 3. Crear cliente de Supabase
  const supabase = await createClient()

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
      },
    },
  })

  if (error) {
    console.error('Supabase signup error:', error)
    return {
      error: { general: error.message },
    }
  }

  if (!data.user) {
    return {
      error: { general: 'No se pudo crear el usuario' },
    }
  }

  // 5. Revalidar cache y redirigir
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * LOGIN ACTION - Iniciar sesión
 *
 * Flujo:
 * 1. Validar email y password
 * 2. Autenticar con Supabase
 * 3. Supabase guarda la sesión en cookies automáticamente
 * 4. Redirigir a dashboard
 */
export async function loginAction(_prevState: any, formData: FormData) {
  // 1. Extraer datos
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // 2. Validar
  const validatedData = loginSchema.safeParse(rawData)

  if (!validatedData.success) {
    return {
      error: validatedData.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedData.data

  // 3. Crear cliente de Supabase
  const supabase = await createClient()

  // 4. Iniciar sesión
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Supabase login error:', error)
    return {
      error: { general: error.message || 'Credenciales inválidas' },
    }
  }

  // 5. Revalidar y redirigir
  revalidatePath('/', 'layout')
  redirect('/dashboard')
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
  const supabase = await createClient()

  // Cerrar sesión en Supabase
  await supabase.auth.signOut()

  // Revalidar y redirigir
  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * GET USER - Obtener usuario actual (helper)
 *
 * Útil para:
 * - Mostrar nombre del usuario en el navbar
 * - Verificar rol para mostrar opciones
 */
export async function getUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
