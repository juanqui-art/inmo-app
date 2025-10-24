# PropertyPopup Integration Guide

> Complete guide for using the redesigned PropertyPopup with PropertyCardHorizontal

**Status:** ✅ Integrated | **Last Updated:** Octubre 24, 2025

---

## 📍 Overview

The `PropertyPopup` component has been redesigned to use the premium `PropertyCardHorizontal` component, providing users with an enhanced visual experience when clicking on map markers.

### Architecture

```
PropertyPopup (Wrapper)
├─ variant="full" (default)
│  └─ PropertyCardHorizontal (900px, full features)
└─ variant="compact"
   └─ PropertyPopupCompact (260px, mobile-friendly)
```

---

## 🚀 Quick Start

### Basic Usage

```tsx
import { PropertyPopup } from "@/components/map/property-popup";

function MapComponent() {
  const [selectedProperty, setSelectedProperty] = useState(null);

  return (
    <>
      {/* Map with markers... */}

      {selectedProperty && (
        <PropertyPopup
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onViewDetails={() => {
            router.push(`/properties/${selectedProperty.id}`);
            setSelectedProperty(null);
          }}
        />
      )}
    </>
  );
}
```

### With Responsive Variants

```tsx
<PropertyPopup
  property={selectedProperty}
  onClose={handleClose}
  onViewDetails={handleViewDetails}
  variant={isMobile ? "compact" : "full"}
/>
```

### With Favorite Toggle

```tsx
<PropertyPopup
  property={selectedProperty}
  onClose={handleClose}
  onViewDetails={handleViewDetails}
  isFavorite={favoriteIds.includes(selectedProperty.id)}
  onFavoriteToggle={(id) => {
    toggleFavorite(id);
  }}
/>
```

---

## 📋 API Reference

### PropertyPopup Props

```typescript
interface PropertyPopupProps {
  /** Property data to display (required) */
  property: MapProperty;

  /** Callback when close button is clicked (required) */
  onClose: () => void;

  /** Callback when "View Details" button is clicked (required) */
  onViewDetails: () => void;

  /** Popup variant: "full" or "compact" (optional, default: "full") */
  variant?: "full" | "compact";

  /** Whether property is favorited (optional, default: false) */
  isFavorite?: boolean;

  /** Callback when favorite button is clicked (optional) */
  onFavoriteToggle?: (propertyId: string) => void;
}
```

### MapProperty Type

```typescript
interface MapProperty {
  id: string;
  title: string;
  price: number;
  transactionType: "SALE" | "RENT";
  category: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: Array<{ url: string; alt?: string }>;
  viewCount?: number;
}
```

---

## 🎨 Variants Comparison

### Full Variant (Default)

**When to use:**
- Desktop browsers
- Large screens (>768px)
- When showing full property details is important
- Premium user experience

**Features:**
- Size: 900px wide × 280px tall
- Image with dark gradient overlay
- All social actions (like, share, bookmark)
- View counter
- Complete property information
- Glassmorphism close button above card

```tsx
<PropertyPopup
  property={property}
  onClose={handleClose}
  onViewDetails={handleViewDetails}
  variant="full"
/>
```

### Compact Variant

**When to use:**
- Mobile screens (<768px)
- When space is limited
- Quick property preview
- Fast interactions needed

**Features:**
- Size: 260px wide (standard popup width)
- Image with overlaid badges
- Price and transaction type visible
- Favorite toggle button
- Essential info only (beds, baths, area)
- Standard close button position

```tsx
<PropertyPopup
  property={property}
  onClose={handleClose}
  onViewDetails={handleViewDetails}
  variant="compact"
/>
```

---

## 📱 Responsive Implementation

### Auto-Detect Screen Size

```tsx
import { useMediaQuery } from "@/lib/hooks/use-media-query";

function MapComponent() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <PropertyPopup
      property={selectedProperty}
      onClose={handleClose}
      onViewDetails={handleViewDetails}
      variant={isMobile ? "compact" : "full"}
    />
  );
}
```

### Using Tailwind Responsive

```tsx
// If you can't detect at component level:
<PropertyPopup
  property={selectedProperty}
  onClose={handleClose}
  onViewDetails={handleViewDetails}
  // Use CSS media query to swap variants
  variant="full" // Default, override with media query
/>
```

---

## 🎯 Integration Examples

### Example 1: Basic Map Integration

```tsx
// apps/web/components/map/map-view.tsx

import { PropertyPopup } from "./property-popup";
import { PropertyMarker } from "./property-marker";

export function MapView({ properties }: { properties: MapProperty[] }) {
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const router = useRouter();

  return (
    <Map>
      {/* Render markers */}
      {properties.map(property => (
        <PropertyMarker
          key={property.id}
          property={property}
          onClick={() => setSelectedProperty(property)}
        />
      ))}

      {/* Render popup */}
      {selectedProperty && (
        <PropertyPopup
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onViewDetails={() => {
            router.push(`/properties/${selectedProperty.id}`);
            setSelectedProperty(null);
          }}
        />
      )}
    </Map>
  );
}
```

### Example 2: With Favorites System

```tsx
import { useFavorites } from "@/hooks/use-favorites";

function MapView({ properties }: { properties: MapProperty[] }) {
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <Map>
      {/* ... markers ... */}

      {selectedProperty && (
        <PropertyPopup
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onViewDetails={() => {
            // Navigate to property details
          }}
          isFavorite={favorites.includes(selectedProperty.id)}
          onFavoriteToggle={toggleFavorite}
        />
      )}
    </Map>
  );
}
```

