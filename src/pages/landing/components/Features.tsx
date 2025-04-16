
import { Users, BarChart3, Zap, Shield } from "lucide-react";

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

export function Features() {
  return (
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
  );
}
