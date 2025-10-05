# Next Steps & Roadmap

## ⏭️ Recommended Priorities

### Option A: Public Property Listings ⭐ (High Priority)

**Goal**: Allow visitors to browse and search properties without authentication

**Features**:
- Public homepage with featured/recent properties
- Property listing page with search and filters
- Property detail page with image carousel
- Map integration (Mapbox) showing property locations
- SEO optimization for property pages (metadata, structured data)
- Responsive design for mobile

**Technical Requirements**:
- Server Components for SEO (public pages)
- Search filters: transactionType, category, price range, bedrooms, city
- Pagination or infinite scroll for listings
- Image optimization with Next.js Image component
- Mapbox GL JS for interactive maps
- OpenGraph images for social sharing

**Files to create**:
```
apps/web/
├── app/(public)/
│   ├── page.tsx                          # Homepage with featured properties
│   ├── propiedades/
│   │   ├── page.tsx                      # Property listings + search
│   │   └── [id]/page.tsx                 # Property detail page
│   └── layout.tsx                        # Public layout (header, footer)
├── components/
│   ├── properties/
│   │   ├── property-filters.tsx          # Search filters UI
│   │   ├── property-grid.tsx             # Grid layout for listings
│   │   ├── property-map.tsx              # Mapbox map component
│   │   └── property-detail.tsx           # Detailed property view
│   └── layout/
│       ├── header.tsx                    # Public header
│       └── footer.tsx                    # Public footer
├── app/actions/
│   └── search.ts                         # Search Server Actions
└── lib/
    └── mapbox/
        └── client.ts                     # Mapbox utilities
```

**Estimated time**: 2-3 days

---

### Option B: Favorites System (Medium Priority)

**Goal**: Allow authenticated clients to save properties for later

**Features**:
- Toggle favorite button on property cards (heart icon)
- Favorites page in CLIENT dashboard
- Optimistic UI updates (instant feedback)
- Email notifications for saved properties (optional)
- Unfavorite from favorites page

**Technical Requirements**:
- Server Actions for add/remove favorite
- Optimistic updates with `useOptimistic` hook
- Repository methods with permission checks
- Client dashboard route (`/dashboard/favoritos`)

**Files to create**:
```
apps/web/
├── app/dashboard/
│   └── favoritos/
│       └── page.tsx                      # Favorites list
├── components/
│   └── properties/
│       └── favorite-button.tsx           # Toggle favorite button
├── app/actions/
│   └── favorites.ts                      # Server Actions (add, remove)
└── packages/database/src/repositories/
    └── favorites.ts                      # Favorite repository
```

**Database setup**:
- ✅ `Favorite` model already exists in schema
- ✅ RLS policies already configured
- Just need repository + Server Actions

**Estimated time**: 1 day

---

### Option C: Appointments System (Medium Priority)

**Goal**: Allow clients to schedule property viewings with agents

**Features**:
- **CLIENT side**:
  - Schedule appointment from property detail page
  - View own appointments (upcoming, past)
  - Cancel appointments
- **AGENT side**:
  - View all appointments for own properties
  - Confirm/reject appointment requests
  - Update appointment status (CONFIRMED → COMPLETED)
  - Add notes to appointments
- **Notifications** (future):
  - Email to client when appointment is confirmed
  - Email to agent when new appointment requested
  - Calendar invites (.ics files)

**Technical Requirements**:
- Date/time picker component
- Calendar view (optional, or simple list)
- Real-time updates (Supabase Realtime)
- Email integration (Resend or similar)

**Files to create**:
```
apps/web/
├── app/dashboard/
│   └── citas/
│       ├── page.tsx                      # Appointments list
│       └── nueva/page.tsx                # Create appointment (CLIENT)
├── components/
│   └── appointments/
│       ├── appointment-form.tsx          # Schedule appointment form
│       ├── appointment-card.tsx          # Appointment card
│       └── appointment-calendar.tsx      # Calendar view (optional)
├── app/actions/
│   └── appointments.ts                   # Server Actions
└── packages/database/src/repositories/
    └── appointments.ts                   # Appointment repository
```

**Database setup**:
- ✅ `Appointment` model already exists in schema
- ✅ RLS policies already configured
- Just need repository + Server Actions + UI

**Estimated time**: 2-3 days

---

### Option D: Advanced Search & Filters (Low Priority)

**Goal**: Powerful search capabilities for finding properties

**Features**:
- Full-text search (search in title + description)
- Geospatial search (properties within X km of location)
- Advanced filters:
  - Price range (slider)
  - Bedrooms/bathrooms (min/max)
  - Area (m²)
  - Amenities (pool, parking, etc.) - requires schema update
  - Year built - requires schema update
- Save searches (for logged-in users)
- Search history
- Sort options (price, date, area)

**Technical Requirements**:
- Supabase Full Text Search or Algolia
- PostGIS extension for geospatial queries
- URL query parameters for shareable links
- Debounced search inputs

**Files to create**:
```
apps/web/
├── app/api/
│   └── search/
│       └── route.ts                      # Search API endpoint
├── components/
│   └── search/
│       ├── advanced-filters.tsx          # Advanced filter UI
│       ├── saved-searches.tsx            # Saved searches list
│       └── search-bar.tsx                # Main search input
├── lib/
│   └── search/
│       ├── fts.ts                        # Full-text search utilities
│       └── geo.ts                        # Geospatial queries
└── packages/database/src/repositories/
    └── search.ts                         # Search repository
```

**Database setup**:
- May need to add `amenities` JSONB field to Property
- May need to add `yearBuilt` Int field to Property
- Create full-text search indexes
- Enable PostGIS extension

**Estimated time**: 3-4 days

---

## 🎯 Recommended Order

For maximum user value:

1. **Public Property Listings** (Option A) - 2-3 days
   - *Why first*: Core feature, most visible to users, drives traffic

2. **Favorites System** (Option B) - 1 day
   - *Why second*: Quick win, improves user engagement, complements listings

3. **Appointments System** (Option C) - 2-3 days
   - *Why third*: Key conversion feature, completes property viewing flow

4. **Advanced Search** (Option D) - 3-4 days
   - *Why last*: Nice-to-have, can start with basic search and iterate

**Total estimated time**: 8-11 days of focused development

---

## 🔮 Future Features (Post-MVP)

### Analytics Dashboard (AGENT)
- Properties views count
- Favorite count per property
- Appointment conversion rate
- Top performing properties

### Messaging System
- Direct messaging between clients and agents
- In-app notifications
- Email fallback for offline users

### User Profiles
- Public agent profiles
- Client profiles with preferences
- Avatar uploads
- Bio/description

### Reviews & Ratings
- Clients can review properties after viewing
- Clients can rate agents
- Display average ratings

### Admin Panel
- Manage all users
- Manage all properties
- Platform analytics
- Moderation tools

### AI Features (Future Vision)
- Chatbot for property recommendations
- Automated lead scoring
- Property description generator
- Image recognition for amenities
- Price prediction based on market data

---

## 📊 Success Metrics

Track these metrics to measure feature success:

**Public Listings**:
- Page views per property
- Average time on property detail page
- Search usage (filters used, searches performed)

**Favorites**:
- % of users who favorite at least one property
- Average favorites per user
- Conversion from favorite to appointment

**Appointments**:
- Appointment requests per property
- Confirmation rate (agent confirms vs rejects)
- Completion rate (confirmed → completed)
- Average time to confirmation

**Overall**:
- User signups (CLIENT vs AGENT)
- Properties created per agent
- Active users (daily/weekly/monthly)
