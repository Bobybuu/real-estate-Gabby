import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageCircle, ArrowRight } from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Contact = (): JSX.Element => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Us',
      description: 'For immediate assistance and inquiries',
      details: '+254 743 012 966',
      action: 'Call Now',
      link: 'tel:+254743012966',
      color: 'text-green-600'
    },
    {
      icon: FaWhatsapp,
      title: 'WhatsApp',
      description: 'Quick chat and instant messaging',
      details: '+254 743 012 966',
      action: 'Message on WhatsApp',
      link: 'https://wa.me/+254743012966?text=Hello%20I%20am%20interested%20in%20your%20services',
      color: 'text-green-500'
    },
    {
      icon: Mail,
      title: 'Email Us',
      description: 'For detailed inquiries and documentation',
      details: 'info@pristineprimer.com',
      action: 'Send Email',
      link: 'mailto:info@pristineprimier.com',
      color: 'text-blue-600'
    },
    {
      icon: MapPin,
      title: 'Visit Office',
      description: 'Meet us in person for consultations',
      details: 'Nairobi, Kenya',
      action: 'Get Directions',
      link: 'https://maps.google.com/?q=Nairobi,Kenya',
      color: 'text-red-600'
    }
  ];

  const socialLinks = [
    {
      icon: FaFacebook,
      name: 'Facebook',
      url: 'https://facebook.com/pristineprimer',
      color: 'text-blue-600'
    },
    {
      icon: FaTwitter,
      name: 'Twitter',
      url: 'https://twitter.com/pristineprimer',
      color: 'text-blue-400'
    },
    {
      icon: FaInstagram,
      name: 'Instagram',
      url: 'https://instagram.com/pristineprimer',
      color: 'text-pink-600'
    },
    {
      icon: FaWhatsapp,
      name: 'WhatsApp',
      url: 'https://wa.me/+254743012966',
      color: 'text-green-500'
    }
  ];

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 2:00 PM' }
  ];

  const handleFormSubmit = () => {
    setFormSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
   



   
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-primary-foreground py-1">
          <div className="container mx-auto px-4 text-center mb-4">
            <h1 className="text-center mb-2 font-light text-3xl tracking-tight">
              Get In Touch
            </h1>
            <p className="text-xl md:text-xl mb-4 max-w-xl mx-auto text-primary-foreground/90">
              We're here to help you with all your real estate needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-2">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Phone className="h-5 w-5" />
                <span className="font-semibold">+254 743 012 966</span>
              </div>
              <p className="text-primary-foreground/80">
                Call now for immediate response
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Choose How to Reach Us</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Multiple ways to connect with our real estate experts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {contactMethods.map((method, index) => (
                <Card key={index} className="hover:shadow-elegant transition-smooth text-center">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      {method.icon === FaWhatsapp ? (
                        <method.icon className={`h-6 w-6 ${method.color}`} />
                      ) : (
                        <method.icon className={`h-6 w-6 ${method.color}`} />
                      )}
                    </div>
                    <h3 className="text-lg font-medium mb-2">{method.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{method.description}</p>
                    <p className="font-semibold mb-4">{method.details}</p>
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      <a href={method.link} target={method.link.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">
                        {method.action}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Response Time Info */}
            <div className="bg-secondary rounded-lg p-6 max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <MessageCircle className="h-6 w-6 text-teal" />
                <h3 className="text-lg font-medium">Response Time Guarantee</h3>
              </div>
              <p className="text-muted-foreground">
                <strong>Immediate response</strong> on calls • <strong>Within 2 hours</strong> for messages and emails
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Send Us a Message</h2>
                {formSubmitted ? (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-medium mb-3 text-green-800">Message Sent Successfully!</h3>
                      <p className="text-green-700 mb-4">
                        Thank you for contacting PristinePrimer Real Estate. We'll get back to you within 2 hours.
                      </p>
                      <p className="text-green-600 text-sm mb-6">
                        For urgent matters, please call us directly at <strong>+254 743 012 966</strong>
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button asChild variant="outline">
                          <Link to="/">Back to Home</Link>
                        </Button>
                        <Button 
                          onClick={() => setFormSubmitted(false)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Send Another Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-elegant">
                    <CardContent className="p-8">
                      <ContactForm 
                        formType="general"  // Changed from "contact" to "general"
                        onSubmit={handleFormSubmit}
                        />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Visit Our Office</h2>
                
                {/* Office Hours */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="h-6 w-6 text-teal" />
                      <h3 className="text-lg font-medium">Office Hours</h3>
                    </div>
                    <div className="space-y-3">
                      {officeHours.map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-muted-foreground">{schedule.day}</span>
                          <span className="font-medium">{schedule.hours}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Location Info */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="h-6 w-6 text-teal mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-medium mb-2">Our Location</h3>
                        <p className="text-muted-foreground">
                          Nairobi, Kenya<br />
                          Real Estate Hub
                        </p>
                      </div>
                    </div>
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      <a 
                        href="https://maps.google.com/?q=Nairobi,Kenya" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Get Directions <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Follow Us</h3>
                    <p className="text-muted-foreground mb-4">
                      Stay updated with our latest properties and real estate tips
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {socialLinks.map((social, index) => (
                        <Button
                          key={index}
                          asChild
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <a 
                            href={social.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <social.icon className={`h-4 w-4 ${social.color}`} />
                            <span>{social.name}</span>
                          </a>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="py-8 bg-accent text-accent-foreground">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Need Immediate Assistance?</h2>
              <p className=" mb-6 text-accent-foreground/90">
                For urgent property inquiries or emergency support, call us directly
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  asChild
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <a href="tel:+254743012966">
                    <Phone className="h-5 w-5 mr-2" />
                    Call +254 743 012 966
                  </a>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-2 border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent"
                >
                  <a href="https://wa.me/+254743012966" target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp className="h-5 w-5 mr-2" />
                    WhatsApp Now
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;