import { Link } from 'react-router-dom';
import { Building2, Users, Target, Award, Shield, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const About = (): JSX.Element => {
  const stats = [
    { number: '500+', label: 'Properties Listed' },
    { number: '1,200+', label: 'Happy Clients' },
    { number: '15+', label: 'Years Experience' },
    { number: '98%', label: 'Client Satisfaction' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Integrity',
      description: 'We build lasting relationships based on transparency and ethical practices in every transaction.'
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'Committed to delivering exceptional service and results that exceed client expectations.'
    },
    {
      icon: Users,
      title: 'Client-First',
      description: 'Your goals are our priority. We listen, understand, and deliver personalized solutions.'
    },
    {
      icon: Heart,
      title: 'Community',
      description: 'Dedicated to building better communities through responsible real estate development.'
    }
  ];

  const team = [
    {
      name: 'Mike Muthuri',
      role: 'Founder & CEO',
      experience: '10+ years in real estate',
      specialty: 'Luxury Properties & Commercial'
    },
    
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-primary-foreground py-1">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-center mb-2 font-light text-3xl tracking-tight">
              About PristinePrimier Real Estate
            </h1>
            <p className="mb-4 max-w-2xl mx-auto text-primary-foreground/90">
              Your Trusted Partner in Kenya's Real Estate Journey Since 2015
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
            <Button 
              asChild 
              className="bg-[#f77f77] hover:bg-[#f77f77]/90 text-white border border-[#f77f77]"
            >
              <Link to="/contact">Get In Touch</Link>
            </Button>
            </div>



          </div>
        </section>

        {/* Mission & Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="mb-6 font-medium">Our Story</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Founded in 2015, PristinePrimier Real Estate began with a simple vision: to transform 
                  the real estate experience in Kenya by providing trustworthy, professional, and 
                  comprehensive property services.
                </p>
                <p className="text-muted-foreground text-lg mb-6">
                  What started as a small team passionate about real estate has grown into a 
                  full-service agency helping thousands of Kenyans find their dream homes, 
                  make smart investments, and manage their properties effectively.
                </p>
                <p className="text-muted-foreground text-lg">
                  Today, we're proud to be one of Nairobi's most trusted real estate partners, 
                  known for our integrity, expertise, and commitment to client success.
                </p>
              </div>
              
              <div className="bg-secondary rounded-lg p-8">
                <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-6">
                  <Building2 className="h-8 w-8 text-teal" />
                </div>
                <h3 className="text-xl font-medium mb-4">Our Mission</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  To make real estate transactions seamless, transparent, and rewarding for 
                  every Kenyan by leveraging technology, expertise, and personalized service.
                </p>
                <h3 className="text-xl font-medium mb-4">Our Vision</h3>
                <p className="text-muted-foreground text-lg">
                  To be East Africa's most trusted real estate platform, empowering property 
                  dreams and building sustainable communities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-xl font-medium mb-4">By The Numbers</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our impact and reach in the Kenyan real estate market
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl md:text-4xl font-bold text-teal mb-2">
                      {stat.number}
                    </div>
                    <div className="text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Our Values</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="hover:shadow-elegant transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <value.icon className="h-6 w-6 text-teal" />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Meet Our Team</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Experienced professionals dedicated to your real estate success
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-elegant transition-smooth">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-teal" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">{member.name}</h3>
                    <p className="text-teal font-semibold mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground mb-2">{member.experience}</p>
                    <p className="text-xs text-muted-foreground">{member.specialty}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Why Choose PristinePrimier?</h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Award className="h-6 w-6 text-teal mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-2 text-xl">Award-Winning Service</h3>
                      <p className="text-muted-foreground text-sm">
                        Recognized for excellence in customer service and property management
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Shield className="h-6 w-6 text-teal mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-2 text-xl">Full Legal Compliance</h3>
                      <p className="text-muted-foreground text-sm">
                        All transactions backed by proper legal documentation and due diligence
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Target className="h-6 w-6 text-teal mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-2 text-xl">Market Expertise</h3>
                      <p className="text-muted-foreground text-sm">
                        Deep understanding of Kenyan real estate markets and investment opportunities
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Heart className="h-6 w-6 text-teal mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-2 text-xl">After-Sales Support</h3>
                      <p className="text-muted-foreground text-sm">
                        Comprehensive support even after your transaction is complete
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 bg-accent text-accent-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-center mb-2 font-light text-2xl tracking-tight">Ready to Start Your Real Estate Journey?</h2>
            <p className="text-lg mb-4 max-w-2xl mx-auto text-accent-foreground/90">
              Join thousands of satisfied clients who have found their perfect properties with us
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                className="bg-[#f77f77] hover:bg-[#f77f77]/90 text-white border border-[#f77f77]"
              >
                <Link to="/buy">Browse Properties</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="bg-transparent border-2 border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent"
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;