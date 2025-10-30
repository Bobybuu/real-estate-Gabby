import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import SearchBar from './SearchBar';
import { PropertyFilters } from '@/types/property';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { path: '/buy', label: 'Properties' },
    { path: '/rent', label: 'Rent Property' },
    { path: '/sell', label: 'Sell a House' },
    { path: '/manage', label: 'Manage Property' },
    { path: '/services', label: 'Services' },
    { path: '/about', label: 'About Us' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.user_type) {
      case 'seller':
        return '/dashboard/seller';
      case 'agent':
        return '/dashboard/seller';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/dashboard';
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.first_name || user.username;
  };

  const handleSearch = (filters: PropertyFilters): void => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    window.location.href = `/buy?${queryParams.toString()}`;
    setSearchExpanded(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur supports-[backdrop-filter]:bg-white/95 shadow-sm">
      {/* Top Bar - Logo, Phone, Menu */}
      <nav className="container mx-auto px-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img 
              src="/logorealestate.png"  
              alt="Golden Years Realty" 
              className="h-20 w-auto"
            />
          </Link>

          {/* Desktop - Phone Number (Center) */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="bg-gray-100 rounded-full p-2">
              <Phone className="h-4 w-4 text-gray-700" />
            </div>
            <div className="text-gray-800">
              <div className="text-xs font-medium opacity-90">Talk to us</div>
              <div className="text-sm font-semibold">+254 735 216000</div>
            </div>
          </div>

          {/* Desktop Navigation & Auth */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-base ${
                    isActive(link.path)
                      ? 'text-gray-900 border-b-2 border-gray-900 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3 ml-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {getUserDisplayName()}
                  </span>
                  <Button asChild variant="outline" size="sm" className="border-gray-600 text-gray-700 hover:bg-gray-600 hover:text-white">
                    <Link to={getDashboardPath()}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                    <Link to="/auth">Login</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="border-gray-600 text-gray-700 hover:bg-gray-600 hover:text-white">
                    <Link to="/auth">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Search Bar Row - Desktop */}
        <div className="hidden lg:block pb-3">
          <SearchBar onSearch={handleSearch} variant="inline" />
        </div>

        {/* Mobile Search Toggle */}
        <div className="lg:hidden pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchExpanded(!searchExpanded)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex-1 justify-start"
            >
              <span>Search properties...</span>
            </Button>
          </div>
          
          {/* Expanded Mobile Search */}
          {searchExpanded && (
            <div className="mt-2 animate-fade-in">
              <SearchBar onSearch={handleSearch} variant="inline" />
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {/* Mobile Phone Number - Only in mobile menu */}
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
              <div className="bg-gray-100 rounded-full p-2">
                <Phone className="h-4 w-4 text-gray-700" />
              </div>
              <div className="text-gray-800">
                <div className="text-xs font-medium opacity-90">Talk to us</div>
                <div className="text-sm font-semibold">+254 735 216000</div>
              </div>
            </div>

            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium py-2 transition-base ${
                  isActive(link.path) ? 'text-gray-900 font-semibold border-l-2 border-gray-900 pl-2' : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              {user ? (
                <>
                  <div className="text-sm text-gray-600 text-center py-2">
                    Welcome, {getUserDisplayName()}
                  </div>
                  <Button asChild variant="outline" size="sm" className="border-gray-600 text-gray-700 hover:bg-gray-600 hover:text-white">
                    <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="border-gray-600 text-gray-700 hover:bg-gray-600 hover:text-white">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;