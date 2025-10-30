/**
 * Mock Data for Development
 * This will be replaced by real API responses
 */

import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';

export interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  type: 'house' | 'condo' | 'townhouse' | 'land' | 'rental';
  status: 'sale' | 'rent' | 'sold';
  images: string[];
  description: string;
  features: string[];
  yearBuilt?: number;
  lotSize?: string;
  isFeatured: boolean;
  agentId: string;
  createdAt: string;
}

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Luxury Estate',
    price: 2850000,
    address: '1234 Oakwood Drive',
    city: 'Beverly Hills',
    state: 'CA',
    zip: '90210',
    beds: 5,
    baths: 4,
    sqft: 4500,
    type: 'house',
    status: 'sale',
    images: [property1],
    description: 'Stunning modern estate featuring floor-to-ceiling windows, open-concept living, and premium finishes throughout. Located in prestigious Beverly Hills neighborhood.',
    features: ['Pool', 'Home Theater', 'Smart Home', 'Chef\'s Kitchen', 'Wine Cellar', '3-Car Garage'],
    yearBuilt: 2020,
    lotSize: '0.75 acres',
    isFeatured: true,
    agentId: 'agent1',
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    title: 'Historic Victorian Mansion',
    price: 1950000,
    address: '567 Heritage Lane',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    beds: 6,
    baths: 3,
    sqft: 5200,
    type: 'house',
    status: 'sale',
    images: [property2],
    description: 'Meticulously restored Victorian masterpiece with original architectural details, turrets, and wraparound porch. Rich in history and elegance.',
    features: ['Original Hardwood', 'Library', 'Formal Dining', 'Turrets', 'Wraparound Porch', 'Garden'],
    yearBuilt: 1895,
    lotSize: '0.45 acres',
    isFeatured: true,
    agentId: 'agent2',
    createdAt: '2025-01-10',
  },
  {
    id: '3',
    title: 'Waterfront Contemporary',
    price: 3200000,
    address: '890 Lakeside Terrace',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    beds: 4,
    baths: 3,
    sqft: 3800,
    type: 'house',
    status: 'sale',
    images: [property3],
    description: 'Breathtaking waterfront property with panoramic lake views, modern architecture, and serene private dock. Perfect for luxury living.',
    features: ['Waterfront', 'Private Dock', 'Floor-to-Ceiling Windows', 'Deck', 'Modern Design', 'Guest Suite'],
    yearBuilt: 2019,
    lotSize: '0.62 acres',
    isFeatured: true,
    agentId: 'agent1',
    createdAt: '2025-01-20',
  },
  {
    id: '4',
    title: 'Downtown Luxury Condo',
    price: 875000,
    address: '100 Main Street, Unit 2305',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    beds: 2,
    baths: 2,
    sqft: 1450,
    type: 'condo',
    status: 'sale',
    images: [property1],
    description: 'High-floor luxury condo with stunning city views, modern finishes, and premium building amenities.',
    features: ['City Views', 'Concierge', 'Gym', 'Rooftop Terrace', 'Parking', 'Storage'],
    yearBuilt: 2018,
    isFeatured: false,
    agentId: 'agent3',
    createdAt: '2025-01-12',
  },
  {
    id: '5',
    title: 'Suburban Family Home',
    price: 650000,
    address: '456 Maple Avenue',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    beds: 4,
    baths: 2,
    sqft: 2800,
    type: 'house',
    status: 'sale',
    images: [property2],
    description: 'Perfect family home in excellent school district. Spacious layout with updated kitchen and bathrooms.',
    features: ['Updated Kitchen', 'Large Backyard', 'Home Office', 'Garage', 'Fireplace'],
    yearBuilt: 2010,
    lotSize: '0.25 acres',
    isFeatured: false,
    agentId: 'agent2',
    createdAt: '2025-01-08',
  },
  {
    id: '6',
    title: 'Prime Commercial Land',
    price: 1500000,
    address: '789 Commerce Boulevard',
    city: 'Denver',
    state: 'CO',
    zip: '80201',
    type: 'land',
    status: 'sale',
    images: [property3],
    description: 'Prime commercial land in rapidly developing area. Zoned for mixed-use development. Excellent investment opportunity.',
    features: ['Zoned Commercial', 'High Traffic', 'Utilities Available', 'Corner Lot'],
    lotSize: '2.5 acres',
    isFeatured: false,
    agentId: 'agent1',
    createdAt: '2025-01-05',
  },
];

export const mockTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Home Buyer',
    content: 'PristinePrimier made finding our dream home effortless. Their team was professional, responsive, and truly understood our needs.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Property Seller',
    content: 'Sold our property in record time! The marketing strategy and agent support were exceptional.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Investor',
    content: 'Outstanding service for investment properties. Their market knowledge and insights are invaluable.',
    rating: 5,
  },
];

export const mockServices = [
  {
    id: 'construction',
    title: 'Construction & Renovation',
    description: 'Expert construction and renovation services to transform your property.',
    icon: '🏗️',
    details: 'From kitchen remodels to full home renovations, our experienced contractors deliver quality craftsmanship on time and within budget.',
  },
  {
    id: 'smart-home',
    title: 'Smart Home Integration',
    description: 'Modernize your property with cutting-edge smart home technology.',
    icon: '🏠',
    details: 'Complete smart home automation including security systems, lighting, climate control, and entertainment systems.',
  },
  {
    id: 'landscaping',
    title: 'Landscaping & Design',
    description: 'Professional landscaping to enhance curb appeal and property value.',
    icon: '🌳',
    details: 'Expert landscape design and maintenance services to create beautiful outdoor spaces.',
  },
  {
    id: 'interior-design',
    title: 'Interior Design',
    description: 'Professional staging and interior design services.',
    icon: '🎨',
    details: 'Transform your space with expert interior design consultation and staging services.',
  },
];

export const mockAdminStats = {
  totalUsers: 1247,
  totalListings: 456,
  pendingVerifications: 12,
  totalRevenue: 5420000,
};
