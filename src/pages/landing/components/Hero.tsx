
import { ArrowRight } from "lucide-react";
import { Link } from "react-scroll";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background -z-10"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-primary text-transparent bg-clip-text animated-gradient">
              Reach New Heights
            </span>
            {" "}with AI-Powered CRM
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Smart Campaigns, Automated Outreach, Real Results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="pricing" spy={true} smooth={true} duration={500}>
              <Button size="lg" className="rounded-full w-full sm:w-auto">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="features" spy={true} smooth={true} duration={500}>
              <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
