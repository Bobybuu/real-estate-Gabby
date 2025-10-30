import { Link } from 'react-router-dom';
import { Bed, Bath, Square, MapPin, Heart, Droplets, Zap, Car, Fence } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Property } from '@/types/property';
import { propertyApi, PLACEHOLDER_IMAGE } from '@/services/propertyApi';
import { useState, MouseEvent } from 'react';

interface PropertyCardProps {
  property: Property;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const PropertyCard = ({ property, viewMode = 'grid', className = "" }: PropertyCardProps) => {
  const [isFavorited, setIsFavorited] = useState<boolean>(property.is_favorited || false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  // Use the propertyApi method to get the correct image URL
  const imageUrl = propertyApi.getPrimaryImageUrl(property);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleFavoriteToggle = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await propertyApi.toggleFavorite(property.id.toString());
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: string | number): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    const formatted = new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(numericPrice);
    return formatted.replace('KES', 'KSh');
  };

  const getPropertyTypeLabel = (type: Property['property_type']): string => {
    const typeMap: Record<Property['property_type'], string> = {
      land: 'Land',
      commercial: 'Commercial',
      rental: 'Rental',
      apartment: 'Apartment',
      sale: 'For Sale',
    };
    return typeMap[type] || type;
  };

  const getLandTypeLabel = (landType?: string): string => {
    const landTypeMap: Record<string, string> = {
      residential: 'Residential',
      agricultural: 'Agricultural',
      commercial: 'Commercial',
      industrial: 'Industrial',
      mixed_use: 'Mixed Use',
    };
    return landType ? landTypeMap[landType] || landType : 'Land';
  };

  const getStatusLabel = (status: Property['status'], propertyType: Property['property_type']): string => {
    if (propertyType === 'rental') return 'For Rent';
    if (propertyType === 'sale') return 'For Sale';
    if (status === 'rented') return 'Rented';
    if (status === 'sold') return 'Sold';
    return 'Available';
  };

  // SAFE land-specific utility functions with null checks
  const getWaterStatus = (): { hasWater: boolean; waterTypes: string[]; displayText: string } => {
    const waterTypes: string[] = [];
    
    // Safe checks with default values
    if (property.has_borehole === true) waterTypes.push('Borehole');
    if (property.has_piped_water === true) waterTypes.push('Piped');
    if (property.water_supply_types && Array.isArray(property.water_supply_types)) {
      waterTypes.push(...property.water_supply_types);
    }
    
    const hasWater = waterTypes.length > 0;
    const displayText = waterTypes.length > 0 ? waterTypes.join(', ') : 'No Water';
    
    return { hasWater, waterTypes, displayText };
  };

  const getElectricityStatus = (): { hasElectricity: boolean; displayText: string } => {
    // Safe check with default
    const electricity = property.electricity_availability || 'none';
    const hasElectricity = electricity === 'on_site' || electricity === 'nearby';
    const displayText = electricity === 'on_site' ? 'Electricity' :
                       electricity === 'nearby' ? 'Electricity Nearby' :
                       electricity === 'planned' ? 'Electricity Planned' : 'No Electricity';
    
    return { hasElectricity, displayText };
  };

  const getRoadAccessStatus = (): { hasRoadAccess: boolean; displayText: string } => {
    // Safe checks with defaults
    const hasRoadAccess = !!property.road_access_type || 
                         (property.distance_to_main_road !== null && property.distance_to_main_road !== undefined);
    let displayText = 'No Road Access';
    
    if (property.road_access_type) {
      displayText = property.road_access_type;
    } else if (property.distance_to_main_road) {
      displayText = `${property.distance_to_main_road}km to main road`;
    }
    
    return { hasRoadAccess, displayText };
  };

  const getSizeDisplay = (): string => {
    // Safe checks with defaults
    if (property.size_acres) {
      return `${property.size_acres} acre${property.size_acres !== 1 ? 's' : ''}`;
    }
    if (property.lot_size) {
      return property.lot_size;
    }
    if (property.plot_dimensions) {
      return property.plot_dimensions;
    }
    return 'Size not specified';
  };

  const getPriceDisplay = (): string => {
    const basePrice = formatPrice(property.price);
    
    if (property.price_per_unit) {
      return `${basePrice} (${property.price_per_unit})`;
    }
    
    if (property.is_negotiable) {
      return `${basePrice} (Negotiable)`;
    }
    
    return basePrice;
  };

  const isLandOnly = property.property_type === 'land';
  const statusLabel = getStatusLabel(property.status, property.property_type);
  const { hasWater, waterTypes, displayText: waterDisplay } = getWaterStatus();
  const { hasElectricity, displayText: electricityDisplay } = getElectricityStatus();
  const { hasRoadAccess, displayText: roadDisplay } = getRoadAccessStatus();

  const isListView = viewMode === 'list';

