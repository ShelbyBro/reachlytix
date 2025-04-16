
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Find answers to common questions about Reachlytix
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">How does the free trial work?</AccordionTrigger>
              <AccordionContent>
                Our free trial gives you full access to all Pro plan features for 14 days. No credit card required to sign up. At the end of your trial, you can choose the plan that works best for your needs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">Can I import my existing leads?</AccordionTrigger>
              <AccordionContent>
                Yes! Reachlytix supports importing leads via CSV, Excel, and direct integration with popular CRMs and marketing platforms. Our onboarding team can help with the migration process.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">What kind of support do you offer?</AccordionTrigger>
              <AccordionContent>
                We offer email support for all plans. Professional plans include priority support with faster response times. Enterprise plans receive 24/7 phone support and a dedicated account manager.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">Is Reachlytix GDPR compliant?</AccordionTrigger>
              <AccordionContent>
                Yes, Reachlytix is fully GDPR compliant. We provide tools to help you manage consent, data subject requests, and other privacy requirements. Our data centers are located in compliant regions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">Can I upgrade or downgrade my plan?</AccordionTrigger>
              <AccordionContent>
                Absolutely. You can change your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the new rate takes effect at the start of your next billing cycle.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
