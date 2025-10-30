import { Link } from 'react-router-dom';
import { ArrowRight, Home as HomeIcon, DollarSign, Building2, Star, Key } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { useFeaturedProperties } from '@/hooks/useProperties';
import { PropertyFilters } from '@/types/property';
import heroImage from '@/assets/hero-home.jpg';
import LoadingSpinner from '@/components/LoadingSpinner';
import PWAInstallPrompt from '@/components/PWAInstallPrompt'; 
import { useNewsletterPopup } from '@/hooks/useNewsletterPopup';
import NewsletterPopup from '@/components/NewsletterPopup';


const Index = (): JSX.Element => {
  const { featuredProperties, loading, error } = useFeaturedProperties();
  const { showPopup, setShowPopup } = useNewsletterPopup();
  const handleSearch = (filters: PropertyFilters): void => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    window.location.href = `/buy?${queryParams.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroImage} alt="Luxury real estate" className="w-full h-full object-cover" />
            <div className="absolute inset-0 gradient-overlay" />
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-white mb-6 font-extralight tracking-tighter leading-none text-4xl md:text-5xl lg:text-6xl">
              Your Trusted Real Estate Partner in Kenya
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in">
              Buy, Sell, or Manage Apartments, Homes and Land with Ease.
            </p>

            <div className="flex justify-center animate-fade-in">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </section>

        

        {/* CTA Section - Reduced height for mobile */}
        <section className="py-1 md:py-3 gradient-hero text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-center text-xl mb-2 font-light  tracking-tight">Ready to Find Your Perfect Home?</h2>
            <p className="text-sm md:text-xl mb-4 md:mb-2 max-w-2xl mx-auto text-primary-foreground/90">
              Join thousands of satisfied clients who found their dream properties with us
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-2">
              <Button 
                asChild 
                size="lg" 
                className="bg-[#f77f77] hover:bg-[#f77f77]/90 text-white border border-[#f77f77]"
              >
                <Link to="/buy">Browse Properties</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary "
              >
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Action CTAs */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/buy">
                <div className="group bg-card p-8 rounded-lg shadow-md hover:shadow-elegant transition-smooth text-center cursor-pointer">
                  <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal/20 transition-base">
                    <HomeIcon className="h-8 w-8 text-teal" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Buy a House</h3>
                  <p className="text-muted-foreground mb-4">
                    Explore thousands of properties ready for you
                  </p>
                  <span className="text-teal font-medium flex items-center justify-center gap-2 group-hover:gap-3 transition-base">
                    Browse Listings <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              <Link to="/sell">
                <div className="group bg-card p-8 rounded-lg shadow-md hover:shadow-elegant transition-smooth text-center cursor-pointer">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-base">
                    <DollarSign className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Sell a House</h3>
                  <p className="text-muted-foreground mb-4">
                    Get the best price for your property
                  </p>
                  <span className="text-accent font-medium flex items-center justify-center gap-2 group-hover:gap-3 transition-base">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              <Link to="/rent">
                <div className="group bg-card p-8 rounded-lg shadow-md hover:shadow-elegant transition-smooth text-center cursor-pointer">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-base">
                    <Key className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Rent Property</h3>
                  <p className="text-muted-foreground mb-4">
                    Find your perfect rental home today
                  </p>
                  <span className="text-primary font-medium flex items-center justify-center gap-2 group-hover:gap-3 transition-base">
                    Browse Rentals <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              <Link to="/manage">
                <div className="group bg-card p-8 rounded-lg shadow-md hover:shadow-elegant transition-smooth text-center cursor-pointer">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/20 transition-base">
                    <Building2 className="h-8 w-8 text-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Manage Property</h3>
                  <p className="text-muted-foreground mb-4">
                    Professional property management services
                  </p>
                  <span className="text-gold font-medium flex items-center justify-center gap-2 group-hover:gap-3 transition-base">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-1">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="mb-2 font-light  tracking-tight">Featured Properties</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Handpicked luxury properties that define elegance and comfort
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Failed to load featured properties</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {featuredProperties && featuredProperties.length > 0 ? (
                    featuredProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground text-lg">
                        No featured properties available at the moment.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Check back soon for new listings!
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-center mb-3">
                  <Button asChild variant="outline" size="lg">
                    <Link to="/buy">
                      View All Properties <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
      {/* Newsletter Popup */}
      {showPopup && (
        <NewsletterPopup onClose={() => setShowPopup(false)} />
      )}

      {/* PWA Install Prompt Popup */}
      <PWAInstallPrompt />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/+254743012966?text=Hello%20I%20am%20interested%20in%20your%20services"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center transition-colors duration-200"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="text-3xl" />
      </a>
    </div>
  );
};

export default Index;