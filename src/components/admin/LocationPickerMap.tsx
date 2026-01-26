import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GlassButton } from "@/components/ui/glass-button";
import { Search, MapPin, Loader2, Crosshair } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  accuracy?: number; // GPS accuracy in meters
  className?: string;
}

export const LocationPickerMap = ({
  latitude,
  longitude,
  onLocationChange,
  accuracy = 50, // Default accuracy circle radius in meters
  className = "",
}: LocationPickerMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

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

    // Add marker and accuracy circle if position exists
    if (latitude !== null && longitude !== null) {
      // Add accuracy circle first (so it's below the marker)
      accuracyCircleRef.current = L.circle([latitude, longitude], {
        radius: accuracy,
        color: "#22c55e",
        fillColor: "#22c55e",
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(map);

      markerRef.current = L.marker([latitude, longitude]).addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      accuracyCircleRef.current = null;
    };
  }, []); // Only run once on mount

  // Update marker position and accuracy circle when coordinates change
  useEffect(() => {
    if (!mapRef.current) return;

    if (latitude !== null && longitude !== null) {
      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      } else {
        markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
      }

      // Update or create accuracy circle
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([latitude, longitude]);
        accuracyCircleRef.current.setRadius(accuracy);
      } else {
        accuracyCircleRef.current = L.circle([latitude, longitude], {
          radius: accuracy,
          color: "#22c55e",
          fillColor: "#22c55e",
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(mapRef.current);
      }

      // Center map on marker
      mapRef.current.setView([latitude, longitude], 17);
    } else {
      // Remove marker if coordinates are null
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      // Remove accuracy circle
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.remove();
        accuracyCircleRef.current = null;
      }
    }
  }, [latitude, longitude, accuracy]);

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

  // Recenter map on user's current location WITHOUT changing saved coordinates
  const handleRecenterOnUser = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: userLat, longitude: userLng } = position.coords;
        if (mapRef.current) {
          mapRef.current.setView([userLat, userLng], 17);
          toast.info("Carte recentrée sur votre position actuelle");
        }
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Accès à la géolocalisation refusé");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Position non disponible");
            break;
          case error.TIMEOUT:
            toast.error("Délai de localisation expiré");
            break;
          default:
            toast.error("Erreur de géolocalisation");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search bar and recenter button */}
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
        <GlassButton
          type="button"
          variant="outline"
          onClick={handleRecenterOnUser}
          disabled={locating}
          title="Recentrer sur ma position"
          className="px-3"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
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

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Cliquez sur la carte pour placer le marqueur
        </p>
        {latitude !== null && longitude !== null && (
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500/30 border border-green-500"></span>
            Zone de précision (~{accuracy}m)
          </p>
        )}
      </div>
    </div>
  );
};
