import { Link } from 'react-router-dom';
import { CheckCircle, Shield, DollarSign, Wrench, Users, FileCheck, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Manage = () => {
  const services = [
    {
      icon: DollarSign,
      title: 'Rent Collection',
      description: 'Automated rent collection and payment processing. On-time payments guaranteed.',
    },
    {
      icon: Wrench,
      title: 'Maintenance & Repairs',
      description: '24/7 maintenance coordination with vetted contractors. Emergency response available.',
    },
    {
      icon: Users,
      title: 'Tenant Screening',
      description: 'Thorough background checks, credit reports, and reference verification.',
    },
    {
      icon: FileCheck,
      title: 'Lease Management',
      description: 'Complete lease preparation, renewal management, and compliance monitoring.',
    },
    {
      icon: Shield,
      title: 'Legal Protection',
      description: 'Full legal compliance and eviction protection services included.',
    },
  ];

  const packages = [
    {
      name: 'Basic Management',
      price: '8%',
      description: 'Perfect for single property owners',
      features: [
        'Rent collection',
        'Tenant screening',
        'Lease management',
        'Monthly reporting',
        'Online portal access',
      ],
    },
    {
      name: 'Full Service',
      price: '10%',
      description: 'Comprehensive property management',
      features: [
        'Everything in Basic',
        '24/7 maintenance coordination',
        'Property inspections',
        'Legal compliance',
        'Marketing & advertising',
        'Dedicated account manager',
      ],
      popular: true,
    },
    {
      name: 'Premium Portfolio',
      price: 'Custom',
      description: 'For multiple properties',
      features: [
        'Everything in Full Service',
        'Customized pricing',
        'Portfolio reporting',
        'Investment consulting',
        'Priority support',
        'Renovation management',
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-primary-foreground py-6">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-center mb-2 font-light text-3xl tracking-tight">Professional Property Management</h1>
            <p className="mb-4 max-w-2xl mx-auto text-primary-foreground/90">
              Maximize rental income and minimize stress with our comprehensive management services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#f77f77] hover:bg-[#f77f77]/90 text-white">
                <a href="#request">Request Service</a>
              </Button>
              <Button className="bg-[#1f1e1d] hover:bg-[#1f1e1d]/90 text-white">
                <Link to="/services">View All Services</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Our Management Services</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to run your rental property successfully
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-elegant transition-smooth">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-teal/10 rounded-lg flex items-center justify-center mb-4">
                      <service.icon className="h-7 w-7 text-teal" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Packages */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Management Packages</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Choose the package that fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {packages.map((pkg, index) => (
                <Card
                  key={index}
                  className={`relative ${
                    pkg.popular
                      ? 'border-2 border-teal shadow-elegant scale-105'
                      : 'hover:shadow-lg transition-smooth'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-teal text-teal-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-medium mb-2">{pkg.name}</h3>
                    <p className="text-muted-foreground mb-6">{pkg.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-medium text-primary">{pkg.price}</span>
                      {pkg.price !== 'Custom' && (
                        <span className="text-muted-foreground"> of monthly rent</span>
                      )}
                    </div>
                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        pkg.popular 
                          ? 'bg-[#f77f77] hover:bg-[#f77f77]/90 text-white' 
                          : 'bg-[#1f1e1d] hover:bg-[#1f1e1d]/90 text-white'
                      }`}
                    >
                      <a href="#request">Get Started</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Request Form Section */}
        <section id="request" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Request Management Services</h2>
                <p className="text-muted-foreground text-lg">
                  Tell us about your property and we'll create a custom management plan
                </p>
              </div>

              <Card className="shadow-elegant">
                <CardContent className="p-8">
                  <ContactForm formType="management" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Services Link */}
        <section className="py-8 bg-accent text-accent-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Need Additional Services?</h2>
            <p className="text-lg mb-4 max-w-2xl mx-auto text-accent-foreground/90">
              Explore our renovation, smart home integration, and other property enhancement services
            </p>
            <Button className="bg-[#1f1e1d] hover:bg-[#1f1e1d]/90 text-white">
              <Link to="/services">
                View All Services
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Manage;