import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { inquiryApi, type InquiryData } from '@/services/inquiryApi';

interface ContactFormProps {
  propertyId?: string;
  formType?: 'inquiry' | 'valuation' | 'management' | 'general';
  onSubmit?: (data: any) => void;
}

const ContactForm = ({ propertyId, formType = 'inquiry', onSubmit }: ContactFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    address: '',
    sqft: '',
    serviceType: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the simplified submitForm method that handles all form types
      const response = await inquiryApi.submitForm(formData, formType, propertyId);

      toast.success('Form submitted successfully! We\'ll be in touch soon.');
      onSubmit?.(formData);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        address: '',
        sqft: '',
        serviceType: '',
      });

    } catch (error: any) {
      console.error('Form submission error:', error);
      
      // More specific error messages
      if (error.message.includes('403')) {
        toast.error('Authentication required. Please try again.');
      } else if (error.message.includes('404')) {
        toast.error('Service temporarily unavailable. Please contact us directly.');
      } else {
        toast.error(error.message || 'Failed to submit form. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Render form fields based on formType
  const renderAdditionalFields = () => {
    switch (formType) {
      case 'valuation':
        return (
          <>
            <div>
              <Label htmlFor="address">Property Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="123 Main St, City, State ZIP"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sqft">Square Footage</Label>
              <Input
                id="sqft"
                name="sqft"
                type="number"
                value={formData.sqft}
                onChange={handleChange}
                placeholder="2000"
                className="mt-1"
              />
            </div>
          </>
        );

      case 'management':
        return (
          <>
            <div>
              <Label htmlFor="address">Property Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="123 Main St, City, State ZIP"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="serviceType">Service Type *</Label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1"
              >
                <option value="">Select a service</option>
                <option value="rent-collection">Rent Collection</option>
                <option value="maintenance">Maintenance</option>
                <option value="tenant-screening">Tenant Screening</option>
                <option value="full-management">Full Management</option>
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getSubmitButtonText = () => {
    if (loading) return 'Submitting...';
    
    switch (formType) {
      case 'inquiry': return propertyId ? 'Inquire About Property' : 'Send Inquiry';
      case 'valuation': return 'Get Free Valuation';
      case 'management': return 'Request Management';
      case 'general': return 'Send Message';
      default: return 'Submit Request';
    }
  };

  const getMessagePlaceholder = () => {
    switch (formType) {
      case 'inquiry':
        return propertyId 
          ? 'Tell us what you love about this property and any questions you have...'
          : 'Tell us more about your property requirements and preferences...';
      case 'valuation':
        return 'Provide additional property details like recent renovations, special features, or neighborhood information...';
      case 'management':
        return 'Describe your property management needs, current challenges, or specific services you\'re interested in...';
      case 'general':
        return 'How can we help you? Please share any questions or information about our services...';
      default:
        return 'How can we help you?';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="john@example.com"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder=" 0722123456"
            className="mt-1"
          />
        </div>

        {/* Additional field slots based on form type */}
        {formType === 'valuation' && (
          <div>
            <Label htmlFor="sqft">Square Footage</Label>
            <Input
              id="sqft"
              name="sqft"
              type="number"
              value={formData.sqft}
              onChange={handleChange}
              placeholder="2000"
              className="mt-1"
            />
          </div>
        )}

        {formType === 'management' && (
          <div>
            <Label htmlFor="serviceType">Service Type *</Label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1"
            >
              <option value="">Select a service</option>
              <option value="rent-collection">Rent Collection</option>
              <option value="maintenance">Maintenance</option>
              <option value="tenant-screening">Tenant Screening</option>
              <option value="full-management">Full Management</option>
              <option value="marketing">Property Marketing</option>
              <option value="tenant-placement">Tenant Placement</option>
            </select>
          </div>
        )}
      </div>

      {renderAdditionalFields()}

      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          placeholder={getMessagePlaceholder()}
          className="mt-1"
        />
      </div>

      <Button 
        type="submit" 
        size="lg" 
        disabled={loading} 
        className="w-full bg-[#f77f77] text-white border-[#f77f77] hover:bg-[#f56a6a] hover:border-[#f56a6a] transition-colors"
      >
        {getSubmitButtonText()}
      </Button>
      
      {/* Privacy notice */}
      <p className="text-xs text-muted-foreground text-center">
        By submitting this form, you agree to our privacy policy and consent to be contacted by PristinePrimier Real Estate.
      </p>
    </form>
  );
};

export default ContactForm;