# PropertyCardHorizontal - Map Popup Card

> Horizontal property card component for map interactions and quick property previews

**Status:** ✅ Implemented | **Last Updated:** Octubre 24, 2025

---

## 📍 Overview

`PropertyCardHorizontal` is a premium property card component designed for displaying comprehensive property information in a horizontal layout. Perfect for:

- Map popup cards on marker click
- Modal overlays with full property details
- Drawer-based property previews
- Quick property information displays

## 🎨 Design Features

### Layout
- **Horizontal layout** with full-width coverage
- **Image background** with dark gradient overlay
- **Two-column content** (left: info, right: price+CTA)
- **Height:** 280px (optimized for viewport)
- **Responsive:** Adapts to mobile and tablet

### Visual Elements

```
┌────────────────────────────────────────────────────┐
│ [Background Image]              [Badges] [Actions] │
│                                                     │
│  [Location Info]                                   │
│  [Beds] [Baths] [Area]                            │
│                              [Price] [View Details]│
└────────────────────────────────────────────────────┘
```

### Glassmorphism Effects
- Backdrop blur on action buttons
- Semi-transparent overlays (white/20)
- Border effects (white/30)
- Smooth transitions on hover

### Color Scheme
- **SALE:** Blue (`blue-500` → `blue-600`)
- **RENT:** Emerald (`emerald-500` → `emerald-600`)
- **Text:** White on dark overlay
- **Shadows:** Dark drop shadows for text legibility

---

## 💻 Usage

### Basic Implementation

```tsx
import { PropertyCardHorizontal } from "@/components/map/property-card-horizontal";

export function MapClickHandler({ property }) {
  return (
    <PropertyCardHorizontal
      property={property}
      onViewDetails={() => {
        // Navigate to detail page
        router.push(`/properties/${property.id}`);
      }}
      isFavorite={isFavorite}
      onFavoriteToggle={(id) => {
        // Handle favorite toggle
        toggleFavorite(id);
      }}
      viewCount={property.viewCount}
    />
  );
}
```

### Integration with PropertyPopup

```tsx
import { PropertyCardHorizontal } from "@/components/map/property-card-horizontal";
import { Popup } from "react-map-gl/mapbox";

export function EnhancedPropertyPopup({
  property,
  onClose,
  onViewDetails,
}) {
  if (!property.latitude || !property.longitude) return null;

  return (
    <Popup
      longitude={property.longitude}
      latitude={property.latitude}
      closeButton={false}
      offset={[0, -50]}
      className="property-card-popup"
    >
      <div className="w-[900px]">
        <PropertyCardHorizontal
          property={property}
          onViewDetails={onViewDetails}
          onFavoriteToggle={(id) => {
            // Handle favorite
          }}
          isFavorite={false}
          viewCount={property.viewCount}
        />
      </div>
    </Popup>
  );
}
```

### With Modal/Drawer

```tsx
import { PropertyCardHorizontal } from "@/components/map/property-card-horizontal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function PropertyModal({ property, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 border-0">
        <PropertyCardHorizontal
          property={property}
          onViewDetails={() => {
            onOpenChange(false);
            // Navigate
          }}
          onFavoriteToggle={(id) => {
            // Handle favorite
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📋 API Reference

### Props

```typescript
interface PropertyCardHorizontalProps {
  /** Property data to display (required) */
  property: PropertyWithRelations | SerializedProperty;

  /** Callback when "View Details" button is clicked (optional) */
  onViewDetails?: () => void;

  /** Callback when favorite button is clicked (optional) */
  onFavoriteToggle?: (propertyId: string) => void;

  /** Whether property is favorited (optional, default: false) */
  isFavorite?: boolean;

