import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, User, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Privacy = (): JSX.Element => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['introduction']));
  const contentRef = useRef<HTMLDivElement>(null);

  const privacySections = [
    {
      id: 'introduction',
      title: 'Introduction & Scope',
      icon: Shield,
      content: 'PristinePrimer Real Estate is committed to protecting your privacy and personal information in compliance with Kenyan Data Protection Act, 2019.'
    },
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: User,
      content: 'We collect contact details, identity documents for verification, property information, and technical data necessary for our real estate services.'
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Information',
      icon: Eye,
      content: 'Your information is used to facilitate property transactions, verify identities, process payments, and provide property management services.'
    },
    {
      id: 'data-protection',
      title: 'Data Protection & Security',
      icon: Lock,
      content: 'We implement SSL encryption, secure servers, and access controls to protect your data. Data is primarily stored and processed in Kenya.'
    },
    {
      id: 'user-rights',
      title: 'Your Rights & Choices',
      icon: Shield,
      content: 'You have rights to access, correct, and delete your personal data. Contact our DPO to exercise these rights under Kenyan law.'
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
        {/* Clean White Hero Section */}
        <section className="relative py-16 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your data protection rights under Kenyan law
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={scrollToContent}
                  className="bg-[#f77f77] hover:bg-[#f77f77]/90 text-white border-0 shadow-sm"
                >
                  Read Policy
                </Button>
                <Button 
                  asChild 
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-500 shadow-sm"
                >
                  <Link to="/contact">
                    Contact DPO
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
              {privacySections.map((section) => (
                <Card 
                  key={section.id}
                  className="bg-white border-gray-200 hover:border-gray-300 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                  onClick={() => toggleSection(section.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <section.icon className="h-5 w-5 text-blue-600" />
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
                  <Mail className="h-8 w-8 text-red-600 mx-auto mb-4" />
                  <h4 className="text-gray-900 font-semibold mb-2">Email DPO</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    For privacy inquiries and data requests
                  </p>
                  <Button 
                    asChild
                    className="bg-[#f77f77] hover:bg-[#f77f77]/90 text-white border border-[#f77f77] shadow-sm w-full"
                  >
                    <a href="mailto:dpo@pristineprimer.com">
                      dpo@pristineprimer.com
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-6 text-center">
                  <Phone className="h-8 w-8 text-red-600 mx-auto mb-4" />
                  <h4 className="text-gray-900 font-semibold mb-2">Call DPO</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    For urgent privacy concerns
                  </p>
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full border-red-600 text-red-600 hover:bg-red-500 shadow-sm"
                  >
                    <a href="tel:+254743012966">
                      +254 743 012 966
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* One-line Summary */}
            <div className="mt-8 text-center border-t border-gray-200 pt-8">
              <p className="text-gray-500 text-sm">
                We respect your privacy and comply with Kenya's Data Protection Act, 2019. 
                Your data is secure with us.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;