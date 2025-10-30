import { useState, useEffect, useCallback } from 'react';
import { propertiesAPI, amenitiesAPI, mediaAPI, documentsAPI, contactAPI } from '@/services/api';
import { 
  Property, 
  PropertyFilters, 
  PaginatedResponse, 
  PropertyMedia,
  Amenity,
  PropertyAmenity,
  LegalDocument,
  PropertyContact,
  PropertyStats,
  PropertySearchParams,
  AmenityCategory 
} from '@/types/property';

// Base hooks return interfaces
interface UsePropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseFeaturedPropertiesReturn {
  featuredProperties: Property[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Extended hooks for land listings
interface UsePropertyDetailsReturn {
  property: Property | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UsePropertyMediaReturn {
  media: PropertyMedia[];
  loading: boolean;
  error: string | null;
  uploadMedia: (files: File[], mediaData: any) => Promise<void>;
  deleteMedia: (mediaId: number) => Promise<void>;
  setPrimaryMedia: (mediaId: number) => Promise<void>;
}

interface UsePropertyAmenitiesReturn {
  amenities: PropertyAmenity[];
  categories: AmenityCategory[];
  loading: boolean;
  error: string | null;
  updateAmenities: (amenities: any[]) => Promise<void>;
  refetch: () => void;
}

interface UsePropertyDocumentsReturn {
  documents: LegalDocument[];
  loading: boolean;
  error: string | null;
  uploadDocument: (file: File, documentData: any) => Promise<void>;
  deleteDocument: (documentId: number) => Promise<void>;
  refetch: () => void;
}

interface UsePropertyContactReturn {
  contact: PropertyContact | null;
  loading: boolean;
  error: string | null;
  updateContact: (contactData: Partial<PropertyContact>) => Promise<void>;
  refetch: () => void;
}

interface UsePropertyStatsReturn {
  stats: PropertyStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseMapPropertiesReturn {
  mapProperties: Property[];
  loading: boolean;
  error: string | null;
  refetch: (filters?: PropertyFilters) => void;
}

// ===== EXISTING HOOKS (Enhanced) =====

export const useProperties = (filters: PropertyFilters = {}): UsePropertiesReturn => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getAll(filters);
      
      let propertiesArray: Property[] = [];
      
      if (response && 'results' in response) {
        propertiesArray = response.results;
      } else if (Array.isArray(response)) {
        propertiesArray = response;
      }
      
      // Enhance properties with land-specific computed properties
      const enhancedProperties = propertiesArray.map(property => ({
        ...property,
        is_land_property: property.property_type === 'land',
        price_display: property.price_per_unit 
          ? `${property.price} (${property.price_per_unit})`
          : property.price,
        location_display: `${property.city}, ${property.state}`,
        size_display: property.size_acres 
          ? `${property.size_acres} acres` 
          : property.lot_size || 'Size not specified'
      }));
      
      setProperties(enhancedProperties);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, error, refetch: fetchProperties };
};

export const useFeaturedProperties = (): UseFeaturedPropertiesReturn => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProperties = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getFeatured();
      
      let propertiesArray: Property[] = [];
      
      if (response && 'results' in response) {
        propertiesArray = response.results;
      } else if (Array.isArray(response)) {
        propertiesArray = response;
      }
      
      setFeaturedProperties(propertiesArray);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch featured properties');
      console.error('Error fetching featured properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  return { featuredProperties, loading, error, refetch: fetchFeaturedProperties };
};

// ===== NEW HOOKS FOR LAND LISTINGS =====

export const usePropertyDetails = (propertyId: number): UsePropertyDetailsReturn => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPropertyDetails = useCallback(async (): Promise<void> => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const propertyData = await propertiesAPI.getById(propertyId);
      
      // Increment views when property details are fetched
      await propertiesAPI.incrementPropertyViews(propertyId);
      
      setProperty(propertyData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch property details');
      console.error('Error fetching property details:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchPropertyDetails();
  }, [fetchPropertyDetails]);

  return { property, loading, error, refetch: fetchPropertyDetails };
};

export const usePropertyMedia = (propertyId: number): UsePropertyMediaReturn => {
  const [media, setMedia] = useState<PropertyMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async (): Promise<void> => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const mediaData = await mediaAPI.getPropertyMedia(propertyId);
      setMedia(mediaData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch property media');
      console.error('Error fetching property media:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const uploadMedia = async (files: File[], mediaData: any): Promise<void> => {
    try {
      await mediaAPI.uploadPropertyMedia(propertyId, files, mediaData);
      await fetchMedia(); // Refresh media list
    } catch (err: any) {
      throw new Error(err.message || 'Failed to upload media');
    }
  };

  const deleteMedia = async (mediaId: number): Promise<void> => {
    try {
      await mediaAPI.deletePropertyMedia(mediaId);
      setMedia(prev => prev.filter(item => item.id !== mediaId));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete media');
    }
  };

  const setPrimaryMedia = async (mediaId: number): Promise<void> => {
    try {
      await mediaAPI.setPrimaryMedia(mediaId);
      await fetchMedia(); // Refresh to update primary status
    } catch (err: any) {
      throw new Error(err.message || 'Failed to set primary media');
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return { media, loading, error, uploadMedia, deleteMedia, setPrimaryMedia };
};

export const usePropertyAmenities = (propertyId: number): UsePropertyAmenitiesReturn => {
  const [amenities, setAmenities] = useState<PropertyAmenity[]>([]);
  const [categories, setCategories] = useState<AmenityCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const [amenitiesData, categoriesData] = await Promise.all([
        amenitiesAPI.getPropertyAmenities(propertyId),
        amenitiesAPI.getCategories()
      ]);
      
      setAmenities(amenitiesData);
      setCategories(categoriesData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch property amenities');
      console.error('Error fetching property amenities:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const updateAmenities = async (amenityUpdates: any[]): Promise<void> => {
    try {
      await amenitiesAPI.updatePropertyAmenities(propertyId, amenityUpdates);
      await fetchData(); // Refresh amenities
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update amenities');
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { amenities, categories, loading, error, updateAmenities, refetch: fetchData };
};

export const usePropertyDocuments = (propertyId: number): UsePropertyDocumentsReturn => {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (): Promise<void> => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const documentsData = await documentsAPI.getPropertyDocuments(propertyId);
      setDocuments(documentsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch property documents');
      console.error('Error fetching property documents:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const uploadDocument = async (file: File, documentData: any): Promise<void> => {
    try {
      await documentsAPI.uploadPropertyDocument(propertyId, file, documentData);
      await fetchDocuments(); // Refresh documents list
    } catch (err: any) {
      throw new Error(err.message || 'Failed to upload document');
    }
  };

  const deleteDocument = async (documentId: number): Promise<void> => {
    try {
      await documentsAPI.deletePropertyDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete document');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, error, uploadDocument, deleteDocument, refetch: fetchDocuments };
};

export const usePropertyContact = (propertyId: number): UsePropertyContactReturn => {
  const [contact, setContact] = useState<PropertyContact | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContact = useCallback(async (): Promise<void> => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const contactData = await contactAPI.getPropertyContact(propertyId);
      setContact(contactData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch property contact');
      console.error('Error fetching property contact:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const updateContact = async (contactData: Partial<PropertyContact>): Promise<void> => {
    try {
      const updatedContact = await contactAPI.updatePropertyContact(propertyId, contactData);
      setContact(updatedContact);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update contact');
    }
  };

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  return { contact, loading, error, updateContact, refetch: fetchContact };
};

export const usePropertyStats = (): UsePropertyStatsReturn => {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const statsData = await propertiesAPI.getPropertyStats();
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch property stats');
      console.error('Error fetching property stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const useMapProperties = (initialFilters: PropertyFilters = {}): UseMapPropertiesReturn => {
  const [mapProperties, setMapProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMapProperties = useCallback(async (filters: PropertyFilters = {}): Promise<void> => {
    try {
      setLoading(true);
      const propertiesData = await propertiesAPI.getMapProperties(filters);
      setMapProperties(propertiesData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch map properties');
      console.error('Error fetching map properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMapProperties(initialFilters);
  }, [fetchMapProperties, JSON.stringify(initialFilters)]);

  return { 
    mapProperties, 
    loading, 
    error, 
    refetch: (filters?: PropertyFilters) => fetchMapProperties(filters || initialFilters)
  };
};

// ===== ADVANCED SEARCH HOOK =====

export const useAdvancedSearch = (searchParams: PropertySearchParams = {}) => {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: PropertySearchParams = {}): Promise<void> => {
    try {
      setLoading(true);
      const response = await propertiesAPI.searchAdvanced({ ...searchParams, ...params });
      
      let propertiesArray: Property[] = [];
      
      if (response && 'results' in response) {
        propertiesArray = response.results;
      } else if (Array.isArray(response)) {
        propertiesArray = response;
      }
      
      setResults(propertiesArray);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      console.error('Error performing advanced search:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(searchParams)]);

  return { results, loading, error, search };
};