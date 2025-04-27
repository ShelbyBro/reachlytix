
import { Upload, Bot, Rocket } from "lucide-react";

const steps = [
  {
    icon: <Upload className="h-8 w-8" />,
    title: "Upload Leads",
    description: "Import your leads from CSV or connect your existing CRM"
  },
  {
    icon: <Bot className="h-8 w-8" />,
    title: "Train AI Agent",
    description: "Customize your AI agent with your campaign goals"
  },
  {
    icon: <Rocket className="h-8 w-8" />,
    title: "Watch Campaigns Run",
    description: "Monitor results in real-time as your AI agent engages leads"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">
            Get started with Reachlytix in three simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative text-center p-6"
            >
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 right-0 transform translate-x-1/2">
                  <div className="w-8 h-0.5 bg-border"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
