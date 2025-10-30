import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import { useRentalProperties } from '@/hooks/useRentalProperties';
import { PropertyFilters } from '@/types/property';
import LoadingSpinner from '@/components/LoadingSpinner';

const Rent = () => {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const { rentalProperties, loading, error, refetch } = useRentalProperties(filters);

  const handleSearch = (searchFilters: PropertyFilters) => {
    setFilters(searchFilters);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary py-1">
          <div className="container mx-auto px-4">
            <h1 className="text-center mb-2 font-light text-3xl tracking-tight">Rental Properties</h1>
            <p className="text-center text-muted-foreground  mb-4 max-w-2xl mx-auto">
              Find your perfect rental property from our curated selection
            </p>
            <SearchBar variant="inline" onSearch={handleSearch} />
          </div>
        </section>

        {/* ... rest of the component remains the same, just replace properties with rentalProperties ... */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                {loading ? 'Loading...' : `${rentalProperties.length} Rental Properties Available`}
              </h2>
            </div>

            {loading && (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground mt-4">Loading rental properties...</p>
              </div>
            )}

            {!loading && rentalProperties.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rentalProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {!loading && rentalProperties.length === 0 && (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-muted-foreground text-lg">
                  No rental properties currently available. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Rent;