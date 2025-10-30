import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Home, Phone, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Faq = (): JSX.Element => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: 'Buying Properties',
      icon: '🏠',
      questions: [
        {
          question: 'How do I schedule a site visit?',
          answer: 'You can schedule a site visit by calling us at +254 743 012 966, using the WhatsApp button on our website, or by filling out the contact form. We typically schedule visits within 24-48 hours and will accompany you to the property.'
        },
        {
          question: 'What documents do I need to buy a property?',
          answer: 'For Kenyan citizens: National ID, KRA PIN certificate. For foreigners: Passport, work permit or special pass, Alien ID if applicable. Additional documents may include proof of income, bank statements, and for land purchases, a land search certificate from the relevant lands office.'
        },
        {
          question: 'Do you offer property financing assistance?',
          answer: 'Yes, we partner with several financial institutions in Kenya and can help connect you with mortgage providers. We also provide guidance on affordable housing schemes and developer financing options.'
        },
        {
          question: 'Can I buy property as a foreigner in Kenya?',
          answer: 'Yes, foreigners can buy property in Kenya, but there are restrictions on agricultural land and land near borders. Leasehold properties are commonly available to foreigners for up to 99 years. We recommend consulting with our legal team for specific guidance.'
        }
      ]
    },
    {
      title: 'Selling Properties',
      icon: '💰',
      questions: [
        {
          question: 'How can I list my property for sale on your website?',
          answer: 'You can list your property by creating a seller account on our platform, calling us directly at +254 743 012 966, or visiting our office. We offer free property valuation and professional photography for all listings.'
        },
        {
          question: 'What fees do you charge for selling my property?',
          answer: 'Our commission is competitive and only payable upon successful sale. Typically, we charge 2-5% of the final sale price depending on the property value and services required. There are no upfront fees for listing your property.'
        },
        {
          question: 'How long does it take to sell a property?',
          answer: 'The average time to sell a property in Nairobi is 30-90 days, depending on location, price, and market conditions. Well-priced properties in good locations often sell within 2-4 weeks through our marketing channels.'
        },
        {
          question: 'Do you help with property valuation?',
          answer: 'Yes, we provide free professional property valuations based on current market trends, comparable sales in the area, and property condition. Our valuations are comprehensive and help you price your property competitively.'
        }
      ]
    },
    {
      title: 'Rental Properties',
      icon: '🔑',
      questions: [
        {
          question: 'What is included in the rental price?',
          answer: 'This varies by property. Some include utilities like water and garbage collection, while others don\'t. Service charges for apartments are usually included. We clearly specify what\'s included in each listing and explain all costs during viewings.'
        },
        {
          question: 'How much deposit is required?',
          answer: 'Typically, one month\'s rent as deposit and one month\'s rent in advance. Some high-end properties may require two months deposit. All deposits are held in a designated account and refundable at the end of the tenancy, subject to property condition.'
        },
        {
          question: 'Do you handle rental agreements?',
          answer: 'Yes, we provide standard tenancy agreements that comply with Kenyan law. We can also facilitate agreement signing, witness services, and provide guidance on your rights and responsibilities as a tenant or landlord.'
        },
        {
          question: 'Can I negotiate the rental price?',
          answer: 'In many cases, yes. Rental prices can sometimes be negotiated, especially for longer-term leases or if you\'re paying several months in advance. Our agents can guide you on reasonable negotiation ranges for different properties.'
        }
      ]
    },
    {
      title: 'Property Management',
      icon: '🏢',
      questions: [
        {
          question: 'What services are included in property management?',
          answer: 'Our comprehensive management includes tenant screening, rent collection, property maintenance, emergency repairs, regular inspections, accounting services, and handling tenant disputes. We act as your full-service property caretaker.'
        },
        {
          question: 'How much do you charge for property management?',
          answer: 'Our management fees range from 8-12% of the monthly rental income, depending on the services required and property type. This includes regular maintenance coordination and 24/7 emergency support.'
        },
        {
          question: 'Do you handle emergency repairs?',
          answer: 'Yes, we have a 24/7 emergency hotline and trusted contractors for urgent repairs like plumbing issues, electrical problems, security concerns, and other emergencies that require immediate attention.'
        },
        {
          question: 'How do you screen tenants?',
          answer: 'Our screening process includes employment verification, previous landlord references, credit checks, and background verification. We ensure tenants have stable income (typically 2.5-3 times the monthly rent) and good rental history.'
        }
      ]
    },
    {
      title: 'Land & Commercial Properties',
      icon: '📊',
      questions: [
        {
          question: 'How do I verify land ownership?',
          answer: 'We conduct thorough due diligence including official land searches at the Ministry of Lands, verification of title deeds, checking for any encumbrances or charges, and confirming the seller\'s identity matches registration documents.'
        },
        {
          question: 'What should I check before buying land?',
          answer: 'Essential checks include: land search certificate, survey documents, planning permissions, access roads, water availability, soil tests, and any development restrictions. We guide you through all these checks as part of our service.'
        },
        {
          question: 'Do you help with commercial property investments?',
          answer: 'Yes, we specialize in commercial properties including office spaces, retail shops, warehouses, and mixed-use developments. We provide investment analysis, rental yield calculations, and help with commercial leasing agreements.'
        },
        {
          question: 'What are the costs of buying land in Kenya?',
          answer: 'Beyond the purchase price, consider stamp duty (2-4%), legal fees (1-2%), valuation fees, survey costs, and registration fees. Total additional costs typically range from 4-8% of the property value.'
        }
      ]
    },
    {
      title: 'General Questions',
      icon: '❓',
      questions: [
        {
          question: 'Are your agents licensed and certified?',
          answer: 'Yes, all our agents are registered with the relevant Kenyan authorities and hold professional certifications. We continuously train our team on market trends, legal requirements, and customer service excellence.'
        },
        {
          question: 'Do you operate outside Nairobi?',
          answer: 'While based in Nairobi, we handle properties throughout Kenya including Mombasa, Kisumu, Nakuru, Naivasha, and other major towns. We have partner agents across the country to serve you better.'
        },
        {
          question: 'How do I know if a property is a good investment?',
          answer: 'We analyze location growth potential, rental yields, development plans in the area, infrastructure projects, and market trends. We provide investment reports to help you make informed decisions based on your financial goals.'
        },
        {
          question: 'What makes PristinePrimier different from other agencies?',
          answer: 'We offer end-to-end services from buying/selling to property management, have transparent pricing, provide regular market insights, and maintain a strong focus on client education. Our 15+ years experience and 98% client satisfaction rate speak to our commitment.'
        }
      ]
    }
  ];

  const popularQuestions = [
    { question: 'How do I schedule a site visit?', category: 'Buying Properties' },
    { question: 'How can I list my property for sale?', category: 'Selling Properties' },
    { question: 'What documents do I need to rent?', category: 'Rental Properties' },
    { question: 'How much deposit is required?', category: 'Rental Properties' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-primary-foreground py-1">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-center mb-2 font-light text-3xl tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-lg mb-4 max-w-2xl mx-auto text-accent-foreground/90">
              Find quick answers to common questions about real estate in Kenya
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
              <Button 
                asChild 
                className="bg-[#f77f77] hover:bg-[#f77f77]/90 text-white border border-[#f77f77]"
              >
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <a href="tel:+254743012966">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Popular Questions 
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-medium mb-8 text-center">Most Popular Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {popularQuestions.map((item, index) => (
                <Card key={index} className="hover:shadow-elegant transition-smooth cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-teal text-sm">?</span>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{item.question}</h3>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section> */}

        {/* FAQ Categories */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Browse Questions by Category</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Find detailed answers organized by topic
              </p>
            </div>

            <div className="space-y-8 max-w-4xl mx-auto">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="bg-card rounded-lg shadow-md overflow-hidden">
                  <div className="bg-secondary px-6 py-4 border-b">
                    <h3 className="text-xl font-medium flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      {category.title}
                    </h3>
                  </div>
                  
                  <div className="divide-y">
                    {category.questions.map((item, questionIndex) => {
                      const globalIndex = categoryIndex * 10 + questionIndex;
                      const isOpen = openItems.includes(globalIndex);
                      
                      return (
                        <div key={questionIndex} className="border-b last:border-b-0">
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="w-full px-6 py-4 text-left hover:bg-secondary/50 transition-colors flex items-center justify-between gap-4"
                          >
                            <span className="font-medium text-lg flex-1">{item.question}</span>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-teal flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-teal flex-shrink-0" />
                            )}
                          </button>
                          
                          {isOpen && (
                            <div className="px-6 pb-4">
                              <div className="bg-secondary/30 rounded-lg p-4">
                                <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="py-1 bg-accent text-accent-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-center mb-2 font-light text-3xl tracking-tight">Still Have Questions?</h2>
            <p className="text-lg mb-4 max-w-2xl mx-auto text-accent-foreground/90">
              Our real estate experts are ready to help you with any questions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
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
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent"
              >
                <Link to="/contact">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Us
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Faq;