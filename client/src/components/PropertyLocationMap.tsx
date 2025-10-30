// components/PropertyLocationMap.tsx
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface PropertyLocationMapProps {
  latitude: number | string;
  longitude: number | string;
  propertyTitle?: string;
}

const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({
  latitude,
  longitude,
  propertyTitle = 'Property Location'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Parse coordinates safely
  const parseCoordinate = (coord: string | number): number | null => {
    const num = typeof coord === 'string' ? parseFloat(coord) : coord;
    return isNaN(num) ? null : num;
  };

  useEffect(() => {
    const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'your_mapbox_access_token_here') {
      console.error('Mapbox token not configured');
      return;
    }

    if (!mapContainer.current) return;

    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);

    if (lat === null || lng === null) {
      console.error('Invalid coordinates');
      return;
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/chrispin2005/cmfjcwzm6004s01se01mr59te', // Custom style URL
        center: [lng, lat],
        zoom: 14,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add marker when map loads
      map.current.on('load', () => {
        // Create custom marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'property-marker';
        markerEl.innerHTML = `
          <div class="bg-red-600 rounded-full p-2 shadow-lg border-2 border-white animate-pulse">
            <div class="w-3 h-3 bg-white rounded-full"></div>
          </div>
        `;

        // Add marker to map
        marker.current = new mapboxgl.Marker({
          element: markerEl,
          anchor: 'center'
        })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        // Add popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false
        }).setHTML(`
          <div class="p-2">
            <h4 class="font-semibold text-sm">${propertyTitle}</h4>
            <p class="text-xs text-gray-600">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
          </div>
        `);

        marker.current.setPopup(popup);
      });

      // Error handling
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      // Cleanup
      return () => {
        if (marker.current) {
          marker.current.remove();
        }
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [latitude, longitude, propertyTitle]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-lg"
    />
  );
};

export default PropertyLocationMap;