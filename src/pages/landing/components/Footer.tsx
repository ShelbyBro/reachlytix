
import { Link } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";

export function Footer() {
  return (
    <footer className="bg-muted/40 py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="block">
              <h2 className="font-bold text-xl bg-gradient-primary text-transparent bg-clip-text">
                Reachlytix
              </h2>
            </Link>
            <p className="text-sm text-muted-foreground">
              Amplify your reach, analyze your success. The all-in-one platform for modern marketing operations.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <ScrollLink 
                  to="features" 
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  spy={true}
                  smooth={true}
                  offset={-70}
                  duration={500}
                >
                  Features
                </ScrollLink>
              </li>
              <li>
                <ScrollLink 
                  to="pricing" 
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  spy={true}
                  smooth={true}
                  offset={-70}
                  duration={500}
                >
                  Pricing
                </ScrollLink>
              </li>
              <li>
                <Link to="/demo" className="text-muted-foreground hover:text-primary transition-colors">
                  Demo
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#careers" className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <ScrollLink 
                  to="testimonials" 
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  spy={true}
                  smooth={true}
                  offset={-70}
                  duration={500}
                >
                  Testimonials
                </ScrollLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <ScrollLink 
                  to="faq" 
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  spy={true}
                  smooth={true}
                  offset={-70}
                  duration={500}
                >
                  FAQ
                </ScrollLink>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Reachlytix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
