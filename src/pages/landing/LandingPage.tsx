// ✅ Full Refined Landing Page
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeuralBackground } from "@/components/neural-background";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Pricing } from "./components/Pricing";
import { Testimonials } from "./components/Testimonials";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NeuralBackground />
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />

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

            {/* Updated Get Started Button - Redirect to Login */}
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full"
              onClick={() => {
                window.location.href = "/auth/login";
              }}
            >
              Get Started Now <ChevronRight className="ml-1" />
            </Button>

            {/* Optional: Watch Demo Button */}
            <Button
              size="lg"
              variant="ghost"
              className="mt-4 text-white underline"
              onClick={() => {
                window.location.href = "/auth/login";
              }}
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
