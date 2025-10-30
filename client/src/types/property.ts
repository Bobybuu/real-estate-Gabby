export interface PropertyImage {
  id: number;
  image: string;
  caption: string;
  is_primary: boolean;
  order: number;
  property: number;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

// ===== NEW LAND LISTING INTERFACES =====

export interface PropertyMedia {
  id: number;
  media_type: 'image' | 'video' | 'drone' | 'site_plan' | 'aerial' | 'document';
  file: string;
  file_url?: string;
  video_url?: string;
  caption: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
  property: number;
  is_interactive?: boolean;
  interactive_type?: 'site_plan' | 'floor_plan' | 'aerial_map';
  interactive_data?: any; // For plot hover details
}

export interface Amenity {
  id: number;
  name: string;
  category: 'utilities' | 'accessibility' | 'surroundings' | 'characteristics' | 'security' | 'community';
  icon_code: string;
  description: string;
  is_active: boolean;
}

export interface PropertyAmenity {
  id: number;
  amenity: Amenity;
  availability: 'on_site' | 'nearby' | 'planned' | 'not_available';
  details: string;
  property: number;
}

export interface LegalDocument {
  id: number;
  document_type: 'title_deed' | 'survey_map' | 'zoning_certificate' | 'brochure' | 'deed_plan' | 'approval_letter' | 'search_certificate';
  file: string;
  file_url?: string;
  file_name?: string;
  description: string;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  property: number;
}

export interface PropertyContact {
  id: number;
  agent_name: string;
  agent_phone: string;
  agent_email: string;
  whatsapp_number: string;
  alternative_contact: string;
  office_address: string;
  license_number: string;
  property: number;
}

// ===== UPDATED PROPERTY INTERFACE WITH LAND FEATURES =====

export interface Property {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  property_type: 'land' | 'commercial' | 'rental' | 'apartment' | 'sale';
  land_type?: 'residential' | 'agricultural' | 'commercial' | 'industrial' | 'mixed_use';
  status: 'draft' | 'pending' | 'published' | 'sold' | 'rented' | 'under_offer';
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: string | null;
  longitude: string | null;
  landmarks?: string;
  landmarks_list?: string[];
  
  // Add to Property interface
  social_media_links?: {
    youtube_tour?: string;
    tiktok_tour?: string;
    instagram_reel?: string;
  };

  // Add to Property interface
  project_highlights?: string[];
  community_features?: string[];
  development_timeline?: string[];

  // Pricing & Financial
  price: string;
  price_unit: string;
  is_negotiable: boolean;
  price_per_unit?: string;
  payment_plan_details?: string;
  discount_offers?: string;
  deposit_percentage?: number | null;
  
  // Land Size & Details
  size_acres?: number | null;
  plot_dimensions?: string;
  num_plots_available?: number;
  total_plots?: number;
  
  // Add to Property interface
  map_pin_color?: string;
  map_cluster_id?: string;
  distance_to_landmarks?: Record<string, number>; // { "school": 2.5, "mall": 5.1 }
  // Land Characteristics
  topography?: string;
  soil_type?: string;
  zoning?: string;
  title_deed_status?: 'freehold' | 'leasehold' | 'absentee' | 'group_ranch' | 'community_land';
  
  // Development Status
  has_subdivision_approval: boolean;
  has_beacons: boolean;
  is_fenced: boolean;
  is_gated_community: boolean;
  
  // Infrastructure & Utilities
  road_access_type?: string;
  distance_to_main_road?: number | null;
  water_supply_types?: string[];
  has_borehole: boolean;
  has_piped_water: boolean;
  electricity_availability?: 'on_site' | 'nearby' | 'planned' | 'none';
  has_sewer_system: boolean;
  has_drainage: boolean;
  internet_availability: boolean;
  
  // Original Property Details (for backward compatibility)
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  lot_size: string | null;
  year_built: number | null;
  has_garage: boolean;
  has_pool: boolean;
  has_garden: boolean;
  has_fireplace: boolean;
  has_central_air: boolean;
  
  // Relationships
  seller: User;
  agent: User | null;
  images: PropertyImage[];
  media?: PropertyMedia[];
  amenities?: PropertyAmenity[];
  documents?: LegalDocument[];
  contact_info?: PropertyContact;
  
  // Metadata
  primary_image?: PropertyImage;
  is_favorited: boolean;
  featured: boolean;
  views_count: number;
  inquiry_count: number;
  created_at: string;
  published_at: string | null;
  seller_name?: string;
  updated_at?: string;
  images_count?: number;
  
  


  // Computed Properties
  is_land_property?: boolean;
  price_display?: string;
  location_display?: string;
  size_display?: string;
}

// ===== ENHANCED FILTER INTERFACES =====

export interface PropertyFilters {
  // Basic Filters
  search?: string;
  city?: string;
  state?: string;
  min_price?: string;
  max_price?: string;
  property_type?: string;
  featured?: boolean;
  status?: string;
  
  // Original Property Filters
  min_bedrooms?: string;
  min_bathrooms?: string;
  min_square_feet?: string;
  has_garage?: boolean;
  has_pool?: boolean;
  has_garden?: boolean;
  
  // New Land Listing Filters
  land_type?: string | string[];
  min_size?: string;
  max_size?: string;
  location?: string;
  zip_code?: string;
  has_title_deed?: boolean;
  title_deed_status?: string | string[];
  is_negotiable?: boolean;
  
  // Infrastructure Filters
  has_water?: boolean;
  has_electricity?: boolean;
  has_road_access?: boolean;
  has_sewer_system?: boolean;
  has_drainage?: boolean;
  internet_availability?: boolean;
  has_borehole?: boolean;
  has_piped_water?: boolean;
  electricity_availability?: string | string[];
  
  // Development Filters
  has_subdivision_approval?: boolean;
  has_beacons?: boolean;
  is_fenced?: boolean;
  is_gated_community?: boolean;
  
  // Road Access Filters
  road_access_type?: string | string[];
  max_distance_to_road?: string;
  
  // Land Characteristic Filters
  topography?: string | string[];
  soil_type?: string | string[];
  zoning?: string;
  
  // Plot-specific Filters
  min_plots_available?: string;
  plot_dimensions?: string;
  has_payment_plan?: boolean;
}

export interface SearchFilters extends PropertyFilters {
  // Add any additional search-specific filters here
}

// ===== API RESPONSE INTERFACES =====

export interface Favorite {
  id: number;
  property: Property;
  created_at: string;
}

export interface Inquiry {
  id: number;
  property: number;
  property_title: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiry_type: 'property_inquiry' | 'valuation_request' | 'management_request' | 'general_inquiry' | 'site_visit';
  source?: 'website' | 'whatsapp' | 'phone' | 'email' | 'walk_in';
  preferred_date: string | null;
  budget_range?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'closed' | 'converted';
  internal_notes?: string;
  assigned_agent?: User | null;
  created_at: string;
  updated_at?: string;
}

export interface SavedSearch {
  id: number;
  name: string;
  search_params: PropertyFilters;
  is_active: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ===== PROPERTY DATA FOR CREATION/UPDATES =====

export interface PropertyData {
  // Basic Information
  title: string;
  description: string;
  short_description?: string;
  property_type: string;
  land_type?: string;
  status: string;
  
  
  // Location
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number | null;
  longitude?: number | null;
  landmarks?: string;
  
  // Pricing & Financial
  price: number | null;
  price_unit: string;
  is_negotiable: boolean;
  price_per_unit?: string;
  payment_plan_details?: string;
  discount_offers?: string;
  deposit_percentage?: number | null;
  
  // Land Details
  size_acres?: number | null;
  plot_dimensions?: string;
  num_plots_available?: number;
  total_plots?: number;
  topography?: string;
  soil_type?: string;
  zoning?: string;
  title_deed_status?: string;
  
  // Development Status
  has_subdivision_approval: boolean;
  has_beacons: boolean;
  is_fenced: boolean;
  is_gated_community: boolean;
  
  // Infrastructure
  road_access_type?: string;
  distance_to_main_road?: number | null;
  water_supply_types?: string[];
  has_borehole: boolean;
  has_piped_water: boolean;
  electricity_availability?: string;
  has_sewer_system: boolean;
  has_drainage: boolean;
  internet_availability: boolean;
  
  // Original Property Fields
  bedrooms?: number | null;
  bathrooms?: number | null;
  square_feet?: number | null;
  lot_size?: number | null;
  year_built?: number | null;
  has_garage: boolean;
  has_pool: boolean;
  has_garden: boolean;
  has_fireplace: boolean;
  has_central_air: boolean;
  featured: boolean;
}

// ===== AMENITY CATEGORY INTERFACE =====

export interface AmenityCategory {
  category: string;
  category_display: string;
  amenities: Amenity[];
}

// ===== PROPERTY STATISTICS INTERFACE =====

export interface PropertyStats {
  total_properties: number;
  published_properties: number;
  land_properties: number;
  total_views: number;
  total_inquiries: number;
  average_price: number;
  price_range: {
    min: number;
    max: number;
  };
}

// ===== DASHBOARD STATS INTERFACE =====

export interface DashboardStats {
  properties: {
    total: number;
    published: number;
    draft: number;
  };
  inquiries: {
    total: number;
    new: number;
  };
  favorites: number;
  views: number;
}

// ===== SEARCH SERIALIZER INTERFACE =====

export interface PropertySearchParams {
  search?: string;
  min_price?: number;
  max_price?: number;
  min_size?: number;
  max_size?: number;
  land_type?: string[];
  property_type?: string[];
  location?: string;
  amenities?: number[];
  has_title_deed?: boolean;
  has_water?: boolean;
  has_electricity?: boolean;
}

// ===== PROPERTY CATEGORIES INTERFACE =====

export interface PropertyCategories {
  property_types: Record<string, string>;
  land_types: Record<string, string>;
  title_deed_types: Record<string, string>;
}