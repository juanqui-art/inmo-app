/**
 * PROPERTY VALIDATION SCHEMAS
 * Zod schemas para validación de propiedades
 */

import { z } from "zod";

/**
 * Schema para crear una propiedad
 */
export const createPropertySchema = z
  .object({
    title: z
      .string()
      .min(5, "El título debe tener al menos 5 caracteres")
      .max(100, "El título no puede exceder 100 caracteres"),

    description: z
      .string()
      .min(20, "La descripción debe tener al menos 20 caracteres")
      .max(2000, "La descripción no puede exceder 2000 caracteres"),

    price: z
      .number({ message: "El precio debe ser un número" })
      .positive("El precio debe ser mayor a 0")
      .max(1000000000, "El precio es demasiado alto"),

    transactionType: z.enum(["SALE", "RENT"], {
      message: "Tipo de transacción inválido",
    }),

    category: z.enum(
      [
        "HOUSE",
        "APARTMENT",
        "SUITE",
        "VILLA",
        "PENTHOUSE",
        "DUPLEX",
        "LOFT",
        "LAND",
        "COMMERCIAL",
        "OFFICE",
        "WAREHOUSE",
        "FARM",
      ],
      {
        message: "Tipo de inmueble inválido",
      },
    ),

    status: z
      .enum(["AVAILABLE", "PENDING", "SOLD", "RENTED"])
      .default("AVAILABLE"),

    bedrooms: z
      .number({ message: "Los dormitorios deben ser un número" })
      .int("Los dormitorios deben ser un número entero")
      .min(0, "Los dormitorios no pueden ser negativos")
      .max(50, "Los dormitorios son demasiados")
      .optional(),

    bathrooms: z
      .number({ message: "Los baños deben ser un número" })
      .min(0, "Los baños no pueden ser negativos")
      .max(50, "Los baños son demasiados")
      .optional(),

    area: z
      .number({ message: "El área debe ser un número" })
      .positive("El área debe ser mayor a 0")
      .max(1000000, "El área es demasiado grande")
      .optional(),

    address: z
      .string()
      .min(5, "La dirección debe tener al menos 5 caracteres")
      .max(200, "La dirección no puede exceder 200 caracteres")
      .optional(),

    city: z
      .string()
      .min(2, "La ciudad debe tener al menos 2 caracteres")
      .max(100, "La ciudad no puede exceder 100 caracteres")
      .optional(),

    state: z
      .string()
      .min(2, "El estado debe tener al menos 2 caracteres")
      .max(100, "El estado no puede exceder 100 caracteres")
      .optional(),

    zipCode: z
      .string()
      .min(4, "El código postal debe tener al menos 4 caracteres")
      .max(10, "El código postal no puede exceder 10 caracteres")
      .regex(
        /^[A-Z0-9-\s]+$/i,
        "El código postal solo puede contener letras, números, guiones y espacios",
      )
      .or(z.literal("")) // Permite string vacío (verdaderamente opcional)
      .optional(),

    latitude: z
      .number()
      .min(-90, "Latitud inválida")
      .max(90, "Latitud inválida")
      .optional(),

    longitude: z
      .number()
      .min(-180, "Longitud inválida")
      .max(180, "Longitud inválida")
      .optional(),
  })
  .refine(
    (data) => {
      // Si se llena address, city, o state, todos deben estar presentes
      const hasAnyLocation = data.address || data.city || data.state;
      if (hasAnyLocation) {
        return data.city && data.state;
      }
      return true;
    },
    {
      message:
        "Si proporcionas información de ubicación, debes incluir al menos Ciudad y Provincia",
      path: ["city"], // El error se mostrará en el campo city
    },
  );

/**
 * Schema para actualizar una propiedad
 * Todos los campos son opcionales excepto el ID
 */
export const updatePropertySchema = z.object({
  id: z.string().uuid("ID de propiedad inválido"),
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "El título no puede exceder 100 caracteres")
    .optional(),

  description: z
    .string()
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres")
    .optional()
    .nullable(),

  price: z
    .number({ message: "El precio debe ser un número" })
    .positive("El precio debe ser mayor a 0")
    .max(1000000000, "El precio es demasiado alto")
    .optional(),

  transactionType: z.enum(["SALE", "RENT"]).optional(),

  category: z
    .enum([
      "HOUSE",
      "APARTMENT",
      "SUITE",
      "VILLA",
      "PENTHOUSE",
      "DUPLEX",
      "LOFT",
      "LAND",
      "COMMERCIAL",
      "OFFICE",
      "WAREHOUSE",
      "FARM",
    ])
    .optional(),

  status: z.enum(["AVAILABLE", "PENDING", "SOLD", "RENTED"]).optional(),

  bedrooms: z
    .number({ message: "Los dormitorios deben ser un número" })
    .int("Los dormitorios deben ser un número entero")
    .min(0, "Los dormitorios no pueden ser negativos")
    .max(50, "Los dormitorios son demasiados")
    .optional()
    .nullable(),

  bathrooms: z
    .number({ message: "Los baños deben ser un número" })
    .min(0, "Los baños no pueden ser negativos")
    .max(50, "Los baños son demasiados")
    .optional()
    .nullable(),

  area: z
    .number({ message: "El área debe ser un número" })
    .positive("El área debe ser mayor a 0")
    .max(1000000, "El área es demasiado grande")
    .optional()
    .nullable(),

  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres")
    .optional()
    .nullable(),

  city: z
    .string()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(100, "La ciudad no puede exceder 100 caracteres")
    .optional()
    .nullable(),

  state: z
    .string()
    .min(2, "El estado debe tener al menos 2 caracteres")
    .max(100, "El estado no puede exceder 100 caracteres")
    .optional()
    .nullable(),

  zipCode: z
    .string()
    .min(4, "El código postal debe tener al menos 4 caracteres")
    .max(10, "El código postal no puede exceder 10 caracteres")
    .regex(
      /^[A-Z0-9-\s]+$/i,
      "El código postal solo puede contener letras, números, guiones y espacios",
    )
    .or(z.literal("")) // Permite string vacío (verdaderamente opcional)
    .optional()
    .nullable(),

  latitude: z
    .number()
    .min(-90, "Latitud inválida")
    .max(90, "Latitud inválida")
    .optional()
    .nullable(),

  longitude: z
    .number()
    .min(-180, "Longitud inválida")
    .max(180, "Longitud inválida")
    .optional()
    .nullable(),
});

/**
 * Type inference
 */
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