  /** Number of views (optional, default: 0) */
  viewCount?: number;
}
```

### Property Types

Accepts either:
- `PropertyWithRelations` - Full ORM model from database
- `SerializedProperty` - Serialized version for client use

Example data structure:
```typescript
{
  id: "uuid",
  title: "Beautiful Family Home",
  price: 250000,
  transactionType: "SALE", // or "RENT"
  category: "HOUSE", // or APARTMENT, VILLA, etc.
  bedrooms: 3,
  bathrooms: 2,
  area: 180,
  city: "Cuenca",
  state: "Azuay",
  images: [{ url: "...", alt: "..." }],
  viewCount: 1234
}
```

---

## 🎯 Features in Detail

### 1. **Status Badges**

Left-aligned badges showing:
- **Transaction Type:** En Venta / En Alquiler (color-coded)
- **Category:** Casa, Departamento, Villa, etc.

```tsx
// Customization example
const transactionTypeLabels = {
  SALE: "En Venta",
  RENT: "En Alquiler",
};

const categoryLabels = {
  HOUSE: "Casa",
  APARTMENT: "Departamento",
  // ... more categories
};
```

### 2. **Social Actions**

Right-aligned interactive buttons:
- **Like/Heart:** Toggle favorite with red fill
- **Share:** Share property on social
- **Bookmark:** Save to collection

```tsx
// All buttons have:
- Glassmorphism styling (bg-white/20, backdrop-blur)
- Hover animations (scale-110)
- Click feedback (scale-95)
- Accessibility (aria-labels)
```

### 3. **View Counter**

Displays view count with Eye icon:
```tsx
<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md">
  <Eye className="w-4 h-4 text-white" />
  <span>{viewCount.toLocaleString()}</span>
</div>
```

### 4. **Property Information**

**Left Column:**
- **Location:** Icon + title + city
- **Details:** Bedrooms, bathrooms, area

**Right Column:**
- **Price:** Large, bold USD amount
- **CTA:** "Ver Detalles" button

### 5. **Button Interaction**

```tsx
<Button
  onClick={onViewDetails}
  className="bg-white text-oslo-gray-900 hover:bg-white/90 rounded-full px-6"
>
  Ver Detalles
  <ChevronRight className="w-4 h-4 ml-1" />
</Button>
```

---

## 🎨 Styling Customization

### Breakpoints

**Desktop (900px):** Full card width
```tsx
<div className="max-w-[900px] h-[280px]">
```

**Tablet:** Reduce width
```tsx
// Add responsive classes
"w-full lg:max-w-[900px] md:max-w-[700px]"
```

**Mobile:** Stack vertically or reduce to popup
```tsx
// On mobile, use with drawer instead of popup
```

### Dark Mode

All colors automatically adapt with Oslo Gray palette:
```tsx
// Base classes already support dark:
"bg-oslo-gray-900 dark:bg-oslo-gray-1000"
"text-white dark:text-oslo-gray-50"
```

### Custom Colors

To change transaction type colors:
```tsx
const transactionColor =
  property.transactionType === "SALE"
    ? "bg-blue-500 hover:bg-blue-600"      // SALE color
    : "bg-emerald-500 hover:bg-emerald-600"; // RENT color
```

---

## ♿ Accessibility Features

✅ **Semantic HTML**
- Proper button elements
- Alt text on images
- Semantic heading structure

✅ **ARIA Labels**
```tsx
aria-label="Add to favorites"
aria-label="Share property"
aria-label="Bookmark property"
```

✅ **Keyboard Support**
- Tab navigation through buttons
- Enter/Space to activate
- Focus visible on all interactive elements

✅ **Color Contrast**
- White text on dark overlay (high contrast)
- All buttons meet WCAG AA standards
- Icons are meaningful with text

✅ **Interaction Feedback**
- Hover states (scale, shadow)
- Active states (scale down)
- Disabled state support

---

## 🌓 Dark Mode Support

Card automatically adapts to dark mode:

```tsx
// Text stays white
className="text-white drop-shadow-lg"

// Button adapts
className="bg-white text-oslo-gray-900 dark:text-oslo-gray-50"

