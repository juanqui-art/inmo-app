# Database Schema & Models

## Prisma Schema Overview

**Location**: `packages/database/prisma/schema.prisma`

**Models**: 5 total
- User
- Property
- PropertyImage
- Favorite
- Appointment

**Enums**: 5 total
- UserRole
- TransactionType
- PropertyCategory
- PropertyStatus
- AppointmentStatus

---

## Data Models (Detailed)

### Property

**Fields:**
- **Básicos**: id (uuid), title, description (Text), price (Decimal 12,2)
- **Clasificación**: transactionType (SALE/RENT), category (enum), status (AVAILABLE/PENDING/SOLD/RENTED)
- **Características**: bedrooms (Int), bathrooms (Decimal 3,1), area (Decimal 10,2 m²)
- **Ubicación**: address, city, state, zipCode, latitude (Decimal 10,8), longitude (Decimal 11,8)
- **Metadata**: agentId, createdAt, updatedAt

**Relations**:
- belongsTo User (agent, onDelete: Cascade)
- hasMany PropertyImage
- hasMany Favorite
- hasMany Appointment

**Indexes**:
- (transactionType, status) - Compound index for filtering
- (category) - Single index for category filter
- (city, state) - Compound index for location search
- (price) - Single index for price range queries
- (agentId) - Foreign key index

---

### User

**Fields**:
- id (uuid)
- email (unique)
- name
- role (CLIENT/AGENT/ADMIN)
- phone
- avatar
- createdAt
- updatedAt

**Relations**:
- hasMany Property (AgentProperties)
- hasMany Favorite
- hasMany Appointment (ClientAppointments + AgentAppointments)

---

### PropertyImage

**Fields**:
- id (uuid)
- url
- alt
- order (default: 0)
- propertyId
- createdAt

**Relations**:
- belongsTo Property (onDelete: Cascade)

**Index**: (propertyId)

---

### Favorite

**Fields**:
- id (uuid)
- userId
- propertyId
- createdAt

**Relations**:
- belongsTo User (onDelete: Cascade)
- belongsTo Property (onDelete: Cascade)

**Constraints**:
- Unique (userId, propertyId)
- Indexes on both foreign keys

---

### Appointment

**Fields**:
- id (uuid)
- userId
- propertyId
- agentId
- scheduledAt
- status (PENDING/CONFIRMED/CANCELLED/COMPLETED)
- notes (Text)
- createdAt
- updatedAt

**Relations**:
- belongsTo User (client, onDelete: Cascade)
- belongsTo Property (onDelete: Cascade)
- belongsTo User (agent, onDelete: Cascade)

**Indexes**:
- (userId)
- (propertyId)
- (agentId)
- (scheduledAt)

---

## Enums

### UserRole
```prisma
enum UserRole {
  CLIENT
  AGENT
  ADMIN
}
```

**Usage**:
- CLIENT: Default role, browse + favorites + appointments
- AGENT: Create/manage properties + appointments
- ADMIN: Full platform access (future)

---

### TransactionType
```prisma
enum TransactionType {
  SALE
  RENT
}
```

**Usage**: Indicates if property is for sale or rent

---

### PropertyCategory (12 tipos)
```prisma
enum PropertyCategory {
  HOUSE         // Casa
  APARTMENT     // Departamento
  SUITE         // Suite
  VILLA         // Villa
  PENTHOUSE     // Penthouse
  DUPLEX        // Dúplex
  LOFT          // Loft
  LAND          // Terreno
  COMMERCIAL    // Local Comercial
  OFFICE        // Oficina
  WAREHOUSE     // Bodega
  FARM          // Finca/Hacienda
}
```

**Classification**:
- **Residencial**: HOUSE, APARTMENT, SUITE, VILLA, PENTHOUSE, DUPLEX, LOFT
- **Terreno/Rural**: LAND, FARM
- **Comercial**: COMMERCIAL, OFFICE, WAREHOUSE

---

### PropertyStatus
```prisma
enum PropertyStatus {
  AVAILABLE
  PENDING
  SOLD
  RENTED
}
```

