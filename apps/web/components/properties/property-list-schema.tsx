/**
 * PropertyListSchema - JSON-LD Schema for Property Listings
 *
 * Adds structured data to help search engines understand:
 * - Property listings on the page
 * - Price, location, features
 * - Schema.org/RealEstateListing format
 *
 * BENEFITS:
 * - Better search engine visibility (SEO)
 * - Rich snippets in Google Search
 * - Better crawlability
 *
 * RESOURCES:
 * - https://schema.org/RealEstateListing
 * - https://developers.google.com/search/docs/appearance/structured-data/real-estate
 */

import type { SerializedProperty } from "@/lib/utils/serialize-property";

interface PropertyListSchemaProps {
  properties: SerializedProperty[];
  city?: string;
}

export function PropertyListSchema({
  properties,
  city,
}: PropertyListSchemaProps) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: properties.map((property, index) => ({
      "@type": "RealEstateListing",
      position: index + 1,
      name: property.title,
      description: `${property.bedrooms || 0} recámaras, ${property.bathrooms || 0} baños, ${property.area || 0}m²`,
      url: `https://inmoapp.com/propiedades/${property.id}`,
      image: property.images && property.images.length > 0 ? property.images[0]?.url : undefined,
      priceCurrency: "USD",
      price: property.price.toString(),
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        price: property.price.toString(),
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: property.city || "Ecuador",
        addressRegion: property.state,
        addressCountry: "EC",
      },
      areaServed: {
        "@type": "Place",
        name: city || "Ecuador",
      },
      ...(property.transactionType && {
        transactionType: property.transactionType === "SALE" ? "Sale" : "Rent",
      }),
      ...(property.bedrooms && {
        numberOfBedrooms: property.bedrooms,
      }),
      ...(property.bathrooms && {
        numberOfBathroomsTotal: property.bathrooms,
      }),
      ...(property.area && {
        floorSize: {
          "@type": "QuantitativeValue",
          value: property.area.toString(),
          unitCode: "MTK",
        },
      }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
    />
  );
}
