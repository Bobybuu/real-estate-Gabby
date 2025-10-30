import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Bed, Bath, Square, MapPin, Share2, Calendar, 
  HomeIcon, ChevronLeft, ChevronRight, Heart, Download,
  Ruler, Trees, Car, Wifi, Droplets, Zap, Shield, Utensils,
  School, ShoppingCart, Hospital, Map
} from 'lucide-react';
import { Facebook, Twitter, Mail, Instagram } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { Button } from '@/components/ui/button';
import { propertiesAPI } from '@/services/api';
import { Property, PropertyAmenity, LegalDocument, PropertyMedia } from '@/types/property';
import LoadingSpinner from '@/components/LoadingSpinner';
import PropertyLocationMap from '../components/PropertyLocationMap';

// Tab types
type TabType = 'overview' | 'details' | 'location' | 'media' | 'documents';

// Image optimization utility
const optimizeImageUrl = (url: string, width: number = 1200, quality: number = 85): string => {
  if (!url || url.includes('placeholder')) return url;
  
  // If using a CDN that supports image transformations
  if (url.includes('cloudinary')) {
    return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
  }
  
  if (url.includes('imgix')) {
    return `${url}?w=${width}&q=${quality}&auto=format&fit=crop`;
  }
  
  // For local images, return as is (consider implementing image optimization on backend)
  return url;
};

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: number]: boolean}>({});
  const [imageErrorStates, setImageErrorStates] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    setLoading(true);
    setError(null);
    try {
      const propertyId = parseInt(id!);
      const propertyData = await propertiesAPI.getById(propertyId);
      setProperty(propertyData);
      setIsFavorite(propertyData.is_favorited || false);
      
      // Initialize image loading states
      const images = propertyData.images || [];
      const loadingStates: {[key: number]: boolean} = {};
      images.forEach((_, index) => {
        loadingStates[index] = true;
      });
      setImageLoadingStates(loadingStates);
      
      // Increment view count
      await propertiesAPI.incrementPropertyViews(propertyId);
    } catch (err: any) {
      setError(err.message || 'Failed to load property');
      console.error('Failed to load property:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!property) return;
    
    try {
      await propertiesAPI.toggleFavorite(property.id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const formatPrice = (price: string): string => {
    const numericPrice = parseFloat(price);
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(numericPrice);
  };

  const getImageUrl = (imagePath: string, size: 'large' | 'medium' | 'small' = 'large'): string => {
    if (!imagePath) return '/placeholder-property.jpg';
    
    // Define sizes for different use cases
    const sizes = {
      large: 1200,   // Main gallery
      medium: 600,   // Thumbnails
      small: 300     // Gallery grid
    };
    
    if (imagePath.startsWith('http')) {
      return optimizeImageUrl(imagePath, sizes[size]);
    }
    
    const baseUrl = 'http://localhost:8000';
    const fullUrl = `${baseUrl}${imagePath}`;
    return optimizeImageUrl(fullUrl, sizes[size]);
  };

  const handleImageLoad = (index: number) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const handleImageError = (index: number) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [index]: false
    }));
    setImageErrorStates(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'email' | 'whatsapp') => {
    const url = window.location.href;
    const text = `Check out this property: ${property?.title}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
        break;
    }
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

  const getStatusLabel = (status: Property['status'], propertyType: Property['property_type']): string => {
    if (propertyType === 'rental') return 'For Rent';
    if (propertyType === 'sale') return 'For Sale';
    if (status === 'rented') return 'Rented';
    if (status === 'sold') return 'Sold';
    return 'Available';
  };

  const getAmenityIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      utilities: Zap,
      accessibility: Car,
      surroundings: Trees,
      characteristics: Ruler,
      security: Shield,
      community: Utensils,
    };
    return iconMap[category] || HomeIcon;
  };

  const getLandAmenities = () => {
    if (!property?.amenities) return [];
    
    const categories: Record<string, PropertyAmenity[]> = {};
    
    property.amenities.forEach(amenity => {
      const category = amenity.amenity.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(amenity);
    });
    
    return categories;
  };

  // Render different content based on active tab
  const renderTabContent = () => {
    if (!property) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Property Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.has_subdivision_approval && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>Subdivision Approval</span>
                  </div>
                )}
                {property.has_beacons && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>Boundary Beacons</span>
                  </div>
                )}
                {property.is_fenced && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <span>Fenced Perimeter</span>
                  </div>
                )}
                {property.is_gated_community && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <span>Gated Community</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'details':
        const amenitiesByCategory = getLandAmenities();
        
        return (
          <div className="space-y-8">
            {/* Land Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {property.size_acres && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <Ruler className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Land Size</h4>
                  <p className="text-2xl font-bold text-gray-900">{property.size_acres} acres</p>
                  {property.plot_dimensions && (
                    <p className="text-sm text-gray-600">{property.plot_dimensions}</p>
                  )}
                </div>
              )}

              {property.topography && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <Trees className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Topography</h4>
                  <p className="text-lg text-gray-900 capitalize">{property.topography}</p>
                </div>
              )}

              {property.soil_type && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="h-8 w-8 bg-yellow-500 rounded-full mb-2 flex items-center justify-center">
                    <span className="text-white text-xs">Soil</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Soil Type</h4>
                  <p className="text-lg text-gray-900 capitalize">{property.soil_type}</p>
                </div>
              )}

              {property.title_deed_status && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <Shield className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Title Deed</h4>
                  <p className="text-lg text-gray-900 capitalize">
                    {property.title_deed_status.replace('_', ' ')}
                  </p>
                </div>
              )}

              {property.zoning && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <Map className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Zoning</h4>
                  <p className="text-lg text-gray-900">{property.zoning}</p>
                </div>
              )}

              {property.distance_to_main_road && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <Car className="h-8 w-8 text-gray-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Distance to Main Road</h4>
                  <p className="text-lg text-gray-900">{property.distance_to_main_road} km</p>
                </div>
              )}
            </div>

            {/* Amenities by Category */}
            {Object.entries(amenitiesByCategory).map(([category, amenities]) => {
              const IconComponent = getAmenityIcon(category);
              return (
                <div key={category} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900 capitalize">
                      {category.replace('_', ' ')}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center gap-3">
                        <span className="text-lg">{amenity.amenity.icon_code}</span>
                        <div>
                          <p className="font-medium text-gray-900">{amenity.amenity.name}</p>
                          {amenity.details && (
                            <p className="text-sm text-gray-600">{amenity.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            {/* Map Container */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4">Location Map</h3>
              <div className="h-96 rounded-lg overflow-hidden">
                {property.latitude && property.longitude ? (
                  <PropertyLocationMap 
                    latitude={property.latitude}
                    longitude={property.longitude}
                    propertyTitle={property.title || 'Property Location'}
                  />
                ) : (
                  <div className="h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Location data not available</p>
                    </div>
                  </div>
                )}
              </div>
              {property.latitude && property.longitude && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Coordinates: {property.latitude}, {property.longitude}
                </p>
              )}
            </div>

            {/* Nearby Amenities */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4">Nearby Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <School className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium">Schools</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <ShoppingCart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">Shops</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Hospital className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="font-medium">Hospitals</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Car className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium">Roads</p>
                </div>
              </div>
            </div>

            {/* Landmarks */}
            {property.landmarks && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-4">Nearby Landmarks</h3>
                <div className="space-y-2">
                  {property.landmarks.split(',').map((landmark, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{landmark.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'media':
        return (
          <div className="space-y-6">
            {/* Video Tours */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4">Video Tours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Placeholder for video integration */}
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-12 w-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white text-lg">▶</span>
                    </div>
                    <p className="text-gray-600">Video Tour</p>
                  </div>
                </div>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Instagram className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <p className="text-gray-600">Instagram Reel</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Images */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {property.images?.map((image, index) => (
                  <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {imageLoadingStates[index] && (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    <img
                      src={imageErrorStates[index] ? '/placeholder-property.jpg' : getImageUrl(image.image, 'small')}
                      alt={`Property view ${index + 1}`}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoadingStates[index] ? 'opacity-0' : 'opacity-100'
                      }`}
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4">Property Documents</h3>
              <div className="space-y-4">
                {property.documents?.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {doc.document_type.replace('_', ' ')}
                        </p>
                        {doc.description && (
                          <p className="text-sm text-gray-600">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
                {(!property.documents || property.documents.length === 0) && (
                  <p className="text-gray-600 text-center py-8">No documents available</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading property details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The property you are looking for does not exist.'}</p>
            <Button asChild variant="hero">
              <Link to="/buy">Browse Properties</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isLandOnly = property.property_type === 'land';
  const images = property.images || [];
  const primaryImage = property.primary_image || images[0];
  const displayImages = primaryImage ? [primaryImage, ...images.filter(img => img.id !== primaryImage.id)] : images;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1">
        {/* Back Button */}
        <section className="bg-gray-50 py-4 border-b">
          <div className="container mx-auto px-4">
            <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Link to="/buy">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Listings
              </Link>
            </Button>
          </div>
        </section>

        {/* Property Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Image Gallery with Slider */}
                <div className="mb-8">
                  <div className="relative rounded-xl overflow-hidden mb-4 bg-gray-100 group aspect-[4/3]">
                    {displayImages.length > 0 ? (
                      <>
                        {imageLoadingStates[selectedImage] && (
                          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        <img
                          src={imageErrorStates[selectedImage] ? '/placeholder-property.jpg' : getImageUrl(displayImages[selectedImage]?.image, 'large')}
                          alt={property.title}
                          className={`w-full h-full object-contain transition-opacity duration-300 ${
                            imageLoadingStates[selectedImage] ? 'opacity-0' : 'opacity-100'
                          }`}
                          onLoad={() => handleImageLoad(selectedImage)}
                          onError={() => handleImageError(selectedImage)}
                          style={{ 
                            imageRendering: '-webkit-optimize-contrast'
                          }}
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">No Image Available</span>
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white z-20"
                      onClick={handleFavoriteToggle}
                    >
                      <Heart 
                        className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                      />
                    </Button>

                    {/* Navigation Buttons */}
                    {displayImages.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm z-20"
                          onClick={() => setSelectedImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm z-20"
                          onClick={() => setSelectedImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium z-20">
                          {selectedImage + 1} / {displayImages.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Navigation */}
                  {displayImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {displayImages.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImage(index)}
                          className={`relative rounded-lg overflow-hidden bg-gray-100 aspect-square transition-all ${
                            selectedImage === index ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          {imageLoadingStates[index] && (
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          )}
                          <img 
                            src={imageErrorStates[index] ? '/placeholder-property.jpg' : getImageUrl(image.image, 'medium')} 
                            alt={`View ${index + 1}`} 
                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                              imageLoadingStates[index] ? 'opacity-0' : 'opacity-100'
                            }`}
                            onLoad={() => handleImageLoad(index)}
                            onError={() => handleImageError(index)}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Property Header */}
                <div className="mb-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          property.status === 'sold' || property.status === 'rented' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getStatusLabel(property.status, property.property_type)}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {getPropertyTypeLabel(property.property_type)}
                        </span>
                        {property.featured && (
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                            Featured
                          </span>
                        )}
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <MapPin className="h-5 w-5" />
                        <span>
                          {property.address}, {property.city}, {property.state} {property.zip_code}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleShare('whatsapp')}>
                        <span className="text-green-600">💬</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleShare('email')}>
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-4xl font-bold text-blue-600 mb-6">
                    {formatPrice(property.price)}
                    {property.property_type === 'rental' && <span className="text-lg text-gray-600">/month</span>}
                    {property.price_per_unit && (
                      <span className="text-lg text-gray-600 ml-2">{property.price_per_unit}</span>
                    )}
                  </div>

                  {/* Property Stats */}
                  <div className="flex flex-wrap gap-6 mb-6 p-6 bg-gray-50 rounded-xl">
                    {!isLandOnly && property.bedrooms && (
                      <div className="flex items-center gap-3">
                        <Bed className="h-6 w-6 text-blue-600" />
                        <div>
                          <div className="text-2xl font-semibold text-gray-900">{property.bedrooms}</div>
                          <div className="text-sm text-gray-600">Bedrooms</div>
                        </div>
                      </div>
                    )}
                    {!isLandOnly && property.bathrooms && (
                      <div className="flex items-center gap-3">
                        <Bath className="h-6 w-6 text-blue-600" />
                        <div>
                          <div className="text-2xl font-semibold text-gray-900">{property.bathrooms}</div>
                          <div className="text-sm text-gray-600">Bathrooms</div>
                        </div>
                      </div>
                    )}
                    {!isLandOnly && property.square_feet && (
                      <div className="flex items-center gap-3">
                        <Square className="h-6 w-6 text-blue-600" />
                        <div>
                          <div className="text-2xl font-semibold text-gray-900">
                            {property.square_feet.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Square Feet</div>
                        </div>
                      </div>
                    )}
                    {isLandOnly && property.size_acres && (
                      <div className="flex items-center gap-3">
                        <Ruler className="h-6 w-6 text-green-600" />
                        <div>
                          <div className="text-2xl font-semibold text-gray-900">{property.size_acres}</div>
                          <div className="text-sm text-gray-600">Acres</div>
                        </div>
                      </div>
                    )}
                    {property.year_built && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-orange-600" />
                        <div>
                          <div className="text-2xl font-semibold text-gray-900">{property.year_built}</div>
                          <div className="text-sm text-gray-600">Year Built</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-8">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'details', label: 'Details & Features' },
                      { id: 'location', label: 'Location' },
                      { id: 'media', label: 'Media' },
                      { id: 'documents', label: 'Documents' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="mb-8">
                  {renderTabContent()}
                </div>

                {/* Share Section */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Share This Property</h3>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => handleShare('facebook')}>
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare('twitter')}>
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare('whatsapp')}>
                      <span className="mr-2">💬</span>
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contact Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Interested in this property?</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Fill out the form below and we'll get in touch with you shortly.
                  </p>
                  <ContactForm propertyId={property.id.toString()} formType="inquiry" />
                  
                  {/* Quick Actions */}
                  <div className="mt-6 space-y-3">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      💬 WhatsApp Agent
                    </Button>
                    <Button variant="outline" className="w-full">
                      📞 Call Agent
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetails;