// services/inquiryApi.ts
import { toast } from 'sonner';

const API_BASE_URL = 'https://api.pristineprimier.com/api';

export interface InquiryData {
  name: string;
  email: string;
  phone: string;
  message: string;
  property?: string; // property ID for property inquiries
  inquiry_type?: string;
  preferred_date?: string;
  address?: string; // for valuation/management requests
  sqft?: string;
  serviceType?: string;
}

class InquiryApi {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 403) {
        throw new Error('Authentication required. Please log in.');
      }
      
      if (response.status === 404) {
        throw new Error('API endpoint not found. Please check the URL.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Property-specific inquiry
  async submitPropertyInquiry(propertyId: string, data: Omit<InquiryData, 'property'>) {
    return this.request('/public-inquiry/', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        property: propertyId,
        inquiry_type: 'property_inquiry'
      }),
    });
  }

  // Valuation request
  async submitValuationRequest(data: InquiryData) {
    const enhancedMessage = data.address || data.sqft 
      ? `Valuation Request Details:\nProperty Address: ${data.address}\nSquare Footage: ${data.sqft}\n\nAdditional Details: ${data.message}`
      : data.message;

    return this.request('/public-inquiry/', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: enhancedMessage,
        inquiry_type: 'valuation_request'
        // Note: address and sqft are included in the message, not as separate fields
        // because your Django serializer might not have these fields
      }),
    });
  }

  // Management request
  async submitManagementRequest(data: InquiryData) {
    const enhancedMessage = data.address || data.serviceType
      ? `Management Request Details:\nProperty Address: ${data.address}\nService Type: ${data.serviceType}\n\nAdditional Details: ${data.message}`
      : data.message;

    return this.request('/public-inquiry/', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: enhancedMessage,
        inquiry_type: 'management_request'
      }),
    });
  }

  // General inquiry
  async submitGeneralInquiry(data: InquiryData) {
    return this.request('/public-inquiry/', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        inquiry_type: 'general_inquiry'
      }),
    });
  }

  // Main method to use in your ContactForm
  async submitForm(data: InquiryData, formType: 'inquiry' | 'valuation' | 'management' | 'general', propertyId?: string) {
    try {
      let result;

      switch (formType) {
        case 'inquiry':
          if (propertyId) {
            result = await this.submitPropertyInquiry(propertyId, data);
          } else {
            result = await this.submitGeneralInquiry(data);
          }
          break;
        
        case 'valuation':
          result = await this.submitValuationRequest(data);
          break;
        
        case 'management':
          result = await this.submitManagementRequest(data);
          break;
        
        case 'general':
          result = await this.submitGeneralInquiry(data);
          break;
        
        default:
          throw new Error(`Unknown form type: ${formType}`);
      }

      return result;
    } catch (error) {
      // If public-inquiry fails, try the fallback method
      console.log('Primary endpoint failed, trying fallback...');
      return await this.submitInquiry(data, this.mapFormTypeToInquiryType(formType), propertyId);
    }
  }

  // Fallback method
  private async submitInquiry(data: InquiryData, inquiryType: string, propertyId?: string) {
    const endpoints = [
      '/public-inquiry/',
      '/inquiries/',
    ];

    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: this.formatMessage(data, inquiryType),
      inquiry_type: inquiryType,
      ...(propertyId && { property: propertyId }),
    };

    for (const endpoint of endpoints) {
      try {
        const result = await this.request(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return result;
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed, trying next...`);
        continue;
      }
    }

    throw new Error('All API endpoints failed. Please check your backend configuration.');
  }

  private mapFormTypeToInquiryType(formType: string): string {
    const mapping: { [key: string]: string } = {
      'inquiry': 'property_inquiry',
      'valuation': 'valuation_request',
      'management': 'management_request',
      'general': 'general_inquiry'
    };
    return mapping[formType] || 'general_inquiry';
  }

  private formatMessage(data: InquiryData, inquiryType: string): string {
    switch (inquiryType) {
      case 'valuation_request':
        return `Valuation Request:\nAddress: ${data.address}\nSquare Feet: ${data.sqft}\n\nMessage: ${data.message}`;
      
      case 'management_request':
        return `Management Request:\nAddress: ${data.address}\nService Type: ${data.serviceType}\n\nMessage: ${data.message}`;
      
      case 'property_inquiry':
        return data.message; // Property context is handled by the property field
      
      default:
        return data.message;
    }
  }
}

export const inquiryApi = new InquiryApi();