# Property Cards Architecture

## Current State (Phase 1.5)

**Decision: Keep separate components (no shared abstraction)**

The InmoApp uses three specialized property card components, each optimized for its specific context:

### Components

#### 1. **PropertyCard** (Vertical)
- **Location:** `apps/web/components/properties/property-card.tsx`
- **LOC:** ~360
- **Layout:** Vertical (4:5 aspect ratio)
- **Features:**
  - Multi-image gallery (swipe, keyboard arrows, touch navigation)
  - Double-tap to favorite with heart animation
  - Share button (Web Share API + clipboard fallback)
  - Transaction and category badges
  - Full property metadata (beds, baths, area)
  - Location display (city, state)
- **Use Cases:** Homepage carousels, property grids, dashboard listings
- **Props:**
  ```typescript
  property: PropertyWithRelations | SerializedProperty
  onFavoriteToggle?: (propertyId: string) => void
  isFavorite?: boolean
  priority?: boolean  // LCP optimization
  ```

#### 2. **PropertyCardHorizontal** (Horizontal)
- **Location:** `apps/web/components/map/property-card-horizontal.tsx`
- **LOC:** ~241
- **Layout:** Horizontal (landscape, ~333x270px)
- **Features:**
  - Single image display (no gallery)
  - Favorite button with pulse animation
  - Transaction and category badges
  - Large price display
  - "View Details" CTA button (Link to detail page)
  - Uses `useFavorites` hook for auth handling
- **Use Cases:** Map popups, property previews
- **Props:**
  ```typescript
  property: PropertyWithRelations | SerializedProperty | MapProperty
  onFavoriteClick?: (propertyId: string) => void
  ```

#### 3. **PropertyCardCompact** (Minimal)
- **Location:** `apps/web/components/map/property-card-compact.tsx`
- **LOC:** ~112
- **Layout:** Horizontal (minimal, 280px wide)
- **Features:**
  - No images (text-only)
  - Transaction badge
  - Price display
  - Property metadata (beds, baths, area with actual values)
  - Location display (city, state)
  - Hover effects for marker synchronization
- **Use Cases:** Map list drawer, carousel alternative
- **Props:**
  ```typescript
  property: MapProperty
  onHover?: () => void     // For marker highlighting
  onLeave?: () => void
  onClick?: () => void
  ```

---

## Rationale for Current Architecture

### ✅ Strengths

1. **Proper Utility Extraction**
   - `formatPropertyPrice()` eliminates price formatting duplication
   - `getTransactionBadgeStyle()` centralizes badge styling
   - `TRANSACTION_TYPE_LABELS` provides i18n consistency
   - Team demonstrated good refactoring discipline

2. **Shared Primitives**
   - `PropertyImageFallback` component reused across cards
   - `Badge` from `@repo/ui` ensures design consistency
   - `useFavorites` hook abstracts favorite logic (Zustand store)

