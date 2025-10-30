// services/api.ts
import { 
  Property, 
  PropertyFilters, 
  Favorite, 
  Inquiry, 
  SavedSearch, 
  PaginatedResponse,
  PropertyMedia,
  Amenity,
  PropertyAmenity,
  LegalDocument,
  PropertyContact,
  PropertyStats,
  DashboardStats,
  PropertySearchParams,
  PropertyCategories,
  AmenityCategory,
  PropertyData
} from '@/types/property';

export type { PropertyData } from '@/types/property';
// Environment-based configuration
const getApiBaseUrl = (): string => {
  const isProduction = import.meta.env.MODE === 'production';

  if (isProduction) {
    return import.meta.env.VITE_API_URL || 'https://api.pristineprimier.com/api';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
};

const getMediaBaseUrl = (): string => {
  const isProduction = import.meta.env.MODE === 'production';

  if (isProduction) {
    return import.meta.env.VITE_MEDIA_URL || 'https://api.pristineprimier.com';
  }
  return import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();
export const MEDIA_BASE_URL = getMediaBaseUrl();

// EXACT SAME Image URL helper function - FIXED to handle double media issue
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    return PLACEHOLDER_IMAGE;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Remove leading slash
  let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Handle the double media prefix issue
  // If path already starts with 'media/', remove it to avoid duplication
  if (cleanPath.startsWith('media/')) {
    // Remove the 'media/' prefix since we'll add it back
    cleanPath = cleanPath.replace(/^media\//, '');
  }
  
  // Construct the final URL with single media prefix
  return `${MEDIA_BASE_URL}/media/${cleanPath}`;
};

// EXACT SAME Placeholder image as data URL to avoid 404
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5YzljOWMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

// Enhanced API request function with better auth handling
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Ensure endpoint starts with slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${formattedEndpoint}`;
  
  const csrfToken = await getCsrfToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRFToken': csrfToken }),
      ...options.headers,
    },
    credentials: 'include', // This is crucial for session authentication
    ...options,
  };

  try {
    console.log(`🔄 API Request: ${url}`, config);
    const response = await fetch(url, config);
    
    if (response.status === 403 || response.status === 401) {
      // Clear any invalid auth state
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      throw new Error('Authentication required. Please log in again.');
    }
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ API Request failed for ${url}:`, error);
    throw error;
  }
}

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
      
      // Handle specific Django REST framework error formats
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (typeof errorData === 'object') {
        // Handle field-specific errors
        const fieldErrors = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        if (fieldErrors) {
          errorMessage = fieldErrors;
        }
      }
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  // For 204 No Content responses
  if (response.status === 204) {
    return {};
  }
  
  try {
    return await response.json();
  } catch {
    return { message: 'Success' };
  }
}

// Get CSRF token from cookie
function getCsrfTokenFromCookie(): string | null {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];
  return cookieValue || null;
}

// Get CSRF token with better error handling
export async function getCsrfToken(): Promise<string> {
  // Try to get from cookie first
  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) {
    return cookieToken;
  }

  // If no cookie token, try to fetch from API
  try {
    const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.csrfToken || data.csrf_token || '';
    }
  } catch (error) {
    console.warn('Failed to get CSRF token from API:', error);
  }
  
  return '';
}

// Get primary image URL for a property - enhanced version
export const getPrimaryImageUrl = (property: Property): string => {
  console.log('🔍 Getting primary image for property:', {
    id: property.id,
    title: property.title,
    primary_image: property.primary_image,
    images: property.images,
  });

  // Try primary_image field first - handle both string and PropertyImage types
  if (property.primary_image) {
    if (typeof property.primary_image === 'string') {
      console.log('📸 Using primary_image as string:', property.primary_image);
      return getImageUrl(property.primary_image);
    } else if (property.primary_image && typeof property.primary_image === 'object' && 'image' in property.primary_image) {
      console.log('📸 Using primary_image.image:', property.primary_image.image);
      return getImageUrl(property.primary_image.image);
    }
  }

  // Try images array - find primary image
  if (property.images && property.images.length > 0) {
    const primaryImage = property.images.find(img => img.is_primary) || property.images[0];
    console.log('🖼️ Using images array - primary image:', primaryImage);
    return getImageUrl(primaryImage.image);
  }

  // No images available
  console.log('❌ No images found for property:', property.id);
  return PLACEHOLDER_IMAGE;
};

// WhatsApp link generator
export const generateWhatsAppLink = (phone: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};

