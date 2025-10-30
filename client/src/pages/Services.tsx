import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockServices } from '@/lib/mockData';

const Services = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const navigate = useNavigate();

  const selectedServiceData = mockServices.find((s) => s.id === selectedService);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

    

      <main className="flex-1">
        {!selectedService ? (
          <>
            {/* Services Overview */}
            <section className="bg-secondary py-1">
              <div className="container mx-auto px-4 text-center">
                <h1 className="text-center mb-2 font-light text-3xl tracking-tight">Our Services</h1>
                <p className="text-muted-foreground mb-4  max-w-2xl mx-auto">
                  Comprehensive property services to enhance and maintain your real estate investments
                </p>
              </div>
            </section>

            {/* Services Grid */}
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {mockServices.map((service) => (
                    <Card
                      key={service.id}
                      className="hover:shadow-elegant transition-smooth cursor-pointer"
                      onClick={() => setSelectedService(service.id)}
                    >
                      <CardContent className="p-8">
                        <div className="text-5xl mb-4">{service.icon}</div>
                        <h2 className="text-2xl font-medium mb-3">{service.title}</h2>
                        <p className="text-muted-foreground mb-4">{service.description}</p>
                        <Button className="bg-[#f77f77] hover:bg-[#f77f77]/90 text-white" size="sm">
                          Learn More & Request Service
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Service Detail */}
            <section className="bg-secondary py-8">
              <div className="container mx-auto px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedService(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All Services
                </Button>
              </div>
            </section>

            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <div className="text-6xl mb-4">{selectedServiceData?.icon}</div>
                    <h1 className="mb-4 font-medium">{selectedServiceData?.title}</h1>
                    <p className="text-muted-foreground text-lg">{selectedServiceData?.details}</p>
                  </div>

                  {/* Service Features */}
                  <div className="bg-secondary rounded-lg p-8 mb-12">
                    <h2 className="text-2xl font-medium mb-6">What's Included</h2>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal mt-2"></div>
                        <span>Professional consultation and assessment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal mt-2"></div>
                        <span>Detailed project planning and timeline</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal mt-2"></div>
                        <span>Quality materials and expert craftsmanship</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal mt-2"></div>
                        <span>Project management and coordination</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal mt-2"></div>
                        <span>Quality guarantee and follow-up support</span>
                      </li>
                    </ul>
                  </div>

                  {/* Contact Form */}
                  <Card className="shadow-elegant">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-medium mb-6">Request This Service</h2>
                      <ContactForm formType="management" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Services;
