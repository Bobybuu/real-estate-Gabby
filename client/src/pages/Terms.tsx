import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, UserCheck, Home, DollarSign, Building2, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Terms = (): JSX.Element => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['introduction']));
  const contentRef = useRef<HTMLDivElement>(null);

  const termsSections = [
    {
      id: 'introduction',
      title: 'Introduction & Acceptance',
      icon: FileText,
      content: 'Welcome to PristinePrimier Real Estate. By using our platform, you agree to these Terms and Conditions governing our real estate services in Kenya.'
    },
    {
      id: 'user-obligations',
      title: 'User Obligations',
      icon: UserCheck,
      content: 'Users must provide accurate information, maintain updated profiles, and comply with Kenyan real estate laws including the Land Act and county regulations.'
    },
    {
      id: 'property-listings',
      title: 'Property Listings',
      icon: Home,
      content: 'Listings must accurately represent property condition, location, and legal status. Prices must be in Kenyan Shillings with all fees disclosed.'
    },
    {
      id: 'transactions',
      title: 'Transactions & Fees',
      icon: DollarSign,
      content: 'Sales commission: 2-5%, Rental fee: 1 month rent, Property management: 8-12% monthly. All payments in Kenyan Shillings.'
    },
    {
      id: 'legal-compliance',
      title: 'Legal Compliance',
      icon: Shield,
      content: 'We comply with Kenyan real estate laws including Land Act, Land Registration Act, and county regulations. Disputes resolved through mediation or Kenyan courts.'
    },
    {
      id: 'property-management',
      title: 'Property Management',
      icon: Building2,
      content: 'Services include tenant screening, rent collection, maintenance coordination. Owners maintain insurance and fund major repairs.'
    },
    {
      id: 'liability',
      title: 'Liability & Disclaimers',
      icon: AlertCircle,
      content: 'We facilitate transactions but are not liable for market fluctuations. Verify property details independently. Liability limited to commission fees paid.'
    }
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1">
        {/* Clean Hero Section */}
        <section className="relative py-16 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-200">
                <Shield className="h-8 w-8 text-teal-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Terms & Conditions
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Legal framework for our real estate services in Kenya
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={scrollToContent}
                  className="bg-[#f77f77] hover:bg-[#f77f77]/90 text-white border-0 shadow-sm"
                >
                  Read Terms
                </Button>
                <Button 
                  asChild 
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-500 shadow-sm"
                >
                  <Link to="/contact">
                    Contact Legal
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Resizable Content Section */}
        <section ref={contentRef} className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-4">
              {termsSections.map((section) => (
                <Card 
                  key={section.id}
                  className="bg-white border-gray-200 hover:border-gray-300 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                  onClick={() => toggleSection(section.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <section.icon className="h-5 w-5 text-teal-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {section.title}
                        </h3>
                      </div>
                      {expandedSections.has(section.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    
                    {expandedSections.has(section.id) && (
                      <div className="mt-4 pl-14">
                        <p className="text-gray-700 leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-teal-600 mx-auto mb-4" />
                  <h4 className="text-gray-900 font-semibold mb-2">Legal Team</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    For terms clarification and legal inquiries
                  </p>
                  <Button 
                    asChild
                    className="bg-[#f77f77] hover:bg-[#f77f77]/90 text-white w-full border-0 shadow-sm"
                  >
                    <a href="mailto:legal@pristineprimer.com">
                      legal@pristineprimer.com
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-gray-900 font-semibold mb-2">Phone Support</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    For urgent legal questions
                  </p>
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-500 shadow-sm"
                  >
                    <a href="tel:+254743012966">
                      +254 743 012 966
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Acceptance Notice */}
            <div className="mt-8 text-center border-t border-gray-200 pt-8">
              <p className="text-gray-500 text-sm">
                By using our services, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;