// ===== AUTH API FUNCTIONS =====
export const authAPI = {
  async login(credentials: { username: string; password: string }) {
    return apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    user_type: string;
    phone_number: string;
    password_confirm?: string;
  }) {
    const registrationData = {
      ...userData,
      password_confirm: userData.password_confirm || userData.password,
    };
    
    console.log('📝 Registration data:', registrationData);
    return apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },

  async logout() {
    return apiRequest('/auth/logout/', {
      method: 'POST',
    });
  },

  async getCurrentUser() {
    return apiRequest('/auth/me/');
  },

  async submitSellerApplication(applicationData: any) {
    return apiRequest('/auth/seller/apply/', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },
};

// ===== DASHBOARD API FUNCTIONS =====
export const dashboardAPI = {
  async getOverview() {
    return apiRequest('/auth/dashboard/overview/');
  },

  async getQuickStats() {
    return apiRequest('/auth/dashboard/quick-stats/');
  },

  async getProfile() {
    return apiRequest('/auth/dashboard/profile/');
  },

  async getActivities() {
    return apiRequest('/auth/dashboard/activities/');
  },

  async getSavedSearches() {
    return apiRequest('/auth/dashboard/saved-searches/');
  },

  // NEW: Dashboard stats for land listings
  async getDashboardStats(): Promise<DashboardStats> {
    return apiRequest('/dashboard/stats/');
  },
};

// ===== ENHANCED PROPERTIES API =====
export const propertiesAPI = {
  // Basic CRUD operations
  async getAll(filters: PropertyFilters = {}): Promise<PaginatedResponse<Property>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return apiRequest(`/properties/?${params.toString()}`);
  },

  async getFeatured(): Promise<PaginatedResponse<Property>> {
    return apiRequest('/properties/?featured=true&limit=6');
  },

  async getById(id: number): Promise<Property> {
    return apiRequest(`/properties/${id}/`);
  },

  async create(propertyData: PropertyData): Promise<Property> {
    console.log('Creating property with data:', propertyData);
    
    // Try multiple endpoints for compatibility
    const endpoints = [
      '/properties/',  // Standard DRF ViewSet endpoint
      '/properties/create/',  // Custom endpoint
      '/create/',  // Simple endpoint
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const result = await apiRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(propertyData),
        });
        console.log(`Success with endpoint: ${endpoint}`);
        return result;
      } catch (error: any) {
        console.log(`Endpoint ${endpoint} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('All property creation endpoints failed.');
  },

  async update(id: number, propertyData: Partial<Property>): Promise<Property> {
    return apiRequest(`/properties/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(propertyData),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest(`/properties/${id}/`, {
      method: 'DELETE',
    });
  },

  // Favorites
  async toggleFavorite(propertyId: number): Promise<{status: string}> {
    return apiRequest(`/properties/${propertyId}/favorite/`, {
      method: 'POST',
    });
  },

  async getFavorites(): Promise<Favorite[]> {
    return apiRequest('/properties/my_favorites/');
  },

  async getMyProperties(): Promise<Property[]> {
    return apiRequest('/properties/my_properties/');
  },

  // NEW: Advanced Search & Filtering
  async searchAdvanced(params: PropertySearchParams): Promise<PaginatedResponse<Property>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    
    return apiRequest(`/properties/search/advanced/?${queryParams.toString()}`);
  },

  async getMapProperties(filters?: PropertyFilters): Promise<Property[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/properties/map/data/?${queryParams.toString()}`
      : '/properties/map/data/';
      
    return apiRequest(endpoint);
  },

  // NEW: Property Analytics
  async getPropertyStats(): Promise<PropertyStats> {
    return apiRequest('/properties/stats/overview/');
  },

  // NEW: Property Actions
  async getSimilarProperties(propertyId: number): Promise<Property[]> {
    return apiRequest(`/properties/${propertyId}/similar/`);
  },

  async createPropertyInquiry(propertyId: number, inquiryData: {
    name: string;
    email: string;
    phone: string;
    message: string;
    inquiry_type?: string;
    preferred_date?: string;
    budget_range?: string;
  }): Promise<Inquiry> {
    return apiRequest(`/properties/${propertyId}/inquire/`, {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  },

  async incrementPropertyViews(propertyId: number): Promise<{views_count: number}> {
    return apiRequest(`/properties/${propertyId}/increment-views/`, {
      method: 'GET',
    });
  },

  // NEW: User-specific endpoints
  async getMyFavoritesList(): Promise<Property[]> {
    return apiRequest('/my-properties/favorites/');
  },

  async getMyPropertiesList(): Promise<Property[]> {
    return apiRequest('/my-properties/owned/');
  },

  // Map-specific endpoints
  async getPropertiesForMapView(filters: PropertyFilters): Promise<Property[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return apiRequest(`/properties/map-view/?${params.toString()}`);
  },

  async getPropertyMapDetails(propertyId: number): Promise<{
    coordinates: { lat: number; lng: number };
    nearby_landmarks: Array<{ name: string; distance: number; type: string }>;
  }> {
    return apiRequest(`/properties/${propertyId}/map-details/`);
  },

  // Enhanced property fetching with images
  async getPropertyWithImages(id: number): Promise<Property> {
    try {
      // First get the property
      const property = await propertiesAPI.getById(id);
      
      // Then try to get images if they're not included
      if (!property.images || property.images.length === 0) {
        try {
          const images = await propertiesAPI.getPropertyImages(id);
          property.images = images;
        } catch (error) {
          console.warn('Could not fetch additional images for property:', id);
        }
      }
      
      return property;
    } catch (error) {
      console.error('Error fetching property with images:', error);
      throw error;
    }
  },

  // IMAGE-SPECIFIC ENDPOINTS
  async getPropertyImages(propertyId: number): Promise<any[]> {
    return apiRequest(`/properties/${propertyId}/images/`);
  },

  async uploadImages(propertyId: number, images: File[], captions: string[] = [], isPrimary: boolean[] = []) {
    console.log(`Uploading ${images.length} images for property ${propertyId}`);
    
    const formData = new FormData();
    const csrfToken = await getCsrfToken();
    
    images.forEach((image, index) => {
      formData.append('images', image);
      formData.append(`image_captions[${index}]`, captions[index] || '');
      formData.append(`image_is_primary[${index}]`, (isPrimary[index] || index === 0).toString());
    });

    const headers: HeadersInit = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/upload_images/`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image upload failed: ${response.status}, ${errorText}`);
      }

      const result = await response.json();
      console.log('Image upload successful:', result);
      return result;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },

  async setPrimaryImage(propertyId: number, imageId: number): Promise<void> {
    return apiRequest(`/properties/${propertyId}/images/${imageId}/set_primary/`, {
      method: 'POST',
    });
  },

  async deleteImage(propertyId: number, imageId: number): Promise<void> {
    return apiRequest(`/properties/${propertyId}/images/${imageId}/`, {
      method: 'DELETE',
    });
  },

  async updateImageCaption(propertyId: number, imageId: number, caption: string): Promise<any> {
    return apiRequest(`/properties/${propertyId}/images/${imageId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ caption }),
    });
  }
};

