# MapBox GL Popup Styling Guide

> Solutions and best practices for styling MapBox GL popups with custom React components

**Status:** ✅ Solved | **Last Updated:** Octubre 24, 2025

---

## 🎯 The Problem

MapBox GL applies default styles to popup containers that can override custom component styling:

```css
/* Default MapBox styles that caused issues */
.mapboxgl-popup-content {
  padding: 15px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,.3);
  max-width: 240px;
  border-radius: 3px;
}

.mapboxgl-popup-tip {
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-top-color: white;
}
```

This caused:
- Unwanted padding and white background
- Limited max-width (240px) for wide components
- Visible pointer/tip that might not fit design
- Conflicting styles with PropertyCardHorizontal

---

## ✅ The Solution

### 1. **Global CSS Overrides** (Recommended)

Add to `apps/web/app/globals.css`:

```css
/* MapBox GL Popup Style Overrides */
.mapboxgl-popup {
  z-index: 10;
}

.mapboxgl-popup-content {
  padding: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  max-width: none !important;
  color: inherit;
  font-family: inherit;
}

.mapboxgl-popup-tip {
  display: none !important;
}

.mapboxgl-popup-close-button {
  display: none !important;
}

/* Responsive constraints */
@media (max-width: 768px) {
  .mapboxgl-popup-content {
    max-width: 280px !important;
  }
}

@media (min-width: 769px) {
  .mapboxgl-popup-content {
    max-width: 900px !important;
  }
}
```

### 2. **Popup Component Props**

In your Popup component:

```tsx
<Popup
  longitude={property.longitude}
  latitude={property.latitude}
  closeButton={false}      // Disable default close button
  maxWidth="none"          // Remove max-width constraint
  offset={[0, -150]}       // Adjust vertical positioning
  closeOnClick={false}     // Prevent closing on map click
>
  {/* Your custom component here */}
</Popup>
```

### 3. **Custom Close Button**

Since we disabled the default close button, implement a custom one:

```tsx
<button
  onClick={onClose}
  className="absolute -top-10 right-0 bg-white/20 rounded-full p-2
    shadow-md hover:bg-white/30 transition-colors z-10 backdrop-blur-sm
    border border-white/30"
  aria-label="Close popup"
>
  <X className="w-5 h-5 text-white" />
</button>
```

---

## 🔧 Key Props to Use

### Popup Props for Custom Components

```typescript
interface PopupProps {
  // Required
  longitude: number;
  latitude: number;

  // Styling
  closeButton?: boolean;          // false = disable default
  maxWidth?: string;              // "none" = remove constraint
  className?: string;             // Add custom classes

  // Behavior
  offset?: [number, number];      // Position adjustment [x, y]
  closeOnClick?: boolean;         // false = keep open
  closeOnMove?: boolean;          // false = keep open while dragging

  // Content
  children: React.ReactNode;      // Your custom component
}
```

---

## 📱 Responsive Behavior

The CSS overrides provide responsive max-width:

| Screen Size | Max-Width |
|------------|-----------|
| Mobile (< 768px) | 280px |
| Desktop (≥ 769px) | 900px |

This allows PropertyCardHorizontal to be full-width on desktop and fit mobile screens.

---

## 🎨 Design Considerations

### Close Button Positioning

**For full-width cards:**
```css
.absolute -top-10 right-0
```
Position above the card with glassmorphism.

**For compact cards:**
```css
.absolute top-2 right-2
```
Position on the image with high contrast.

### Z-Index

Ensure popups appear above map controls:
```css
.mapboxgl-popup {
  z-index: 10;  /* Default is 1 */
}
```

### Dark Mode

Your custom components should handle dark mode:
```tsx
<div className="bg-white dark:bg-oslo-gray-900">
  {/* Content */}
</div>
```

---

## 🚀 Implementation Checklist

- [x] Add CSS overrides to globals.css
- [x] Use `maxWidth="none"` on Popup component
- [x] Set `closeButton={false}` to disable default
- [x] Implement custom close button
- [x] Adjust offset for proper positioning
- [x] Test responsive behavior
- [x] Verify dark mode works
- [x] Check accessibility (ARIA labels)

---

## 🐛 Troubleshooting

### Styles Still Being Overridden

**Solution:** Ensure `!important` flags are in globals.css:
```css
.mapboxgl-popup-content {
  padding: 0 !important;  /* ← important! */
  background: transparent !important;
}
```

### Popup Width Still Limited

**Solution:** Make sure `maxWidth="none"` is set:
```tsx
<Popup maxWidth="none">  {/* ← Set this */}
  {/* content */}
</Popup>
```

### Close Button Not Visible

**Solution:** Ensure custom button has z-index:
```tsx
<button className="... z-10 ...">
  <X />
</button>
```

### Pointer/Tip Still Showing

**Solution:** CSS should hide it:
```css
.mapboxgl-popup-tip {
  display: none !important;
}
```

---

## 🔗 Related Resources

- [MapBox GL Popup Docs](https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup)
- [react-map-gl Popup API](https://visgl.github.io/react-map-gl/docs/api-reference/mapbox/popup)
- [PropertyPopup Integration Guide](./PROPERTY_POPUP_INTEGRATION.md)
- [PropertyCardHorizontal Guide](./PROPERTY_CARD_HORIZONTAL.md)

---

## 📊 CSS Specificity Reference

When overriding MapBox styles:

| Selector | Specificity | Use Case |
|----------|------------|----------|
| `.mapboxgl-popup-content` | 10 | Basic overrides |
| `.custom .mapboxgl-popup-content` | 20 | Class-specific |
| `.mapboxgl-popup-content { !important }` | ∞ | Force override |

Always use `!important` for MapBox overrides due to their stylesheet specificity.

---

## 💡 Best Practices

1. **Always reset padding and background** when using custom components
2. **Set `maxWidth="none"`** to avoid width constraints
3. **Disable default close button** if using custom close
4. **Use `!important`** in CSS for MapBox overrides
5. **Test responsive** behavior on mobile and desktop
6. **Check accessibility** - custom close buttons need aria-labels

---

## 📝 Version History

### v1.0.0 (Oct 24, 2025)

✅ **Initial Documentation**
- Solution for MapBox popup style overrides
- CSS recommendations with !important flags
- Popup props configuration
- Responsive sizing guide
- Troubleshooting tips

---

## 🎯 Summary

To use custom components in MapBox GL popups:

1. ✅ Add CSS overrides to globals.css
2. ✅ Use `maxWidth="none"` prop
3. ✅ Set `closeButton={false}`
4. ✅ Implement custom close button
5. ✅ Test on both desktop and mobile

With these changes, PropertyCardHorizontal displays perfectly in the popup without any style conflicts!

---

**Last Updated:** Octubre 24, 2025
**Status:** ✅ Production Ready
**Tested On:** React 19, Next.js 16, MapBox GL JS 3.x
