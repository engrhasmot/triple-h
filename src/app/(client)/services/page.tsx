import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ServicesHero, ServicesList } from "./ServicesContent";

export default function ServicesPage() {
  return (
    <div className="w-full">
      <ServicesHero />
      <ServicesList />

      {/* FAQ Section */}
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading mb-4">Engineering Approvals FAQ</h2>
            <p className="text-muted-foreground">Common questions about building plan approvals in Bangladesh.</p>
          </div>
          
          <Accordion defaultValue={['item-1']} className="w-full bg-card rounded-xl shadow-sm border border-border px-6">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-semibold">What documents are needed for Plan Passing?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Generally, you need the original land deed (Dalil), Mutation (Namjari), CS/RS/SA Khatian, Up-to-date land tax receipt (Khajna), Soil test report, and our Architectural & Structural working drawings.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-semibold">How long does union parishad approval take?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Typically, Union Parishad approvals take 1 to 2 weeks provided all your land documents are clear and there are no boundary disputes. Paurashava or RAJUK approvals take longer (1-3 months).
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-semibold">Do you supervise the construction directly?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, our engineers can be hired for on-site technical supervision. We highly recommend this for foundation pouring and roof casting to ensure the contractor strictly follows our structural design.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