// ===== AMENITIES API =====
export const amenitiesAPI = {
  async getAll(): Promise<Amenity[]> {
    return apiRequest('/amenities/');
  },

  async getCategories(): Promise<AmenityCategory[]> {
    return apiRequest('/amenities/categories/grouped/');
  },

  async getPropertyAmenities(propertyId: number): Promise<PropertyAmenity[]> {
    return apiRequest(`/properties/${propertyId}/amenities/`);
  },

  async updatePropertyAmenities(propertyId: number, amenities: {
    amenity_id: number;
    availability: string;
    details?: string;
  }[]): Promise<PropertyAmenity[]> {
    return apiRequest(`/properties/${propertyId}/amenities/`, {
      method: 'PUT',
      body: JSON.stringify({ amenity_ids: amenities }),
    });
  },
};

// ===== MEDIA API =====
export const mediaAPI = {
  async getPropertyMedia(propertyId: number): Promise<PropertyMedia[]> {
    return apiRequest(`/properties/${propertyId}/media/`);
  },

  async uploadPropertyMedia(
    propertyId: number, 
    files: File[], 
    mediaData: {
      media_types: string[];
      captions?: string[];
      is_primary?: boolean[];
      display_order?: number[];
    }
  ): Promise<PropertyMedia[]> {
    const formData = new FormData();
    const csrfToken = await getCsrfToken();
    
    files.forEach((file, index) => {
      formData.append('media_files', file);
      formData.append(`media_types[${index}]`, mediaData.media_types[index] || 'image');
      formData.append(`captions[${index}]`, mediaData.captions?.[index] || '');
      formData.append(`is_primary[${index}]`, (mediaData.is_primary?.[index] || false).toString());
      formData.append(`display_order[${index}]`, (mediaData.display_order?.[index] || index).toString());
    });

    const headers: HeadersInit = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/property-media/`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    return await handleResponse(response);
  },

  async deletePropertyMedia(mediaId: number): Promise<void> {
    return apiRequest(`/property-media/${mediaId}/`, {
      method: 'DELETE',
    });
  },

  async setPrimaryMedia(mediaId: number): Promise<void> {
    return apiRequest(`/property-media/${mediaId}/set_primary/`, {
      method: 'POST',
    });
  },

  // Social media video upload
  async uploadSocialMediaVideo(
    propertyId: number,
    videoData: {
      video_url: string;
      platform: 'youtube' | 'tiktok' | 'instagram';
      caption?: string;
    }
  ): Promise<PropertyMedia> {
    return apiRequest(`/properties/${propertyId}/social-media/`, {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  },

  // Interactive site plan upload
  async uploadInteractiveSitePlan(
    propertyId: number,
    file: File,
    interactiveData: {
      plot_data: Array<{ plot_number: string; size: string; status: string }>;
    }
  ): Promise<PropertyMedia> {
    const formData = new FormData();
    const csrfToken = await getCsrfToken();
    
    formData.append('file', file);
    formData.append('property', propertyId.toString());
    formData.append('media_type', 'interactive_site_plan');
    formData.append('interactive_data', JSON.stringify(interactiveData.plot_data));

    const headers: HeadersInit = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/property-media/interactive-site-plan/`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    return await handleResponse(response);
  },
};

