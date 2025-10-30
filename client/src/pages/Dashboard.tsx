// Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogOut, Plus, FileText, Settings, Users, BarChart, User, Building2, Eye, Heart, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { dashboardAPI, propertiesAPI } from '@/services/api';
import { Property as ApiProperty } from '@/types/property'; 
// Types for API responses
interface DashboardStats {
  total_favorites: number;
  total_listings: number;
  total_inquiries: number;
  total_saved_searches: number;
  total_property_views: number;
  recent_activities: any[];
  unread_messages: number;
  pending_tours: number;
  new_matches: number;
  active_listings: number;
  pending_listings: number;
  sold_listings: number;
  total_commission: number;
  application_status: string | null;
  application_details: any;
}

// Use the imported Property type from your types file
type Property = ApiProperty;

// Alternative: If you want to keep your local interface, make sure it matches:
// interface Property {
//   id: number; // Changed from string to number to match the imported type
//   title: string;
//   price: number;
//   status: string;
//   property_type: string;
//   created_at: string;
//   city: string;
//   views_count: number;
// }

// Loading skeleton component
const DashboardSkeleton = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1 bg-secondary py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
    <Footer />
  </div>
);

// Seller Dashboard with Real Data
const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, myProperties] = await Promise.all([
        dashboardAPI.getOverview(),
        propertiesAPI.getMyProperties(),
      ]);
      setStats(overviewData);
      setProperties(myProperties);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      published: 'default',
      draft: 'outline',
      pending: 'secondary',
      sold: 'destructive',
      rented: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-secondary py-8">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {user?.user_type === 'agent' ? 'Agent Dashboard' : 'Seller Dashboard'}
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.first_name || user?.username}!
                {user?.user_type === 'agent' && ' Manage your property listings and clients.'}
                {user?.user_type === 'seller' && ' Manage your property listings.'}
              </p>
            </div>
            <Button variant="hero" size="lg" asChild>
              <Link to="/dashboard/seller/create">
                <Plus className="h-5 w-5 mr-2" />
                Create Listing
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.active_listings || 0}</div>
                <p className="text-xs text-muted-foreground">Published properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_property_views || 0}</div>
                <p className="text-xs text-muted-foreground">Property views</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_inquiries || 0}</div>
                <p className="text-xs text-muted-foreground">Customer inquiries</p>
              </CardContent>
            </Card>
          </div>

          {/* Application Status */}
          {stats?.application_status && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{stats.application_status}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.application_status === 'pending' && 'Your application is under review'}
                      {stats.application_status === 'approved' && 'Your application has been approved'}
                      {stats.application_status === 'rejected' && 'Your application was not approved'}
                    </p>
                  </div>
                  <Badge variant={
                    stats.application_status === 'approved' ? 'default' :
                    stats.application_status === 'rejected' ? 'destructive' : 'outline'
                  }>
                    {stats.application_status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{user?.company_name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{user?.license_number || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verification Status</p>
                  <Badge variant={user?.is_verified ? 'default' : 'outline'}>
                    {user?.is_verified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{formatDate(user?.date_joined)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listings Table */}
          <Card>
            <CardHeader>
              <CardTitle>My Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {properties.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.title}</TableCell>
                        <TableCell>${property.price.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{property.property_type}</TableCell>
                        <TableCell>{getStatusBadge(property.status)}</TableCell>
                        <TableCell>{property.views_count}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/property/${property.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first property listing to get started</p>
                  <Button asChild variant="hero">
                    <Link to="/dashboard/seller/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Listing
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Buyer Dashboard with Real Data
const BuyerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, favoritesData, searchesData] = await Promise.all([
        dashboardAPI.getOverview(),
        propertiesAPI.getFavorites().catch(() => []), // Gracefully handle errors
        dashboardAPI.getSavedSearches().catch(() => []), // Gracefully handle errors
      ]);
      setStats(overviewData);
      setFavorites(favoritesData || []);
      setSavedSearches(searchesData || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-secondary py-8">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.first_name || user?.username}! Manage your property searches and preferences.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_favorites || favorites.length || 0}</div>
                <p className="text-xs text-muted-foreground">Properties saved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Saved Searches</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_saved_searches || savedSearches.length || 0}</div>
                <p className="text-xs text-muted-foreground">Active searches</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Property Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_property_views || 0}</div>
                <p className="text-xs text-muted-foreground">Properties viewed</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Button variant="hero" size="lg" className="w-full" asChild>
              <Link to="/buy">
                <Plus className="h-5 w-5 mr-2" />
                Browse Properties
              </Link>
            </Button>
            <Button variant="teal" size="lg" className="w-full" asChild>
              <Link to="/dashboard/profile">
                <User className="h-5 w-5 mr-2" />
                Update Preferences
              </Link>
            </Button>
          </div>

          {/* Saved Properties */}
          {favorites.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Recently Saved Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.slice(0, 4).map((favorite) => (
                    <div key={favorite.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{favorite.property?.title || 'Property'}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${favorite.property?.price?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                <div className="space-y-4">
                  {stats.recent_activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium capitalize">{activity.activity_type?.replace('_', ' ') || 'Activity'}</p>
                        {activity.property_title && (
                          <p className="text-sm text-muted-foreground">{activity.property_title}</p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No recent activity</h3>
                  <p className="text-muted-foreground">Your property searches and views will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Admin Dashboard with Real Data
const AdminDashboard = () => {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/admin/dashboard/stats/', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAdminStats(data);
      }
    } catch (error) {
      console.error('Admin dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.first_name || user?.username}! Manage all listings and users.
            </p>
          </div>

          {/* Admin Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.total_users || 0}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.total_properties || 0}</div>
                <p className="text-xs text-muted-foreground">Listed properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.pending_applications || 0}</div>
                <p className="text-xs text-muted-foreground">Seller applications</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.total_inquiries || 0}</div>
                <p className="text-xs text-muted-foreground">Customer inquiries</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions for Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/properties">
                <Building2 className="h-4 w-4 mr-2" />
                Manage Properties
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/applications">
                <FileText className="h-4 w-4 mr-2" />
                View Applications
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/inquiries">
                <Users className="h-4 w-4 mr-2" />
                Manage Inquiries
              </Link>
            </Button>
          </div>

          {!adminStats && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Admin dashboard data will appear here once available.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Main Dashboard component
const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Please log in to access your dashboard.</p>
          <Button asChild variant="hero">
            <Link to="/auth">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  switch (user.user_type) {
    case 'admin':
      return <AdminDashboard />;
    case 'seller':
    case 'agent':
      return <SellerDashboard />;
    case 'buyer':
    case 'management_client':
    default:
      return <BuyerDashboard />;
  }
};

export default Dashboard;
export { SellerDashboard, AdminDashboard, BuyerDashboard };