**Workflow**:
- AVAILABLE → PENDING (offer made)
- PENDING → SOLD (sale finalized)
- PENDING → RENTED (rent contract signed)
- PENDING → AVAILABLE (deal fell through)

---

### AppointmentStatus
```prisma
enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

**Workflow**:
- CLIENT creates → PENDING
- AGENT confirms → CONFIRMED
- Either cancels → CANCELLED
- After meeting → COMPLETED

---

## API Patterns

### Server Actions (Preferred)

```ts
// apps/web/app/actions/properties.ts
'use server'

import { propertyRepository } from '@repo/database'
import { propertySchema } from '@/lib/validations/property'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createPropertyAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== 'AGENT') {
    throw new Error('Unauthorized')
  }

  const rawData = {
    title: formData.get('title'),
    price: formData.get('price'),
    transactionType: formData.get('transactionType'),
    category: formData.get('category'),
    // ... more fields
  }

  const validated = propertySchema.parse(rawData) // Zod validation
  const property = await propertyRepository.create({
    ...validated,
    agentId: user.id
  })

  revalidatePath('/dashboard/propiedades')
  return { success: true, data: property }
}
```

### Repository Pattern (Database)

```ts
// packages/database/src/repositories/properties.ts
import { db } from '../client'
import type { Property, PropertyStatus, TransactionType, PropertyCategory } from '@prisma/client'

interface PropertyFilters {
  transactionType?: TransactionType
  category?: PropertyCategory
  status?: PropertyStatus
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  city?: string
  agentId?: string
}

export const propertyRepository = {
  async findMany(filters: PropertyFilters) {
    return db.property.findMany({
      where: {
        transactionType: filters.transactionType,
        category: filters.category,
        status: filters.status || 'AVAILABLE',
        price: {
          gte: filters.minPrice,
          lte: filters.maxPrice
        },
        bedrooms: { gte: filters.minBedrooms },
        city: filters.city,
        agentId: filters.agentId
      },
      include: {
        images: { orderBy: { order: 'asc' } },
        agent: { select: { name: true, email: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  async create(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) {
    return db.property.create({ data })
  }
}
```

---

## Search & Filters

- **Search implementation**: Full-text search via Prisma or Supabase Full Text Search
- **Geospatial queries**: PostGIS extension for location-based search (properties near lat/lng)
- **Filter parameters**: transactionType, category, status, price range, bedrooms, bathrooms, area, location bounds
- **Mapbox integration**: Display properties on interactive map, cluster markers

---

## Real-time Features

- **Supabase Realtime** for live updates:
  - New property alerts (subscribe to properties table)
  - Chat messages between clients and agents (future)
  - Appointment status changes
- **Optimistic updates** in UI for better UX

---

## Database Operations

### Common Commands

```bash
# Generate Prisma Client (after schema changes)
cd packages/database && bunx prisma generate
# Or from root: bun install (triggers postinstall hook)

# Create new migration
cd packages/database && bunx prisma migrate dev --name <migration_name>

# Reset database (development only)
cd packages/database && bunx prisma migrate reset

# Seed database
cd packages/database && bunx prisma db seed

# Push schema changes without migration (development)
cd packages/database && bunx prisma db push

# Open Prisma Studio (visual DB browser)
cd packages/database && bunx prisma studio

# IMPORTANT: After schema changes
# 1. Generate client: bunx prisma generate
# 2. Restart dev server: bun run dev
# 3. Generated client location: node_modules/.prisma/client (root, not packages/)
```

### Supabase Operations

```bash
# Start Supabase locally (Docker required)
bunx supabase start

# Stop Supabase
bunx supabase stop

# Generate TypeScript types from database
bunx supabase gen types typescript --local > packages/database/types/supabase.ts

# Create new migration
bunx supabase migration new <migration_name>
```

---

## Environment Variables

Required in `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
DATABASE_URL=                 # Pooler connection (transaction mode)
DIRECT_URL=                   # Direct connection (for migrations)
```

**Important**:
- `DATABASE_URL`: Use pooler connection with `?pgbouncer=true` flag
- `DIRECT_URL`: Use direct connection for migrations (no pooler)