// ===== LEGAL DOCUMENTS API =====
export const documentsAPI = {
  async getPropertyDocuments(propertyId: number): Promise<LegalDocument[]> {
    return apiRequest(`/properties/${propertyId}/documents/`);
  },

  async uploadPropertyDocument(
    propertyId: number,
    file: File,
    documentData: {
      document_type: string;
      description?: string;
    }
  ): Promise<LegalDocument> {
    const formData = new FormData();
    const csrfToken = await getCsrfToken();
    
    formData.append('file', file);
    formData.append('property', propertyId.toString());
    formData.append('document_type', documentData.document_type);
    if (documentData.description) {
      formData.append('description', documentData.description);
    }

    const headers: HeadersInit = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/legal-documents/`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    return await handleResponse(response);
  },

  async deletePropertyDocument(documentId: number): Promise<void> {
    return apiRequest(`/legal-documents/${documentId}/`, {
      method: 'DELETE',
    });
  },
};

// ===== PROPERTY CONTACT API =====
export const contactAPI = {
  async getPropertyContact(propertyId: number): Promise<PropertyContact> {
    return apiRequest(`/properties/${propertyId}/contact/`);
  },

  async updatePropertyContact(propertyId: number, contactData: Partial<PropertyContact>): Promise<PropertyContact> {
    return apiRequest(`/properties/${propertyId}/contact/`, {
      method: 'PATCH',
      body: JSON.stringify(contactData),
    });
  },
};

// ===== INQUIRIES API =====
export const inquiriesAPI = {
  async create(inquiryData: Omit<Inquiry, 'id' | 'created_at' | 'property_title'>): Promise<Inquiry> {
    return apiRequest('/inquiries/', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  },

  async getAll(): Promise<Inquiry[]> {
    return apiRequest('/inquiries/');
  },

  async getById(id: number): Promise<Inquiry> {
    return apiRequest(`/inquiries/${id}/`);
  },

  // NEW: Inquiry management
  async updateStatus(inquiryId: number, status: string): Promise<Inquiry> {
    return apiRequest(`/inquiries/${inquiryId}/update-status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async assignAgent(inquiryId: number, agentId: number): Promise<Inquiry> {
    return apiRequest(`/inquiries/${inquiryId}/assign-agent/`, {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId }),
    });
  },

  // User-specific inquiries
  async getMyInquiries(): Promise<Inquiry[]> {
    return apiRequest('/inquiries/');
  },
};

