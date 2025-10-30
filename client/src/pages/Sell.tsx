import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, TrendingUp, Users, Shield, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Sell = () => {
  const steps = [
    {
      number: '01',
      title: 'Property Valuation',
      description: 'Get a free, accurate valuation of your property from our expert team.',
    },
    {
      number: '02',
      title: 'Professional Marketing',
      description: 'We create stunning listings with professional photography and targeted marketing.',
    },
    {
      number: '03',
      title: 'Qualified Buyers',
      description: 'Connect with pre-qualified buyers ready to make competitive offers.',
    },
    {
      number: '04',
      title: 'Smooth Closing',
      description: 'Our team handles all paperwork and negotiations for a hassle-free closing.',
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Maximum Value',
      description: 'Strategic pricing and marketing to get you the best possible price.',
    },
    {
      icon: Clock,
      title: 'Fast Sales',
      description: 'Average sale time of 30 days with our proven marketing strategies.',
    },
    {
      icon: Users,
      title: 'Expert Agents',
      description: 'Work with experienced agents who know your market inside out.',
    },
    {
      icon: Shield,
      title: 'Secure Process',
      description: 'Full legal protection and transparent transaction management.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-primary-foreground py-6">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-center mb-2 font-light text-3xl tracking-tight">Sell Your House with Confidence</h1>
            <p className="mb-4 max-w-2xl mx-auto text-primary-foreground/90">
              Get the best price for your property with our expert team and proven process
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#f77f77] hover:bg-[#f77f77]/90 text-white">
                <a href="#valuation">Get Free Valuation</a>
              </Button>
              <Button className="bg-[#1f1e1d] hover:bg-[#1f1e1d]/90 text-white">
                <Link to="/dashboard/seller">Seller Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-small text-center mb-2 font-light text-3xl tracking-tight">Why Sell With Us?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Experience the difference with our comprehensive selling services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="hover:shadow-elegant transition-smooth">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-8 w-8 text-teal" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-small text-center mb-2 font-light text-3xl tracking-tight">Our Selling Process</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A simple, transparent process from listing to closing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-card p-6 rounded-lg shadow-md h-full">
                    <div className="text-5xl font-bold text-teal/20 mb-4">{step.number}</div>
                    <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-teal" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Valuation Form Section */}
        <section id="valuation" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-small text-center mb-2 font-light text-3xl tracking-tight">Get Your Free Property Valuation</h2>
                <p className="text-muted-foreground text-lg">
                  Provide us with some basic information and receive an instant estimate
                </p>
              </div>

              <Card className="shadow-elegant">
                <CardContent className="p-8">
                  <ContactForm formType="valuation" />
                </CardContent>
              </Card>

              <div className="mt-8 p-6 bg-secondary rounded-lg">
                <h3 className="font-medium mb-4">What happens after you submit?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Receive an instant online estimate based on current market data
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      A local agent will contact you within 24 hours for a detailed assessment
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Get a comprehensive market analysis and pricing strategy
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 bg-accent text-accent-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Ready to Get Started?</h2>
            <p className="text-lg mb-4 max-w-2xl mx-auto text-accent-foreground/90">
              Access your seller dashboard to create listings and track your sales
            </p>
            <Button className="bg-[#1f1e1d] hover:bg-[#1f1e1d]/90 text-white">
              <Link to="/dashboard/seller">Go to Dashboard</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Sell;