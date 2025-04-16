
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle, 
  ArrowRight, 
  BarChart3, 
  Users, 
  Zap, 
  Shield,
  ShieldCheck,
  Menu, 
  X,
  ChevronRight,
  Phone,
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NeuralBackground } from "@/components/neural-background";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const testimonials = [
  {
    quote: "Reachlytix has transformed how we approach marketing campaigns. The analytics and lead management features are game-changers.",
    author: "Sarah Johnson",
    role: "Marketing Director, TechCorp",
  },
  {
    quote: "The intuitive interface and powerful reporting tools have made tracking campaign performance so much easier.",
    author: "Michael Chang",
    role: "CMO, GrowthFinder",
  },
  {
    quote: "Since implementing Reachlytix, we've seen a 43% increase in conversion rates across all our campaigns.",
    author: "Elena Rodríguez",
    role: "Head of Growth, Innovate Inc.",
  },
];

const features = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "Lead Management",
    description: "Organize and track all your leads in one centralized platform with detailed profiles and activity history."
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Campaign Analytics",
    description: "Get in-depth insights into campaign performance with real-time metrics and customizable dashboards."
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Automation Tools",
    description: "Save time with intelligent automation for lead scoring, follow-ups, and campaign scheduling."
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Security & Compliance",
    description: "Enterprise-grade security and compliance features to keep your data safe and maintain regulatory standards."
  },
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header 
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled 
            ? "bg-background/80 backdrop-blur-lg border-b shadow-sm" 
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold bg-gradient-primary text-transparent bg-clip-text">Reachlytix</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-8 ml-10">
                <Link to="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
                <Link to="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
                <Link to="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimonials</Link>
                <Link to="#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/signup">Sign Up</Link>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex flex-col space-y-3">
                <Link to="#features" className="text-sm font-medium hover:text-primary transition-colors py-2">Features</Link>
                <Link to="#pricing" className="text-sm font-medium hover:text-primary transition-colors py-2">Pricing</Link>
                <Link to="#testimonials" className="text-sm font-medium hover:text-primary transition-colors py-2">Testimonials</Link>
                <Link to="#faq" className="text-sm font-medium hover:text-primary transition-colors py-2">FAQ</Link>
                <div className="flex space-x-4 pt-2">
                  <Button variant="outline" asChild className="flex-1">
                    <Link to="/auth/login">Login</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link to="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background -z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-primary text-transparent bg-clip-text animated-gradient">Amplify Your Reach</span>
              <br />Track Your Success
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              The all-in-one CRM platform designed for modern marketing teams.
              Manage leads, optimize campaigns, and drive conversions with powerful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full" asChild>
                <Link to="/auth/signup">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <Link to="#demo">Watch Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground">
              Everything you need to manage your marketing campaigns and drive results
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-card shadow-sm rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">
              Choose the plan that works best for your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">Starter</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mb-6">Perfect for small teams and startups</p>
                <Button className="w-full" variant="outline">Start Free Trial</Button>
              </div>
              <div className="border-t border-border p-6">
                <ul className="space-y-3">
                  {["Up to 2,500 leads", "3 campaigns", "Basic analytics", "Email support"].map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-card rounded-xl shadow-md border-2 border-primary relative">
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-xs font-bold uppercase px-3 py-1 rounded-bl-lg text-primary-foreground">
                  Most Popular
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">Professional</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mb-6">Ideal for growing businesses</p>
                <Button className="w-full">Start Free Trial</Button>
              </div>
              <div className="border-t border-border p-6">
                <ul className="space-y-3">
                  {["Up to 25,000 leads", "15 campaigns", "Advanced analytics", "Priority support", "Marketing automation", "API access"].map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$249</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mb-6">For large organizations with complex needs</p>
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </div>
              <div className="border-t border-border p-6">
                <ul className="space-y-3">
                  {["Unlimited leads", "Unlimited campaigns", "Custom reporting", "24/7 phone support", "Advanced integrations", "Dedicated account manager", "Custom onboarding"].map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground">
              Hear from marketing teams who have transformed their lead management with Reachlytix
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-card shadow-sm rounded-xl p-6 border border-border">
                <p className="mb-6 italic text-muted-foreground">"{testimonial.quote}"</p>
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Find answers to common questions about Reachlytix
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">How does the free trial work?</AccordionTrigger>
                <AccordionContent>
                  Our free trial gives you full access to all Pro plan features for 14 days. No credit card required to sign up. At the end of your trial, you can choose the plan that works best for your needs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">Can I import my existing leads?</AccordionTrigger>
                <AccordionContent>
                  Yes! Reachlytix supports importing leads via CSV, Excel, and direct integration with popular CRMs and marketing platforms. Our onboarding team can help with the migration process.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">What kind of support do you offer?</AccordionTrigger>
                <AccordionContent>
                  We offer email support for all plans. Professional plans include priority support with faster response times. Enterprise plans receive 24/7 phone support and a dedicated account manager.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">Is Reachlytix GDPR compliant?</AccordionTrigger>
                <AccordionContent>
                  Yes, Reachlytix is fully GDPR compliant. We provide tools to help you manage consent, data subject requests, and other privacy requirements. Our data centers are located in compliant regions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">Can I upgrade or downgrade my plan?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. You can change your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the new rate takes effect at the start of your next billing cycle.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to transform your marketing operations?</h2>
            <p className="text-xl opacity-90 mb-8">
              Start your free trial today and see the difference Reachlytix can make for your business.
            </p>
            <Button size="lg" variant="secondary" className="rounded-full" asChild>
              <Link to="/auth/signup">
                Get Started Now <ChevronRight className="ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Integrations</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Case Studies</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Team</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Knowledge Base</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Webinars</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="font-bold text-lg bg-gradient-primary text-transparent bg-clip-text">Reachlytix</Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Reachlytix Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
