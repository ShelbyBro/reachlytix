
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeuralBackground } from "@/components/neural-background";
import { useNavigate } from "react-router-dom";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { Pricing } from "./components/Pricing";
import { Footer } from "./components/Footer";

export default function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <NeuralBackground />
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to transform your marketing operations?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Start your free trial today and see the difference Reachlytix can
              make for your business.
            </p>

            <Button
              size="lg"
              variant="secondary"
              className="rounded-full"
              onClick={() => navigate("/auth/signup")}
            >
              Get Started Now <ChevronRight className="ml-1" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
