
const testimonials = [
  {
    quote: "Reachlytix has transformed how we approach marketing campaigns. The analytics and lead management features are game-changers.",
    author: "Sarah Johnson",
    role: "Marketing Director, TechCorp",
  },
  {
    quote: "The intuitive interface and powerful reporting tools have made tracking campaign performance so much easier.",
    author: "Michael Chang",
    role: "CMO, GrowthFinder",
  },
  {
    quote: "Since implementing Reachlytix, we've seen a 43% increase in conversion rates across all our campaigns.",
    author: "Elena Rodríguez",
    role: "Head of Growth, Innovate Inc.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-primary/5 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground">
            Hear from marketing teams who have transformed their lead management with Reachlytix
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-card shadow-sm rounded-xl p-6 border border-border">
              <p className="mb-6 italic text-muted-foreground">"{testimonial.quote}"</p>
              <div>
                <p className="font-medium">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
