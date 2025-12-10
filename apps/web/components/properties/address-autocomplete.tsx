"use client";

import { env } from "@repo/env";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { Check, Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

interface AddressAutocompleteProps {
  onAddressSelect: (data: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => void;
  initialValue?: string;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  context?: {
    id: string;
    text: string;
    short_code?: string;
  }[];
}

export function AddressAutocomplete({ onAddressSelect, initialValue = "" }: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);
  const [debouncedValue] = useDebounce(inputValue, 500);
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [loading, setLoading] = useState(false);

  // Update effect for debounced search
  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < 3) {
      setResults([]);
      return;
    }

    const searchAddress = async () => {
      setLoading(true);
      try {
        const token = env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) throw new Error("Mapbox token missing");

        // Limit results to 5, types address/poi, language es
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          debouncedValue
        )}.json?access_token=${token}&language=es&limit=5`;

        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (data.features) {
          setResults(data.features);
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchAddress();
  }, [debouncedValue]);

  const handleSelect = (feature: MapboxFeature) => {
    setInputValue(feature.place_name);
    setOpen(false);

    // Extract basic details from Mapbox context
    // Mapbox context is array like: [District, City, Region, Country]
    // We try to find patterns roughly.
    const city = feature.context?.find(c => c.id.startsWith('place'))?.text || 
                 feature.context?.find(c => c.id.startsWith('district'))?.text || "";
    
    const state = feature.context?.find(c => c.id.startsWith('region'))?.text || "";
    
    // Zip code is rarely returned perfectly in this generic endpoint, usually empty or in context
    const zip = feature.context?.find(c => c.id.startsWith('postcode'))?.text || "";

    // Feature place_name usually contains the full formatted address
    // We use the 'text' (name of place) + address number if available, else full string
    const address = feature.place_name.split(',')[0] || feature.place_name;

    onAddressSelect({
      address,
      city,
      state,
      zipCode: zip,
      latitude: feature.center[1], // Mapbox gives [lng, lat]
      longitude: feature.center[0],
    });
  };

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Buscar dirección (ej: Av. 9 de Octubre, Guayaquil)..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[var(--radix-popover-trigger-width)]" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
            {results.length === 0 ? (
               <div className="py-6 text-center text-sm text-muted-foreground">No se encontraron resultados.</div>
            ) : (
               <div className="flex flex-col gap-1">
                 <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Sugerencias</div>
                 {results.map((feature) => (
                   <button
                     key={feature.id}
                     onClick={() => handleSelect(feature)}
                     className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground w-full text-left"
                   >
                     <MapPin className="mr-2 h-4 w-4 text-muted-foreground opacity-70 shrink-0" />
                     <span className="truncate">{feature.place_name}</span>
                     {inputValue === feature.place_name && <Check className="ml-auto h-4 w-4 opacity-50 shrink-0" />}
                   </button>
                 ))}
               </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