// Backdrop blur works in both modes
className="bg-white/20 backdrop-blur-md"
```

No additional setup needed - uses Oslo Gray palette automatically.

---

## 📊 Real-World Examples

### Example 1: Map Popup Integration

```tsx
function MapView() {
  const [selectedProperty, setSelectedProperty] = useState(null);

  return (
    <>
      {/* Map with markers */}
      <MapContainer>
        {/* ... markers ... */}
      </MapContainer>

      {/* Popup on marker click */}
      {selectedProperty && (
        <Popup
          longitude={selectedProperty.longitude}
          latitude={selectedProperty.latitude}
        >
          <PropertyCardHorizontal
            property={selectedProperty}
            onViewDetails={() => {
              router.push(`/properties/${selectedProperty.id}`);
              setSelectedProperty(null);
            }}
          />
        </Popup>
      )}
    </>
  );
}
```

### Example 2: Search Results Preview

```tsx
function SearchResults({ properties }) {
  const [selectedProperty, setSelectedProperty] = useState(null);

  return (
    <div className="grid grid-cols-1 gap-4">
      {properties.map(property => (
        <button
          key={property.id}
          onClick={() => setSelectedProperty(property)}
          className="text-left hover:shadow-lg transition-shadow"
        >
          {/* Thumbnail or basic info */}
        </button>
      ))}

      {/* Preview modal */}
      {selectedProperty && (
        <Modal onClose={() => setSelectedProperty(null)}>
          <PropertyCardHorizontal
            property={selectedProperty}
            onViewDetails={() => {
              // Navigate to full details
            }}
          />
        </Modal>
      )}
    </div>
  );
}
```

### Example 3: Favorites Integration

```tsx
function FavoritePreview({ propertyId }) {
  const { data: property } = useQuery(['property', propertyId]);
  const { toggleFavorite, isFavorite } = useFavorites();

  return (
    <PropertyCardHorizontal
      property={property}
      isFavorite={isFavorite(propertyId)}
      onFavoriteToggle={() => {
        toggleFavorite(propertyId);
      }}
      viewCount={property.viewCount}
    />
  );
}
```

---

## 🔗 Related Components

- [`PropertyCard`](../../../properties/property-card.tsx) - Vertical card variant
- [`PropertyCardCompact`](./property-card-compact.tsx) - Compact carousel card
- [`PropertyPopup`](./property-popup.tsx) - Current popup implementation
- [`Button`](../ui/button.tsx) - Base button component

---

## 📁 Files

**Component:**
- `apps/web/components/map/property-card-horizontal.tsx`

**Dependencies:**
- `apps/web/components/ui/button.tsx`
- `apps/web/components/ui/badge.tsx`
- `lucide-react` (icons)
- `next/image` (Image component)

---

## 🚀 Performance Tips

1. **Image Loading:** Use Next.js Image component (already implemented)
2. **Memoization:** Wrap in `React.memo()` if rendering many times
3. **Lazy Loading:** Import dynamically for larger bundles
4. **State Management:** Use callbacks for parent-level state updates

```tsx
// Lazy load if in drawer
const PropertyCardHorizontal = dynamic(
  () => import('./property-card-horizontal'),
  { loading: () => <Skeleton /> }
);
```

---

## 📝 Changelog

### v1.0.0 (Oct 24, 2025)

✨ **Initial Release**
- Complete PropertyCardHorizontal component
- Glassmorphism design
- Full accessibility support
- Dark mode support
- Documentation

Features:
- Image background with overlay
- Status badges
- Social actions (like, share, bookmark)
- View counter
- Property details
- CTA button
- Responsive design

---

## 🎯 Future Enhancements

- [ ] Image carousel (swipe through multiple images)
- [ ] Virtual tour button integration
- [ ] 3D tour support
- [ ] Price comparison with market
- [ ] Agent information card
- [ ] Mortgage calculator integration
- [ ] Similar properties suggestions
- [ ] Investment metrics (for commercial)

---

**Last Updated:** Octubre 24, 2025
**Status:** ✅ Production Ready
**Maintained By:** Development Team
