# Development Tasks & Git Worktrees Guide

> Complete reference for available development tasks and how to practice git worktrees in InmoApp

**Last Updated:** 2025-11-14
**Status:** Active Development
**Phase:** 1.5 - Public-facing features

---

## 📚 Table of Contents

1. [Git Worktrees Practice Guide](#git-worktrees-practice-guide)
2. [Available Development Tasks](#available-development-tasks)
3. [Task Reference Table](#task-reference-table)
4. [Recommendations by Scenario](#recommendations-by-scenario)
5. [Quick Templates](#quick-templates)

---

## 🔄 Git Worktrees Practice Guide

### Why Practice Git Worktrees?

- ✅ Work on 2+ features simultaneously without `git stash/pop`
- ✅ No context switching delays (just change directory)
- ✅ Clean git history with isolated commits
- ✅ Industry standard for parallel development

### Complete Step-by-Step Tutorial

#### **Step 1: Create New Branches**

```bash
# Make sure you're on main
git checkout main
git pull origin main

# Create two new branches for practice
git branch feature/your-first-task
git branch feature/your-second-task

# Verify they were created
git branch -a
```

#### **Step 2: Create Worktrees**

```bash
# From /Users/juanquizhpi/Desktop/projects/inmo-app

# Worktree 1 - First feature
git worktree add ../inmo-app-task1 feature/your-first-task

# Worktree 2 - Second feature
git worktree add ../inmo-app-task2 feature/your-second-task

# Verify worktrees exist
git worktree list
```

**Output should look like:**
```
/Users/juanquizhpi/Desktop/projects/inmo-app          abc1234 [main]
/Users/juanquizhpi/Desktop/projects/inmo-app-task1    abc1234 [feature/your-first-task]
/Users/juanquizhpi/Desktop/projects/inmo-app-task2    abc1234 [feature/your-second-task]
```

#### **Step 3: Open Two Terminals (One Per Worktree)**

**Terminal 1 - First Task:**
```bash
cd /Users/juanquizhpi/Desktop/projects/inmo-app-task1
code .  # Open in VSCode (or vim, nano, etc)
```

**Terminal 2 - Second Task (in parallel):**
```bash
cd /Users/juanquizhpi/Desktop/projects/inmo-app-task2
code .  # Open in VSCode
```

#### **Step 4: Make Changes & Commits**

**In Terminal 1:**
```bash
# Edit files, then commit
git status
git add .
git commit -m "feat(feature-name): your commit message

Detailed description of changes.

🤖 Generated with Claude Code

Co-Authored-By: Your Name <your.email@example.com>"
```

**In Terminal 2 (simultaneously):**
```bash
# Edit different files, commit separately
git status
git add .
git commit -m "feat(other-feature): another commit message

Detailed description.

🤖 Generated with Claude Code

Co-Authored-By: Your Name <your.email@example.com>"
```

#### **Step 5: Return to Main and Merge Both**

```bash
# Back in original directory /inmo-app
cd /Users/juanquizhpi/Desktop/projects/inmo-app

# Merge first feature
git merge feature/your-first-task

# Merge second feature
git merge feature/your-second-task

# Verify both are merged
git log --oneline -5
```

#### **Step 6: Type Check & Verify**

```bash
# Run TypeScript check
bun run type-check

# Run lint
bun run lint

# Check for any issues
git status
```

#### **Step 7: Cleanup Worktrees and Branches**

```bash
# Remove worktrees
git worktree remove ../inmo-app-task1
git worktree remove ../inmo-app-task2

# Remove branches (after verifying merge)
git branch -d feature/your-first-task
git branch -d feature/your-second-task

# Verify cleanup
git worktree list
git branch -a
```

#### **Step 8: Push to Remote**

```bash
git push origin main

# Or if you want to create PR instead:
# git push origin main && gh pr create --base main --head main
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `fatal: 'branch' is already checked out` | Branch can only be in ONE worktree at a time |
| Worktree won't delete | Make sure you're not inside it: `cd /inmo-app` first |
| Changes not syncing | Worktrees are independent until committed/merged |
| Port conflicts | Use different ports in `.env` for each worktree if running dev |

---

## 📋 Available Development Tasks

### 🔴 Small Tasks (1-2 hours each)

#### **1. Create Property Details Page** ⭐⭐⭐⭐⭐

**Files to Create:**
- `/apps/web/app/(public)/propiedades/[id]/page.tsx`
- `/apps/web/app/(public)/propiedades/[id]/layout.tsx` (optional)

**What to Build:**
- Server component to fetch property by ID
- Image gallery with lightbox
- Full property details (description, specs, price, location)
- Agent contact card
- "Schedule Appointment" button
- Similar properties section
- Breadcrumbs navigation

**Database:**
- Query: `propertyRepository.findById(id)`

**Key Components Needed:**
- Image gallery component
- Agent card component
- Similar properties grid

**Impact:** 🔥 CRITICAL - Without this, all map clicks lead nowhere

**Example Route:**
```
/propiedades/property-id-123
```

**Bonus Features:**
- Share buttons (already have share logic)
- View counter (increment PropertyView)
- Favorite button integration
- Property comparison

---

#### **2. Create Favorites Page** ⭐⭐⭐⭐

**Files to Create:**
- `/apps/web/app/dashboard/favoritos/page.tsx` or `/apps/web/app/(public)/perfil/favoritos/page.tsx`

**What to Build:**
- Fetch user's favorites from `Favorite` table
- Display as grid of property cards
- Remove favorite button per card
- Empty state message
- Optional: Filter/sort favorited properties

**Database:**
```typescript
db.favorite.findMany({
  where: { userId: user.id },
  include: { property: true },
})
```

**Key Components:**
- Reuse PropertyCard component
- Favorite button with loading state
- Empty state illustration

**Impact:** Medium-High - Improves user engagement

**Bonus Features:**
- Filter by price/location/type
- Sort options
- Export favorites list

---

#### **3. Connect Hero Search Bar** ⭐⭐⭐⭐⭐

**Files to Modify:**
- `/apps/web/components/home/hero-search-bar.tsx`

**What to Build:**
- Search functionality (text input)
- Server action: `searchPropertiesAction(query)`
- Display search results (modal or results page)
- Link to filtered map view

**Database Query:**
```typescript
propertyRepository.list({
  filters: {
    search: query,
    status: 'AVAILABLE'
  },
  take: 10
})
```

**Key Components:**
- Search input with debounce
- Results dropdown/modal
- Result item card
- Loading state

**Impact:** 🔥 CRITICAL - Main user entry point

**Bonus Features:**
- Autocomplete suggestions
- Recent searches
- Search analytics

---

#### **4. Add Image Lazy Loading** ⭐⭐⭐

**Files to Modify:**
- Any file using `<img>` tags (especially property cards)
- Common files:
  - Property card components
  - Property details page
  - Homepage sections

**What to Do:**
- Replace `<img>` with Next.js `<Image>` component
- Add `loading="lazy"`
- Add blur `placeholder`
- Add responsive `sizes`

**Example:**
```typescript
import Image from 'next/image';

<Image
  src={property.images[0]?.url || '/placeholder.jpg'}
  alt={property.title}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/png;base64,..."
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**Impact:** Medium - Performance improvement

**Time:** 1-2 hours

---

#### **5. Create Admin Global Statistics Page** ⭐⭐⭐⭐

**Files to Create:**
- `/apps/web/app/dashboard/admin/stats.tsx`

**What to Build:**
- Total properties in system (by status)
- Total users/agents
- Total revenue/views
- Charts/graphs
- Recent activity feed

**Database:**
```typescript
const totalProperties = await db.property.count();
const totalAgents = await db.user.count({ where: { role: 'AGENT' } });
const totalViews = await db.propertyView.count();
```

**Key Libraries:**
- `recharts` or `chart.js` for graphs

**Impact:** Low-Medium - Admin only feature

**Bonus:**
- Export as CSV/PDF
- Date range filters
- Real-time updates

---

### 🟡 Medium Tasks (3-4 hours each)

#### **6. Implement Map Clustering** ⭐⭐⭐⭐

**Library:** `supercluster` (npm package)

**What to Build:**
- Group property markers when zoomed out
- Show cluster count badge ("25 properties")
- Expand clusters when zooming in
- Cluster statistics (avg price, count)

**Files to Modify:**
- `/apps/web/components/map/ui/map-container.tsx`

**Implementation Steps:**
1. Install: `bun add supercluster`
2. Create clustering logic in map component
3. Render clusters as special markers
4. Handle zoom/pan interactions

**Impact:** High - Map unusable with 100+ properties

**Resources:**
- https://github.com/mapbox/supercluster
- Example: https://visgl.github.io/react-map-gl/examples/cluster

---

#### **7. Build Appointment Booking System** ⭐⭐⭐⭐

**Files to Create:**
- `/apps/web/app/(public)/propiedades/[id]/agendar/page.tsx`
- `/apps/web/app/dashboard/citas/page.tsx`

**What to Build:**

**Client Side (Property Details):**
- Form: Name, Email, Phone, Message, Preferred Date/Time
- Calendar picker for availability
- Submit button

**Agent Side (Dashboard):**
- List of appointments
- Status: pending/confirmed/completed/cancelled
- View appointment details
- Confirm/reschedule/cancel appointment

**Database:**
```typescript
// Create appointment
db.appointment.create({
  propertyId: id,
  clientName: formData.name,
  clientEmail: formData.email,
  status: 'PENDING',
  scheduledAt: formData.date,
})

// Agent views appointments for their properties
db.appointment.findMany({
  where: {
    property: { agentId: agent.id }
  }
})
```

**Features:**
- Email notifications (optional)
- Conflict prevention (no double-booking)
- Status management
- Reminder emails

**Impact:** High - Important feature for agents

---

#### **8. Dynamic Map Filtering** ⭐⭐⭐⭐

**What to Build:**
- Filter inputs: price range, bedrooms, transaction type
- "Search this area" button (Airbnb style)
- URL query parameters for shareable filters
- Server-side filtering
- Result count badge

**Files to Modify/Create:**
- `/apps/web/components/map/map-filters.tsx` (uncomment & implement)
- `/apps/web/components/map/ui/map-container.tsx`
- `/apps/web/app/(public)/mapa/page.tsx` (add filter params)

**URL Example:**
```
/mapa?transactionType=SALE&minPrice=100000&maxPrice=500000&bedrooms=3&area=ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05
```

**Implementation:**
1. Read URL search params
2. Validate with Zod
3. Pass to server component
4. Filter properties with Prisma
5. Update URL on map move/filter change

**Impact:** High - Core UX feature

---

### 🟢 Large Tasks (1-2 weeks each)

#### **9. Natural Language Property Search (AI)** ⭐⭐⭐⭐⭐

**Example User Input:**
```
"Casa moderna 3 hab cerca de Yanuncay, menos de 200k"
```

**What to Build:**
- Modal with natural language input
- Call to OpenAI GPT-4o-mini or Claude API
- Parse response to extract: price range, bedrooms, location, property type
- Apply extracted filters to properties
- Show results on map

**Implementation:**
1. Create server action: `searchByNaturalLanguageAction(query)`
2. Call AI API with Zod schema for structured output
3. Query properties with parsed filters
4. Return results

**AI Prompt Example:**
```
Parse this property search query and extract structured data.
Return JSON with: minPrice, maxPrice, bedrooms, category, location

User query: "Casa moderna 3 hab cerca de Yanuncay, menos de 200k"
```

**API Cost:** ~$0.001-0.01 per search

**Documentation:** See `docs/ai-search-implementation.md` (26KB)

**Impact:** 🌟 VERY HIGH - Major market differentiator

**Libraries:**
- `openai` or Claude SDK
- `zod` for schema validation

---

#### **10. Price Heatmap Visualization** ⭐⭐⭐⭐

**What to Build:**
- Heatmap layer on map showing price density
- Color scale: Green (cheap) → Yellow → Red (expensive)
- Toggle button to show/hide heatmap
- Leyend with color scale
- Hover to see average price in area

**Implementation:**
- Use MapBox native heatmap layer
- Aggregate prices by geographic region
- Update colors based on price ranges

**Files to Modify:**
- `/apps/web/components/map/ui/map-container.tsx`

**MapBox Docs:**
- https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#heatmap

**Impact:** High - Unique visual feature

**Time:** 4-6 hours

---

#### **11. Analytics & Tracking Dashboard** ⭐⭐⭐⭐

**What to Build:**
- Property view analytics
- Share analytics (which platform most used)
- Most viewed properties
- Trending properties
- Agent performance metrics
- Graphs and charts

**Database:**
```typescript
// Already exist:
- PropertyView table
- PropertyShare table
- Appointment table
```

**Metrics to Track:**
- Views per property (total & by date)
- Shares per platform
- Conversion: views → appointments
- Top performing agents
- Peak hours/days

**Files to Create:**
- `/apps/web/app/dashboard/analytics/page.tsx`

**Libraries:**
- `recharts` or `chart.js`
- `date-fns` for date formatting

**Impact:** Medium - For agents & admin

---

### 💎 Bonus/Advanced Features

#### **12. Virtual Staging (AI Image Generation)**
- Remove/add furniture from property photos
- Tech: Replicate API or AWS Rekognition
- Cost: $0.10-0.50 per image
- Time: 4-6 weeks

#### **13. Mobile App (React Native)**
- Replicate web features in mobile app
- Tech: React Native or Flutter
- Time: 4-6 weeks

#### **14. Multi-language Support (i18n)**
- Add Spanish, English, French support
- Library: `next-intl`
- Time: 1 week

#### **15. Advanced Property Matching**
- ML-based property recommendations
- Similar property suggestions
- User preference learning
- Time: 2-3 weeks

---

## 📊 Task Reference Table

| # | Task | Difficulty | Time | Impact | Worktrees | Priority |
|---|------|-----------|------|--------|-----------|----------|
| 1 | Property Details Page | ⭐ | 2h | ⭐⭐⭐⭐⭐ | ✅ | 🔴 MUST |
| 2 | Favorites Page | ⭐ | 2h | ⭐⭐⭐⭐ | ✅ | 🟡 HIGH |
| 3 | Hero Search Bar | ⭐ | 3h | ⭐⭐⭐⭐⭐ | ✅ | 🔴 MUST |
| 4 | Lazy Loading Images | ⭐ | 1h | ⭐⭐⭐ | ⚠️ | 🟡 MEDIUM |
| 5 | Admin Stats | ⭐⭐ | 3h | ⭐⭐⭐⭐ | ✅ | 🟢 LOW |
| 6 | Map Clustering | ⭐⭐ | 4h | ⭐⭐⭐⭐ | ✅ | 🟡 HIGH |
| 7 | Booking System | ⭐⭐⭐ | 5h | ⭐⭐⭐⭐ | ✅ | 🟡 HIGH |
| 8 | Dynamic Filtering | ⭐⭐ | 4h | ⭐⭐⭐⭐ | ✅ | 🟡 HIGH |
| 9 | AI Search | ⭐⭐⭐ | 1-2w | ⭐⭐⭐⭐⭐ | ✅ | 🟡 MEDIUM |
| 10 | Price Heatmap | ⭐⭐ | 4h | ⭐⭐⭐⭐ | ✅ | 🟢 LOW |
| 11 | Analytics Dashboard | ⭐⭐ | 1w | ⭐⭐⭐⭐ | ✅ | 🟢 LOW |

**Legend:**
- ✅ = Perfect for worktrees
- ⚠️ = Can do, but simpler without
- 🔴 MUST = Blocker for other features
- 🟡 HIGH = Important for MVP
- 🟢 LOW = Nice-to-have

---

## 🎯 Recommendations by Scenario

### **Scenario 1: First 3 Hours - Get Quick Wins**

**Best Combo:**
1. **Property Details Page** (2h) - Unblocks everything
2. **Lazy Loading** (1h) - Quick performance boost

**Commands:**
```bash
git branch feature/property-details
git worktree add ../inmo-app-details feature/property-details

# Work on task...
git add .
git commit -m "feat(pages): add property details page with gallery"
git checkout main
git merge feature/property-details
```

---

### **Scenario 2: Full Day - Solid Foundation**

**Recommended:**
1. **Property Details Page** (2h)
2. **Favorites Page** (2h)
3. **Dynamic Filtering** (3h)

**With Worktrees:**
```bash
# Create 3 branches for true parallel work
git branch feature/property-details
git branch feature/favorites-management
git branch feature/map-filtering

# Create 3 worktrees
git worktree add ../inmo-app-details feature/property-details
git worktree add ../inmo-app-favorites feature/favorites-management
git worktree add ../inmo-app-filters feature/map-filtering

# Work in 3 terminals simultaneously
# Merge all 3 to main at end
```

---

### **Scenario 3: Two Small Parallel Tasks**

**Perfect for Worktrees Practice:**
```bash
# Choose any 2 from small tasks list
git branch feature/first-task
git branch feature/second-task

git worktree add ../inmo-app-t1 feature/first-task
git worktree add ../inmo-app-t2 feature/second-task

# Terminal 1: Work on first task
# Terminal 2: Work on second task simultaneously

# Merge both when done
```

---

### **Scenario 4: Long-Term Commitment**

**Suggested Order:**
1. ✅ Property Details (MUST)
2. ✅ Hero Search (MUST)
3. ✅ Favorites (HIGH)
4. ✅ Dynamic Filtering (HIGH)
5. ✅ Booking System (HIGH)
6. ⭐ AI Search (DIFFERENTIATOR)

---

## 📋 Quick Templates

### **Quick Start: Single Task**

```bash
# Setup
TASK_NAME="feature-name"
git branch feature/$TASK_NAME
git worktree add ../inmo-app-work feature/$TASK_NAME

# Work
cd ../inmo-app-work
# ... edit files ...

# Commit
git add .
git commit -m "feat(scope): description

Detailed explanation.

🤖 Generated with Claude Code

Co-Authored-By: Your Name <your.email@example.com>"

# Merge
cd ../inmo-app
git merge feature/$TASK_NAME
git worktree remove ../inmo-app-work
git branch -d feature/$TASK_NAME
```

---

### **Template: Two Parallel Tasks (Best Practice)**

```bash
# Setup
TASK1="feature-name-1"
TASK2="feature-name-2"

git branch feature/$TASK1
git branch feature/$TASK2

git worktree add ../inmo-app-t1 feature/$TASK1
git worktree add ../inmo-app-t2 feature/$TASK2

# Terminal 1
cd ../inmo-app-t1
# Work & commit

# Terminal 2 (parallel)
cd ../inmo-app-t2
# Work & commit

# Finalize (main terminal)
cd ../inmo-app
git merge feature/$TASK1
git merge feature/$TASK2
git worktree remove ../inmo-app-t1
git worktree remove ../inmo-app-t2
git branch -d feature/$TASK1
git branch -d feature/$TASK2
```

---

### **Conventional Commit Template**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**
```bash
git commit -m "feat(map): implement marker click handlers"

git commit -m "fix(dashboard): resolve hardcoded statistics

Replace mock data with real database queries for:
- Property counts
- Appointment tracking
- View analytics"

git commit -m "refactor(components): extract search logic to hook

Improves reusability and testability."

git commit -m "docs: add development tasks and worktrees guide

Complete reference for available tasks and how to practice
git worktrees with parallel development."
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance
- `perf:` Performance improvement
- `style:` Code style

---

## 🚀 Getting Started

### **Choose Your Path:**

**Path A: Learn Worktrees (1 hour)**
1. Pick 2 small tasks
2. Follow "Complete Step-by-Step Tutorial" above
3. Practice the workflow

**Path B: Build Features (3+ hours)**
1. Pick tasks based on priority
2. Follow recommendations for your time frame
3. Use worktrees for parallel development

**Path C: Complete MVP (1 week)**
1. Do tasks in recommended order
2. Get Property Details, Search, Filtering working
3. Add Favorites & Booking

---

## 📚 Related Documentation

- **Git Worktrees:** `docs/git-worktrees-guide.md`
- **AI Search:** `docs/ai-search-implementation.md`
- **Map Roadmap:** `docs/map-features-roadmap.md`
- **Database Schema:** `packages/database/prisma/schema.prisma`
- **Quick Start:** `QUICK_START.md`
- **Claude Context:** `CLAUDE.md`

---

## 💡 Pro Tips

1. **Use the scripts:**
   ```bash
   ./scripts/setup-worktrees.sh feature-name bugfix-name
   ./scripts/cleanup-worktrees.sh feature-name bugfix-name
   ```

2. **Always type-check before merge:**
   ```bash
   bun run type-check
   ```

3. **Create detailed commits:**
   - Describe WHAT you changed
   - Explain WHY you changed it
   - List any new dependencies

4. **Test locally before pushing:**
   ```bash
   bun run dev  # Start dev server
   bun run type-check  # TypeScript check
   bun run lint  # Code style
   ```

5. **Use descriptive branch names:**
   - ✅ `feature/property-details-page`
   - ❌ `feature/new-feature`
   - ✅ `fix/dashboard-stats-hardcoded`
   - ❌ `fix/bug`

---

**Happy coding! 🚀**

For questions or clarifications, check:
- `CLAUDE.md` - Project context
- `docs/git-worktrees-guide.md` - Detailed worktrees guide
- `.claude/` directory - Claude Code configuration

