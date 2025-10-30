import { useState, useEffect } from 'react';
import { propertiesAPI } from '@/services/api';
import { Property, PropertyFilters } from '@/types/property';

interface UseRentalPropertiesReturn {
  rentalProperties: Property[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useRentalProperties = (filters: PropertyFilters = {}): UseRentalPropertiesReturn => {
  const [rentalProperties, setRentalProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRentalProperties = async (): Promise<void> => {
    try {
      setLoading(true);
      const rentalFilters: PropertyFilters = {
        ...filters,
        property_type: 'rental',
        status: 'published'
      };
      
      const response = await propertiesAPI.getAll(rentalFilters);
      
      let propertiesArray: Property[] = [];
      if (response && 'results' in response) {
        propertiesArray = response.results;
      } else if (Array.isArray(response)) {
        propertiesArray = response;
      }
      
      setRentalProperties(propertiesArray);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rental properties');
      console.error('Error fetching rental properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalProperties();
  }, [JSON.stringify(filters)]);

  const refetch = () => {
    fetchRentalProperties();
  };

  return { rentalProperties, loading, error, refetch };
};