### Example 3: Mobile-Aware Popup

```tsx
import { useMediaQuery } from "@/lib/hooks/use-media-query";

function MapView({ properties }: { properties: MapProperty[] }) {
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Map>
      {/* ... markers ... */}

      {selectedProperty && (
        <PropertyPopup
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onViewDetails={() => {
            // Navigate
          }}
          variant={isMobile ? "compact" : "full"}
        />
      )}
    </Map>
  );
}
```

---

## 🎨 Styling & Customization

### Close Button Styling

**Full Variant:**
```tsx
// Positioned above card with backdrop blur
className="absolute -top-10 right-0 bg-white/20 dark:bg-oslo-gray-800/40
  rounded-full p-2 shadow-md hover:bg-white/30
  dark:hover:bg-oslo-gray-800/60 transition-colors z-10
  backdrop-blur-sm border border-white/30"
```

**Compact Variant:**
```tsx
// Standard position on image
className="absolute top-2 right-2 bg-white dark:bg-oslo-gray-800
  rounded-full p-1 shadow-md hover:bg-oslo-gray-100
  dark:hover:bg-oslo-gray-700 transition-colors z-10"
```

### MapBox Popup Offset

**Full:**
```tsx
offset={[0, -150]} // More space for large card
```

**Compact:**
```tsx
offset={[0, -10]} // Standard offset
```

---

## ♿ Accessibility

Both variants support:

✅ **ARIA Labels**
- `aria-label="Close popup"` on close button

✅ **Keyboard Navigation**
- Tab to cycle through buttons
- Enter/Space to activate
- Escape to close (inherited from MapBox)

✅ **Screen Readers**
- Semantic HTML structure
- Descriptive button labels
- Property information clearly announced

✅ **Focus Management**
- Visible focus rings
- Focus trap within popup
- Returns focus to map on close

---

## 🌓 Dark Mode

Both variants automatically support dark mode:

```tsx
// Full variant (PropertyCardHorizontal)
className="bg-oslo-gray-900 dark:bg-oslo-gray-1000"
className="text-white drop-shadow-lg"

// Compact variant (PropertyPopupCompact)
className="bg-white dark:bg-oslo-gray-900"
className="text-oslo-gray-900 dark:text-oslo-gray-50"
```

No additional setup needed - Oslo Gray palette handles everything.

---

## 🚀 Performance Tips

### 1. **Lazy Load Popup Content**

```tsx
// Only create popup DOM when needed
{selectedProperty && (
  <PropertyPopup
    property={selectedProperty}
    onClose={handleClose}
    onViewDetails={handleViewDetails}
  />
)}
```

### 2. **Memoize Properties List**

```tsx
const properties = useMemo(() => fetchedProperties, [fetchedProperties]);
```

### 3. **Optimize Images**

PropertyCardHorizontal uses Next.js Image component for optimization.

### 4. **Debounce Close Handler**

```tsx
const handleClose = useCallback(
  debounce(() => setSelectedProperty(null), 100),
  []
);
```

---

## 🔗 Related Components

- **[PropertyCardHorizontal](./PROPERTY_CARD_HORIZONTAL.md)** - Full horizontal card
- **[PropertyMarker](./MARKER_STYLES.md)** - Map marker styles
- **[PropertyCard](../../../properties/property-card.tsx)** - Vertical card variant

---

## 🐛 Troubleshooting

### Popup Not Showing

**Check:**
1. `property.latitude` and `property.longitude` are valid numbers
2. MapBox GL Popup component is rendered
3. Close button working correctly

```tsx
// Guard in component
if (!property.latitude || !property.longitude) {
  return null; // Component returns null
}
```

### Close Button Not Visible

**Check:**
1. Z-index conflicts: Set `z-10` or higher
2. Parent overflow: Remove `overflow: hidden` if needed
3. Backdrop blur support: Works in all modern browsers

### Favorite Toggle Not Working

**Check:**
1. `onFavoriteToggle` callback is passed
2. Component is re-rendering with updated `isFavorite` prop
3. State is properly updated in parent

```tsx
// Make sure to update state
const handleToggleFavorite = (id: string) => {
  setFavorites(prev =>
    prev.includes(id)
      ? prev.filter(fid => fid !== id)
      : [...prev, id]
  );
};
```

---

## 📊 Version History

### v2.0.0 (Oct 24, 2025)

**Major Redesign:**
- Replaced basic popup with PropertyCardHorizontal
- Added responsive variants (full/compact)
- Glassmorphism effects
- Social actions integration
- Favorite system support
- Enhanced visual design

**Breaking Changes:**
- New props: `variant`, `isFavorite`, `onFavoriteToggle`
- Old popup design removed
- Different close button positioning

**Migration:**
```tsx
// Old (still works, uses full variant by default)
<PropertyPopup property={...} onClose={...} onViewDetails={...} />

// New with variants
<PropertyPopup property={...} onClose={...} onViewDetails={...} variant="full" />
<PropertyPopup property={...} onClose={...} onViewDetails={...} variant="compact" />
```

---

## 🎯 Future Enhancements

- [ ] Image carousel in popup
- [ ] Virtual tour preview
- [ ] Quick scheduling from popup
- [ ] Share to social from popup
- [ ] Price history graph
- [ ] Similar properties suggestions
- [ ] Agent info card

---

**Last Updated:** Octubre 24, 2025
**Status:** ✅ Production Ready
**Maintained By:** Development Team
