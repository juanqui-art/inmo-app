# Images Directory

This directory contains static images for the application.

## Hero Background Image

**Required file**: `hero-background.jpg`

### Requirements

- **Dimensions**: 1920x1080px (16:9 aspect ratio)
- **File size**: <400KB (compressed)
- **Format**: JPG (for photos), WebP for even smaller size
- **Focus**: Center of image (important content in middle)
- **Style**: Professional, welcoming, aspirational

### Where to Get Free High-Quality Images

1. **Unsplash** (recommended): https://unsplash.com/s/photos/modern-house
   - License: Free for commercial use
   - Quality: Professional
   - Search: "modern house", "luxury home", "real estate"

2. **Pexels**: https://www.pexels.com/search/real%20estate/
   - License: Free for commercial use
   - Good variety

3. **Pixabay**: https://pixabay.com/images/search/house/
   - License: Free for commercial use

### How to Optimize Images

Before uploading, compress your image:

1. **Online Tools** (easiest):
   - https://tinypng.com/ (drag & drop)
   - https://squoosh.app/ (advanced options)

2. **CLI Tools** (if you prefer):
   ```bash
   # Install Sharp CLI
   npm install -g sharp-cli

   # Compress image
   sharp -i original.jpg -o hero-background.jpg --resize 1920,1080 --quality 85
   ```

### Tips for Choosing the Right Image

✅ **DO**:
- Choose images with good lighting
- Ensure there's space for text overlay (darker areas work best)
- Test on mobile (portrait orientation)
- Pick images that represent your target market

❌ **DON'T**:
- Use overly busy images (competes with search bar)
- Use images with people's faces (distraction)
- Use very bright images (text becomes hard to read)
- Use stock photos that look obviously fake

### Example Search Queries

For different property styles:
- "modern minimalist house exterior"
- "luxury villa architecture"
- "cozy suburban home"
- "urban apartment building"
- "beachfront property"

### Current Placeholder

Until you add `hero-background.jpg`, the component will show a missing image error.

**Quick Start**: Download any image from Unsplash, resize to 1920x1080, compress to <400KB, save as `hero-background.jpg` in this directory.
