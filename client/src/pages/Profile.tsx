// Profile.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building2, MapPin, Save, Camera, Shield, Bell, Key, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

// API service functions
const profileAPI = {
  updateProfile: async (data: any) => {
    const response = await fetch('/api/users/dashboard/profile/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  updateAccount: async (data: any) => {
    const response = await fetch('/api/users/dashboard/account/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update account');
    return response.json();
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await fetch('/api/auth/password/change/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      credentials: 'include',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      }),
    });
    if (!response.ok) throw new Error('Failed to change password');
    return response.json();
  },
};

// Helper function to get CSRF token
const getCSRFToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
};

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    bio: '',
  });

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    price_range_min: '',
    price_range_max: '',
    preferred_locations: [] as string[],
    preferred_property_types: [] as string[],
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [newLocation, setNewLocation] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        bio: user.bio || '',
      });

      // Initialize preferences from user profile if available
      if (user.profile) {
        setPreferences({
          email_notifications: user.profile.email_notifications ?? true,
          sms_notifications: user.profile.sms_notifications ?? false,
          price_range_min: user.profile.price_range_min ? user.profile.price_range_min.toString() : '',
          price_range_max: user.profile.price_range_max ? user.profile.price_range_max.toString() : '',
          preferred_locations: user.profile.preferred_locations || [],
          preferred_property_types: user.profile.preferred_property_types || [],
          address: user.profile.address || '',
          city: user.profile.city || '',
          state: user.profile.state || '',
          zip_code: user.profile.zip_code || '',
          country: user.profile.country || '',
        });
      }
    }
  }, [user]);

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update both user account and profile
      await Promise.all([
        profileAPI.updateAccount(personalInfo),
        profileAPI.updateProfile({
          address: preferences.address,
          city: preferences.city,
          state: preferences.state,
          zip_code: preferences.zip_code,
          country: preferences.country,
        })
      ]);
      
      await refreshUser(); // Refresh user data in context
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profileAPI.updateProfile({
        email_notifications: preferences.email_notifications,
        sms_notifications: preferences.sms_notifications,
        price_range_min: preferences.price_range_min ? parseFloat(preferences.price_range_min) : null,
        price_range_max: preferences.price_range_max ? parseFloat(preferences.price_range_max) : null,
        preferred_locations: preferences.preferred_locations,
        preferred_property_types: preferences.preferred_property_types,
      });
      
      await refreshUser();
      toast.success('Preferences updated successfully!');
    } catch (error) {
      toast.error('Failed to update preferences. Please try again.');
      console.error('Preferences update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast.error('New passwords do not match');
        return;
      }

      await profileAPI.changePassword(passwordData.current_password, passwordData.new_password);
      
      setIsPasswordDialogOpen(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error('Failed to change password. Please check your current password.');
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLocation = () => {
    if (newLocation.trim() && !preferences.preferred_locations.includes(newLocation.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter(l => l !== location)
    }));
  };

  const togglePropertyType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_property_types: prev.preferred_property_types.includes(type)
        ? prev.preferred_property_types.filter(t => t !== type)
        : [...prev.preferred_property_types, type]
    }));
  };

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'villa', label: 'Villa' },
    { value: 'rental', label: 'Rental' },
    { value: 'sale', label: 'For Sale' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Please log in to access your profile.</p>
          <Button asChild variant="hero">
            <button onClick={() => navigate('/auth')}>Login</button>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-secondary py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                {user.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <Button 
                size="icon" 
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                variant="secondary"
                disabled
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.username
                }
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {user.user_type}
                </Badge>
                <Badge variant={user.is_verified ? "default" : "secondary"}>
                  {user.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
                {user.company_name && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {user.company_name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={personalInfo.first_name}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, first_name: e.target.value }))}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={personalInfo.last_name}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, last_name: e.target.value }))}
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone_number" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone_number"
                          type="tel"
                          value={personalInfo.phone_number}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone_number: e.target.value }))}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Address Information</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="address">Street Address</Label>
                          <Input
                            id="address"
                            value={preferences.address}
                            onChange={(e) => setPreferences(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="123 Main St"
                          />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={preferences.city}
                              onChange={(e) => setPreferences(prev => ({ ...prev, city: e.target.value }))}
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={preferences.state}
                              onChange={(e) => setPreferences(prev => ({ ...prev, state: e.target.value }))}
                              placeholder="State"
                            />
                          </div>
                          <div>
                            <Label htmlFor="zip_code">ZIP Code</Label>
                            <Input
                              id="zip_code"
                              value={preferences.zip_code}
                              onChange={(e) => setPreferences(prev => ({ ...prev, zip_code: e.target.value }))}
                              placeholder="12345"
                            />
                          </div>
                          <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              value={preferences.country}
                              onChange={(e) => setPreferences(prev => ({ ...prev, country: e.target.value }))}
                              placeholder="Country"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {user.user_type === 'agent' || user.user_type === 'seller' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company_name">Company Name</Label>
                          <Input
                            id="company_name"
                            value={user.company_name || ''}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, company_name: e.target.value }))}
                            placeholder="Your company name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="license_number">License Number</Label>
                          <Input
                            id="license_number"
                            value={user.license_number || ''}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, license_number: e.target.value }))}
                            placeholder="Your license number"
                          />
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={personalInfo.bio}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us a bit about yourself..."
                        rows={4}
                      />
                    </div>

                    <Button type="submit" variant="hero" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Preferences & Notifications
                  </CardTitle>
                  <CardDescription>
                    Customize your property search preferences and notification settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                    {/* Notification Settings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Notification Settings</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email_notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive property updates and alerts via email
                          </p>
                        </div>
                        <Switch
                          id="email_notifications"
                          checked={preferences.email_notifications}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, email_notifications: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms_notifications">SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive urgent alerts via text message
                          </p>
                        </div>
                        <Switch
                          id="sms_notifications"
                          checked={preferences.sms_notifications}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, sms_notifications: checked }))
                          }
                        />
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Price Range</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price_min">Minimum Price</Label>
                          <Input
                            id="price_min"
                            type="number"
                            value={preferences.price_range_min}
                            onChange={(e) => setPreferences(prev => ({ ...prev, price_range_min: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="price_max">Maximum Price</Label>
                          <Input
                            id="price_max"
                            type="number"
                            value={preferences.price_range_max}
                            onChange={(e) => setPreferences(prev => ({ ...prev, price_range_max: e.target.value }))}
                            placeholder="1000000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preferred Locations */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Preferred Locations</h3>
                      <div className="flex gap-2">
                        <Input
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          placeholder="Add a location..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                        />
                        <Button type="button" onClick={addLocation} variant="outline">
                          <MapPin className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {preferences.preferred_locations.map((location, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {location}
                            <button
                              type="button"
                              onClick={() => removeLocation(location)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Property Types */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Preferred Property Types</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {propertyTypes.map((type) => (
                          <Button
                            key={type.value}
                            type="button"
                            variant={preferences.preferred_property_types.includes(type.value) ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => togglePropertyType(type.value)}
                          >
                            {type.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" variant="hero" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Change Password Dialog */}
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Change Password</h4>
                          <p className="text-sm text-muted-foreground">
                            Update your password to keep your account secure
                          </p>
                        </div>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Key className="h-4 w-4 mr-2" />
                            Change Password
                          </Button>
                        </DialogTrigger>
                      </div>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and set a new one.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          <div>
                            <Label htmlFor="current_password">Current Password</Label>
                            <Input
                              id="current_password"
                              type="password"
                              value={passwordData.current_password}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="new_password">New Password</Label>
                            <Input
                              id="new_password"
                              type="password"
                              value={passwordData.new_password}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirm_password">Confirm New Password</Label>
                            <Input
                              id="confirm_password"
                              type="password"
                              value={passwordData.confirm_password}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                              required
                            />
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" variant="hero" disabled={loading}>
                              {loading ? 'Changing...' : 'Change Password'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline" disabled>
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Account Verification</h4>
                        <p className="text-sm text-muted-foreground">
                          Status: {user.is_verified ? 'Verified' : 'Pending Verification'}
                        </p>
                      </div>
                      <Badge variant={user.is_verified ? "default" : "secondary"}>
                        {user.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>

                    {/* Delete Account Dialog */}
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5">
                        <div>
                          <h4 className="font-semibold text-destructive">Delete Account</h4>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all associated data
                          </p>
                        </div>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </DialogTrigger>
                      </div>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Account</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="button" variant="destructive" disabled>
                            Delete Account
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;