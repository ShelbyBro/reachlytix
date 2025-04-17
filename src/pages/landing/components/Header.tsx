
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative z-20 w-full">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="mr-4 flex">
          <RouterLink to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-primary text-transparent bg-clip-text">
              Reachlytix
            </span>
          </RouterLink>
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <ScrollLink
              to="features"
              spy={true}
              smooth={true}
              offset={-70}
              duration={500}
              className="transition-colors hover:text-foreground/80 cursor-pointer"
            >
              Features
            </ScrollLink>
            <ScrollLink
              to="pricing"
              spy={true}
              smooth={true}
              offset={-70}
              duration={500}
              className="transition-colors hover:text-foreground/80 cursor-pointer"
            >
              Pricing
            </ScrollLink>
            <ScrollLink
              to="testimonials"
              spy={true}
              smooth={true}
              offset={-70}
              duration={500}
              className="transition-colors hover:text-foreground/80 cursor-pointer"
            >
              Testimonials
            </ScrollLink>
            <ScrollLink
              to="faq"
              spy={true}
              smooth={true}
              offset={-70}
              duration={500}
              className="transition-colors hover:text-foreground/80 cursor-pointer"
            >
              FAQ
            </ScrollLink>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex items-center">
            <ThemeToggle />
            <RouterLink to="/auth/login">
              <Button variant="ghost" size="sm" className="ml-4">
                Sign In
              </Button>
            </RouterLink>
            <RouterLink to="/auth/signup">
              <Button size="sm" className="ml-2">
                Get Started
              </Button>
            </RouterLink>
          </div>
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-background/90 backdrop-blur-sm">
          <div className="container flex flex-col gap-6 py-8">
            <nav className="flex flex-col gap-6 text-lg font-medium">
              <ScrollLink
                to="features"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                className="transition-colors hover:text-foreground/80 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </ScrollLink>
              <ScrollLink
                to="pricing"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                className="transition-colors hover:text-foreground/80 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </ScrollLink>
              <ScrollLink
                to="testimonials"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                className="transition-colors hover:text-foreground/80 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </ScrollLink>
              <ScrollLink
                to="faq"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                className="transition-colors hover:text-foreground/80 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </ScrollLink>
            </nav>
            <div className="flex flex-col gap-4 mt-4">
              <RouterLink to="/auth/login">
                <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Button>
              </RouterLink>
              <RouterLink to="/auth/signup">
                <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Button>
              </RouterLink>
              <div className="flex justify-center mt-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
