// src/pages/CreateProperty.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  MapPin, 
  Home, 
  DollarSign, 
  Ruler, 
  Bath, 
  Bed, 
  Calendar,
  Plus,
  X,
  Save,
  Camera,
  Droplets,
  Zap,
  Car,
  Fence,
  Trees,
  Mountain,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { propertiesAPI, type PropertyData } from '@/services/api';

interface PropertyFormData {
  // Basic Information
  title: string;
  description: string;
  short_description: string;
  property_type: string;
  land_type: string;
  status: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  landmarks: string;
  
  // Pricing & Financial
  price: string;
  price_unit: string;
  is_negotiable: boolean;
  price_per_unit: string;
  payment_plan_details: string;
  discount_offers: string;
  deposit_percentage: string;
  
  // Land Size & Details
  size_acres: string;
  plot_dimensions: string;
  num_plots_available: string;
  total_plots: string;
  
  // Land Characteristics
  topography: string;
  soil_type: string;
  zoning: string;
  title_deed_status: string;
  
  // Development Status
  has_subdivision_approval: boolean;
  has_beacons: boolean;
  is_fenced: boolean;
  is_gated_community: boolean;
  
  // Infrastructure & Utilities
  road_access_type: string;
  distance_to_main_road: string;
  water_supply_types: string[];
  has_borehole: boolean;
  has_piped_water: boolean;
  electricity_availability: string;
  has_sewer_system: boolean;
  has_drainage: boolean;
  internet_availability: boolean;
  
  // Original Property Details
  bedrooms: string;
  bathrooms: string;
  square_feet: string;
  lot_size: string;
  year_built: string;
  has_garage: boolean;
  has_pool: boolean;
  has_garden: boolean;
  has_fireplace: boolean;
  has_central_air: boolean;
  
  // Metadata
  featured: boolean;
}

interface ImageFile {
  file: File;
  preview: string;
  caption: string;
  is_primary: boolean;
}

const CreateProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<ImageFile[]>([]);

  const [formData, setFormData] = useState<PropertyFormData>({
    // Basic Information
    title: '',
    description: '',
    short_description: '',
    property_type: '',
    land_type: '',
    status: 'draft',
    
    // Location
    address: '',
    city: '',
    state: '',
    zip_code: '',
    latitude: '',
    longitude: '',
    landmarks: '',
    
    // Pricing & Financial
    price: '',
    price_unit: 'total',
    is_negotiable: false,
    price_per_unit: '',
    payment_plan_details: '',
    discount_offers: '',
    deposit_percentage: '',
    
    // Land Size & Details
    size_acres: '',
    plot_dimensions: '',
    num_plots_available: '',
    total_plots: '',
    
    // Land Characteristics
    topography: '',
    soil_type: '',
    zoning: '',
    title_deed_status: '',
    
    // Development Status
    has_subdivision_approval: false,
    has_beacons: false,
    is_fenced: false,
    is_gated_community: false,
    
    // Infrastructure & Utilities
    road_access_type: '',
    distance_to_main_road: '',
    water_supply_types: [],
    has_borehole: false,
    has_piped_water: false,
    electricity_availability: '',
    has_sewer_system: false,
    has_drainage: false,
    internet_availability: false,
    
    // Original Property Details
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    lot_size: '',
    year_built: '',
    has_garage: false,
    has_pool: false,
    has_garden: false,
    has_fireplace: false,
    has_central_air: false,
    
    // Metadata
    featured: false,
  });

  // Check if user is seller or agent
  if (!user || (user.user_type !== 'seller' && user.user_type !== 'agent')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You need to be a seller or agent to create property listings.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="hero">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const propertyTypes = [
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'rental', label: 'Rental' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'sale', label: 'For Sale' },
  ];

  const landTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'agricultural', label: 'Agricultural' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'mixed_use', label: 'Mixed Use' },
  ];

  const titleDeedStatuses = [
    { value: 'freehold', label: 'Freehold' },
    { value: 'leasehold', label: 'Leasehold' },
    { value: 'absentee', label: 'Absentee' },
    { value: 'group_ranch', label: 'Group Ranch' },
    { value: 'community_land', label: 'Community Land' },
  ];

  const electricityOptions = [
    { value: 'on_site', label: 'On Site' },
    { value: 'nearby', label: 'Nearby' },
    { value: 'planned', label: 'Planned' },
    { value: 'none', label: 'None' },
  ];

  const roadAccessTypes = [
    { value: 'tarmac', label: 'Tarmac Road' },
    { value: 'murram', label: 'Murram Road' },
    { value: 'gravel', label: 'Gravel Road' },
    { value: 'dirt', label: 'Dirt Road' },
  ];

  const topographyTypes = [
    { value: 'flat', label: 'Flat Land' },
    { value: 'gentle_slope', label: 'Gentle Slope' },
    { value: 'steep_slope', label: 'Steep Slope' },
    { value: 'hilly', label: 'Hilly' },
    { value: 'valley', label: 'Valley' },
  ];

  const soilTypes = [
    { value: 'red_soil', label: 'Red Soil' },
    { value: 'black_cotton', label: 'Black Cotton' },
    { value: 'sandy', label: 'Sandy' },
    { value: 'clay', label: 'Clay' },
    { value: 'loam', label: 'Loam' },
  ];

  const waterSupplyTypes = [
    { value: 'borehole', label: 'Borehole' },
    { value: 'piped', label: 'Piped Water' },
    { value: 'well', label: 'Well' },
    { value: 'river', label: 'River' },
    { value: 'rainwater', label: 'Rainwater Harvesting' },
  ];

  const priceUnits = [
    { value: 'total', label: 'Total Price' },
    { value: 'per_sqft', label: 'Price per Sq Ft' },
    { value: 'per_month', label: 'Price per Month' },
    { value: 'per_acre', label: 'Price per Acre' },
    { value: 'per_plot', label: 'Price per Plot' },
  ];

  const handleInputChange = (field: keyof PropertyFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWaterSupplyToggle = (waterType: string) => {
    setFormData(prev => {
      const currentTypes = prev.water_supply_types || [];
      const newTypes = currentTypes.includes(waterType)
        ? currentTypes.filter(type => type !== waterType)
        : [...currentTypes, waterType];
      
      return {
        ...prev,
        water_supply_types: newTypes
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({
          file,
          preview,
          caption: '',
          is_primary: images.length + newImages.length === 0 // First image is primary
        });
      }
    }

    setImages(prev => [...prev, ...newImages]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // If we removed the primary image, set the first remaining image as primary
      if (prev[index].is_primary && newImages.length > 0) {
        newImages[0].is_primary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImages(prev => 
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    );
  };

  const updateImageCaption = (index: number, caption: string) => {
    setImages(prev => 
      prev.map((img, i) => 
        i === index ? { ...img, caption } : img
      )
    );
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && (!formData.title || !formData.description || !formData.property_type)) {
      toast.error('Please fill in all required fields in Basic Information');
      return;
    }
    
    if (currentStep === 2 && (!formData.address || !formData.city || !formData.state)) {
      toast.error('Please fill in all required fields in Location Details');
      return;
    }
    
    if (currentStep === 3 && (!formData.price || (formData.property_type === 'land' && !formData.size_acres))) {
      toast.error('Please fill in all required fields in Property Details');
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.property_type || !formData.address || !formData.city || !formData.state || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate that at least one image is uploaded
    if (images.length === 0) {
      toast.error('Please upload at least one image of the property');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating property:', formData);

      // Convert form data to API format
      const propertyData: PropertyData = {
        // Basic Information
        title: formData.title,
        description: formData.description,
        short_description: formData.short_description,
        property_type: formData.property_type,
        land_type: formData.land_type,
        status: formData.status,
        
        // Location
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        landmarks: formData.landmarks,
        
        // Pricing & Financial
        price: formData.price ? parseFloat(formData.price) : null,
        price_unit: formData.price_unit,
        is_negotiable: formData.is_negotiable,
        price_per_unit: formData.price_per_unit,
        payment_plan_details: formData.payment_plan_details,
        discount_offers: formData.discount_offers,
        deposit_percentage: formData.deposit_percentage ? parseFloat(formData.deposit_percentage) : null,
        
        // Land Size & Details
        size_acres: formData.size_acres ? parseFloat(formData.size_acres) : null,
        plot_dimensions: formData.plot_dimensions,
        num_plots_available: formData.num_plots_available ? parseInt(formData.num_plots_available) : null,
        total_plots: formData.total_plots ? parseInt(formData.total_plots) : null,
        
        // Land Characteristics
        topography: formData.topography,
        soil_type: formData.soil_type,
        zoning: formData.zoning,
        title_deed_status: formData.title_deed_status,
        
        // Development Status
        has_subdivision_approval: formData.has_subdivision_approval,
        has_beacons: formData.has_beacons,
        is_fenced: formData.is_fenced,
        is_gated_community: formData.is_gated_community,
        
        // Infrastructure & Utilities
        road_access_type: formData.road_access_type,
        distance_to_main_road: formData.distance_to_main_road ? parseFloat(formData.distance_to_main_road) : null,
        water_supply_types: formData.water_supply_types,
        has_borehole: formData.has_borehole,
        has_piped_water: formData.has_piped_water,
        electricity_availability: formData.electricity_availability,
        has_sewer_system: formData.has_sewer_system,
        has_drainage: formData.has_drainage,
        internet_availability: formData.internet_availability,
        
        // Original Property Details
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
        lot_size: formData.lot_size ? parseFloat(formData.lot_size) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        has_garage: formData.has_garage,
        has_pool: formData.has_pool,
        has_garden: formData.has_garden,
        has_fireplace: formData.has_fireplace,
        has_central_air: formData.has_central_air,
        
        // Metadata
        featured: formData.featured,
      };

      // Step 1: Create the property first
      const createdProperty = await propertiesAPI.create(propertyData);
      console.log('Property created successfully:', createdProperty);

      // Step 2: Upload images
      if (images.length > 0) {
        try {
          setIsUploadingImages(true);
          setUploadProgress(30);
          
          const imageFiles = images.map(img => img.file);
          const captions = images.map(img => img.caption);
          const isPrimary = images.map(img => img.is_primary);
          
          // Simulate progress updates
          setUploadProgress(60);
          await propertiesAPI.uploadImages(createdProperty.id, imageFiles, captions, isPrimary);
          setUploadProgress(100);
          
          console.log('Images uploaded successfully');
          toast.success('Property and images uploaded successfully!');
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          toast.error('Property created but image upload failed. You can add images later.');
        } finally {
          setIsUploadingImages(false);
          setUploadProgress(0);
        }
      }

      // Navigate to dashboard after successful creation
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('Property creation error:', error);
      
      if (error.message?.includes('400')) {
        toast.error('Please check your input data and try again.');
      } else if (error.message?.includes('401')) {
        toast.error('Please log in to create properties.');
      } else if (error.message?.includes('403')) {
        toast.error('You do not have permission to create properties.');
      } else if (error.message?.includes('404')) {
        toast.error('Property creation service unavailable. Please try again later.');
      } else {
        toast.error('Failed to create property. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: Home },
    { number: 2, title: 'Location', icon: MapPin },
    { number: 3, title: 'Property Details', icon: Trees },
    { number: 4, title: 'Infrastructure', icon: Zap },
    { number: 5, title: 'Media', icon: Camera },
  ];

  const isLandProperty = formData.property_type === 'land';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">Create New Property Listing</h1>
            <p className="text-muted-foreground">
              Fill in the details below to list your property
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex flex-wrap justify-center md:justify-between gap-4 mb-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              
              return (
                <div key={step.number} className="flex flex-col items-center flex-1 min-w-[100px]">
                  <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-colors ${
                    isActive 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <div className="w-5 h-5 md:w-6 md:h-6">✓</div>
                    ) : (
                      <StepIcon className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs md:text-sm font-medium text-center ${
                    isActive || isCompleted ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Upload Progress */}
          {isUploadingImages && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Uploading Images...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Enter the basic details about your property
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Beautiful 2-acre residential plot in Karen"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="short_description">Short Description</Label>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => handleInputChange('short_description', e.target.value)}
                      placeholder="Brief description for property cards..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Full Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your property in detail including features, location advantages, and potential uses..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="property_type">Property Type *</Label>
                      <Select
                        value={formData.property_type}
                        onValueChange={(value) => handleInputChange('property_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {isLandProperty && (
                      <div>
                        <Label htmlFor="land_type">Land Type *</Label>
                        <Select
                          value={formData.land_type}
                          onValueChange={(value) => handleInputChange('land_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select land type" />
                          </SelectTrigger>
                          <SelectContent>
                            {landTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleInputChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending">Pending Review</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked)}
                    />
                    <Label htmlFor="featured">Feature this property</Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Details
                  </CardTitle>
                  <CardDescription>
                    Where is your property located?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Karen Road"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Nairobi"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/County *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Nairobi County"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip_code">ZIP Code</Label>
                      <Input
                        id="zip_code"
                        value={formData.zip_code}
                        onChange={(e) => handleInputChange('zip_code', e.target.value)}
                        placeholder="00502"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="landmarks">Nearby Landmarks</Label>
                    <Input
                      id="landmarks"
                      value={formData.landmarks}
                      onChange={(e) => handleInputChange('landmarks', e.target.value)}
                      placeholder="Near Karen Shopping Centre, close to international school"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude (Optional)</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                        placeholder="-1.2921"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude (Optional)</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                        placeholder="36.8219"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Property Details & Pricing */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trees className="h-5 w-5" />
                    {isLandProperty ? 'Land Details & Pricing' : 'Property Details & Pricing'}
                  </CardTitle>
                  <CardDescription>
                    {isLandProperty 
                      ? 'Specify the land features and pricing' 
                      : 'Specify the property features and pricing'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder={isLandProperty ? "2500000" : "5000000"}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_unit">Price Unit</Label>
                      <Select
                        value={formData.price_unit}
                        onValueChange={(value) => handleInputChange('price_unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priceUnits.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_per_unit">Price per Unit</Label>
                      <Input
                        id="price_per_unit"
                        value={formData.price_per_unit}
                        onChange={(e) => handleInputChange('price_per_unit', e.target.value)}
                        placeholder="Ksh 1.25M per acre"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_negotiable"
                        checked={formData.is_negotiable}
                        onCheckedChange={(checked) => handleInputChange('is_negotiable', checked)}
                      />
                      <Label htmlFor="is_negotiable">Price is negotiable</Label>
                    </div>
                  </div>

                  {/* Land-specific fields */}
                  {isLandProperty && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="size_acres">Size (Acres) *</Label>
                          <Input
                            id="size_acres"
                            type="number"
                            step="0.01"
                            value={formData.size_acres}
                            onChange={(e) => handleInputChange('size_acres', e.target.value)}
                            placeholder="2.5"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="plot_dimensions">Plot Dimensions</Label>
                          <Input
                            id="plot_dimensions"
                            value={formData.plot_dimensions}
                            onChange={(e) => handleInputChange('plot_dimensions', e.target.value)}
                            placeholder="100x200 ft"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="num_plots_available">Plots Available</Label>
                          <Input
                            id="num_plots_available"
                            type="number"
                            value={formData.num_plots_available}
                            onChange={(e) => handleInputChange('num_plots_available', e.target.value)}
                            placeholder="5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="total_plots">Total Plots</Label>
                          <Input
                            id="total_plots"
                            type="number"
                            value={formData.total_plots}
                            onChange={(e) => handleInputChange('total_plots', e.target.value)}
                            placeholder="10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="topography">Topography</Label>
                          <Select
                            value={formData.topography}
                            onValueChange={(value) => handleInputChange('topography', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select topography" />
                            </SelectTrigger>
                            <SelectContent>
                              {topographyTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="soil_type">Soil Type</Label>
                          <Select
                            value={formData.soil_type}
                            onValueChange={(value) => handleInputChange('soil_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select soil type" />
                            </SelectTrigger>
                            <SelectContent>
                              {soilTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="title_deed_status">Title Deed Status</Label>
                        <Select
                          value={formData.title_deed_status}
                          onValueChange={(value) => handleInputChange('title_deed_status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select title deed status" />
                          </SelectTrigger>
                          <SelectContent>
                            {titleDeedStatuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="zoning">Zoning</Label>
                        <Input
                          id="zoning"
                          value={formData.zoning}
                          onChange={(e) => handleInputChange('zoning', e.target.value)}
                          placeholder="Residential Zone 2"
                        />
                      </div>
                    </>
                  )}

                  {/* Original property details for non-land properties */}
                  {!isLandProperty && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="bedrooms" className="flex items-center gap-2">
                          <Bed className="h-4 w-4" />
                          Bedrooms
                        </Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          value={formData.bedrooms}
                          onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                          placeholder="3"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bathrooms" className="flex items-center gap-2">
                          <Bath className="h-4 w-4" />
                          Bathrooms
                        </Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          step="0.5"
                          value={formData.bathrooms}
                          onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                          placeholder="2.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="square_feet">Square Feet</Label>
                        <Input
                          id="square_feet"
                          type="number"
                          value={formData.square_feet}
                          onChange={(e) => handleInputChange('square_feet', e.target.value)}
                          placeholder="2000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="year_built" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Year Built
                        </Label>
                        <Input
                          id="year_built"
                          type="number"
                          value={formData.year_built}
                          onChange={(e) => handleInputChange('year_built', e.target.value)}
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  )}

                  {!isLandProperty && (
                    <div>
                      <Label htmlFor="lot_size">Lot Size (acres)</Label>
                      <Input
                        id="lot_size"
                        type="number"
                        step="0.01"
                        value={formData.lot_size}
                        onChange={(e) => handleInputChange('lot_size', e.target.value)}
                        placeholder="0.25"
                      />
                    </div>
                  )}

                  {/* Payment Plans */}
                  <div>
                    <Label htmlFor="payment_plan_details">Payment Plan Details</Label>
                    <Textarea
                      id="payment_plan_details"
                      value={formData.payment_plan_details}
                      onChange={(e) => handleInputChange('payment_plan_details', e.target.value)}
                      placeholder="Describe available payment plans, installment options, or financing details..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount_offers">Discount Offers</Label>
                      <Input
                        id="discount_offers"
                        value={formData.discount_offers}
                        onChange={(e) => handleInputChange('discount_offers', e.target.value)}
                        placeholder="Early bird discount: 10% off for first 5 buyers"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deposit_percentage">Deposit Percentage</Label>
                      <Input
                        id="deposit_percentage"
                        type="number"
                        step="0.1"
                        max="100"
                        value={formData.deposit_percentage}
                        onChange={(e) => handleInputChange('deposit_percentage', e.target.value)}
                        placeholder="20"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Infrastructure & Utilities */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Infrastructure & Utilities
                  </CardTitle>
                  <CardDescription>
                    Specify available utilities and infrastructure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Road Access */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="road_access_type" className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Road Access Type
                      </Label>
                      <Select
                        value={formData.road_access_type}
                        onValueChange={(value) => handleInputChange('road_access_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select road type" />
                        </SelectTrigger>
                        <SelectContent>
                          {roadAccessTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="distance_to_main_road">Distance to Main Road (km)</Label>
                      <Input
                        id="distance_to_main_road"
                        type="number"
                        step="0.1"
                        value={formData.distance_to_main_road}
                        onChange={(e) => handleInputChange('distance_to_main_road', e.target.value)}
                        placeholder="2.5"
                      />
                    </div>
                  </div>

                  {/* Water Supply */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      Water Supply
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {waterSupplyTypes.map((waterType) => (
                        <div key={waterType.value} className="flex items-center space-x-2">
                          <Switch
                            id={`water_${waterType.value}`}
                            checked={formData.water_supply_types.includes(waterType.value)}
                            onCheckedChange={() => handleWaterSupplyToggle(waterType.value)}
                          />
                          <Label htmlFor={`water_${waterType.value}`}>{waterType.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Electricity */}
                  <div>
                    <Label htmlFor="electricity_availability" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Electricity Availability
                    </Label>
                    <Select
                      value={formData.electricity_availability}
                      onValueChange={(value) => handleInputChange('electricity_availability', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select electricity status" />
                      </SelectTrigger>
                      <SelectContent>
                        {electricityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Development Status */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Development Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'has_subdivision_approval', label: 'Subdivision Approval', icon: null },
                        { key: 'has_beacons', label: 'Beacons Installed', icon: null },
                        { key: 'is_fenced', label: 'Fenced', icon: Fence },
                        { key: 'is_gated_community', label: 'Gated Community', icon: null },
                        { key: 'has_sewer_system', label: 'Sewer System', icon: null },
                        { key: 'has_drainage', label: 'Drainage', icon: null },
                        { key: 'internet_availability', label: 'Internet Available', icon: null },
                      ].map((feature) => (
                        <div key={feature.key} className="flex items-center space-x-2">
                          <Switch
                            id={feature.key}
                            checked={formData[feature.key as keyof PropertyFormData] as boolean}
                            onCheckedChange={(checked) => 
                              handleInputChange(feature.key as keyof PropertyFormData, checked)
                            }
                          />
                          <Label htmlFor={feature.key}>{feature.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Original Amenities for non-land properties */}
                  {!isLandProperty && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Amenities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'has_garage', label: 'Garage' },
                          { key: 'has_pool', label: 'Swimming Pool' },
                          { key: 'has_garden', label: 'Garden' },
                          { key: 'has_fireplace', label: 'Fireplace' },
                          { key: 'has_central_air', label: 'Central Air' },
                        ].map((amenity) => (
                          <div key={amenity.key} className="flex items-center space-x-2">
                            <Switch
                              id={amenity.key}
                              checked={formData[amenity.key as keyof PropertyFormData] as boolean}
                              onCheckedChange={(checked) => 
                                handleInputChange(amenity.key as keyof PropertyFormData, checked)
                              }
                            />
                            <Label htmlFor={amenity.key}>{amenity.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 5: Media */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Property Photos
                  </CardTitle>
                  <CardDescription>
                    Upload photos of your property. The first image will be used as the main photo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Upload Area */}
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 md:p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Upload Property Photos</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Drag and drop images here or click to browse
                    </p>
                    <Button type="button" variant="outline" size="sm" className="md:text-base">
                      <Plus className="h-4 w-4 mr-2" />
                      Select Images
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Image Requirement Alert */}
                  {images.length === 0 && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        At least one image is required to create a property listing.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Image Preview Grid */}
                  {images.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Uploaded Images ({images.length})</h4>
                        <Badge variant={images.length > 0 ? "default" : "secondary"}>
                          {images.length > 0 ? 'Ready to submit' : 'No images'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group border rounded-lg overflow-hidden bg-card">
                            <div className={`border-2 ${image.is_primary ? 'border-primary' : 'border-transparent'}`}>
                              <img
                                src={image.preview}
                                alt={`Property image ${index + 1}`}
                                className="w-full h-40 object-cover"
                              />
                              <div className="p-3 space-y-2">
                                <Input
                                  value={image.caption}
                                  onChange={(e) => updateImageCaption(index, e.target.value)}
                                  placeholder="Image caption..."
                                  className="text-sm"
                                />
                                <div className="flex justify-between items-center gap-2">
                                  <Button
                                    type="button"
                                    variant={image.is_primary ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPrimaryImage(index)}
                                    className="flex-1 text-xs"
                                  >
                                    {image.is_primary ? 'Primary' : 'Set Primary'}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                    className="px-2"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {image.is_primary && (
                              <Badge className="absolute top-2 left-2 bg-primary">Primary</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className="order-2 sm:order-1"
              >
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  variant="hero"
                  onClick={nextStep}
                  className="order-1 sm:order-2"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="hero"
                  disabled={loading || images.length === 0}
                  className="order-1 sm:order-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Property
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateProperty;