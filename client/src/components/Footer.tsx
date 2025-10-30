import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

 //  update the handleNewsletterSubmit function:
const handleNewsletterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Basic email validation before making the request
  if (!email || !email.includes('@')) {
    toast.error('Please enter a valid email address');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/api/newsletter/subscribe/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle HTTP errors (4xx, 5xx)
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.success) {
      toast.success(data.message);
      setEmail('');
      
      // Optional: Track successful subscription
      console.log('Newsletter subscription successful for:', email);
    } else {
      // Handle API-level errors (success: false)
      const errorMessage = data.errors?.email?.[0] || data.message || 'Subscription failed';
      toast.error(errorMessage);
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    // More specific error messages
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      toast.error('Network error. Please check your connection and try again.');
    } else {
      toast.error(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};
  

  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-16 mt-auto">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand & Contact */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            
            <span className="text-2xl font-bold text-primary-700">PristinePrimier</span>
          </Link>
          <p className="mt-4 text-gray-600 text-sm">
            Helping you buy, sell, or rent your next property in Kenya.
          </p>
          <div className="mt-6 text-gray-600 text-sm space-y-1">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <strong>Address:</strong> Nairobi, Kenya
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <strong>Phone:</strong>{' '}
              <a href="tel:+254729407573" className="hover:underline">
                +254 729407573
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <strong>Email:</strong>{' '}
              <a href="mailto:info@pristineprimier.co.ke" className="hover:underline">
                info@pristineprimier.co.ke
              </a>
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Links</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>
              <Link to="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:underline">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter & Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Subscribe to our Newsletter</h3>
          <p className="text-sm text-gray-600 mb-4">
            Get the latest property listings and market trends.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row sm:items-center mb-6">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full sm:flex-1 px-4 py-2 mb-3 sm:mb-0 sm:mr-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
            <Button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                'Subscribe'
            )}
</Button>
          </form>

          {/* Social Media Links */}
          <div className="flex space-x-4">
            <a 
              href="https://web.facebook.com/people/PristinePrimer-Real-Estate/61578142085551/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a 
            href="https://www.instagram.com/pristineprimier.re?igsh=ZmFna3p4d2RuZXF4" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram" 
            className="text-gray-600 hover:text-primary-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
            <a 
              href="https://x.com/PristinePrimier?t=rtYfB5-tSYumWfICk6vKfA&s=09" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Twitter" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="https://youtube.com/@pristineprimierre?si=5tWPIODLQIQj_rzG" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="YouTube" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a 
              href="https://www.tiktok.com/@pristineprimer.re?_t=ZM-90NhiAPtt8d&_r=1"
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="TikTok" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-3.77-1.105z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} PristinePrimier. All rights reserved.</p>
        <p className="mt-1">
          Made by{' '}
          <a
            href="https://implimenta.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-secondary-600 hover:text-secondary-800 hover:underline"
          >
            Implimenta
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;