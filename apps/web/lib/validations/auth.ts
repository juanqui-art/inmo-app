/**
 * SCHEMAS DE VALIDACIÓN - Autenticación
 *
 * ¿Qué hace Zod?
 * - Valida que los datos cumplan ciertas reglas
 * - Si no cumplen, devuelve errores descriptivos
 * - Proporciona TypeScript types automáticamente
 *
 * ¿Por qué validar en el servidor?
 * - Nunca confíes en datos del cliente (pueden manipularlos)
 * - La validación en el servidor es la única confiable
 */

import { z } from 'zod'

/**
 * Schema para LOGIN
 *
 * Reglas:
 * - email: Debe ser un email válido
 * - password: Mínimo 1 carácter (ya existe, solo validamos que no esté vacío)
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Debe ser un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

/**
 * Schema para SIGNUP (Registro)
 *
 * Reglas más estrictas:
 * - name: Mínimo 2 caracteres
 * - email: Debe ser email válido
 * - password: Mínimo 8 caracteres + letra + número
 * - role: Solo puede ser CLIENT, AGENT, o ADMIN
 */
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Debe ser un email válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[a-zA-Z]/, 'La contraseña debe contener al menos una letra')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  role: z.enum(['CLIENT', 'AGENT', 'ADMIN'], {
    errorMap: () => ({ message: 'Rol inválido' }),
  }),
})

// Tipos TypeScript generados automáticamente desde los schemas
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
