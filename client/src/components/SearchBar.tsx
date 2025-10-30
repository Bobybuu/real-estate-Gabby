import { useState } from 'react';
import { Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyFilters } from '@/types/property';

interface SearchBarProps {
  onSearch?: (filters: PropertyFilters) => void;
  variant?: 'hero' | 'inline';
}

const SearchBar = ({ onSearch, variant = 'hero' }: SearchBarProps) => {
  const [filters, setFilters] = useState({
    search: '',
    property_type: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert frontend filters to backend PropertyFilters format
    const backendFilters: PropertyFilters = {
      search: filters.search,
      property_type: filters.property_type === 'all' ? '' : filters.property_type,
    };

    // Clean up empty values
    const cleanFilters = Object.fromEntries(
      Object.entries(backendFilters).filter(([_, value]) => value !== '')
    );

    onSearch?.(cleanFilters);
  };

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={handleSubmit}
      className={`${
        isHero
          ? 'bg-white/95 backdrop-blur-sm shadow-lg rounded-xl p-4 max-w-4xl w-full border border-[#577A26]/20'
          : 'bg-white border border-[#577A26]/20 rounded-lg p-3'
      }`}
    >
      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        
        {/* Main Search Input - Grows to fill available space */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#577A26]" />
            <Input
              type="text"
              placeholder="Search properties by title, location, or description..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 h-11 text-sm border-[#577A26]/30 focus:border-[#577A26] focus:ring-[#577A26]/20 w-full"
            />
          </div>
        </div>

        {/* Property Type - Fixed width on desktop */}
        <div className="w-full md:w-48">
          <Select value={filters.property_type} onValueChange={(value) => updateFilter('property_type', value)}>
            <SelectTrigger className="h-11 text-sm border-[#577A26]/30 focus:border-[#577A26] focus:ring-[#577A26]/20 w-full">
              <Home className="h-4 w-4 mr-2 text-[#577A26]" />
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="rental">Rental</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button - Fixed width on desktop */}
        <Button
          type="submit"
          className="h-11 text-sm font-medium bg-[#f77f77] hover:bg-[#f77f77]/90 text-white border border-[#f77f77] w-full md:w-32"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;