// ===== PUBLIC API ENDPOINTS =====
export const publicAPI = {
  async createPublicInquiry(inquiryData: {
    property?: number;
    name: string;
    email: string;
    phone: string;
    message: string;
    inquiry_type?: string;
    preferred_date?: string;
    budget_range?: string;
  }): Promise<Inquiry> {
    return apiRequest('/public-inquiry/', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  },

  async getPropertyCategories(): Promise<PropertyCategories> {
    return apiRequest('/categories/');
  },
};

// ===== ADMIN API ENDPOINTS =====
export const adminAPI = {
  async getProperties(filters?: PropertyFilters): Promise<PaginatedResponse<Property>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/admin/properties/?${queryParams.toString()}`
      : '/admin/properties/';
      
    return apiRequest(endpoint);
  },

  async approveProperty(propertyId: number): Promise<Property> {
    return apiRequest(`/admin/properties/${propertyId}/approve/`, {
      method: 'POST',
    });
  },

  async rejectProperty(propertyId: number): Promise<Property> {
    return apiRequest(`/admin/properties/${propertyId}/reject/`, {
      method: 'POST',
    });
  },
};

// ===== SAVED SEARCHES API =====
export const savedSearchesAPI = {
  async getAll(): Promise<SavedSearch[]> {
    return apiRequest('/saved-searches/');
  },

  async create(searchData: { name: string; search_params: PropertyFilters }): Promise<SavedSearch> {
    return apiRequest('/saved-searches/', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
  },

  async update(id: number, searchData: Partial<SavedSearch>): Promise<SavedSearch> {
    return apiRequest(`/saved-searches/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(searchData),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest(`/saved-searches/${id}/`, {
      method: 'DELETE',
    });
  },
};

// ===== COMPREHENSIVE PROPERTY API (Legacy compatibility) =====
export const propertyApi = {
  // Image handling
  getPrimaryImageUrl,
  getImageUrl,

  // Property operations (delegated to propertiesAPI)
  createProperty: propertiesAPI.create,
  getProperties: propertiesAPI.getAll,
  getFeaturedProperties: propertiesAPI.getFeatured,
  getPropertyById: propertiesAPI.getById,
  updateProperty: propertiesAPI.update,
  deleteProperty: propertiesAPI.delete,
  getMyProperties: propertiesAPI.getMyProperties,
  toggleFavorite: propertiesAPI.toggleFavorite,
  getFavorites: propertiesAPI.getFavorites,

  // Enhanced methods
  getPropertyWithImages: propertiesAPI.getPropertyWithImages,
  searchPropertiesAdvanced: propertiesAPI.searchAdvanced,
  getMapProperties: propertiesAPI.getMapProperties,
  getPropertyStats: propertiesAPI.getPropertyStats,
  getDashboardStats: dashboardAPI.getDashboardStats,
  getSimilarProperties: propertiesAPI.getSimilarProperties,
  createPropertyInquiry: propertiesAPI.createPropertyInquiry,
  incrementPropertyViews: propertiesAPI.incrementPropertyViews,

  // Image operations
  getPropertyImages: propertiesAPI.getPropertyImages,
  uploadImages: propertiesAPI.uploadImages,
  setPrimaryImage: propertiesAPI.setPrimaryImage,
  deleteImage: propertiesAPI.deleteImage,
  updateImageCaption: propertiesAPI.updateImageCaption,

  // Other delegated operations
  getAmenities: amenitiesAPI.getAll,
  getAmenityCategories: amenitiesAPI.getCategories,
  getPropertyAmenities: amenitiesAPI.getPropertyAmenities,
  updatePropertyAmenities: amenitiesAPI.updatePropertyAmenities,
  getPropertyMedia: mediaAPI.getPropertyMedia,
  uploadPropertyMedia: mediaAPI.uploadPropertyMedia,
  deletePropertyMedia: mediaAPI.deletePropertyMedia,
  setPrimaryMedia: mediaAPI.setPrimaryMedia,
  uploadSocialMediaVideo: mediaAPI.uploadSocialMediaVideo,
  uploadInteractiveSitePlan: mediaAPI.uploadInteractiveSitePlan,
  getPropertyDocuments: documentsAPI.getPropertyDocuments,
  uploadPropertyDocument: documentsAPI.uploadPropertyDocument,
  deletePropertyDocument: documentsAPI.deletePropertyDocument,
  getPropertyContact: contactAPI.getPropertyContact,
  updatePropertyContact: contactAPI.updatePropertyContact,
  createPublicInquiry: publicAPI.createPublicInquiry,
  getPropertyCategories: publicAPI.getPropertyCategories,
  getMyInquiries: inquiriesAPI.getMyInquiries,
  updateInquiryStatus: inquiriesAPI.updateStatus,
  assignInquiryAgent: inquiriesAPI.assignAgent,
  getAdminProperties: adminAPI.getProperties,
  approveProperty: adminAPI.approveProperty,
  rejectProperty: adminAPI.rejectProperty,
  getMyFavoritesList: propertiesAPI.getMyFavoritesList,
  getMyPropertiesList: propertiesAPI.getMyPropertiesList,
};