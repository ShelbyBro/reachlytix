
import { Bot, Phone, Users, Shield } from "lucide-react";

const features = [
  {
    icon: <Bot className="h-8 w-8" />,
    title: "AI Campaign Automation",
    description: "Let AI handle your outreach campaigns with intelligent automation and personalized messaging."
  },
  {
    icon: <Phone className="h-8 w-8" />,
    title: "VOIP Calling System",
    description: "Integrated cloud calling with AI voice assistance for seamless customer communication."
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Smart Lead Management",
    description: "Intelligent lead scoring, tracking, and nurturing to maximize conversion rates."
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Powerful Admin Controls",
    description: "Complete oversight and control of your campaigns, team, and AI agents."
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground">
            Everything you need to automate and scale your outreach
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