3. **Clear Separation of Concerns**
   - Each card optimized for its context (homepage ≠ map popup)
   - Asymmetric features are intentional (vertical has gallery, horizontal doesn't)
   - Easy to debug (logic in one file per card)
   - Optimal tree-shaking (import only needed cards)

4. **No Over-Abstraction**
   - Simple components are easy to understand and modify
   - No prop drilling or complex Context overhead
   - Performance optimized (minimal re-renders)

### ⚠️ Limitations

1. **Duplication**
   - Only ~80 lines duplicated (favorite button logic, badge rendering)
   - Asymmetric features make full abstraction premature
   - Only duplicated where benefits > complexity

2. **Maintenance Notes**
   - Bug fixes to gallery logic → only `PropertyCard` affected
   - Favorite logic changes → both cards affected (uses shared `useFavorites`)
   - Badge/price changes → all cards affected (centralized utilities)

3. **When to Refactor**
   - Current ROI: 7-16 years (refactor cost vs maintenance savings)
   - Not justified until triggers below are met

---

## Refactoring Decision Matrix

### When to Refactor: Trigger Conditions

**DO NOT refactor** unless **one or more** of these conditions are met:

#### 🔴 Strong Trigger: New Card Variant with Interactive Features
**Condition:** A third card variant emerges that shares features with existing cards (gallery, share, animations)

**Example:** "Featured Property Card" for homepage needs gallery + share + animations

**Action:** Implement **Option D: Atomic Design Pattern**

**Rationale:** Prevents duplicating 80+ lines of gallery/interaction logic

---

#### 🔴 Strong Trigger: Horizontal Card Needs Gallery
**Condition:** Product decision to add image gallery to map popups

**Example:** "Map popup should show property gallery like desktop view"

**Action:** Implement **Option C: Headless Hook Pattern**

**Rationale:** Extract gallery logic to reusable hook, then use in both cards

---

#### 🟡 Medium Trigger: Mobile App Development
**Condition:** Team starts building mobile app (React Native or Flutter)

**Example:** "Mobile app needs same cards as web"

**Action:** Create `@repo/property-cards` package with **Option D**

**Rationale:** Reusable logic/components across platforms

---

#### 🟡 Medium Trigger: Storybook Adoption
**Condition:** Team adopts Storybook for component documentation

**Example:** "We need visual component library for QA and design handoff"

**Action:** Implement **Option D: Atomic Design Pattern**

**Rationale:** Storybook works best with atomic primitives (atoms → molecules → organisms)

---

#### 🟡 Medium Trigger: Duplication Exceeds Threshold
**Condition:** Duplicated code grows beyond 150 lines (currently: 80 lines)

**Example:** "Gallery, share, and favorite logic all duplicated + animations duplicated"

**Action:** Implement **Option C or D** depending on scope

**Rationale:** Beyond acceptable duplication threshold

---

#### 🟢 Weak Trigger: Team Grows Significantly
**Condition:** Team grows to 5+ developers

**Example:** "With more developers, isolated files are harder to coordinate"

**Action:** Optional - implement **Option D** for better organization

**Rationale:** More developers benefit from clear primitives and conventions

---

### Current Metrics (Do Not Trigger Yet)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| **Duplicated Lines** | 80 | 150+ | ✅ OK |
| **Active Card Variants** | 3 | 5+ | ✅ OK |
| **Shared Utilities** | 6+ | Improving | ✅ Good |
| **Maintenance Issues** | 0 reported | >3 | ✅ No Issues |
| **Bundle Size Impact** | Neutral | >20% | ✅ OK |
| **Team Size** | 3-4 | 5+ | ✅ OK |

---

## Recommended Refactoring Approach (If Triggered)

### Option D: Atomic Design Pattern

**Why this option:**
- ✅ Zero breaking changes (organisms maintain same API)
- ✅ Incremental migration (1-2 atoms per PR)
- ✅ Highest code reuse (90% vs 65-70% others)
- ✅ Future-proof (atoms reusable beyond cards)
- ✅ Best tree-shaking (~10% bundle savings)

**Structure:**

```
apps/web/components/properties/
├─ atoms/
│  ├─ PropertyImage.tsx              (image + gradient)
│  ├─ FavoriteButton.tsx             (glass/solid variants)
│  ├─ ShareButton.tsx                (Web Share API)
│  ├─ PriceDisplay.tsx               (formatted price)
│  ├─ PropertyMetadata.tsx           (bed/bath/area)
│  └─ PropertyTitle.tsx              (title + location)
├─ molecules/
│  ├─ PropertyImageGallery.tsx       (gallery + controls)
│  ├─ PropertyBadges.tsx             (transaction + category)
│  └─ PropertyHeader.tsx             (badges + actions)
├─ organisms/
│  ├─ PropertyCardVertical.tsx       (refactored, 145 LOC from 360)
│  ├─ PropertyCardHorizontal.tsx     (refactored, 80 LOC from 241)
│  └─ PropertyCardCompact.tsx        (refactored, 60 LOC from 112)
├─ hooks/
│  ├─ useImageGalleryControls.ts     (gallery logic)
│  └─ usePropertyShare.ts            (share logic)
└─ types.ts
```

**Effort:** ~24 hours over 3-5 weeks (incremental)

**Process:**
1. **Week 1:** Extract atoms (FavoriteButton, ShareButton, PropertyImage, etc.)
2. **Week 2:** Extract molecules (ImageGallery, PropertyBadges, etc.)
3. **Week 3:** Refactor PropertyCardVertical to use atoms/molecules
4. **Week 4:** Refactor PropertyCardHorizontal + PropertyCardCompact
5. **Week 5:** Testing, QA, monitoring

**Migration Path:**
- No breaking changes (old components renamed to .old, new ones take their place)
- Can stop at any week (incremental = low-risk)
- Rollback: Feature flag to toggle between old/new

---

## Alternative Approaches Not Recommended

### ❌ Option A: Composition Pattern (Compound Components)
- **Pros:** Maximum flexibility
- **Cons:** Complex Context overhead, high learning curve, all-or-nothing migration
- **ROI:** Not worth it for 3 cards

### ❌ Option B: Variant Props Pattern
- **Pros:** Single component to maintain
- **Cons:** 500+ LOC "God component", all variants shipped even if unused
- **ROI:** Creates tech debt

### ❌ Option C: Headless Hook Pattern (Alone)
- **Pros:** Clear logic/presentation separation
- **Cons:** Still duplicates JSX (markup in each card), limited reusability
- **ROI:** Good intermediate step toward D

---

## Recent Changes & Fixes (Nov 11, 2025)

### Fixed PropertyCardCompact Bugs
- ✅ Hardcoded values → Now uses actual property data
  - `<span>3</span>` → `<span>{property.bedrooms}</span>`
  - `<span>2</span>` → `<span>{Number(property.bathrooms)}</span>`
  - `<span>180 m²</span>` → `<span>{Number(property.area)}m²</span>`
- ✅ Location display → City/State instead of coordinates
  - Old: Shows `latitude, longitude`
  - New: Shows `city, state`
- ✅ Badge component → Now uses shared `Badge` from `@repo/ui`
  - Old: Inline `<span>` with hardcoded styles
  - New: Uses `getTransactionBadgeStyle()` utility

### Removed Deprecated Props
- ✅ Removed `onViewDetails` prop from `PropertyCardHorizontal`
  - Already navigates via `Link` component
  - Updated call site in `property-popup.tsx`

---

## Best Practices

### For New Feature Development

1. **New Card Variant?**
   - First, try to use existing components
   - If needs are similar, check if refactoring is triggered
   - If not triggered, create new component (acceptable duplication)

2. **Modifying Favorites Logic?**
   - Changes go in `@/hooks/use-favorites.ts` (Zustand store)
   - All cards automatically reflect changes
   - Test across all card types

3. **Updating Badge/Price Formatting?**
   - Changes go in `@/lib/utils/property-formatters.ts`
   - All cards automatically use new formatting
   - Centralized = single source of truth

4. **Adding New Interactive Feature?**
   - Document in card header comment
   - Consider if other cards need same feature
   - If yes, extract to shared hook

---

## Monitoring & Metrics

### Bundle Size
- **Current:** PropertyCard (~4.2KB) + PropertyCardHorizontal (~2.8KB) + PropertyCardCompact (~1.2KB)
- **Tracked in:** CI/CD pipeline (webpack-bundle-analyzer)
- **Alert threshold:** >20% increase from baseline

### Performance
- **Tracked in:** Lighthouse CI
- **Critical metric:** LCP (Largest Contentful Paint)
- **PropertyCard optimization:** `priority={index < 3}` for above-fold images

### Maintenance Cost
- **Tracked in:** Sprint retrospectives
- **Metric:** Hours spent fixing bugs in multiple cards
- **If trending up:** Consider refactoring trigger

---

## FAQ

**Q: Why not refactor now?**
A: ROI is negative (~7-16 year break-even). Refactoring cost (16-32 hrs) >> maintenance savings (2 hrs/yr). Better to invest in higher-impact work.

**Q: Can PropertyCard and PropertyCardHorizontal share logic?**
A: Not yet. They have asymmetric features (one has gallery, one doesn't). When a third card variant with gallery emerges, then refactor using Option D.

**Q: What if the gallery code has a bug?**
A: Only PropertyCard has gallery, so fix is isolated. If bug is in shared logic (favorites, formatting), fix in hook/utility → all cards benefit.

**Q: Should we use PropertyCardCompact or PropertyCardHorizontal for map?**
A: Both are used:
- `PropertyCardHorizontal` → Map popup (full interactive card)
- `PropertyCardCompact` → Map drawer list (minimal text-only)

**Q: Will tree-shaking work correctly?**
A: Yes. Each component is separate file. Build tool imports only what's needed per page.

---

## References

- **Analysis Report:** See archived analysis for detailed Option A-E comparison
- **Future Pattern:** Atomic Design pattern documentation (if refactoring is triggered)
- **Related Issues:** AI search optimization, React.cache() implementation
- **Authored:** Nov 11, 2025 (InmoApp Phase 1.5)
