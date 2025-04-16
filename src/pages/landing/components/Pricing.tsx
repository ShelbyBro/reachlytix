
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pricing() {
  return (
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
  );
}
