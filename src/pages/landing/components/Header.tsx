
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SocialLinks } from "./SocialLinks";

export function Header() {
  const { user } = useAuth();
  
  return (
    <header className="py-4 border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-primary text-transparent bg-clip-text">
              Reachlytix
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link to="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link to="#how-it-works" className="text-sm font-medium hover:text-primary">
              How It Works
            </Link>
            <Link to="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <SocialLinks />
            <ThemeToggle />
            
            {user ? (
              <Button
                variant="default"
                size="sm"
                asChild
              >
                <Link to="/dashboard">My Dashboard</Link>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                asChild
              >
                <Link to="/auth/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