  return (
    <Link to={`/property/${property.id}`}>
      <Card className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full max-h-[85vh] group ${
        isListView ? 'flex-row' : ''
      } ${className}`}>
        {/* Improved Image Container */}
          <div className={`relative overflow-hidden ${
            isListView 
              ? 'w-64 aspect-video' 
              : 'w-full aspect-video'
          }`}>
            {imageLoading && !imageError && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f77f77]"></div>
              </div>
            )}
            <img
              src={imageError ? PLACEHOLDER_IMAGE : imageUrl}
              alt={property.title}
              className="w-full h-full object-cover transition-opacity duration-300"
              style={{ 
                objectPosition: 'center',
                imageRendering: imageError ? 'crisp-edges' : 'auto'
              }}
              loading="lazy"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />

          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              property.status === 'sold' || property.status === 'rented' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-[#f77f77] text-white'
            }`}>
              {statusLabel}
            </span>
          </div>
          
          {/* Favorite Button */}
          <button
            className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors duration-200 shadow-sm"
            onClick={handleFavoriteToggle}
            disabled={isLoading}
          >
            <Heart 
              className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>

          {/* Featured Badge */}
          {property.featured && (
            <div className="absolute bottom-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </div>
          )}

          {/* Land Type Badge for Land Properties */}
          {isLandOnly && property.land_type && (
            <div className="absolute bottom-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {getLandTypeLabel(property.land_type)}
            </div>
          )}
        </div>

        {/* Content Area with Flexible Growth */}
        <CardContent className={`flex-1 p-4 md:p-5 flex flex-col ${isListView ? 'justify-center' : ''}`}>
          {/* Price */}
          <div className="mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {getPriceDisplay()}
              {property.property_type === 'rental' && <span className="text-sm text-gray-600 font-normal">/month</span>}
            </h3>
          </div>

          {/* Title */}
          <h4 className={`font-medium text-gray-800 mb-2 ${
            isListView ? 'text-lg line-clamp-2' : 'text-lg line-clamp-1'
          }`}>
            {property.title}
          </h4>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className={`text-sm ${isListView ? 'line-clamp-2' : 'line-clamp-1'}`}>
              {property.city}, {property.state}
              {property.landmarks && ` • ${property.landmarks}`}
            </span>
          </div>

          {/* Land Utilities Section - Only show if we have land data */}
          {isLandOnly && (
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Water Status */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                hasWater ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <Droplets className="h-3 w-3" />
                <span>{waterDisplay}</span>
              </div>

              {/* Electricity Status */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                hasElectricity ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <Zap className="h-3 w-3" />
                <span>{electricityDisplay}</span>
              </div>

              {/* Road Access */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                hasRoadAccess ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <Car className="h-3 w-3" />
                <span>{roadDisplay}</span>
              </div>

              {/* Fencing - Only show if we have the data */}
              {property.is_fenced && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  <Fence className="h-3 w-3" />
                  <span>Fenced</span>
                </div>
              )}
            </div>
          )}

          {/* Property Details for non-land properties */}
          {!isLandOnly && property.bedrooms && property.bathrooms && (
            <div className={`grid grid-cols-3 gap-2 mb-4 py-2 border-y border-gray-100 ${
              isListView ? 'mb-4' : ''
            }`}>
              {property.bedrooms && (
                <div className="text-center">
                  <Bed className="w-4 h-4 mx-auto text-gray-500 mb-1" />
                  <span className="text-sm text-gray-700">{property.bedrooms} bed</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="text-center">
                  <Bath className="w-4 h-4 mx-auto text-gray-500 mb-1" />
                  <span className="text-sm text-gray-700">{property.bathrooms} bath</span>
                </div>
              )}
              {property.square_feet && (
                <div className="text-center">
                  <Square className="w-4 h-4 mx-auto text-gray-500 mb-1" />
                  <span className="text-sm text-gray-700">{property.square_feet.toLocaleString()} sqft</span>
                </div>
              )}
            </div>
          )}

          {/* Land Details */}
          {isLandOnly && (
            <div className="flex items-center justify-between text-sm text-gray-700 mb-4 py-2 border-y border-gray-100">
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4 text-gray-500" />
                <span>{getSizeDisplay()}</span>
              </div>
              
              {/* Plot Information - Only show if we have the data */}
              {property.num_plots_available && property.total_plots && (
                <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {property.num_plots_available}/{property.total_plots} plots available
                </div>
              )}
            </div>
          )}

          {/* Description (only in list view) */}
          {isListView && property.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
              {property.description}
            </p>
          )}

          {/* Property Type and Additional Info */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-600 uppercase tracking-wide">
              {getPropertyTypeLabel(property.property_type)}
              {isLandOnly && property.land_type && ` • ${getLandTypeLabel(property.land_type)}`}
            </span>
            
            {/* Title Deed Status for Land - Only show if we have the data */}
            {isLandOnly && property.title_deed_status && (
              <span className={`text-xs px-2 py-1 rounded ${
                property.title_deed_status === 'freehold' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {property.title_deed_status === 'freehold' ? 'Freehold' : 'Leasehold'}
              </span>
            )}
          </div>

          {/* CTA Button 
          <button className="w-full bg-[#f77f77] hover:bg-[#f56a6a] text-white py-2.5 px-4 rounded-lg transition-colors duration-200 font-medium text-sm mt-4">
            View Details
          </button> */}
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;