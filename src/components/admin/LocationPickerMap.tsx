import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GlassButton } from "@/components/ui/glass-button";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

// Fix for default marker icon in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

export const LocationPickerMap = ({
  latitude,
  longitude,
  onLocationChange,
  className = "",
}: LocationPickerMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Default position (Libreville, Gabon)
  const defaultLat = 0.4162;
  const defaultLng = 9.4673;
  
  const currentLat = latitude ?? defaultLat;
  const currentLng = longitude ?? defaultLng;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [currentLat, currentLng],
      latitude !== null ? 17 : 12
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Click handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    // Add marker if position exists
    if (latitude !== null && longitude !== null) {
      markerRef.current = L.marker([latitude, longitude]).addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // Only run once on mount

  // Update marker position when coordinates change
  useEffect(() => {
    if (!mapRef.current) return;

    if (latitude !== null && longitude !== null) {
      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      } else {
        markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
      }
      // Center map on marker
      mapRef.current.setView([latitude, longitude], 17);
    } else {
      // Remove marker if coordinates are null
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [latitude, longitude]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "fr" } }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        onLocationChange(parseFloat(lat), parseFloat(lon));
        setSearchQuery("");
      } else {
        setSearchError("Adresse non trouvée. Essayez une autre recherche.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Erreur lors de la recherche. Veuillez réessayer.");
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Rechercher une adresse..."
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <GlassButton
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rechercher"}
        </GlassButton>
      </div>

      {searchError && (
        <p className="text-sm text-destructive">{searchError}</p>
      )}

      {/* Map */}
      <div 
        ref={mapContainerRef}
        className="rounded-lg overflow-hidden border-2 border-border" 
        style={{ height: "300px", width: "100%" }}
      />

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        Cliquez sur la carte pour placer le marqueur à l'emplacement souhaité
      </p>
    </div>
  );
};
