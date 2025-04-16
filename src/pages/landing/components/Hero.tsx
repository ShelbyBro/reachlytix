
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
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
  );
}
