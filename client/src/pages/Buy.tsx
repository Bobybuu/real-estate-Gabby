import { useState, useEffect, useRef } from 'react';
import { Grid, List, Map } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useProperties } from '@/hooks/useProperties';
import { PropertyFilters } from '@/types/property';
import LoadingSpinner from '@/components/LoadingSpinner';

// Mapbox imports
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'your_mapbox_access_token_here';

// Initialize Mapbox
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

// Nairobi, Kenya coordinates [longitude, latitude]
const NAIROBI_CENTER: [number, number] = [36.8219, -1.2921];
const DEFAULT_ZOOM = 10;

// Helper function to safely convert string coordinates to numbers
const parseCoordinate = (coord: string | number | undefined): number | null => {
  if (coord === undefined || coord === null) return null;
  
  const num = typeof coord === 'string' ? parseFloat(coord) : coord;
  return isNaN(num) ? null : num;
};

// Helper function to safely format price
const formatPriceForMap = (price: any): string => {
  if (price === undefined || price === null) return 'Price N/A';
  
  try {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    return isNaN(numericPrice) ? 'Price N/A' : `KSh ${numericPrice.toLocaleString()}`;
  } catch {
    return 'Price N/A';
  }
};

const Buy = () => {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Map references
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Use the custom hook instead of local state management
  const { properties, loading, error } = useProperties(filters);

  const handleSearch = (searchFilters: PropertyFilters) => {
    setFilters(searchFilters);
  };

  // Mapbox initialization
  useEffect(() => {
    if (!showMap) return;

    if (!mapContainer.current) {
      return;
    }

    if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'your_mapbox_access_token_here') {
      toast.error('Mapbox token not configured. Please check your environment variables.');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/chrispin2005/cmfjcwzm6004s01se01mr59te',
        center: NAIROBI_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      map.current.on('load', () => {
        setMapLoaded(true);
        addNairobiWelcomeMarker();
        updateMapMarkers();
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        toast.error('Failed to load map. Please try again.');
      });

      // Cleanup function
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
          setMapLoaded(false);
        }
        // Clear markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];
      };
    } catch (error) {
      console.error('Error initializing Mapbox:', error);
      toast.error('Failed to load map. Please check your Mapbox configuration.');
    }
  }, [showMap]);

  // Add a permanent welcome marker for Nairobi
  const addNairobiWelcomeMarker = () => {
    if (!map.current || !mapLoaded) return;

    const welcomeEl = document.createElement('div');
    welcomeEl.className = 'welcome-marker';
    welcomeEl.innerHTML = `
      <div class="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg border-2 border-white">
        <div class="font-semibold text-sm">🏠 Nairobi</div>
        <div class="text-xs">Property Hub</div>
      </div>
    `;

    const welcomeMarker = new mapboxgl.Marker({
      element: welcomeEl,
      anchor: 'bottom'
    })
      .setLngLat(NAIROBI_CENTER)
      .addTo(map.current!);

    markers.current.push(welcomeMarker);
  };

  // Update map markers when properties change
  useEffect(() => {
    if (mapLoaded) {
      updateMapMarkers();
      
      if (map.current && properties.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        let hasValidCoordinates = false;
        
        bounds.extend(NAIROBI_CENTER);
        
        properties.forEach(property => {
          const lng = parseCoordinate(property.longitude);
          const lat = parseCoordinate(property.latitude);
          
          if (lng !== null && lat !== null) {
            bounds.extend([lng, lat]);
            hasValidCoordinates = true;
          }
        });
        
        if (hasValidCoordinates) {
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15,
            duration: 1000
          });
        } else {
          map.current.flyTo({
            center: NAIROBI_CENTER,
            zoom: 11,
            duration: 1000,
            essential: true
          });
        }
      } else if (map.current) {
        map.current.flyTo({
          center: NAIROBI_CENTER,
          zoom: 11,
          duration: 1000,
          essential: true
        });
      }
    }
  }, [properties, mapLoaded]);

  const updateMapMarkers = () => {
    // Clear existing property markers but keep Nairobi marker
    markers.current.forEach(marker => {
      const element = marker.getElement();
      if (element && !element.classList.contains('welcome-marker')) {
        marker.remove();
      }
    });
    
    markers.current = markers.current.filter(marker => {
      const element = marker.getElement();
      return element && element.classList.contains('welcome-marker');
    });

    if (!map.current || !mapLoaded) return;

    // Add markers for each property
    properties.forEach(property => {
      const lng = parseCoordinate(property.longitude);
      const lat = parseCoordinate(property.latitude);
      
      if (lng !== null && lat !== null) {
        const el = document.createElement('div');
        el.className = 'property-marker';
        el.innerHTML = `
          <div class="bg-white rounded-full p-2 shadow-lg border-2 border-blue-500 hover:border-blue-700 transition-colors cursor-pointer">
            <div class="text-blue-600 font-semibold text-sm">${formatPriceForMap(property.price)}</div>
          </div>
        `;

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom'
        })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        el.addEventListener('click', () => {
          const propertyElement = document.getElementById(`property-${property.id}`);
          if (propertyElement) {
            propertyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            propertyElement.classList.add('ring-2', 'ring-blue-500');
            setTimeout(() => {
              propertyElement.classList.remove('ring-2', 'ring-blue-500');
            }, 2000);
          }
        });

        markers.current.push(marker);
      }
    });

    // Ensure Nairobi marker is visible if no properties
    if (properties.length === 0 || !properties.some(p => p.latitude && p.longitude)) {
      const hasNairobiMarker = markers.current.some(marker => {
        const element = marker.getElement();
        return element && element.classList.contains('welcome-marker');
      });
      
      if (!hasNairobiMarker) {
        addNairobiWelcomeMarker();
      }
    }
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error('Failed to load properties. Please try again.');
    }
  }, [error]);

  // Check if Mapbox token is configured
  const isMapboxConfigured = MAPBOX_ACCESS_TOKEN && MAPBOX_ACCESS_TOKEN !== 'your_mapbox_access_token_here';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary py-1">
          <div className="container mx-auto px-4">
            <h1 className="text-center mb-2 font-light text-3xl tracking-tight">Properties</h1>
            <p className="text-center text-muted-foreground mb-4 max-w-2xl mx-auto">
              Discover your perfect property in Kenya
            </p>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="bg-card border rounded-lg p-6 sticky top-20">
                  <h3 className="font-semibold mb-4">Advanced Filters</h3>
                  <div className="space-y-4">
                    {/* Property Type Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Property Type</label>
                      <select 
                        className="w-full p-2 border rounded-md text-sm"
                        value={filters.property_type || ''}
                        onChange={(e) => handleSearch({ ...filters, property_type: e.target.value })}
                      >
                        <option value="">All Types</option>
                        <option value="apartment">Apartment</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                        <option value="rental">Rental</option>
                        <option value="sale">For Sale</option>
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Price Range (KSh)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          className="w-full p-2 border rounded-md text-sm"
                          value={filters.min_price || ''}
                          onChange={(e) => handleSearch({ ...filters, min_price: e.target.value })}
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          className="w-full p-2 border rounded-md text-sm"
                          value={filters.max_price || ''}
                          onChange={(e) => handleSearch({ ...filters, max_price: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Bedrooms Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                      <select 
                        className="w-full p-2 border rounded-md text-sm"
                        value={filters.min_bedrooms || ''}
                        onChange={(e) => handleSearch({ ...filters, min_bedrooms: e.target.value })}
                      >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5+</option>
                      </select>
                    </div>

                    {/* Location Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <input
                        type="text"
                        placeholder="Nairobi, Mombasa, etc."
                        className="w-full p-2 border rounded-md text-sm"
                        value={filters.city || ''}
                        onChange={(e) => handleSearch({ ...filters, city: e.target.value })}
                      />
                    </div>

                    {/* Map Toggle */}
                    {isMapboxConfigured && (
                      <div className="pt-4 border-t">
                        <label className="text-sm font-medium mb-2 block">Map View</label>
                        <Button
                          variant={showMap ? "default" : "outline"}
                          size="sm"
                          className="w-full"
                          onClick={() => setShowMap(!showMap)}
                        >
                          <Map className="h-4 w-4 mr-2" />
                          {showMap ? 'Hide Map' : 'Show  Map'}
                        </Button>
                      </div>
                    )}

                    {/* Clear Filters */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setFilters({})}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1">
                {/* View Controls */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{properties.length}</span> properties found
                    {Object.keys(filters).length > 0 && (
                      <span className="ml-2">(with filters applied)</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Map Integration */}
                {showMap && isMapboxConfigured && (
                  <div className="mb-6">
                    <div 
                      ref={mapContainer} 
                      className="rounded-lg h-96 border border-border relative bg-muted"
                    >
                      {!mapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                          <div className="text-center">
                            <LoadingSpinner size="sm" />
                            <p className="text-muted-foreground mt-2">Loading Nairobi map...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">
                        Click property markers to view details
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (map.current) {
                            map.current.flyTo({
                              center: NAIROBI_CENTER,
                              zoom: DEFAULT_ZOOM,
                              duration: 1000
                            });
                          }
                        }}
                      >
                        Reset to Nairobi
                      </Button>
                    </div>
                  </div>
                )}

                {/* Map Not Configured Message */}
                {showMap && !isMapboxConfigured && (
                  <div className="bg-muted rounded-lg h-64 mb-6 flex items-center justify-center border">
                    <div className="text-center">
                      <Map className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">
                        Map integration requires MapBox API Key
                      </p>
                      <p className="text-xs text-muted-foreground max-w-md">
                        Please set your VITE_MAPBOX_ACCESS_TOKEN in your .env file
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => window.open('https://account.mapbox.com/access-tokens/', '_blank')}
                      >
                        Get Mapbox Token
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-center py-12 bg-destructive/10 rounded-lg">
                    <p className="text-destructive text-lg mb-4">Failed to load properties</p>
                    <Button 
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="text-muted-foreground mt-4">Loading properties...</p>
                  </div>
                )}

                {/* Property Grid/List */}
                {!loading && !error && properties.length > 0 && (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                        : 'flex flex-col gap-6'
                    }
                  >
                    {properties.map((property) => (
                      <div 
                        key={property.id} 
                        id={`property-${property.id}`}
                        className="transition-all duration-300"
                      >
                        <PropertyCard 
                          property={property}
                          viewMode={viewMode}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {!loading && !error && properties.length === 0 && (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                      <p className="text-muted-foreground mb-4">
                        {Object.keys(filters).length > 0 
                          ? 'Try adjusting your search filters to see more results.'
                          : 'No properties are currently available. Check back later!'
                        }
                      </p>
                      {Object.keys(filters).length > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => setFilters({})}
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Buy;