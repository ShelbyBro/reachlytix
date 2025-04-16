
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
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
  );
}
